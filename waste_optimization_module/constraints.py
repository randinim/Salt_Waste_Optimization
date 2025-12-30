"""
Feature Constraints for Waste Optimization
==========================================

Defines realistic bounds and constraints for Puttalam district salt production
based on historical climate data and operational parameters.

Author: AI/ML Tech Lead
Date: December 2025
"""

import numpy as np
from typing import Dict, Tuple


class FeatureConstraints:
    """
    Realistic constraints for salt production features in Puttalam district
    
    Based on historical data analysis (2023-2025):
    - Climate patterns for Sri Lanka's northwestern coastal region
    - Operational production ranges
    - Seasonal variations
    """
    
    # Feature bounds (min, max) based on historical data
    BOUNDS = {
        'temperature_c': (23.0, 35.0),        # Typical range: 24-32°C
        'humidity_pct': (45.0, 98.0),         # Coastal humidity: 50-95%
        'rainfall_mm': (0.0, 500.0),          # Monthly rainfall: 20-485mm
        'wind_speed_kmh': (2.0, 30.0),        # Average wind: 5-25 km/h
        'production_kg': (500000, 10000000),  # 500 tons - 10,000 tons/month
        'month': (1, 12)                      # January to December
    }
    
    # Typical ranges for each season in Puttalam
    SEASONAL_PATTERNS = {
        # Dry season: Dec-March (peak production)
        'dry': {
            'months': [12, 1, 2, 3],
            'temperature_c': (25.0, 32.0),
            'humidity_pct': (50.0, 85.0),
            'rainfall_mm': (20.0, 160.0),
            'wind_speed_kmh': (8.0, 20.0),
        },
        # Inter-monsoon: April-May
        'inter_1': {
            'months': [4, 5],
            'temperature_c': (27.0, 33.0),
            'humidity_pct': (70.0, 90.0),
            'rainfall_mm': (100.0, 420.0),
            'wind_speed_kmh': (12.0, 27.0),
        },
        # Southwest monsoon: June-September
        'monsoon_sw': {
            'months': [6, 7, 8, 9],
            'temperature_c': (26.0, 32.0),
            'humidity_pct': (70.0, 90.0),
            'rainfall_mm': (80.0, 220.0),
            'wind_speed_kmh': (15.0, 26.0),
        },
        # Inter-monsoon: October-November
        'inter_2': {
            'months': [10, 11],
            'temperature_c': (25.0, 30.0),
            'humidity_pct': (80.0, 98.0),
            'rainfall_mm': (200.0, 500.0),
            'wind_speed_kmh': (8.0, 18.0),
        }
    }
    
    # Production capacity constraints
    PRODUCTION_CONSTRAINTS = {
        'min_daily_capacity_kg': 15000,      # ~500 tons/month
        'max_daily_capacity_kg': 330000,     # ~10,000 tons/month
        'typical_daily_kg': 100000,          # ~3,000 tons/month
        'bag_weight_kg': 50,
    }
    
    @classmethod
    def get_bounds(cls, as_tuple=True) -> Dict[str, Tuple[float, float]]:
        """
        Get feature bounds for optimization
        
        Args:
            as_tuple: If True, returns dict. If False, returns separate arrays
            
        Returns:
            Dictionary of (min, max) tuples or separate min/max arrays
        """
        if as_tuple:
            return cls.BOUNDS.copy()
        else:
            # Return as separate arrays for scipy.optimize
            features = ['temperature_c', 'humidity_pct', 'rainfall_mm', 
                       'wind_speed_kmh', 'production_kg', 'month']
            lower_bounds = [cls.BOUNDS[f][0] for f in features]
            upper_bounds = [cls.BOUNDS[f][1] for f in features]
            return lower_bounds, upper_bounds
    
    @classmethod
    def get_seasonal_bounds(cls, month: int) -> Dict[str, Tuple[float, float]]:
        """
        Get seasonally-adjusted bounds for a specific month
        
        Args:
            month: Month number (1-12)
            
        Returns:
            Dictionary of (min, max) tuples adjusted for season
        """
        # Determine season
        season = None
        for s_name, s_data in cls.SEASONAL_PATTERNS.items():
            if month in s_data['months']:
                season = s_data
                break
        
        if season is None:
            return cls.BOUNDS.copy()
        
        # Build seasonal bounds
        bounds = {
            'temperature_c': season['temperature_c'],
            'humidity_pct': season['humidity_pct'],
            'rainfall_mm': season['rainfall_mm'],
            'wind_speed_kmh': season['wind_speed_kmh'],
            'production_kg': cls.BOUNDS['production_kg'],
            'month': (month, month)  # Fixed month
        }
        
        return bounds
    
    @classmethod
    def validate_features(cls, features: Dict[str, float]) -> Tuple[bool, str]:
        """
        Validate if feature values are within realistic bounds
        
        Args:
            features: Dictionary of feature values
            
        Returns:
            (is_valid, message) tuple
        """
        for feature, value in features.items():
            if feature not in cls.BOUNDS:
                continue
                
            min_val, max_val = cls.BOUNDS[feature]
            if value < min_val or value > max_val:
                return False, f"{feature}={value:.2f} outside bounds [{min_val}, {max_val}]"
        
        # Check month is integer
        if 'month' in features:
            if not isinstance(features['month'], int) or features['month'] not in range(1, 13):
                return False, f"month must be integer 1-12, got {features['month']}"
        
        return True, "Valid"
    
    @classmethod
    def get_typical_values(cls, month: int = 7) -> Dict[str, float]:
        """
        Get typical/average feature values for a given month
        
        Args:
            month: Month number (1-12)
            
        Returns:
            Dictionary of typical values
        """
        seasonal_bounds = cls.get_seasonal_bounds(month)
        
        # Use midpoints of seasonal ranges
        typical = {}
        for feature, (min_val, max_val) in seasonal_bounds.items():
            if feature == 'month':
                typical[feature] = month
            else:
                typical[feature] = (min_val + max_val) / 2
        
        return typical
    
    @classmethod
    def get_feature_info(cls) -> Dict[str, Dict]:
        """
        Get detailed information about each feature
        
        Returns:
            Dictionary with feature metadata
        """
        return {
            'temperature_c': {
                'name': 'Temperature',
                'unit': '°C',
                'description': 'Monthly average temperature',
                'bounds': cls.BOUNDS['temperature_c'],
                'typical': 28.0
            },
            'humidity_pct': {
                'name': 'Humidity',
                'unit': '%',
                'description': 'Monthly average relative humidity',
                'bounds': cls.BOUNDS['humidity_pct'],
                'typical': 80.0
            },
            'rainfall_mm': {
                'name': 'Rainfall',
                'unit': 'mm',
                'description': 'Monthly total rainfall',
                'bounds': cls.BOUNDS['rainfall_mm'],
                'typical': 150.0
            },
            'wind_speed_kmh': {
                'name': 'Wind Speed',
                'unit': 'km/h',
                'description': 'Monthly average wind speed',
                'bounds': cls.BOUNDS['wind_speed_kmh'],
                'typical': 15.0
            },
            'production_kg': {
                'name': 'Production',
                'unit': 'kg',
                'description': 'Monthly salt production',
                'bounds': cls.BOUNDS['production_kg'],
                'typical': 3000000
            },
            'month': {
                'name': 'Month',
                'unit': '',
                'description': 'Month of year (1-12)',
                'bounds': cls.BOUNDS['month'],
                'typical': 7
            }
        }
