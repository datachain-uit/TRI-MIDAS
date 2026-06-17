"""Sequential deep-learning baselines for early course-quality prediction.

This is the "early prediction" stage of TRI-MIDAS: sequential models are trained
on the ET-imputed, Radius-SMOTE-balanced data and evaluated at four cumulative
observation phases (P1-P4), simulating data arriving over time. At phase k the
model is retrained from scratch on the concatenation of phases 1..k.

Each enrollment is fed as a single-step feature vector of shape ``(N, 1, F)``
(one time step, F features); the recurrent/SSM backbone reads it and a linear
head produces one of three quality classes (excellent / good / average).

Backbones: RNN, LSTM, GRU, and BiLSTM.

All paths and hyper-parameters live in the CONFIG section below. Run as a
script to train every registered model and write per-phase results to disk.
"""

import os
import time

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
from torch.utils.data import DataLoader, TensorDataset

# =============================================================================
# CONFIG
# =============================================================================

# Root directory holding one sub-folder per phase, each with train/val/test CSVs:
#   {DATA_DIR}/stage_{k}/{train,val,test}.csv   for k in 1..NUM_PHASES
DATA_DIR = "data/radius-smote"
STAGE_DIR = "{root}/stage_{phase}"
NUM_PHASES = 4

# Target column and its integer encoding.
TARGET = "label_f"
LABEL_MAPPING = {"excellent": 0, "good": 1, "average": 2}
NUM_CLASSES = 3

# Training hyper-parameters.
NUM_EPOCHS = 50
BATCH_SIZE = 256
LR = 1e-3
DROPOUT = 0.3
NUM_WORKERS = 4
GRAD_CLIP_NORM = 5.0
AMP_DTYPE = torch.bfloat16

# Output directory; each model writes to {OUTPUT_ROOT}/phase_{MODEL_NAME}.
OUTPUT_ROOT = "."

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


# =============================================================================
# MODELS
# =============================================================================

class SimpleRNN(nn.Module):
    def __init__(self, input_size, hidden_size=128, num_layers=1, num_classes=NUM_CLASSES):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.rnn = nn.RNN(input_size, hidden_size, num_layers,
                          batch_first=True, nonlinearity="tanh")
        self.dropout = nn.Dropout(DROPOUT)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size, device=x.device)
        out, _ = self.rnn(x, h0)
        return self.fc(out[:, -1, :])


class SimpleLSTM(nn.Module):
    def __init__(self, input_size, hidden_size=128, num_layers=1, num_classes=NUM_CLASSES):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.dropout = nn.Dropout(DROPOUT)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])


class SimpleGRU(nn.Module):
    def __init__(self, input_size, hidden_size=128, num_layers=1, num_classes=NUM_CLASSES):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.gru = nn.GRU(input_size, hidden_size, num_layers, batch_first=True)
        self.dropout = nn.Dropout(DROPOUT)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size, device=x.device)
        out, _ = self.gru(x, h0)
        return self.fc(out[:, -1, :])


class BiLSTM(nn.Module):
    def __init__(self, input_size, hidden_size=128, num_layers=1, num_classes=NUM_CLASSES):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers,
                            batch_first=True, bidirectional=True)
        self.dropout = nn.Dropout(DROPOUT)
        self.fc = nn.Linear(hidden_size * 2, num_classes)  # *2 for bidirectional

    def forward(self, x):
        h0 = torch.zeros(self.num_layers * 2, x.size(0), self.hidden_size, device=x.device)
        c0 = torch.zeros(self.num_layers * 2, x.size(0), self.hidden_size, device=x.device)
        out, _ = self.lstm(x, (h0, c0))
        return self.fc(self.dropout(out[:, -1, :]))


# Models to train: name -> (class, constructor kwargs).
# Per the paper: hidden units = 128 for all four backbones (BiLSTM concatenates
# the two directions -> effective dimension 256), dropout p = 0.3.
MODEL_REGISTRY = {
    "LSTM": (SimpleLSTM, dict(hidden_size=128)),
    "GRU": (SimpleGRU, dict(hidden_size=128)),
    "RNN": (SimpleRNN, dict(hidden_size=128)),
    "BiLSTM": (BiLSTM, dict(hidden_size=128)),
}


# =============================================================================
# DATA
# =============================================================================

def load_phase_data(root=DATA_DIR, num_phases=NUM_PHASES):
    """Load per-phase train/val/test splits and align all to a common schema.

    Columns are aligned to the last phase's training columns (missing columns
    filled with 0) so every phase shares the same feature space.
    """
    train, val, test = [], [], []
    for k in range(1, num_phases + 1):
        d = STAGE_DIR.format(root=root, phase=k)
        train.append(pd.read_csv(f"{d}/train.csv"))
        val.append(pd.read_csv(f"{d}/val.csv"))
        test.append(pd.read_csv(f"{d}/test.csv"))

    # Reference schema = features of the last training phase.
    feature_cols = [c for c in train[-1].columns if c != TARGET]
    all_cols = feature_cols + [TARGET]
    align = lambda df: df.reindex(columns=all_cols, fill_value=0)

    return [align(d) for d in train], [align(d) for d in val], [align(d) for d in test]


