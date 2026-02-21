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

Example:
    >>> from waste_predictor import WastePredictor, predict_waste
    >>> 
    >>> # Quick prediction
    >>> result = predict_waste(
    ...     production_volume=50000,
    ...     rain_sum=200,
    ...     temperature_mean=28,
    ...     humidity_mean=85,
    ...     wind_speed_mean=15,
    ...     month=6
    ... )
    >>> print(f"Total Waste: {result['Total_Waste_kg']:,.0f} kg")
    >>>
    >>> # Using the class
    >>> predictor = WastePredictor()
    >>> result = predictor.predict(
    ...     production_volume=50000,
    ...     rain_sum=200,
    ...     temperature_mean=28,
    ...     humidity_mean=85,
    ...     wind_speed_mean=15,
    ...     month=6
    ... )
"""

__version__ = "4.0.2"
__author__ = "Research Project Team"
__description__ = "Production-grade waste prediction ML system"

from .predict import WastePredictor, predict_waste

__all__ = [
    "WastePredictor",
    "predict_waste",
    "__version__",
]
