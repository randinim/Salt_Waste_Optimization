"""
Synthetic Data Generator for Digital Twin
Generates realistic time-series data based on historical patterns
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import pickle
from pathlib import Path


class SyntheticDataGenerator:
    """Generate synthetic weather and production data based on historical patterns"""
    
    def __init__(self, historical_data_path=None):
        """
        Initialize generator with historical data statistics
        
        Args:
            historical_data_path: Path to historical engineered features CSV
        """
        if historical_data_path is None:
            historical_data_path = str(Path(__file__).parent.parent / "data" / "processed" / "features_engineered.csv")
        self.historical_data_path = historical_data_path
        self.historical_data = self._load_historical_data()
        self.statistics = self._calculate_statistics()
        
    def _load_historical_data(self):
        """Load historical data"""
        try:
            df = pd.read_csv(self.historical_data_path)
            df['date'] = pd.to_datetime(df['date'])
            return df
        except Exception as e:
            print(f"Error loading historical data: {e}")
            return None
    
    def _calculate_statistics(self):
        """Calculate statistical properties from historical data"""
        if self.historical_data is None:
            return {}
        
        stats = {}
        
        # Map column names from actual data
        col_map = {
            'temperature': 'temperature_mean (°C)',
            'humidity': 'relative_humidity_mean (%)',
            'rain': 'rain_sum (mm)',
            'wind_speed': 'wind_speed_mean (km/h)',
            'production': 'production volume'
        }
        
        # Climate features statistics
        climate_features = ['temperature', 'humidity', 'rain', 'wind_speed']
        for feature in climate_features:
            col_name = col_map.get(feature)
            if col_name and col_name in self.historical_data.columns:
                stats[feature] = {
                    'mean': self.historical_data[col_name].mean(),
                    'std': self.historical_data[col_name].std(),
                    'min': self.historical_data[col_name].min(),
                    'max': self.historical_data[col_name].max()
                }
        
        # Production features
        prod_col = col_map['production']
        if prod_col in self.historical_data.columns:
            stats['production'] = {
                'mean': self.historical_data[prod_col].mean(),
                'std': self.historical_data[prod_col].std(),
                'min': self.historical_data[prod_col].min(),
                'max': self.historical_data[prod_col].max()
            }
        
        # Seasonal patterns (by month)
        if 'month' in self.historical_data.columns:
            stats['monthly_patterns'] = {}
            for month in self.historical_data['month'].unique():
                month_data = self.historical_data[self.historical_data['month'] == month]
                stats['monthly_patterns'][int(month)] = {
                    'temp_offset': month_data[col_map['temperature']].mean() - stats['temperature']['mean'],
                    'humidity_offset': month_data[col_map['humidity']].mean() - stats['humidity']['mean'],
                    'production_multiplier': month_data[prod_col].mean() / stats['production']['mean']
                }
        
        return stats
    
    def generate_monthly_data(self, start_date, end_date, num_samples=1, 
                            production_trend=None, weather_pattern='realistic'):
        """
        Generate synthetic monthly data for a time range
        
        Args:
            start_date: Start date (str or datetime, format: 'YYYY-MM-01' or datetime)
            end_date: End date (str or datetime)
            num_samples: Number of samples per month (for ensemble forecasts)
            production_trend: Linear trend multiplier (default: stable at 1.0)
            weather_pattern: 'realistic', 'dry', 'wet', 'hot', 'cold'
            
        Returns:
            pd.DataFrame with synthetic data points
        """
        if isinstance(start_date, str):
            start_date = pd.to_datetime(start_date)
        if isinstance(end_date, str):
            end_date = pd.to_datetime(end_date)
        
        # Generate date range
        date_range = pd.date_range(start=start_date, end=end_date, freq='ME')
        
        all_data = []
        
        for idx, date in enumerate(date_range):
            month = date.month
            
            # Get seasonal offsets
            monthly_offset = self.statistics['monthly_patterns'].get(month, {})
            
            # Generate samples for this month
            for sample_idx in range(num_samples):
                sample = {
                    'date': date,
                    'month': month,
                    'sample_id': sample_idx
                }
                
                # Apply weather pattern
                pattern_adjustments = self._get_weather_pattern_adjustment(weather_pattern, month)
                
                # Temperature
                temp_mean = (self.statistics['temperature']['mean'] + 
                            monthly_offset.get('temp_offset', 0) +
                            pattern_adjustments['temp_adj'])
                sample['temperature'] = np.random.normal(
                    temp_mean,
                    self.statistics['temperature']['std'] * 0.8
                )
                sample['temperature'] = np.clip(
                    sample['temperature'],
                    self.statistics['temperature']['min'],
                    self.statistics['temperature']['max']
                )
                
                # Humidity (inversely correlated with temperature)
                humidity_base = (self.statistics['humidity']['mean'] + 
                               monthly_offset.get('humidity_offset', 0) +
                               pattern_adjustments['humidity_adj'])
                # Add inverse correlation with temperature
                temp_deviation = (sample['temperature'] - self.statistics['temperature']['mean'])
                humidity_mean = humidity_base - (temp_deviation * 0.5)
                sample['humidity'] = np.random.normal(
                    humidity_mean,
                    self.statistics['humidity']['std'] * 0.7
                )
                sample['humidity'] = np.clip(sample['humidity'], 0, 100)
                
                # Rain
                rain_base = self.statistics['rain']['mean'] + pattern_adjustments['rain_adj']
                sample['rain'] = max(0, np.random.gamma(
                    shape=1.5,
                    scale=rain_base / 1.5 if rain_base > 0 else 0.1
                ))
                
                # Wind speed
                wind_mean = self.statistics['wind_speed']['mean'] + pattern_adjustments['wind_adj']
                sample['wind_speed'] = max(0, np.random.normal(
                    wind_mean,
                    self.statistics['wind_speed']['std'] * 0.8
                ))
                
                # Production
                prod_multiplier = (
                    monthly_offset.get('production_multiplier', 1.0) *
                    (1.0 + production_trend * idx / 12 if production_trend else 1.0)
                )
                sample['production'] = self.statistics['production']['mean'] * prod_multiplier * np.random.normal(1.0, 0.05)
                sample['production'] = max(50000, sample['production'])  # Minimum production
                
                all_data.append(sample)
        
        return pd.DataFrame(all_data)
    
    def _get_weather_pattern_adjustment(self, pattern, month):
        """Get adjustments for specific weather patterns"""
        adjustments = {
            'temp_adj': 0,
            'humidity_adj': 0,
            'rain_adj': 0,
            'wind_adj': 0
        }
        
        if pattern == 'dry':
            adjustments['rain_adj'] = -1.0
            adjustments['humidity_adj'] = -5.0
        elif pattern == 'wet':
            adjustments['rain_adj'] = 2.0
            adjustments['humidity_adj'] = 10.0
        elif pattern == 'hot':
            adjustments['temp_adj'] = 5.0
            adjustments['humidity_adj'] = -8.0
        elif pattern == 'cold':
            adjustments['temp_adj'] = -5.0
            adjustments['humidity_adj'] = 8.0
        
        return adjustments
    
    def generate_forecast_ensemble(self, base_date, horizon_months=12, num_members=10):
        """
        Generate ensemble forecast (Monte Carlo style)
        
        Args:
            base_date: Base date for forecast (str or datetime, 'YYYY-MM-01')
            horizon_months: How many months to forecast
            num_members: Number of ensemble members (for uncertainty quantification)
            
        Returns:
            pd.DataFrame with ensemble forecast data
        """
        if isinstance(base_date, str):
            base_date = pd.to_datetime(base_date)
        
        end_date = base_date + pd.DateOffset(months=horizon_months-1)
        
        return self.generate_monthly_data(
            base_date, 
            end_date, 
            num_samples=num_members,
            weather_pattern='realistic'
        )
    
    def generate_scenario_data(self, scenario_name, start_date, end_date, 
                             weather_override=None, production_override=None):
        """
        Generate data for specific scenarios
        
        Args:
            scenario_name: 'drought', 'flood', 'heat_wave', 'production_increase', etc.
            start_date: Start date
            end_date: End date
            weather_override: Dict with temp, humidity, rain, wind overrides
            production_override: Production multiplier
            
        Returns:
            pd.DataFrame with scenario data
        """
        # Generate base data with scenario pattern
        scenario_patterns = {
            'drought': {'temp_adj': 3, 'humidity_adj': -15, 'rain_adj': -2},
            'flood': {'temp_adj': 0, 'humidity_adj': 25, 'rain_adj': 5},
            'heat_wave': {'temp_adj': 8, 'humidity_adj': -20, 'rain_adj': -1},
            'cold_snap': {'temp_adj': -10, 'humidity_adj': 15, 'rain_adj': 0},
            'production_surge': {'temp_adj': 0, 'humidity_adj': 0, 'rain_adj': 0}
        }
        
        # Get pattern for scenario
        scenario_pattern = scenario_patterns.get(scenario_name, {})
        
        if isinstance(start_date, str):
            start_date = pd.to_datetime(start_date)
        if isinstance(end_date, str):
            end_date = pd.to_datetime(end_date)
        
        date_range = pd.date_range(start=start_date, end=end_date, freq='MS')
        all_data = []
        
        for idx, date in enumerate(date_range):
            month = date.month
            monthly_offset = self.statistics['monthly_patterns'].get(month, {})
            
            sample = {
                'date': date,
                'month': month,
                'scenario': scenario_name
            }
            
            # Temperature with scenario adjustment
            temp_mean = (self.statistics['temperature']['mean'] + 
                        monthly_offset.get('temp_offset', 0) +
                        scenario_pattern.get('temp_adj', 0))
            if weather_override and 'temperature' in weather_override:
                sample['temperature'] = weather_override['temperature']
            else:
                sample['temperature'] = np.clip(
                    np.random.normal(temp_mean, self.statistics['temperature']['std'] * 0.8),
                    self.statistics['temperature']['min'],
                    self.statistics['temperature']['max']
                )
            
            # Humidity with scenario adjustment
            humidity_mean = (self.statistics['humidity']['mean'] + 
                            monthly_offset.get('humidity_offset', 0) +
                            scenario_pattern.get('humidity_adj', 0) -
                            (sample['temperature'] - self.statistics['temperature']['mean']) * 0.5)
            if weather_override and 'humidity' in weather_override:
                sample['humidity'] = weather_override['humidity']
            else:
                sample['humidity'] = np.clip(
                    np.random.normal(humidity_mean, self.statistics['humidity']['std'] * 0.7),
                    0, 100
                )
            
            # Rain with scenario adjustment
            rain_mean = self.statistics['rain']['mean'] + scenario_pattern.get('rain_adj', 0)
            if weather_override and 'rain' in weather_override:
                sample['rain'] = weather_override['rain']
            else:
                sample['rain'] = max(0, np.random.gamma(1.5, rain_mean / 1.5 if rain_mean > 0 else 0.1))
            
            # Wind speed
            wind_mean = self.statistics['wind_speed']['mean'] + scenario_pattern.get('wind_adj', 0)
            if weather_override and 'wind_speed' in weather_override:
                sample['wind_speed'] = weather_override['wind_speed']
            else:
                sample['wind_speed'] = max(0, np.random.normal(wind_mean, self.statistics['wind_speed']['std'] * 0.8))
            
            # Production
            prod_multiplier = production_override if production_override else 1.0
            if scenario_name == 'production_surge':
                prod_multiplier = 1.2
            
            sample['production'] = self.statistics['production']['mean'] * prod_multiplier * np.random.normal(1.0, 0.05)
            sample['production'] = max(50000, sample['production'])
            
            all_data.append(sample)
        
        return pd.DataFrame(all_data)


# Example usage
if __name__ == '__main__':
    print("=" * 80)
    print("SYNTHETIC DATA GENERATOR - DEMO")
    print("=" * 80)
    
    # Initialize generator
    generator = SyntheticDataGenerator()
    print("\nGenerator initialized with historical statistics")
    print(f"  - Historical data: {len(generator.historical_data)} records")
    print(f"  - Date range: {generator.historical_data['date'].min()} to {generator.historical_data['date'].max()}")
    
    # Example 1: Generate data for next 12 months
    print("\n" + "-" * 80)
    print("EXAMPLE 1: Generate 12-Month Forecast (2025-01-01 to 2025-12-01)")
    print("-" * 80)
    forecast_data = generator.generate_monthly_data('2025-01-01', '2025-12-01')
    print(f"Generated {len(forecast_data)} data points")
    print("\nFirst 5 records:")
    print(forecast_data.head())
    
    # Example 2: Generate ensemble forecast
    print("\n" + "-" * 80)
    print("EXAMPLE 2: Ensemble Forecast (10 members, 6 months)")
    print("-" * 80)
    ensemble = generator.generate_forecast_ensemble('2025-01-01', horizon_months=6, num_members=10)
    print(f"Generated {len(ensemble)} ensemble members")
    print("\nEnsemble statistics by month:")
    ensemble_stats = ensemble.groupby('month')[['temperature', 'humidity', 'rain', 'production']].agg(['mean', 'std'])
    print(ensemble_stats)
    
    # Example 3: Generate scenario data (drought)
    print("\n" + "-" * 80)
    print("EXAMPLE 3: Drought Scenario (2025-06-01 to 2025-08-01)")
    print("-" * 80)
    drought_data = generator.generate_scenario_data(
        'drought',
        '2025-06-01',
        '2025-08-01'
    )
    print(f"Generated {len(drought_data)} drought scenario records")
    print("\nDrought scenario data:")
    print(drought_data)
    
    # Example 4: Heat wave scenario
    print("\n" + "-" * 80)
    print("EXAMPLE 4: Heat Wave Scenario (2025-07-01 to 2025-09-01)")
    print("-" * 80)
    heat_wave = generator.generate_scenario_data(
        'heat_wave',
        '2025-07-01',
        '2025-09-01'
    )
    print(f"Generated {len(heat_wave)} heat wave scenario records")
    print("\nHeat wave statistics:")
    print(heat_wave[['date', 'temperature', 'humidity', 'rain']].to_string())
    
    print("\n" + "=" * 80)
    print("SYNTHETIC DATA GENERATION COMPLETE")
    print("=" * 80)
