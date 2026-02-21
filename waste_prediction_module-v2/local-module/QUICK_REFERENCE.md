# Waste Predictor - Quick Reference

## Installation

```bash
pip install waste-predictor
```

## Basic Usage

### Make a Prediction

```python
from waste_predictor import get_waste_prediction

result = get_waste_prediction({
    'production_volume': 50000,
    'rain_sum': 200,
    'temperature_mean': 28,
    'humidity_mean': 85,
    'wind_speed_mean': 15,
    'month': 6
})

print(f"Total Waste: {result['Total_Waste_kg']:,.2f} kg")
```

### Train from MongoDB

```python
from waste_predictor import train_from_mongodb

# Local MongoDB
results = train_from_mongodb(
    mongo_uri='mongodb://localhost:27017',
    database='waste_db',
    collection='training'
)

# MongoDB Atlas (Cloud)
results = train_from_mongodb(
    mongo_uri='mongodb+srv://cluster.mongodb.net',
    database='waste_db',
    username='your_username',
    password='your_password',
    collection='training'
)

print(f"Model R²: {results['metrics']['r2']:.4f}")
```

### Train from CSV/DataFrame

```python
import pandas as pd
from waste_predictor import train_from_dataframe

df = pd.read_csv('training_data.csv')
results = train_from_dataframe(df)
```

## Required MongoDB Fields

### Input Features (for prediction & training)
- `production_volume` (float)
- `rain_sum` (float)
- `temperature_mean` (float)
- `humidity_mean` (float)
- `wind_speed_mean` (float)
- `Month` (int, 1-12)

### Output Targets (for training only)
- `Total_Waste_kg`
- `Solid_Waste_Limestone_kg`
- `Solid_Waste_Gypsum_kg`
- `Solid_Waste_Industrial_Salt_kg`
- `Liquid_Waste_Bittern_Liters`
- `Potential_Epsom_Salt_kg`
- `Potential_Potash_kg`
- `Potential_Magnesium_Oil_Liters`

## API Reference

### `get_waste_prediction(input_data: Dict) -> Dict`

Make waste predictions.

**Parameters:**
- `input_data`: Dictionary with production and weather data

**Returns:**
- Dictionary with predicted waste amounts

### `train_from_mongodb(...) -> Dict`

Train model from MongoDB data.

**Parameters:**
- `mongo_uri`: MongoDB connection string
- `database`: Database name
- `collection`: Collection name (default: 'training')
- `username`: Optional username
- `password`: Optional password
- `output_model_path`: Where to save model (default: 'waste_predictor_v4.pkl')
- `verbose`: Show training progress (default: True)

**Returns:**
- Dictionary with training metrics and model path

### `train_from_dataframe(df, ...) -> Dict`

Train model from pandas DataFrame.

**Parameters:**
- `df`: DataFrame with training data
- `output_model_path`: Where to save model
- `verbose`: Show training progress

**Returns:**
- Dictionary with training metrics

## Model Performance

| Metric | Value |
|--------|-------|
| R² Score | 0.98 |
| MAE | 1,607 kg |
| RMSE | 3,092 kg |
| CV R² | 0.974 ± 0.005 |

## Full Documentation

- **TRAINING_GUIDE.md** - Comprehensive training documentation
- **README.md** - Full package documentation
- **example_train_mongodb.py** - Code examples

## Support

For issues or questions, see the documentation or open an issue on GitHub.
