"""
Data validation utilities
"""

import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)


class DataValidator:
    """Validate input data for predictions"""
    
    WEATHER_RANGES = {
        'Temperature (°C)': (-10, 50),
        'Humidity (%)': (0, 100),
        'Rain (mm)': (0, 500),
        'Wind Speed (km/h)': (0, 100),
        'Evaporation Index': (0, 100)
    }
    
    COMPOSITION_RANGES = {
        'Organic Matter (%)': (0, 100),
        'Gypsum (%)': (0, 100),
        'Magnesium (%)': (0, 100),
        'Iron Oxides (%)': (0, 100),
        'Silica/Clay (%)': (0, 100),
        'Residual Salt (%)': (0, 100),
        'Moisture (%)': (0, 100)
    }
    
    @staticmethod
    def validate_weather_data(data: dict) -> bool:
        """Validate weather input data
        
        Args:
            data: Dictionary with weather features
            
        Returns:
            True if valid, False otherwise
        """
        for feature, (min_val, max_val) in DataValidator.WEATHER_RANGES.items():
            if feature in data:
                value = data[feature]
                if not isinstance(value, (int, float)) or not (min_val <= value <= max_val):
                    logger.warning(f"Invalid {feature}: {value} (expected {min_val}-{max_val})")
                    return False
        return True
    
    @staticmethod
    def validate_composition_predictions(predictions: dict) -> bool:
        """Validate waste composition predictions
        
        Args:
            predictions: Dictionary with waste compositions
            
        Returns:
            True if valid, False otherwise
        """
        # Check if percentages sum to approximately 100%
        total = sum(v.get('percentage', 0) for v in predictions.values() if isinstance(v, dict))
        
        if not (95 <= total <= 105):
            logger.warning(f"Waste composition percentages sum to {total}% (expected ~100%)")
            return False
        
        for component, (min_val, max_val) in DataValidator.COMPOSITION_RANGES.items():
            if component in predictions:
                value = predictions[component].get('percentage', 0) if isinstance(predictions[component], dict) else predictions[component]
                if not (min_val <= value <= max_val):
                    logger.warning(f"Invalid {component}: {value}% (expected {min_val}-{max_val}%)")
                    return False
        
        return True
    
    @staticmethod
    def validate_training_data(df: pd.DataFrame) -> tuple:
        """Validate training data completeness
        
        Args:
            df: Training data DataFrame
            
        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []
        
        # Check required columns
        required_cols = (
            ['Date', 'Production Volume', 'Temperature (°C)', 'Humidity (%)', 'Rain (mm)',
             'Wind Speed (km/h)', 'Evaporation Index', 'Confidence',
             'Organic Matter (%)', 'Gypsum (%)', 'Magnesium (%)', 'Iron Oxides (%)',
             'Silica/Clay (%)', 'Residual Salt (%)', 'Moisture (%)']
        )
        
        for col in required_cols:
            if col not in df.columns:
                errors.append(f"Missing required column: {col}")
        
        if errors:
            return False, errors
        
        # Check for missing values
        missing = df[required_cols].isnull().sum()
        if missing.any():
            for col, count in missing[missing > 0].items():
                errors.append(f"Column {col} has {count} missing values")
        
        # Check composition sum to ~100%
        composition_cols = ['Organic Matter (%)', 'Gypsum (%)', 'Magnesium (%)',
                           'Iron Oxides (%)', 'Silica/Clay (%)', 'Residual Salt (%)',
                           'Moisture (%)']
        df['CompositionSum'] = df[composition_cols].sum(axis=1)
        
        invalid_rows = (df['CompositionSum'] < 95) | (df['CompositionSum'] > 105)
        if invalid_rows.any():
            errors.append(f"{invalid_rows.sum()} rows have composition percentages not summing to ~100%")
        
        return len(errors) == 0, errors
