"""Radius-SMOTE class-imbalance augmentation (MIDAS, Stage 2).

This module implements the Radius-SMOTE oversampling used in the TRI-MIDAS
framework to rebalance the course-quality classes before sequential model
training. It corresponds to *State 2* of the MIDAS algorithm and to the
"Class Imbalance Augmentation" equations in the paper.

For every minority class, synthetic samples are interpolated between a minority
instance and a randomly chosen neighbour that lies within a fixed Euclidean
radius ``r`` (located via a Ball Tree). When a minority instance has no
neighbour inside the radius, its single nearest minority neighbour is used as a
fallback. Each minority class is grown until it matches the majority count.

Reference (per minority class ``c``):
    n_gen = max_c' |X^(c')| - |X^(c)|
    N_r(x_i) = { x_j in X^(c) : d(x_i, x_j) <= r, j != i }
    x_j   ~ Uniform(N_r(x_i))      or   NN_1(x_i, X^(c))  if N_r is empty
    alpha ~ Uniform[0, 1]
    x_syn = x_i + alpha * (x_j - x_i)
"""

import numpy as np
from sklearn.neighbors import NearestNeighbors

# =============================================================================
# CONFIG
# =============================================================================

# Radius of the Euclidean neighbourhood used to search for minority neighbours.
RADIUS = 1.0

# Seed for every random operation (sample selection + interpolation).
RANDOM_STATE = 42


# =============================================================================
# RADIUS-SMOTE
# =============================================================================

class RadiusSMOTE:
    """Oversample minority classes by interpolating within a fixed radius.

    Parameters
    ----------
    radius : float
        Euclidean radius defining the minority neighbourhood ``N_r(x_i)``.
    random_state : int
        Seed controlling sample selection and interpolation coefficients.
    """

    def __init__(self, radius=RADIUS, random_state=RANDOM_STATE):
        self.radius = radius
        self.random_state = random_state

    def fit_resample(self, X, y):
        """Return ``(X_res, y_res)`` with every minority class grown to the
        majority count. The original samples are preserved; only synthetic
        minority samples are appended.
        """
        rng = np.random.default_rng(self.random_state)
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y)

        classes, counts = np.unique(y, return_counts=True)
        majority_count = counts.max()
        majority_class = classes[counts.argmax()]

        X_res, y_res = [X], [y]

        for cls in classes:
            if cls == majority_class:
                continue

            X_min = X[y == cls]
            n_to_gen = majority_count - len(X_min)
            if n_to_gen <= 0:
                continue

            # Radius neighbours within the minority class (Ball Tree).
            nn_r = NearestNeighbors(radius=self.radius, algorithm="ball_tree")
            nn_r.fit(X_min)
            in_radius = nn_r.radius_neighbors(X_min, return_distance=False)

            # Fallback: nearest neighbour (index 0 is the point itself).
            nn_k = NearestNeighbors(n_neighbors=2, algorithm="ball_tree")
            nn_k.fit(X_min)
            _, fallback_idx = nn_k.kneighbors(X_min)

            sample_idx = rng.integers(0, len(X_min), size=n_to_gen)
            X_syn = np.empty((n_to_gen, X_min.shape[1]))

            for i, idx in enumerate(sample_idx):
                candidates = [j for j in in_radius[idx] if j != idx]
                neighbor = rng.choice(candidates) if candidates else fallback_idx[idx, 1]
                alpha = rng.random()
                X_syn[i] = X_min[idx] + alpha * (X_min[neighbor] - X_min[idx])

            X_res.append(X_syn)
            y_res.append(np.full(n_to_gen, cls))

            print(f'  Class "{cls}": {len(X_min):,} -> {len(X_min) + n_to_gen:,} '
                  f"(+{n_to_gen:,} synthetic)")

        return np.vstack(X_res), np.concatenate(y_res)


# =============================================================================
# EXAMPLE
# =============================================================================

if __name__ == "__main__":
    # Minimal usage example on a synthetic imbalanced dataset.
    rng = np.random.default_rng(RANDOM_STATE)
    X = np.vstack([
        rng.normal(0.0, 1.0, size=(100, 5)),  # majority class
        rng.normal(3.0, 1.0, size=(20, 5)),   # minority class
    ])
    y = np.array(["majority"] * 100 + ["minority"] * 20)

    smote = RadiusSMOTE(radius=RADIUS, random_state=RANDOM_STATE)
    X_res, y_res = smote.fit_resample(X, y)

    print(f"Before: {len(y):,} samples -> After: {len(y_res):,} samples")
