# Waste Optimization ML

**Inverse Optimization Engine for Salt Production Waste Management**

Find optimal production conditions to achieve desired waste outcomes using trained ML models and multi-objective optimization.

---

## 🎯 Overview

This module performs **inverse optimization** - given target waste percentages, it computes the optimal production features (weather conditions, production levels) needed to achieve those targets.

**Key Capabilities:**
- ✅ Minimize total waste percentage
- ✅ Target specific waste outcomes (percentages)
- ✅ Multi-category optimization (salt dust, brine, organic, etc.)
- ✅ Realistic constraints based on Puttalam district climate
- ✅ Multiple optimization algorithms (SLSQP, Trust-constr, Differential Evolution)
- ✅ Seasonal constraint adaptation

---

## 📁 Architecture

```
waste_optimization_ml/
├── optimizer.py              # Core optimization engine
├── constraints.py            # Feature bounds & validation
├── run_optimization.py       # CLI interface
├── test_optimization.py      # Test suite
├── config/                   # Configuration files
├── results/                  # Optimization results (JSON)
└── README.md                 # This file
```

**Technology Stack:**
- **scipy.optimize**: Constrained optimization algorithms
- **Trained Model**: Uses waste_prediction_ml models as objective function
- **Constraints**: Climate/production bounds from historical data (2023-2025)

---

## 🚀 Quick Start

### 1. Installation

```bash
# Already installed if you set up waste_prediction_ml
pip install scipy numpy pandas joblib
```

### 2. Basic Usage

**Minimize Total Waste:**
```bash
python run_optimization.py --mode minimize --month 7 --production 3000000
```

**Target 4% Total Waste:**
```bash
python run_optimization.py --mode target --month 7 --target-total 4.0 --production 3000000
```

**Multi-Category Targets:**
```bash
python run_optimization.py --mode target --month 7 \
    --target-total 4.5 \
    --target-salt-dust 1.5 \
    --target-brine 1.0 \
    --production 3000000
```

### 3. Run Tests

```bash
python test_optimization.py
```

---

## 💻 Programmatic Usage

```python
from optimizer import WasteOptimizer, print_optimization_result

# Initialize optimizer
optimizer = WasteOptimizer()

# Example 1: Minimize waste for July
result = optimizer.optimize_minimize_waste(
    month=7,
    production_kg=3000000,
    method='SLSQP'
)

print_optimization_result(result)

# Example 2: Target 4% waste
result = optimizer.optimize_target_waste(
    target_percentages={'total_waste_kg': 4.0},
    month=7,
    production_kg=3000000
)

print_optimization_result(result)

# Access results
optimal_temp = result.optimal_features['temperature_c']
optimal_humidity = result.optimal_features['humidity_pct']
predicted_waste = result.predicted_waste['total_waste_kg']
```

---

## 🔧 Command Line Options

```bash
python run_optimization.py --help
```

**Required Arguments:**
- `--mode {minimize,target}` - Optimization mode
- `--month {1-12}` - Target month

**Optional Arguments:**
- `--production FLOAT` - Fix production level (kg)
- `--target-total FLOAT` - Target total waste %
- `--target-salt-dust FLOAT` - Target salt dust %
- `--target-brine FLOAT` - Target brine runoff %
- `--target-organic FLOAT` - Target organic matter %
- `--target-packaging FLOAT` - Target packaging waste %
- `--target-other FLOAT` - Target other solids %
- `--method {SLSQP,trust-constr,differential_evolution}` - Algorithm
- `--no-seasonal` - Disable seasonal constraints
- `--output FILENAME` - Output file name

---

## 📊 Optimization Methods

### SLSQP (Default)
- **Sequential Least Squares Programming**
- Fast, gradient-based
- Good for smooth objectives
- Recommended for most use cases

### Trust-constr
- **Trust-region constrained algorithm**
- Robust to nonlinear constraints
- Slower but more reliable

