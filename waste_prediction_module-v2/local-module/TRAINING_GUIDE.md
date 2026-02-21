# Training Guide - Waste Predictor

This guide explains how to train custom waste prediction models using your own data.

## Overview

The Waste Predictor package supports training models from two sources:
1. **MongoDB** - Train directly from MongoDB collections
2. **DataFrame** - Train from pandas DataFrames (CSV, Excel, etc.)

## MongoDB Training

### Prerequisites

1. MongoDB instance (local or cloud) with training data
2. Package installed: `pip install waste-predictor`
3. PyMongo dependency (automatically installed)

### Data Requirements

Your MongoDB collection must contain documents with these fields:

**Required Input Features:**
- `production_volume` (float)
- `rain_sum` (float)  
- `temperature_mean` (float)
- `humidity_mean` (float)
- `wind_speed_mean` (float)
- `Month` (int, 1-12)

**Required Output Targets:**
- `Total_Waste_kg` (float)
- `Solid_Waste_Limestone_kg` (float)
- `Solid_Waste_Gypsum_kg` (float)
- `Solid_Waste_Industrial_Salt_kg` (float)
- `Liquid_Waste_Bittern_Liters` (float)
- `Potential_Epsom_Salt_kg` (float)
- `Potential_Potash_kg` (float)
- `Potential_Magnesium_Oil_Liters` (float)

### Example Document

```json
{
  "_id": ObjectId("..."),
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

### Training Examples

#### 1. Local MongoDB

```python
from waste_predictor import train_from_mongodb

results = train_from_mongodb(
    mongo_uri='mongodb://localhost:27017',
    database='waste_db',
    collection='training',
    output_model_path='my_model.pkl',
    verbose=True
)

print(f"✅ Training complete!")
print(f"R² Score: {results['metrics']['r2']:.4f}")
print(f"MAE: {results['metrics']['mae']:,.2f}")
print(f"RMSE: {results['metrics']['rmse']:,.2f}")
print(f"Model saved: {results['model_path']}")
```

#### 2. MongoDB Atlas (Cloud)

```python
from waste_predictor import train_from_mongodb

results = train_from_mongodb(
    mongo_uri='mongodb+srv://cluster0.xxxxx.mongodb.net',
    database='production_db',
    username='admin_user',
    password='secure_password_123',
    collection='waste_training_data',
    output_model_path='production_model.pkl',
    verbose=True
)
```

#### 3. Full Connection String

```python
from waste_predictor import train_from_mongodb

# Connection string with all parameters
uri = "mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority"

results = train_from_mongodb(
    mongo_uri=uri,
    database='waste_db',
    collection='training',
    output_model_path='custom_model.pkl'
)
```

#### 4. With Authentication Source

```python
from waste_predictor import train_from_mongodb

results = train_from_mongodb(
    mongo_uri='mongodb://localhost:27017',
    database='waste_production',
    username='data_scientist',
    password='mypassword',
    auth_source='admin',  # Authentication database
    collection='monthly_waste_data'
)
```

## DataFrame Training

Train from any pandas-compatible data source (CSV, Excel, databases, etc.)

### Example: Train from CSV

```python
import pandas as pd
from waste_predictor import train_from_dataframe

# Load data
df = pd.read_csv('waste_training_data.csv')

# Train model
results = train_from_dataframe(
    df=df,
    output_model_path='csv_trained_model.pkl',
    verbose=True
)

print(f"Training complete! R²: {results['metrics']['r2']:.4f}")
```

### Example: Train from Excel

```python
import pandas as pd
from waste_predictor import train_from_dataframe

# Load from Excel
df = pd.read_excel('waste_data.xlsx', sheet_name='Training')

# Train
results = train_from_dataframe(df, output_model_path='excel_model.pkl')
```

### Example: Train from SQL Database

```python
import pandas as pd
from sqlalchemy import create_engine
from waste_predictor import train_from_dataframe

# Connect to database
engine = create_engine('postgresql://user:pass@localhost/waste_db')

# Query training data
query = """
SELECT 
    production_volume,
    rain_sum,
    temperature_mean,
    humidity_mean,
    wind_speed_mean,
    month,
    Total_Waste_kg,
    Solid_Waste_Limestone_kg,
    -- ... other columns
FROM waste_training_table
WHERE year >= 2020
"""

df = pd.read_sql(query, engine)

