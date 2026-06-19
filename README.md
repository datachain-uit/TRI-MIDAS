# TRI-MIDAS

This repository contains the **research implementation** used in our paper:
**"Behavior-Driven Automatic Course Quality Labeling and Data Quality
Enhancement for Early MOOC Course Quality Prediction"**.

TRI-MIDAS couples two components into a single pipeline for early course-quality
prediction on the MOOCCubeX dataset:

- **TRIAD** — behavior-driven *automatic course-quality labeling*. Cognitive,
  affective, and academic engagement signals are aggregated into a composite
  vector and turned into a three-level quality label (excellent / good /
  average).
- **MIDAS** — *Multivariate Imputation and Data Augmentation System*. Missing
  behavioral features are reconstructed with an iterative Extra-Trees regressor,
  and the skewed label distribution is rebalanced with Radius-SMOTE.

The enhanced dataset is then used to train sequential deep-learning models
(RNN / LSTM / GRU / BiLSTM) evaluated across four early observation phases
(P1–P4). An interactive web dashboard is included to explore the labeled data
and data-quality diagnostics.

## 📋 Table of Contents

- [Project Overview](#project-overview)
  - [Pipeline](#pipeline)
  - [Demo Dashboard](#demo-dashboard)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [1. Course-Quality Labeling (TRIAD)](#1-course-quality-labeling-triad)
  - [2. Imputation (MIDAS — Extra Trees)](#2-imputation-midas--extra-trees)
  - [3. Augmentation (MIDAS — Radius-SMOTE)](#3-augmentation-midas--radius-smote)
  - [4. Early-Prediction Baselines](#4-early-prediction-baselines)
  - [5. Demo Dashboard](#5-demo-dashboard)
- [Project Structure](#project-structure)
- [Contributors](#contributors)

<a id="project-overview"></a>

## Project Overview

<a id="pipeline"></a>

### Pipeline

The pipeline (`src/pipeline/`) implements TRI-MIDAS end to end:

| Stage | File | Description |
|-------|------|-------------|
| Labeling (TRIAD) | `TRIAD.py` | Builds the COELO / AFELO / ACELO engagement vector per (course, chapter) on Spark/Delta and derives the quality label from the Euclidean distance to the ideal point. |
| Imputation (MIDAS) | `extral-tree.ipynb` | MICE-style iterative imputation of missing features using an Extra-Trees regressor. |
| Augmentation (MIDAS) | `radius_smote.py` | Radius-SMOTE oversampling that rebalances the minority quality classes. |
| Early prediction | `baseline_models.py` | Phase-cumulative (P1–P4) training of RNN / LSTM / GRU / BiLSTM backbones. |

<a id="demo-dashboard"></a>

### Demo Dashboard

The demo (`src/demo/`) is a Next.js dashboard, extracted from the TEMPO-DQ
framework and **scoped to the course-quality views only** (overview, courses,
data-quality). It reads labeled records from Azure Cosmos DB and visualizes:

- Course-quality label distribution and latest course activity (Overview)
- Per-course and per-chapter quality analysis (Courses)
- Data-quality diagnostics: completeness, consistency, and sanity metrics
  (Data Quality)

<a id="getting-started"></a>

## 🚀 Getting Started

<a id="prerequisites"></a>

### Prerequisites

- Python 3.10+ (pipeline) with `pandas`, `numpy`, `scikit-learn`, `torch`,
  and `pyspark` (for `TRIAD.py`). `mamba_ssm` is **not** required for Phase 1.
- Node.js 18+ (LTS) and `pnpm`/`npm` (demo dashboard).
- Access to the processed MOOCCubeX feature tables / Azure Cosmos DB
  (`mooccubex` database) for the demo.

<a id="installation"></a>

### 📦 Installation

```bash
# 1. Pipeline (Python)
pip install pandas numpy scikit-learn torch pyspark

# 2. Demo dashboard (Next.js)
cd src/demo/frontend
npm install --legacy-peer-deps
```

<a id="usage"></a>

## 💻 Usage

<a id="1-course-quality-labeling-triad"></a>

### 1. Course-Quality Labeling (TRIAD)

Run on a Spark cluster (e.g. Databricks) where the Gold/Silver Delta tables are
mounted. Paths and label thresholds are configured in the `CONFIG` block.

```bash
python src/pipeline/TRIAD.py
```

<a id="2-imputation-midas--extra-trees"></a>

### 2. Imputation (MIDAS — Extra Trees)

Open `src/pipeline/extral-tree.ipynb`, set `INPUT_PATH` to the labeled feature
table, and run all cells to write the imputed table.

<a id="3-augmentation-midas--radius-smote"></a>

### 3. Augmentation (MIDAS — Radius-SMOTE)

```bash
python src/pipeline/radius_smote.py   # runs the RadiusSMOTE usage example
```

`RadiusSMOTE.fit_resample(X, y)` can also be imported and applied to any
imputed training split.

<a id="4-early-prediction-baselines"></a>

### 4. Early-Prediction Baselines

Point `DATA_DIR` to the augmented per-phase splits, then:

```bash
python src/pipeline/baseline_models.py
```

This trains every backbone in `MODEL_REGISTRY` across phases P1–P4 and writes
per-phase predictions, confusion matrices, and timing tables.

<a id="5-demo-dashboard"></a>

### 5. Demo Dashboard

Create `src/demo/frontend/.env.local`:

```bash
COSMOS_ENDPOINT="azure_cosmos_endpoint_url"
COSMOS_KEY="azure_cosmos_primary_key"
COSMOS_DATABASE="mooccubex"
```

Then start the dev server:

```bash
cd src/demo/frontend
npm run dev
```

The dashboard is available at `http://localhost:3000`.

<a id="project-structure"></a>

## 🗂️ Project Structure

```
TRI-MIDAS/
├── README.md                       # Main documentation
├── .gitignore
└── src/
    ├── pipeline/                   # TRI-MIDAS data pipeline (Python)
    │   ├── TRIAD.py                # Automatic course-quality labeling
    │   ├── extral-tree.ipynb       # Extra-Trees iterative imputation (MIDAS)
    │   ├── radius_smote.py         # Radius-SMOTE augmentation (MIDAS)
    │   └── baseline_models.py      # Sequential DL early-prediction baselines
    └── demo/                       # Course-quality dashboard (Next.js)
        ├── data/                   # Static experiment/quality data
        ├── frontend/               # Next.js app (overview, courses, data-quality)
        └── backend/                # (placeholder)
```

<a id="contributors"></a>

## 👥 Contributors
- Leader: M.Sc. IT. Nguyễn Thị Anh Thư
- Members : Nguyễn Đức Minh Mẫn