def encode_labels(series):
    """Map string labels to ints (pass through if already numeric)."""
    if series.dtype == "object":
        return series.map(LABEL_MAPPING).values.astype(np.int64)
    return series.values.astype(np.int64)


def make_loader(X, y, batch_size, shuffle, num_workers):
    """Wrap scaled features (N, F) as a (N, 1, F) tensor DataLoader."""
    tx = torch.tensor(X, dtype=torch.float32).unsqueeze(1)  # (N, 1, F)
    ty = torch.tensor(y, dtype=torch.long)
    ds = TensorDataset(tx, ty)
    return DataLoader(ds, batch_size=batch_size, shuffle=shuffle,
                      num_workers=num_workers, pin_memory=True, persistent_workers=True)


# =============================================================================
# TRAINING
# =============================================================================

def train_phase_model(model_class, model_kwargs, train_phase_dfs, val_phase_dfs,
                      test_phase_dfs, num_epochs=NUM_EPOCHS, batch_size=BATCH_SIZE,
                      lr=LR, device=DEVICE, num_workers=NUM_WORKERS):
    """Phase-cumulative training.

    For phase k the train/val/test sets are the concatenations of phases 1..k.
    A fresh model is trained from scratch each phase. Features are standardized
    with statistics fit on the (cumulative) training split only. Class weights
    are derived from the cumulative training label counts.

    Returns ``(all_phase_results, total_time)``.
    """
    total_start = time.time()
    all_phase_results = []
    cum_train = cum_val = cum_test = None

    for phase_idx in range(len(train_phase_dfs)):
        phase_num = phase_idx + 1
        print(f"\n{'='*60}\nPHASE {phase_num}/{len(train_phase_dfs)}\n{'='*60}")

        # Accumulate phases 1..k.
        cum_train = train_phase_dfs[phase_idx].copy() if cum_train is None \
            else pd.concat([cum_train, train_phase_dfs[phase_idx]], ignore_index=True)
        cum_val = val_phase_dfs[phase_idx].copy() if cum_val is None \
            else pd.concat([cum_val, val_phase_dfs[phase_idx]], ignore_index=True)
        cum_test = test_phase_dfs[phase_idx].copy() if cum_test is None \
            else pd.concat([cum_test, test_phase_dfs[phase_idx]], ignore_index=True)

        print(f"  Train: {len(cum_train):,}  Val: {len(cum_val):,}  Test: {len(cum_test):,}")

        feature_cols = [c for c in cum_train.columns if c != TARGET]

        # Class weights from cumulative training labels (normalized to mean 1).
        train_y = encode_labels(cum_train[TARGET])
        class_counts = np.bincount(train_y, minlength=NUM_CLASSES)
        class_weights = 1.0 / np.maximum(class_counts, 1)
        class_weights = class_weights / class_weights.sum() * NUM_CLASSES
        criterion = nn.CrossEntropyLoss(
            weight=torch.tensor(class_weights, dtype=torch.float32).to(device))
        print(f"  Class weights: {class_weights.round(4)}")

        # Standardize: fit on train, transform val/test (no leakage).
        def to_X(df):
            return df[feature_cols].replace([np.inf, -np.inf], np.nan).fillna(0) \
                                   .values.astype(np.float32)

        scaler = StandardScaler()
        train_X = scaler.fit_transform(to_X(cum_train))
        val_X = scaler.transform(to_X(cum_val))
        test_X = scaler.transform(to_X(cum_test))
        val_y = encode_labels(cum_val[TARGET])
        test_y = encode_labels(cum_test[TARGET])

        train_ldr = make_loader(train_X, train_y, batch_size, True, num_workers)
        val_ldr = make_loader(val_X, val_y, batch_size, False, num_workers)
        test_ldr = make_loader(test_X, test_y, batch_size, False, num_workers)

        # Fresh model per phase.
        model = model_class(input_size=train_X.shape[1], **model_kwargs).to(device)
        try:
            model = torch.compile(model, mode="reduce-overhead")
        except Exception as e:
            print(f"  Compile: SKIP - {e}")
        optimizer = torch.optim.Adam(model.parameters(), lr=lr)

        # --- Train ---
        phase_train_start = time.time()
        val_acc = val_loss = 0.0
        for epoch in range(num_epochs):
            model.train()
            total_loss = total_correct = 0
            for bx, by in train_ldr:
                bx, by = bx.to(device), by.to(device)
                optimizer.zero_grad()
                with torch.autocast(device_type="cuda", dtype=AMP_DTYPE):
                    out = model(bx)
                    loss = criterion(out.float(), by)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), GRAD_CLIP_NORM)
                optimizer.step()
                total_loss += loss.item() * bx.size(0)
                total_correct += (out.detach().float().argmax(1) == by).sum().item()

            if (epoch + 1) % 10 == 0 or epoch == num_epochs - 1:
                tr_loss = total_loss / len(train_ldr.dataset)
                tr_acc = total_correct / len(train_ldr.dataset)
                val_loss, val_acc = evaluate(model, val_ldr, criterion, device)
                print(f"  Epoch {epoch+1:>3}/{num_epochs} | Loss {tr_loss:.4f} "
                      f"Acc {tr_acc:.4f} | Val Loss {val_loss:.4f} Val Acc {val_acc:.4f}")
        phase_train_time = time.time() - phase_train_start

        # --- Test ---
        t_start = time.time()
        y_pred, y_true, probs = predict(model, test_ldr, device)
        t_time = time.time() - t_start
        t_acc = float((np.array(y_pred) == np.array(y_true)).mean())
        print(f"  Test accuracy: {t_acc:.4f}")
        print(classification_report(y_true, y_pred))

        all_phase_results.append({
            "phase": phase_num,
            "train_size": len(cum_train),
            "val_size": len(cum_val),
            "test_size": len(cum_test),
            "train_time": phase_train_time,
            "test_time": t_time,
            "accuracy": t_acc,
            "val_acc_last": val_acc,
            "val_loss_last": val_loss,
            "y_pred": list(y_pred),
            "y_true": list(y_true),
            "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
            "probs": [list(p) for p in probs],
        })

    total_time = time.time() - total_start
    print(f"\n[Total time: {total_time:.2f}s]")
    return all_phase_results, total_time