### Differential Evolution
- **Genetic algorithm**
- Global optimization
- No gradients needed
- Slower but finds global optima

**Example:**
```bash
python run_optimization.py --mode minimize --month 7 --method differential_evolution
```

---

## 🌍 Feature Constraints

### Climate Bounds (Puttalam District)

| Feature | Min | Max | Typical |
|---------|-----|-----|---------|
| Temperature (°C) | 23 | 35 | 28 |
| Humidity (%) | 45 | 98 | 80 |
| Rainfall (mm) | 0 | 500 | 150 |
| Wind Speed (km/h) | 2 | 30 | 15 |
| Production (kg) | 500,000 | 10,000,000 | 3,000,000 |

### Seasonal Patterns

**Dry Season (Dec-Mar):**
- Lower humidity (50-85%)
- Less rainfall (20-160mm)
- Higher production capacity

**Southwest Monsoon (Jun-Sep):**
- Higher humidity (70-90%)
- Moderate rainfall (80-220mm)
- Consistent production

**Northeast Monsoon (Oct-Nov):**
- Very high humidity (80-98%)
- Heavy rainfall (200-500mm)
- Lower production

---

## 📈 Example Results

### Minimize Waste (July, 3000 tons production)

```
OPTIMAL FEATURES
================
Temperature:          26.50°C
Humidity:             72.30%
Rainfall:             80.00mm
Wind Speed:           18.50 km/h
Production:           3,000,000 kg
Month:                7

PREDICTED WASTE OUTCOMES
========================
Total Waste:          4.23%
Salt Dust:            1.48%
Brine Runoff:         0.99%
Organic Matter:       0.68%
Packaging:            0.63%
Other Solids:         0.42%
```

### Target 4% Waste

```
OPTIMAL FEATURES
================
Temperature:          27.20°C
Humidity:             75.80%
Rainfall:             90.50mm
Wind Speed:           16.20 km/h

PREDICTED WASTE
===============
Total Waste:          4.02% (Target: 4.00%, Diff: +0.02%)
```

---

## 🔬 How It Works

### Architecture Flow

```
1. Load Trained Model
   └─> Predictor + Scaler + Feature Names

2. Define Optimization Problem
   └─> Objective: minimize waste OR target waste percentages
   └─> Constraints: realistic feature bounds

3. Run Optimization Algorithm
   └─> scipy.optimize (SLSQP/Trust-constr/DE)
   └─> Iteratively adjust features
   └─> Evaluate using trained model

4. Return Optimal Features
   └─> Weather conditions
   └─> Production level
   └─> Predicted waste outcomes
```

### Objective Functions

**Minimize Mode:**
```python
objective = predicted_total_waste_percentage
minimize(objective)
```

**Target Mode:**
```python
objective = sum(weight_i * (predicted_i - target_i)²)
minimize(objective)  # Minimize squared error from targets
```

### Feature Engineering
The optimizer uses the same feature engineering as the prediction model:
- Temperature × Humidity interaction
- Production / Temperature ratio
- Rainfall / Humidity ratio
- Squared terms
- Wind × Temperature interaction
- Production / Rainfall ratio

---

## ✅ Validation

The optimization results are validated against:
1. **Feature bounds** - All values within realistic ranges
2. **Seasonal patterns** - Aligned with climate norms
3. **Model predictions** - Cross-checked with trained model
4. **Historical comparison** - Compared to actual data

---

## 📝 Output Format

Results are saved as JSON:

```json
{
  "success": true,
  "optimal_features": {
    "temperature_c": 27.5,
    "humidity_pct": 75.0,
    "rainfall_mm": 85.0,
    "wind_speed_kmh": 17.2,
    "production_kg": 3000000,
    "month": 7
  },
  "predicted_waste_percentages": {
    "total_waste_kg": 4.18,
    "salt_dust_kg": 1.46,
    "brine_runoff_kg": 0.98,
    ...
  },
  "target_waste_percentages": {
    "total_waste_kg": 4.0
  },
  "objective_value": 0.000324,
  "iterations": 45,
  "method": "SLSQP",
  "timestamp": "2025-12-26T12:45:00"
}
```

