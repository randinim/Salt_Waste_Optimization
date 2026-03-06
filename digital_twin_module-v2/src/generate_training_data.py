"""
Training Data Generator for Digital Twin Model

This script generates synthetic monthly waste data for specified time ranges
using the calibrated physics-based digital twin model. The output is suitable
for training machine learning prediction models.

Usage:
    python src/generate_training_data.py --start-year 2020 --end-year 2025 --output training_data.csv
    python src/generate_training_data.py --start-date 2020-01 --end-date 2025-12 --output custom_data.csv
"""

import pandas as pd
import numpy as np
import os
import sys
import argparse
from datetime import datetime
from dateutil.relativedelta import relativedelta

# Add parent directory to path for module imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.digital_twin import WasteDistributor

class TrainingDataGenerator:
    def __init__(self, seed=42):
        """
        Initialize the training data generator with calibrated model.
        
        Args:
            seed: Random seed for reproducible synthetic data generation
        """
        np.random.seed(seed)
        self.distributor = WasteDistributor(production_weight=1.0, rain_weight=0.3, temp_weight=0.1)
        self.is_calibrated = False
        
    def calibrate_model(self):
        """
        Calibrate the model using existing data.
        """
        try:
            # Load existing data for calibration
            processed_dir = 'data/processed'
            original_dir = 'data/original'
            
            monthly_features = pd.read_parquet(os.path.join(processed_dir, 'monthly_features.parquet'))
            yearly_waste = pd.read_excel(os.path.join(original_dir, 'actual_waste_data.xlsx'))
            
            # Calibrate the model
            self.distributor.calibrate(yearly_waste, monthly_features)
            self.is_calibrated = True
            
            # Store reference data for realistic parameter generation
            self.ref_production_mean = monthly_features['production_volume'].mean()
            self.ref_production_std = monthly_features['production_volume'].std()
            self.ref_rain_mean = monthly_features['rain_sum'].mean()
            self.ref_rain_std = monthly_features['rain_sum'].std()
            self.ref_temp_mean = monthly_features['temperature_mean'].mean()
            self.ref_temp_std = monthly_features['temperature_mean'].std()
            self.ref_humidity_mean = monthly_features['humidity_mean'].mean()
            self.ref_humidity_std = monthly_features['humidity_mean'].std()
            self.ref_wind_mean = monthly_features['wind_speed_mean'].mean()
            self.ref_wind_std = monthly_features['wind_speed_mean'].std()
            
            print("[OK] Model calibrated successfully using historical data")
            print(f"   Calibration factor: {self.distributor.calibration_factor:.4f} kg/score_unit")
            
        except Exception as e:
            print(f"[ERROR] Calibration failed: {e}")
            raise
    
    def generate_realistic_features(self, year, month):
        """
        Generate realistic monthly features based on Puttalam climate patterns.
        
        Args:
            year: Year (int)
            month: Month (1-12)
            
        Returns:
            dict: Dictionary with realistic feature values
        """
        # Seasonal patterns for Puttalam, Sri Lanka
        # Monsoon seasons: May-Sep (Southwest), Dec-Feb (Northeast)
        
        # Production volume (salt production is seasonal)
        # Higher production in dry months (Mar-Apr, Jul-Aug)
        if month in [3, 4, 7, 8]:  # Dry season peak
            production_base = self.ref_production_mean * 1.3
        elif month in [5, 6, 10, 11]:  # Monsoon transition
            production_base = self.ref_production_mean * 0.8
        else:  # Monsoon months
            production_base = self.ref_production_mean * 0.6
            
        production = max(0, np.random.normal(production_base, self.ref_production_std * 0.3))
        
        # Rainfall (strong seasonal pattern)
        if month in [5, 6, 9, 10, 11]:  # Southwest monsoon
            rain_base = self.ref_rain_mean * 2.5
        elif month in [12, 1, 2]:  # Northeast monsoon
            rain_base = self.ref_rain_mean * 1.8
        else:  # Dry months
            rain_base = self.ref_rain_mean * 0.2
            
        rain = max(0, np.random.normal(rain_base, self.ref_rain_std * 0.4))
        
        # Temperature (less seasonal variation near equator)
        if month in [3, 4, 5]:  # Hottest months
            temp_base = self.ref_temp_mean + 2
        elif month in [12, 1]:  # Coolest months
            temp_base = self.ref_temp_mean - 1
        else:
            temp_base = self.ref_temp_mean
            
        temperature = np.random.normal(temp_base, self.ref_temp_std * 0.3)
        
        # Humidity (inversely related to temperature, positively to rainfall)
        humidity_base = self.ref_humidity_mean + (rain / self.ref_rain_mean) * 10 - (temperature - self.ref_temp_mean) * 2
        humidity = np.clip(np.random.normal(humidity_base, self.ref_humidity_std * 0.3), 30, 100)
        
        # Wind speed (higher during monsoons)
        if month in [5, 6, 10, 11, 12, 1]:  # Monsoon months
            wind_base = self.ref_wind_mean * 1.4
        else:
            wind_base = self.ref_wind_mean * 0.8
            
        wind_speed = max(0, np.random.normal(wind_base, self.ref_wind_std * 0.3))
        
        return {
            'Year': year,
            'Month': month,
            'production_volume': round(production, 2),
            'production_capacity': round(production / np.random.uniform(0.65, 0.95), 2),  # Realistic capacity utilization
            'rain_sum': round(rain, 2),
            'temperature_mean': round(temperature, 2),
            'humidity_mean': round(humidity, 2),
            'wind_speed_mean': round(wind_speed, 2)
        }
    
    def generate_training_data(self, start_date, end_date, include_noise=True, noise_level=0.05):
        """
        Generate training data for the specified time range.
        
        Args:
            start_date: Start date (YYYY-MM format or datetime)
            end_date: End date (YYYY-MM format or datetime)
            include_noise: Whether to add realistic noise to predictions
            noise_level: Standard deviation of noise as fraction of predicted value
            
        Returns:
            pandas.DataFrame: Training data with features and targets
        """
        if not self.is_calibrated:
            raise ValueError("Model must be calibrated before generating data. Call calibrate_model() first.")
        
        # Parse dates
        if isinstance(start_date, str):
            start_year, start_month = map(int, start_date.split('-'))
        else:
            start_year, start_month = start_date.year, start_date.month
            
        if isinstance(end_date, str):
            end_year, end_month = map(int, end_date.split('-'))
        else:
            end_year, end_month = end_date.year, end_date.month
        
        # Generate monthly data points
        training_data = []
        current_date = datetime(start_year, start_month, 1)
        end_date_dt = datetime(end_year, end_month, 1)
        
        print(f"[INFO] Generating training data from {start_year}-{start_month:02d} to {end_year}-{end_month:02d}")

        while current_date <= end_date_dt:
            # Generate realistic features
            features = self.generate_realistic_features(current_date.year, current_date.month)
            
            # Predict waste and composition using calibrated model
            prediction = self.distributor.predict_one_month(
                production=features['production_volume'],
                rain=features['rain_sum'],
                temp=features['temperature_mean'],
                humidity=features['humidity_mean'],
                wind=features['wind_speed_mean'],
                production_capacity=features['production_capacity']
            )
            
            # Add noise to make training data more realistic
            if include_noise:
                # Apply noise to solid waste components proportionally
                solid_keys = ['Solid_Waste_Limestone_kg', 'Solid_Waste_Gypsum_kg', 'Solid_Waste_Industrial_Salt_kg']
                liquid_keys = ['Liquid_Waste_Bittern_Liters', 'Potential_Epsom_Salt_kg', 'Potential_Potash_kg', 'Potential_Magnesium_Oil_Liters']

                # Apply noise to solid wastes first
                solid_noise_factors = {}
                for key in solid_keys:
                    if key in prediction and prediction[key] > 0:
                        noise_factor = 1 + np.random.normal(0, noise_level)
                        solid_noise_factors[key] = max(0.5, noise_factor)  # At least 50% of original
                        prediction[key] = float(prediction[key] * solid_noise_factors[key])

                # Recalculate Total_Solid_Waste_kg to match sum of noisy solid components
                solid_sum = sum(prediction.get(key, 0) for key in solid_keys)
                prediction['Total_Solid_Waste_kg'] = float(solid_sum)
                prediction['Total_Waste_kg'] = float(solid_sum)  # Keep consistent

                # Apply noise to liquid wastes independently
                for key in liquid_keys:
                    if key in prediction and prediction[key] > 0:
                        noise_factor = 1 + np.random.normal(0, noise_level)
                        prediction[key] = float(max(0, prediction[key] * noise_factor))

                # Recalculate Total_Liquid_Waste_Liters
                if 'Liquid_Waste_Bittern_Liters' in prediction:
                    liquid_sum = (
                        prediction.get('Liquid_Waste_Bittern_Liters', 0) +
                        prediction.get('Potential_Magnesium_Oil_Liters', 0)
                    )
                    prediction['Total_Liquid_Waste_Liters'] = float(liquid_sum)

            # Ensure all values are proper float types
            for key, value in prediction.items():
                if isinstance(value, (int, float, np.number)):
                    prediction[key] = float(value)

            # Combine features and targets
            data_point = {**features, **prediction}
            training_data.append(data_point)
            
            # Move to next month
            current_date += relativedelta(months=1)
        
        df = pd.DataFrame(training_data)
        
        # Round numerical values for cleaner output
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        df[numeric_columns] = df[numeric_columns].round(4)
        
        # Validate that Total_Waste_kg equals sum of solid waste components
        self._validate_waste_sums(df)

        print(f"[OK] Generated {len(df)} training samples")
        return df
    
    def _validate_waste_sums(self, df):
        """
        Validate that Total_Waste_kg equals the sum of solid waste components.

        Args:
            df: DataFrame with training data
        """
        solid_cols = ['Solid_Waste_Limestone_kg', 'Solid_Waste_Gypsum_kg', 'Solid_Waste_Industrial_Salt_kg']

        # Check if all required columns exist
        if not all(col in df.columns for col in solid_cols + ['Total_Waste_kg']):
            print("[WARN] Warning: Missing columns for validation")
            return

        # Calculate expected sum
        df['_calculated_solid_sum'] = df[solid_cols].sum(axis=1)

        # Check for discrepancies (allowing small floating point differences)
        discrepancies = abs(df['Total_Waste_kg'] - df['_calculated_solid_sum']) > 0.01
        if discrepancies.any():
            n_discrepancies = discrepancies.sum()
            print(f"[WARN] Warning: {n_discrepancies} rows have Total_Waste_kg != sum of solid wastes")
            # Fix discrepancies by updating Total_Waste_kg
            df.loc[discrepancies, 'Total_Waste_kg'] = df.loc[discrepancies, '_calculated_solid_sum']
            print("   -> Fixed by recalculating Total_Waste_kg from solid waste components")
        else:
            print("[OK] Validation passed: Total_Waste_kg = sum of solid waste components")

        # Clean up temporary column
        df.drop('_calculated_solid_sum', axis=1, inplace=True)

    def save_training_data(self, df, output_path, include_metadata=True):
        """
        Save training data to CSV with optional metadata.
        
        Args:
            df: DataFrame with training data
            output_path: Path to save CSV file
            include_metadata: Whether to include generation metadata
        """
        if include_metadata:
            # Add metadata as comments at the top
            metadata = [
                f"# Digital Twin Training Data Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                f"# Total Samples: {len(df)}",
                f"# Date Range: {df['Year'].min()}-{df['Month'].min():02d} to {df['Year'].max()}-{df['Month'].max():02d}",
                f"# Calibration Factor: {self.distributor.calibration_factor:.6f} kg/score_unit",
                f"# Model Parameters: prod_weight={self.distributor.production_weight}, rain_weight={self.distributor.rain_weight}, temp_weight={self.distributor.temp_weight}",
                f"# Features: production_volume, production_capacity, rain_sum, temperature_mean, humidity_mean, wind_speed_mean",
                "# Targets: Total_Waste_kg = Sum(Solid_Waste_Limestone_kg + Solid_Waste_Gypsum_kg + Solid_Waste_Industrial_Salt_kg)",
                "# Additional: Total_Solid_Waste_kg, Total_Liquid_Waste_Liters (Bittern + Magnesium Oil)",
                "# Potential Products: Potential_Epsom_Salt_kg, Potential_Potash_kg (derived from Bittern)",
                "#"
            ]
            
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                for line in metadata:
                    f.write(line + '\n')
                df.to_csv(f, index=False)
        else:
            df.to_csv(output_path, index=False)
        
        print(f"[SAVED] Training data saved to: {output_path}")
        print(f"[INFO] Data shape: {df.shape}")
        print(f"[INFO] Columns: {', '.join(df.columns)}")

