# Digital Twin for Waste Distribution

## Project Overview
This project implements a Digital Twin module to distribute yearly waste data into monthly figures based on correlations with production volume and weather conditions. It utilizes a physics-based correlation model to ensure data consistency and domain relevance.

## Technologies Used

### 1. DVC (Data Version Control)
**What it stands for:** Data Version Control

**What it does:**
DVC is an open-source version control system for machine learning projects. While Git is excellent for code, it struggles with large files (datasets, models). DVC solves this by:
- **Versioning Data:** It allows you to version control large files and directories.
- **Storage Abstraction:** It stores the actual large files in a separate storage (local cache, S3, Azure Blob, Google Drive, etc.) and keeps lightweight pointer files (`.dvc`) in Git.
- **Reproducibility:** It tracks the dependencies and outputs of your data pipeline, ensuring you can reproduce results.

**Logic in this Project:**
- **`dvc init`**: Initializes the DVC project, creating a `.dvc` directory to manage internal state.
- **`dvc add data/original`**: 
    - Calculates a hash (checksum) of the `data/original` directory.
    - Moves the actual data to the DVC cache.
    - Creates a small text file `data/original.dvc` containing the hash.
    - Adds `data/original` to `.gitignore` so Git doesn't track the heavy files.
    - **Why?** This ensures that if the raw data changes, we can track versions of it without bloating the Git repository.
- **`dvc add data/processed` & `dvc add data/final`**: Similarly tracks the intermediate and final outputs. This allows us to checkout specific versions of the dataset corresponding to specific code commits.

### 2. MLflow
**Role:** Experiment Tracking & Model Registry
- **Logic:** We use MLflow to log the parameters of our physics-based model (e.g., weights for rain vs. production) and the resulting metrics (validation differences). This provides a history of "runs" to see how changing assumptions affects the waste distribution.

### 3. Physics-Based Modeling
**Role:** Core Logic for Data Distribution & Composition
- **Logic:** Instead of a black-box regression model (which requires massive training data), we use a domain-driven formula:
  $$ \text{Waste} \propto \text{Production} \times (1 + \alpha \cdot \text{Rain} + \beta \cdot \text{Temp}) $$
- **Composition Modeling:** We further break down the total waste into 7 specific categories relevant to Puttalam, Sri Lanka salt production:
    1. **Limestone ($CaCO_3$)**: Precipitates early, stable.
    2. **Gypsum ($CaSO_4$)**: Major solid waste, increases with Temp.
    3. **Industrial Salt ($NaCl$)**: "Wasted" salt, increases significantly with Rain (dissolution).
    4. **Bittern (Liquid)**: Mother liquor, decreases with Rain (washout), increases with Temp.
    5. **Epsom Salt ($MgSO_4$)**: Crystallizes from Bittern, needs low humidity.
    6. **Magnesium Oil ($MgCl_2$)**: Hygroscopic, volume increases with high Humidity.
    7. **Potash ($KCl$)**: Requires extreme evaporation (Wind/Temp).

## How to Run

1. **Activate Environment:**
   ```powershell
   .venv\Scripts\Activate.ps1
   ```

2. **Run Pipeline:**
   ```powershell
   $env:PYTHONPATH = "."; python src/preprocess.py
   $env:PYTHONPATH = "."; python src/digital_twin.py
   ```