def evaluate(model, loader, criterion, device):
    """Return (mean loss, accuracy) over a loader."""
    model.eval()
    loss_sum = correct = 0
    with torch.no_grad(), torch.autocast(device_type="cuda", dtype=AMP_DTYPE):
        for bx, by in loader:
            bx, by = bx.to(device), by.to(device)
            out = model(bx)
            loss_sum += criterion(out.float(), by).item() * bx.size(0)
            correct += (out.float().argmax(1) == by).sum().item()
    model.train()
    n = len(loader.dataset)
    return loss_sum / n, correct / n


def predict(model, loader, device):
    """Return (y_pred, y_true, probs) over a loader."""
    model.eval()
    y_pred, y_true, all_probs = [], [], []
    with torch.no_grad(), torch.autocast(device_type="cuda", dtype=AMP_DTYPE):
        for bx, by in loader:
            bx = bx.to(device)
            out = model(bx).float()
            y_pred.extend(out.argmax(1).cpu().numpy())
            y_true.extend(by.numpy())
            all_probs.extend(torch.softmax(out, dim=1).cpu().numpy())
    return y_pred, y_true, all_probs


# =============================================================================
# SAVE
# =============================================================================

def save_phase_results(all_phase_results, prefix="phase_results"):
    """Persist per-phase predictions, confusion matrices, probabilities, and
    summary/timing tables under ``{prefix}/``.
    """
    os.makedirs(prefix, exist_ok=True)
    summary_rows, time_rows = [], []

    for res in all_phase_results:
        tag = f"phase{res['phase']}"
        pd.DataFrame({"y_true": res["y_true"], "y_pred": res["y_pred"]}).to_csv(
            f"{prefix}/{tag}_predictions.csv", index=False)
        pd.DataFrame(res["confusion_matrix"]).to_csv(
            f"{prefix}/{tag}_confusion_matrix.csv", index=False)
        probs = np.array(res["probs"])
        pd.DataFrame(probs, columns=[f"class_{i}_prob" for i in range(probs.shape[1])]).to_csv(
            f"{prefix}/{tag}_probs.csv", index=False)

        summary_rows.append({
            "phase": res["phase"], "train_size": res["train_size"],
            "test_size": res["test_size"], "accuracy": res["accuracy"],
            "train_time_s": res["train_time"], "test_time_s": res["test_time"],
        })
        time_rows.append({
            "phase": res["phase"], "train_size": res["train_size"],
            "train_time_s": res["train_time"], "test_size": res["test_size"],
            "test_time_s": res["test_time"],
            "total_phase_time_s": res["train_time"] + res["test_time"],
        })

    pd.DataFrame(summary_rows).to_csv(f"{prefix}/summary.csv", index=False)
    pd.DataFrame(time_rows).to_csv(f"{prefix}/time_per_phase.csv", index=False)
    print(f"Results saved to: {prefix}/")


# =============================================================================
# ENTRY POINT
# =============================================================================

def main():
    print(f"Device: {DEVICE}")
    train_dfs, val_dfs, test_dfs = load_phase_data()
    for name, (model_class, kwargs) in MODEL_REGISTRY.items():
        print(f"\n########## {name} ##########")
        results, _ = train_phase_model(model_class, kwargs, train_dfs, val_dfs, test_dfs)
        save_phase_results(results, prefix=f"{OUTPUT_ROOT}/phase_{name}")


if __name__ == "__main__":
    main()