# Train
results = train_from_dataframe(df, output_model_path='sql_model.pkl')
```

## Understanding Training Output

The training process returns a dictionary with:

```python
{
    'status': 'success',
    'model_path': 'waste_predictor_v4.pkl',
    'training_samples': 1200,
    'metrics': {
        'r2': 0.9845,
        'mae': 1485.23,
        'rmse': 2786.45,
        'r2_per_target': {
            'Total_Waste_kg': 0.9612,
            'Solid_Waste_Limestone_kg': 0.9823,
            # ... other targets
        }
    },
    'feature_columns': ['production_volume', 'rain_sum', ...]
}
```

### Metrics Explained

- **R² Score** (0-1): How well the model explains variance. >0.95 is excellent.
- **MAE** (Mean Absolute Error): Average prediction error in kg/L
- **RMSE** (Root Mean Squared Error): Penalizes larger errors more
- **R² per target**: Individual R² for each waste type

## Training Best Practices

### 1. Data Volume

- **Minimum**: 100 samples
- **Recommended**: 500+ samples
- **Optimal**: 1000+ samples

More data generally leads to better models.

### 2. Data Quality

- Remove duplicates
- Handle missing values
- Check for outliers
- Ensure data consistency

```python
import pandas as pd

# Data quality checks
df = pd.read_csv('training_data.csv')

print("Missing values:")
print(df.isnull().sum())

print("\nDuplicates:")
print(df.duplicated().sum())

# Remove duplicates
df = df.drop_duplicates()

# Handle missing values (example)
df = df.dropna()  # or use df.fillna()
```

### 3. Data Distribution

Ensure your training data covers the range of values you'll see in production:

```python
# Check value ranges
print(df[['production_volume', 'rain_sum', 'temperature_mean']].describe())
```

### 4. Model Validation

The training process automatically:
- Splits data (85% train, 15% test)
- Performs 5-fold cross-validation
- Reports metrics for each target variable

## Using Your Trained Model

After training, use your custom model for predictions:

```python
from waste_predictor import get_waste_prediction

# The package will use the most recently saved model
# Or specify the path in your predict.py

result = get_waste_prediction({
    'production_volume': 50000,
    'rain_sum': 200,
    'temperature_mean': 28,
    'humidity_mean': 85,
    'wind_speed_mean': 15,
    'month': 6
})

print(result)
```

## Troubleshooting

### Connection Issues

**Error**: `ConnectionFailure: Failed to connect to MongoDB`

**Solutions**:
- Check MongoDB is running: `mongod --version`
- Verify connection string
- Check firewall/network settings
- For Atlas: whitelist your IP address

### Missing Data

**Error**: `ValueError: Missing required columns`

**Solutions**:
- Verify all required fields exist in your documents
- Check field name spelling (case-sensitive)
- Use `db.collection.findOne()` to inspect document structure

### Memory Issues

**Error**: OutOfMemoryError during training

**Solutions**:
- Train on a subset of data first
- Use a machine with more RAM
- Close other applications

### Low Performance

If R² < 0.90:
- Check data quality (outliers, errors)
- Ensure sufficient training samples
- Verify feature distributions match production data
- Consider collecting more diverse training data

## Advanced Configuration

### Custom Model Path

```python
results = train_from_mongodb(
    mongo_uri='mongodb://localhost:27017',
    database='waste_db',
    collection='training',
    output_model_path='/models/production/waste_v4.pkl',  # Custom path
    verbose=True
)
```

### Headless Training (No Output)

```python
results = train_from_mongodb(
    mongo_uri='mongodb://localhost:27017',
    database='waste_db',
    collection='training',
    verbose=False  # Suppress all output
)
```

## Integration Examples

### Automated Retraining Script

```python
#!/usr/bin/env python3
"""
Automated model retraining script
Run daily/weekly via cron job
"""

import os
from datetime import datetime
from waste_predictor import train_from_mongodb

def retrain_model():
    """Retrain model with latest data"""
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    model_path = f'models/waste_predictor_{timestamp}.pkl'
    
    results = train_from_mongodb(
        mongo_uri=os.getenv('MONGO_URI'),
        database=os.getenv('MONGO_DB'),
        username=os.getenv('MONGO_USER'),
        password=os.getenv('MONGO_PASS'),
        collection='training',
        output_model_path=model_path,
        verbose=True
    )
    
    # Only deploy if performance is good
    if results['metrics']['r2'] >= 0.95:
        print(f"✅ Model meets quality threshold")
        # Copy to production path
        import shutil
        shutil.copy(model_path, 'models/production/current.pkl')
    else:
        print(f"❌ Model R² too low: {results['metrics']['r2']:.4f}")
    
    return results

if __name__ == '__main__':
    retrain_model()
```

### API Integration

```python
from flask import Flask, request, jsonify
from waste_predictor import train_from_mongodb, get_waste_prediction

app = Flask(__name__)

@app.route('/train', methods=['POST'])
def trigger_training():
    """API endpoint to trigger model retraining"""
    config = request.json
    
    results = train_from_mongodb(
        mongo_uri=config['mongo_uri'],
        database=config['database'],
        collection=config.get('collection', 'training'),
        verbose=False
    )
    
    return jsonify(results)

@app.route('/predict', methods=['POST'])
def predict():
    """API endpoint for predictions"""
    input_data = request.json
    result = get_waste_prediction(input_data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=False)
```

## Support

For issues or questions:
1. Check this training guide
2. Review example scripts in the repository
3. Check package documentation
4. Open an issue on GitHub
