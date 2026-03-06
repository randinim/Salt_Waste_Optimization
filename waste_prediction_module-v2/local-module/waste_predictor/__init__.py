"""
Waste Prediction Module V4
===========================

A production-grade machine learning system for predicting industrial waste 
compositions based on production volume and environmental parameters.

Performance:
    - R² Score: 0.98
    - MAE: 1,485 kg
    - RMSE: 2,786 kg
    - CV R² (5-Fold): 0.9766 ± 0.0025

Prediction Example:
    >>> from waste_predictor import get_waste_prediction
    >>> 
    >>> result = get_waste_prediction({
    ...     'production_volume': 50000,
    ...     'rain_sum': 200,
    ...     'temperature_mean': 28,
    ...     'humidity_mean': 85,
    ...     'wind_speed_mean': 15,
    ...     'month': 6
    ... })
    >>> print(f"Total Waste: {result['Total_Waste_kg']:,.0f} kg")

Training Example:
    >>> from waste_predictor import train_from_mongodb
    >>> 
    >>> results = train_from_mongodb(
    ...     mongo_uri='mongodb://localhost:27017',
    ...     database='waste_db',
    ...     collection='training'
    ... )
    >>> print(f"Model R²: {results['metrics']['r2']:.4f}")
"""

__version__ = "1.0.5"
__author__ = "Research Project Team"
__description__ = "Production-grade waste prediction ML system"

from .predict import WastePredictor, predict_waste
from .predict_api import get_waste_prediction
from .train_api import train_from_mongodb, train_from_dataframe
from .update_api import update_model_from_s3, restore_model_from_backup

__all__ = [
    "WastePredictor",
    "predict_waste",
    "get_waste_prediction",
    "train_from_mongodb",
    "train_from_dataframe",
    "update_model_from_s3",
    "restore_model_from_backup",
    "__version__",
]