---

## 🎯 Use Cases

### 1. Production Planning
*"What conditions minimize waste for next month?"*
```bash
python run_optimization.py --mode minimize --month 8
```

### 2. Target Setting
*"What do we need to achieve 4% waste?"*
```bash
python run_optimization.py --mode target --month 7 --target-total 4.0
```

### 3. Scenario Analysis
*"Compare waste across seasons"*
```python
for month in [1, 4, 7, 10]:
    result = optimizer.optimize_minimize_waste(month=month)
    print(f"Month {month}: {result.predicted_waste['total_waste_kg']:.2f}%")
```

### 4. What-If Analysis
*"If we increase production to 5000 tons, what conditions minimize waste?"*
```bash
python run_optimization.py --mode minimize --month 7 --production 5000000
```

---

## 🔒 Constraints & Limitations

### Constraints
- ✅ Realistic climate bounds (Puttalam district)
- ✅ Seasonal patterns enforced
- ✅ Production capacity limits
- ✅ Physical feasibility checks

### Limitations
- ⚠️ Optimizes controllable features only (weather is given)
- ⚠️ Assumes model predictions are accurate
- ⚠️ Limited to monthly aggregation
- ⚠️ Based on historical patterns (2023-2025)

### Practical Notes
- Most weather features are **environmental constraints** (not controllable)
- **Production level** is the primary controllable variable
- Optimization shows **ideal conditions**, not prescriptions

---

## 🧪 Testing

Run comprehensive test suite:

```bash
python test_optimization.py
```

**Tests Include:**
1. ✅ Minimize waste optimization
2. ✅ Target waste optimization
3. ✅ Multi-category targets
4. ✅ Seasonal comparisons
5. ✅ Algorithm comparison
6. ✅ Variable production optimization

---

## 📚 Technical Details

### Dependencies
```
scipy>=1.11.0
numpy>=1.24.0
pandas>=2.0.0
joblib>=1.3.0
```

### Model Requirements
- Trained model from `waste_prediction_ml/models_monthly/`
- Model artifacts: `predictor.joblib`, `scaler.joblib`, `feature_names.json`

### Performance
- **SLSQP**: ~0.1-0.5 seconds per optimization
- **Differential Evolution**: ~5-30 seconds per optimization
- **Typical iterations**: 20-100

---

## 🤝 Integration

### With Prediction API
```python
# 1. Find optimal features
optimizer = WasteOptimizer()
result = optimizer.optimize_target_waste(
    target_percentages={'total_waste_kg': 4.0},
    month=7
)

# 2. Verify with API
import requests
response = requests.post('http://localhost:5000/predict', json={
    'temperature_c': result.optimal_features['temperature_c'],
    'humidity_pct': result.optimal_features['humidity_pct'],
    'rainfall_mm': result.optimal_features['rainfall_mm'],
    'wind_speed_kmh': result.optimal_features['wind_speed_kmh'],
    'production_kg': result.optimal_features['production_kg'],
    'month': result.optimal_features['month']
})

print(response.json())
```

---

## 📞 Support

**Issues?**
1. Check constraints are reasonable
2. Try different optimization methods
3. Verify model is loaded correctly
4. Check seasonal bounds for your month

**For Technical Support:**
- Review test_optimization.py for examples
- Check constraints.py for bounds
- Validate with known scenarios

---

## 🔮 Future Enhancements

- [ ] Multi-month optimization
- [ ] Pareto frontier analysis (multi-objective)
- [ ] Uncertainty quantification
- [ ] Real-time weather integration
- [ ] Production scheduling optimization
- [ ] Cost-benefit analysis integration

---

## 📄 License

Puttalam Salt Society - Internal Use
December 2025

---

**Created by:** AI/ML Tech Lead  
**Version:** 1.0.0  
**Last Updated:** December 26, 2025
