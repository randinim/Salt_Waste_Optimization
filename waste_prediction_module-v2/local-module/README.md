# Waste Prediction Module V4

A production-grade machine learning system for predicting industrial waste compositions based on production volume and environmental parameters.

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| **R² Score** | **0.98** |
| **MAE** | 1,607 |
| **RMSE** | 3,092 |
| **CV R² (5-Fold)** | 0.974 ± 0.005 |

### Per-Target R² Scores

| Waste Type | R² |
|------------|-----|
| Total_Waste_kg | 0.96 |
| Solid_Waste_Limestone_kg | 0.98 |
| Solid_Waste_Gypsum_kg | 0.99 |
| Solid_Waste_Industrial_Salt_kg | 0.98 |
| Liquid_Waste_Bittern_Liters | 0.99 |
| Potential_Epsom_Salt_kg | 0.98 |
| Potential_Potash_kg | 0.99 |
| Potential_Magnesium_Oil_Liters | 0.98 |

## 🚀 Quick Start

### Installation

#### Install from source (local development)

```bash
pip install -e .
```

#### Install from wheel file

```bash
pip install waste_predictor-4.0.0-py3-none-any.whl
```

#### Install from GitHub (if hosted)

```bash
pip install git+https://github.com/yourusername/waste-predictor.git
```

#### Install from PyPI (if published)

```bash
pip install waste-predictor
```

## 📈 Usage

### Making Predictions

The package provides a simple `get_waste_prediction` function:

```python
from waste_predictor import get_waste_prediction

# Prepare input data
input_data = {
    'production_volume': 50000,
    'rain_sum': 200,
    'temperature_mean': 28,
    'humidity_mean': 85,
    'wind_speed_mean': 15,
    'month': 6
}

# Get prediction
result = get_waste_prediction(input_data)

print(result)
# {
#   'Total_Waste_kg': 101804.91, 
#   'Solid_Waste_Limestone_kg': 7322.23,
#   'Solid_Waste_Gypsum_kg': 32448.03,
#   'Solid_Waste_Industrial_Salt_kg': 62034.64,
#   'Liquid_Waste_Bittern_Liters': 40547.23,
#   'Potential_Epsom_Salt_kg': 2128.86,
#   'Potential_Potash_kg': 379.34,
#   'Potential_Magnesium_Oil_Liters': 4055.32
# }
```

### Training from MongoDB

Users can train their own models using data from MongoDB:

```python
from waste_predictor import train_from_mongodb

# Train with local MongoDB
results = train_from_mongodb(
    mongo_uri='mongodb://localhost:27017',
    database='waste_db',
    collection='training',
    output_model_path='my_custom_model.pkl'
)

print(f"Model R²: {results['metrics']['r2']:.4f}")
print(f"Model saved to: {results['model_path']}")
```

#### Training with MongoDB Atlas (Cloud)

```python
from waste_predictor import train_from_mongodb

results = train_from_mongodb(
    mongo_uri='mongodb+srv://cluster.mongodb.net',
    database='waste_production_db',
    username='your_username',
    password='your_password',
    collection='training',
    output_model_path='waste_predictor_custom.pkl',
    verbose=True
)
```

#### Training with Full Connection String

```python
from waste_predictor import train_from_mongodb

connection_string = "mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true"

results = train_from_mongodb(
    mongo_uri=connection_string,
    database='waste_db',
    collection='training'
)
```

### Training from DataFrame

You can also train from a pandas DataFrame:

```python
import pandas as pd
from waste_predictor import train_from_dataframe

# Load your data
df = pd.read_csv('training_data.csv')

# Train model
results = train_from_dataframe(
    df=df,
    output_model_path='custom_model.pkl',
    verbose=True
)

print(f"Training R²: {results['metrics']['r2']:.4f}")
```

### Updating Model from S3

Download and update your model directly from AWS S3:

```python
from waste_predictor import update_model_from_s3

# Update model from S3 (also downloads metadata.json automatically)
result = update_model_from_s3(
    bucket_name='my-models-bucket',
    s3_key='models/waste_predictor_v5.pkl',
    aws_access_key_id='YOUR_ACCESS_KEY_ID',
    aws_secret_access_key='YOUR_SECRET_ACCESS_KEY',
    region_name='us-east-1'
)

if result['success']:
    print(f"✓ {result['message']}")
    print(f"Model: {result['model_path']}")
    print(f"Metadata: {result['metadata_path']}")
else:
    print(f"✗ {result['message']}")
```

#### Using IAM Role (EC2/Lambda)

When running on AWS infrastructure with IAM roles:

```python
from waste_predictor import update_model_from_s3

# No credentials needed - uses IAM role
result = update_model_from_s3(
    bucket_name='my-models-bucket',
    s3_key='models/waste_predictor_v5.pkl'
)
```

#### Restore from Backup

If an update fails, restore the previous model:

```python
from waste_predictor import restore_model_from_backup

result = restore_model_from_backup()
print(result['message'])
```

**📚 For detailed S3 setup and examples, see [S3_UPDATE_GUIDE.md](S3_UPDATE_GUIDE.md)**

