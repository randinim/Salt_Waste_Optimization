"""
Data loading and preprocessing utilities
"""

import pandas as pd
import numpy as np
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class DataLoader:
    """Load and prepare training data"""
    
    @staticmethod
    def load_training_data(data_path: str) -> pd.DataFrame:
        """Load training data from Excel file
        
        Args:
            data_path: Path to training_data.xlsx
            
        Returns:
            DataFrame with cleaned data
        """
        try:
            df = pd.read_excel(data_path)
            logger.info(f"Loaded {len(df)} records from {data_path}")
            return df
        except Exception as e:
            logger.error(f"Failed to load data: {e}")
            raise
    
    @staticmethod
    def validate_data(df: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate data"""
        
        # Handle missing values
        df = df.dropna(subset=['Production Volume', 'Temperature (°C)', 'Humidity (%)', 
                               'Organic Matter (%)', 'Gypsum (%)', 'Magnesium (%)',
                               'Iron Oxides (%)', 'Silica/Clay (%)', 'Residual Salt (%)', 
                               'Moisture (%)'])
        
        # Remove duplicates
        df = df.drop_duplicates(subset=['Date'])
        
        # Ensure correct data types
        numeric_cols = ['Production Volume', 'Temperature (°C)', 'Humidity (%)', 'Rain (mm)',
                       'Wind Speed (km/h)', 'Predicted Waste (bags)', 'Evaporation Index',
                       'Confidence', 'Organic Matter (%)', 'Gypsum (%)', 'Magnesium (%)',
                       'Iron Oxides (%)', 'Silica/Clay (%)', 'Residual Salt (%)', 
                       'Moisture (%)', 'Value per Bag (USD)']
        
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        logger.info(f"Data validation complete: {len(df)} valid records")
        return df
