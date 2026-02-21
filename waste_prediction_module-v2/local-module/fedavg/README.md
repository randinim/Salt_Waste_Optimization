# Federated Averaging (FedAvg) for Waste Predictor

This folder contains tools for aggregating multiple trained waste predictor models using the Federated Averaging (FedAvg) algorithm.

## Use Case

When you have **multiple instances** of the waste predictor trained on **different data sources** (e.g., different facilities, regions, or time periods), you can combine them into a single, more robust model using FedAvg.

## Quick Start

### 1. Collect Model Files

Ensure you have `.pkl` model files from each instance:
- `instance1_model.pkl`
- `instance2_model.pkl`
- `instance3_model.pkl`
- `instance4_model.pkl`
- `instance5_model.pkl`

### 2. Run FedAvg Aggregation

```bash
python fedavg_aggregate.py instance1_model.pkl instance2_model.pkl instance3_model.pkl instance4_model.pkl instance5_model.pkl --output fedavg_model.pkl
```

### 3. Use the Aggregated Model

The aggregated model (`fedavg_model.pkl`) can be used just like any other trained model:

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
```

## How FedAvg Works

1. **Loads** all model files
2. **Averages** the weights of corresponding sub-models:
   - Ensemble weights
   - Tree ensemble estimators (combined)
   - Neural network parameters (averaged)
   - Linear model coefficients (averaged)
3. **Saves** the aggregated model

## Requirements

- All models must have the same architecture
- All models must be trained on data with the same features
- Install dependencies: `pip install -r requirements.txt`

## Complete Example

See `example_fedavg_workflow.py` for a complete workflow that:
1. Simulates training on 5 different data instances
2. Aggregates them using FedAvg
3. Tests the aggregated model

Run it with:
```bash
python example_fedavg_workflow.py
```

## Command-Line Options

```bash
python fedavg_aggregate.py --help
```

**Arguments:**
- `model_files`: Paths to model `.pkl` files (at least 2 required)
- `--output`, `-o`: Output path for aggregated model (default: `fedavg_model.pkl`)

## Real-World Scenario

### Instance 1 (Factory A)
```python
from waste_predictor import train_from_mongodb

train_from_mongodb(
    mongo_uri='mongodb://factoryA:27017',
    database='waste_data',
    collection='training',
    output_model_path='factoryA_model.pkl'
)
```

### Instance 2 (Factory B)
```python
train_from_mongodb(
    mongo_uri='mongodb://factoryB:27017',
    database='waste_data',
    collection='training',
    output_model_path='factoryB_model.pkl'
)
```

### ... (Instances 3-5 similar)

### Aggregate All Models
```bash
python fedavg_aggregate.py factoryA_model.pkl factoryB_model.pkl factoryC_model.pkl factoryD_model.pkl factoryE_model.pkl --output global_model.pkl
```

## Benefits of FedAvg

✅ **Privacy-preserving**: Each instance keeps its data local  
✅ **Robust**: Combined knowledge from multiple data sources  
✅ **Simple**: No need to centralize training data  
✅ **Scalable**: Works with any number of instances (minimum 2)

## Notes

- The script supports sklearn (tree ensembles, linear models) and PyTorch (neural networks)
- For tree-based models, estimators from all instances are combined rather than averaged
- For neural networks, weights are averaged element-wise
- The aggregated model maintains the same API as individual models

## Troubleshooting

**Error: Can't find class 'GradientBoostingWasteModel'**
- Ensure `waste-predictor` package is installed: `pip install waste-predictor`
- Or ensure the waste_predictor folder is in the parent directory

**Error: Models have incompatible structures**
- Verify all models were trained with the same architecture
- Check that all models have the same feature set

## Support

For issues or questions about FedAvg aggregation, refer to the main package documentation or open an issue on GitHub.
