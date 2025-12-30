"""
Feature engineering utilities for waste prediction
"""

import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Engineer features from raw data for waste composition prediction"""
    
    # Waste composition targets based on new columns
    WASTE_COMPONENTS = [
        'Organic Matter (%)',
        'Gypsum (%)',
        'Magnesium (%)',
        'Iron Oxides (%)',
        'Silica/Clay (%)',
        'Residual Salt (%)',
        'Moisture (%)'
    ]
    
    # Weather features from training data
    WEATHER_FEATURES = [
        'Temperature (°C)',
        'Humidity (%)',
        'Rain (mm)',
        'Wind Speed (km/h)',
        'Evaporation Index'
    ]
    
    # Production features
    PRODUCTION_FEATURES = [
        'Production Volume',
        'Predicted Waste (bags)'
    ]
    
    @staticmethod
    def engineer_features(df: pd.DataFrame) -> tuple:
        """Engineer comprehensive features for the model
        
        Args:
            df: Raw training data
            
        Returns:
            Tuple of (X features, y targets, feature_names list)
        """
        
        df = df.copy()
        
        # Extract temporal features from Date
        df['Date'] = pd.to_datetime(df['Date'])
        df['DayOfYear'] = df['Date'].dt.dayofyear
        df['Quarter'] = df['Date'].dt.quarter
        df['Month'] = df['Date'].dt.month
        df['Year'] = df['Date'].dt.year
        
        # Seasonal features
        df['IsSummer'] = (df['Month'].isin([6, 7, 8])).astype(int)
        df['IsWinter'] = (df['Month'].isin([12, 1, 2])).astype(int)
        df['IsMonsoon'] = (df['Month'].isin([6, 7, 8, 9])).astype(int)
        df['IsSpring'] = (df['Month'].isin([3, 4, 5])).astype(int)
        
        # Weather interaction features
        df['Temp_Humidity'] = df['Temperature (°C)'] * df['Humidity (%)']
        df['Temp_Squared'] = df['Temperature (°C)'] ** 2
        df['Humidity_Squared'] = df['Humidity (%)'] ** 2
        df['RainfallPerDay'] = df['Rain (mm)'] / 30.0
        
        # Production-based features (non-linear relationships)
        df['Production_Log'] = np.log1p(df['Production Volume'])
        df['Production_Sqrt'] = np.sqrt(df['Production Volume'])
        df['Production_Inv'] = 1.0 / (1.0 + df['Production Volume'])
        
        # Combined features for waste generation patterns
        df['TempXProduction'] = df['Temperature (°C)'] * df['Production_Log']
        df['HumidityXProduction'] = df['Humidity (%)'] * df['Production_Log']
        df['EvaporationXProduction'] = df['Evaporation Index'] * df['Production_Log']
        
        # Rolling statistics (temporal patterns)
        rolling_cols = ['Temperature (°C)', 'Humidity (%)', 'Production Volume']
        for col in rolling_cols:
            for window in [3, 6, 12]:
                if len(df) >= window:
                    df[f'{col}_Rolling{window}'] = df[col].rolling(window=window, min_periods=1).mean()
        
        # Feature selection - comprehensive set
        feature_cols = (
            FeatureEngineer.WEATHER_FEATURES +
            FeatureEngineer.PRODUCTION_FEATURES +
            ['Confidence'] +
            ['DayOfYear', 'Quarter', 'Month', 'IsSummer', 'IsWinter', 'IsMonsoon', 'IsSpring'] +
            ['Temp_Humidity', 'Temp_Squared', 'Humidity_Squared', 'RainfallPerDay'] +
            ['Production_Log', 'Production_Sqrt', 'Production_Inv'] +
            ['TempXProduction', 'HumidityXProduction', 'EvaporationXProduction']
        )
        
        # Add rolling features
        for col in rolling_cols:
            for window in [3, 6, 12]:
                col_name = f'{col}_Rolling{window}'
                if col_name in df.columns:
                    feature_cols.append(col_name)
        
        # Filter to features that exist in dataframe
        feature_cols = [col for col in feature_cols if col in df.columns]
        
        X = df[feature_cols].values
        y = df[FeatureEngineer.WASTE_COMPONENTS].values
        
        logger.info(f"Engineered {len(feature_cols)} features")
        logger.info(f"Predicting {len(FeatureEngineer.WASTE_COMPONENTS)} waste components")
        
        return X, y, feature_cols, FeatureEngineer.WASTE_COMPONENTS
    
    @staticmethod
    def prepare_prediction_features(input_data: dict, feature_names: list) -> np.ndarray:
        """Prepare features from input dict for prediction
        
        Args:
            input_data: Dictionary with feature values
            feature_names: List of expected feature names
            
        Returns:
            Feature array for prediction
        """
        features = []
        for fname in feature_names:
            features.append(input_data.get(fname, 0.0))
        return np.array(features).reshape(1, -1)