def main():
    parser = argparse.ArgumentParser(description='Generate training data for Digital Twin prediction model')
    parser.add_argument('--start-year', type=int, help='Start year (e.g., 2020)')
    parser.add_argument('--end-year', type=int, help='End year (e.g., 2025)')
    parser.add_argument('--start-date', type=str, help='Start date in YYYY-MM format (e.g., 2020-01)')
    parser.add_argument('--end-date', type=str, help='End date in YYYY-MM format (e.g., 2025-12)')
    parser.add_argument('--output', type=str, default='training_data.csv', help='Output CSV file path')
    parser.add_argument('--samples', type=int, help='Number of samples to generate (alternative to date range)')
    parser.add_argument('--seed', type=int, default=42, help='Random seed for reproducibility')
    parser.add_argument('--no-noise', action='store_true', help='Generate data without noise')
    parser.add_argument('--noise-level', type=float, default=0.05, help='Noise level (default: 0.05)')
    
    args = parser.parse_args()
    
    # Validate arguments
    if args.start_year and args.end_year:
        start_date = f"{args.start_year}-01"
        end_date = f"{args.end_year}-12"
    elif args.start_date and args.end_date:
        start_date = args.start_date
        end_date = args.end_date
    elif args.samples:
        # Generate for recent years if samples specified
        start_date = "2020-01"
        end_date = "2025-12"
    else:
        print("[ERROR] Please specify either --start-year/--end-year or --start-date/--end-date")
        return
    
    try:
        # Initialize generator
        generator = TrainingDataGenerator(seed=args.seed)
        
        # Calibrate model
        generator.calibrate_model()
        
        # Generate training data
        df = generator.generate_training_data(
            start_date=start_date,
            end_date=end_date,
            include_noise=not args.no_noise,
            noise_level=args.noise_level
        )
        
        # Limit samples if specified
        if args.samples and len(df) > args.samples:
            df = df.sample(n=args.samples, random_state=args.seed).sort_values(['Year', 'Month'])
            print(f"[INFO] Sampled {args.samples} records from generated data")

        # Save data
        generator.save_training_data(df, args.output)
        
        # Print summary statistics
        print("\n[INFO] Data Summary:")
        print(df[['Total_Waste_kg', 'production_volume', 'rain_sum', 'temperature_mean']].describe())
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())