## 📋 Required Data Format

### MongoDB Document Format

Each document in your MongoDB training collection should have:

```json
{
  "Year": 2000,
  "Month": 1,
  "production_volume": 43163.99,
  "rain_sum": 270.87,
  "temperature_mean": 26.53,
  "humidity_mean": 100,
  "wind_speed_mean": 19.68,
  "Total_Waste_kg": 96664.3838,
  "Solid_Waste_Limestone_kg": 5080.5243,
  "Solid_Waste_Gypsum_kg": 23189.168,
  "Solid_Waste_Industrial_Salt_kg": 68394.6915,
  "Liquid_Waste_Bittern_Liters": 31725.5458,
  "Potential_Epsom_Salt_kg": 1605.914,
  "Potential_Potash_kg": 206.5851,
  "Potential_Magnesium_Oil_Liters": 3163.2316
}
```

### Required Fields

**Input Features:**
- `production_volume` - Production volume (numeric)
- `rain_sum` - Total rainfall in mm (numeric)
- `temperature_mean` - Average temperature in °C (numeric)
- `humidity_mean` - Average humidity percentage (numeric)
- `wind_speed_mean` - Average wind speed (numeric)
- `Month` - Month number 1-12 (integer)

**Output Targets (for training only):**
- `Total_Waste_kg`
- `Solid_Waste_Limestone_kg`
- `Solid_Waste_Gypsum_kg`
- `Solid_Waste_Industrial_Salt_kg`
- `Liquid_Waste_Bittern_Liters`
- `Potential_Epsom_Salt_kg`
- `Potential_Potash_kg`
- `Potential_Magnesium_Oil_Liters`

## 📁 Project Structure

```
local-module/
├── data/
│   └── training/
│       └── training.csv          # Training dataset (312 samples)
├── train_v4.py                   # V4 training (PRODUCTION - R²=0.98)
├── predict_v4.py                 # V4 inference module
├── waste_predictor_v4.pkl        # Trained model checkpoint
├── waste_predictor_v4_metadata.json
├── train_v3.py                   # V3 training (Neural network)
├── model_v2.py                   # Enhanced neural network model
├── feature_engineering.py        # Feature engineering pipeline
├── requirements.txt              # Dependencies
└── README.md
```

## 🔧 Input Features

| Feature | Description | Range |
|---------|-------------|-------|
| `production_volume` | Production volume | 0 - 200,000 |
| `rain_sum` | Total rainfall (mm) | 0 - 1,000 |
| `temperature_mean` | Average temperature (°C) | 0 - 50 |
| `humidity_mean` | Average humidity (%) | 0 - 100 |
| `wind_speed_mean` | Average wind speed (km/h) | 0 - 50 |
| `month` | Month of year | 1 - 12 |

## 📤 Output Predictions

| Output | Description |
|--------|-------------|
| `Total_Waste_kg` | Total waste produced (kg) |
| `Solid_Waste_Limestone_kg` | Limestone solid waste (kg) |
| `Solid_Waste_Gypsum_kg` | Gypsum solid waste (kg) |
| `Solid_Waste_Industrial_Salt_kg` | Industrial salt waste (kg) |
| `Liquid_Waste_Bittern_Liters` | Bittern liquid waste (L) |
| `Potential_Epsom_Salt_kg` | Potential Epsom salt byproduct (kg) |
| `Potential_Potash_kg` | Potential Potash byproduct (kg) |
| `Potential_Magnesium_Oil_Liters` | Potential Magnesium oil (L) |

## 🧠 Model Architecture (V4)

### Weighted Ensemble of 3 Model Types:

1. **XGBoost Gradient Boosting** (weight ~33%)
   - 500 estimators, max_depth=6
   - Per-target models with log-transformed outputs

2. **Stacked Ensemble** (weight ~34%)
   - Level 0: XGBoost + LightGBM + Random Forest + GBR
   - Level 1: Ridge regression meta-learner
   - 5-fold stacking with passthrough

3. **Deep Neural Network** (weight ~33%)
   - Architecture: 256 → 512 → 256 → 128 with skip connections
   - GELU activation, BatchNorm, Dropout
   - Cosine annealing LR schedule

### Feature Engineering (30+ features):
- Log/sqrt/squared production transforms
- Cyclical month encoding (sin/cos)
- Weather condition indices (wet, dry, evaporation)
- Production × weather interactions
- Domain-driven ratio features

## 📈 Performance Comparison

| Version | R² Score | MAE | Key Technique |
|---------|----------|-----|---------------|
| V1 (Original) | 0.47 | 7,873 | Simple MLP |
| V3 | 0.77 | 5,575 | Log transform + Feature eng |
| **V4 (Production)** | **0.98** | **1,607** | XGBoost + Stacked + DNN Ensemble |

## 🔄 Retraining

To retrain the model with new data:

1. Add new data to `data/training/training.csv`
2. Run training:
   ```bash
   python train_v4.py
   ```
3. Model will be saved to `waste_predictor_v4.pkl`

## 📝 License

MIT License



