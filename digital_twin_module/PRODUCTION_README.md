# Digital Twin - Production Setup

## 📦 Project Structure

```
digital_twin_module/
├── stream_data.py                      # Stream predictions to JSON (monthly)
├── generate_excel.py                   # Export predictions to Excel
├── data/
│   ├── original/                       # Raw data (if available)
│   └── processed/
│       ├── stream_output/              # Monthly JSON predictions
│       └── training_data/              # Historical & Excel exports
├── utils/
│   ├── digital_twin.py                 # Core waste prediction (Ridge R²=0.735)
│   ├── synthetic_data_generator.py     # Weather/production data generation
│   └── composition_advanced_predictor.py # Waste composition (XGBoost R²=0.9464)
└── config/                             # Configuration files (optional)
```

## 🎯 Core Models

### 1. Waste Prediction (digital_twin.py)
- **Algorithm**: Ridge Regression
- **R² Score**: 0.735
- **Predicts**: Monthly waste bags
- **Features**: Production volume, temperature, humidity, rain, wind speed
- **Output**: Waste bags, evaporation index, confidence score

### 2. Composition Prediction (composition_advanced_predictor.py)
- **Algorithm**: XGBoost (7 independent models)
- **R² Score**: 0.9464 average (was 0.1529 with basic Ridge)
- **Improvement**: +519%
- **Predicts**: 7 waste component percentages
- **Training Data**: 500 samples with physics-based correlations
- **Features**: 14 engineered features (base + interactions + seasonal)

**Components Tracked**:
- Organic Matter (40-70%)
- Gypsum (5-16%)
- Magnesium (8-16%)
- Iron Oxides (3-8%)
- Silica/Clay (4-12%)
- Residual Salt (5-13%)
- Moisture (2-18%)

## 🚀 Quick Start

### Generate Monthly Predictions to JSON
```bash
python stream_data.py --start 2025-01-01 --end 2025-12-31 --fast
```
Output: Individual JSON files in `data/processed/stream_output/`

### Export to Excel with Full Details
```bash
python generate_excel.py --start 2025-01-01 --end 2025-12-31 --output predictions.xlsx
```
Output: Excel file with:
- 18 columns: inputs + waste prediction + composition + market value
- Each row = one month
- Market value per bag (USD) based on component prices

### Test Recent Data (1 month)
```bash
python stream_data.py --start 2025-06-01 --end 2025-06-30 --fast
```

## 📊 Excel Output Columns

| Column | Type | Description |
|--------|------|-------------|
| Date | Date | Month-end date |
| Month | Integer | Month number (1-12) |
| Production Volume | Float | Monthly production (kg) |
| Temperature (°C) | Float | Average temperature |
| Humidity (%) | Float | Average humidity |
| Rain (mm) | Float | Monthly rainfall |
| Wind Speed (km/h) | Float | Average wind speed |
| Predicted Waste (bags) | Float | Waste output prediction |
| Evaporation Index | Float | Water evaporation indicator |
| Confidence | Float | Model confidence (0-1) |
| Organic Matter (%) | Float | Component percentage |
| Gypsum (%) | Float | Component percentage |
| Magnesium (%) | Float | Component percentage |
| Iron Oxides (%) | Float | Component percentage |
| Silica/Clay (%) | Float | Component percentage |
| Residual Salt (%) | Float | Component percentage |
| Moisture (%) | Float | Component percentage |
| Value per Bag (USD) | Float | Market value estimate |

## 💰 Market Value Estimation

Component prices (USD/ton):
- Organic Matter: $150 (fertilizer, biofuel)
- Magnesium: $120 (industrial)
- Iron Oxides: $80 (pigments)
- Silica/Clay: $40 (construction)
- Gypsum: $25 (construction)
- Residual Salt: $15 (recovery)

Value per 25kg bag ranges: $2.50-2.70 depending on composition

## 📈 Command Line Options

### stream_data.py
```
--start DATE          Start date (YYYY-MM-DD), default: current month
--end DATE            End date (YYYY-MM-DD), default: +12 months
--fast                Fast mode (no delay between records)
--delay SECONDS       Delay between records in fast mode
--output DIR          Output directory (default: data/processed/stream_output)
```

### generate_excel.py
```
--start DATE          Start date (YYYY-MM-DD), default: current month
--end DATE            End date (YYYY-MM-DD), default: +12 months
--output FILE         Output Excel file path (default: predictions.xlsx)
```

## 🔧 Model Training (If Data Updates Required)

To retrain composition models with new data:
```bash
python utils/composition_ml_advanced.py
```

This regenerates:
- 7 XGBoost models (one per component)
- Feature scaler
- Metadata with R² scores

## 📝 JSON Output Example

```json
{
  "timestamp": "2025-12-29T10:01:45.688796",
  "date": "2025-06-30 00:00:00",
  "month": 6,
  "input": {
    "production_volume": 50000.0,
    "temperature_celsius": 28.5,
    "humidity_percent": 80.6,
    "rain_mm": 2.56,
    "wind_speed_kmh": 10.2
  },
  "prediction": {
    "waste_bags": 2377.0,
    "evaporation_index": 0.624,
    "confidence": 0.9
  },
  "composition": {
    "organic_matter_percent": 54.25,
    "gypsum_percent": 8.95,
    "magnesium_percent": 12.61,
    "iron_oxides_percent": 5.18,
    "silica_clay_percent": 7.94,
    "residual_salt_percent": 7.37,
    "moisture_percent": 3.70
  }
}
```

## ✅ Production Ready Checklist

- [x] Waste prediction model (Ridge R²=0.735)
- [x] Composition models (XGBoost R²=0.9464)
- [x] Streaming to JSON (configurable date ranges)
- [x] Excel export (with market values)
- [x] Seasonal variations (monsoon vs dry)
- [x] Market value estimation
- [x] Realistic data generation (physics-based)
- [x] Feature engineering (14 engineered features)
- [x] Trained models in production format

## 🔐 Notes

- Models use XGBoost with domain-informed feature engineering
- Training data is synthetic (500 samples) based on salt production physics
- All predictions normalize to realistic component bounds
- Market values assume 25kg bags (0.025 tons per bag)
- Seasonal variation reflected in monsoon (May-Sept) vs dry season patterns
