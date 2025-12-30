# Quick Reference - Digital Twin Commands

## 🎯 Most Common Operations

### 1. Generate Next 12 Months to Excel
```bash
python generate_excel.py --output predictions_2025.xlsx
```

### 2. Stream Current Month
```bash
python stream_data.py --fast
```

### 3. Forecast Full Year (Jan-Dec 2025)
```bash
python generate_excel.py --start 2025-01-01 --end 2025-12-31 --output yearly_forecast.xlsx
```

### 4. Stream Historical Data (2015-2025)
```bash
python generate_excel.py --start 2015-01-01 --end 2025-12-31 --output historical_11years.xlsx
```

## 📊 Key Metrics

| Metric | Value |
|--------|-------|
| Waste Prediction R² | 0.735 |
| Composition R² (avg) | 0.9464 |
| Improvement (Composition) | +519% |
| Components Tracked | 7 |
| Market Value Range | $2.50-2.70/bag |

## 🗂️ Output Files Location

- **JSON**: `data/processed/stream_output/*.json` (one per month)
- **Excel**: Same directory as command or specified with `--output`
- **Models**: `utils/models_advanced/` (7 XGBoost models + scaler)

## 🔄 Data Flow

```
Weather Data → Digital Twin (Ridge) → Waste Prediction
         ↓
        └→ Composition Predictor (XGBoost) → 7 Components → Market Value
```

## 💡 Usage Tips

1. **For monthly updates**: Use `stream_data.py --fast` (creates JSON)
2. **For reporting**: Use `generate_excel.py` (creates formatted Excel)
3. **For specific period**: Always use `--start` and `--end` dates
4. **For fast execution**: Add `--fast` flag (removes delays)

## ⚙️ Model Details

### Waste Prediction (Ridge Regression)
- 5 input features
- Trained on 32 historical records
- Confidence: 0.9 (90%)

### Composition Prediction (XGBoost)
- 14 engineered features
- 500 training samples
- 7 independent models (one per component)
- Average R²: 0.9464 (excellent)

## 🌍 Seasonal Patterns

**Monsoon (May-Sept)**:
- Higher organic matter (algae growth)
- More moisture
- Lower gypsum (dilution)
- Higher silica (sediment)

**Dry Season (Oct-Apr)**:
- Lower organic matter
- Lower moisture
- Higher gypsum (crystallization)
- Higher salt concentration

## 📦 Dependencies

```
pandas
numpy
scikit-learn
xgboost
openpyxl (for Excel)
```

Install: `pip install -r requirements.txt`

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Models not found" | Ensure `utils/models_advanced/` exists with `.json` and `.pkl` files |
| "No data in output" | Check date range with `--start` and `--end` |
| "Slow execution" | Add `--fast` flag to stream_data.py |
| "Excel not created" | Check `--output` path has write permissions |

## 📞 Model Versions

- **Waste Prediction**: Ridge Regression (v1.0)
- **Composition**: XGBoost Advanced (v2.0) - supersedes Ridge/Hybrid approaches
