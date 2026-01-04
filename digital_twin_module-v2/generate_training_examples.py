"""
Example: Generate Training Data for Digital Twin Model
This script demonstrates how to generate training data for different scenarios.
"""

import sys
import os
sys.path.append('.')

from src.generate_training_data import TrainingDataGenerator

def main():
    print("🚀 Digital Twin Training Data Generator - Examples")
    print("=" * 60)
    
    # Initialize the generator
    generator = TrainingDataGenerator(seed=42)
    
    # Calibrate using existing data
    print("\n1️⃣ Calibrating model...")
    generator.calibrate_model()
    
    # Example 1: Generate 5 years of training data
    print("\n2️⃣ Generating 5 years of training data (2020-2024)...")
    df_5years = generator.generate_training_data(
        start_date="2020-01",
        end_date="2024-12"
    )
    generator.save_training_data(df_5years, "data/final/training_data_5years.csv")
    
    # Example 2: Generate 1 year with high noise for robustness testing
    print("\n3️⃣ Generating 1 year with high noise (2025)...")
    df_noisy = generator.generate_training_data(
        start_date="2025-01",
        end_date="2025-12",
        include_noise=True,
        noise_level=0.15  # 15% noise
    )
    generator.save_training_data(df_noisy, "data/final/training_data_noisy.csv")
    
    # Example 3: Generate clean data for validation
    print("\n4️⃣ Generating clean validation data (2026)...")
    df_clean = generator.generate_training_data(
        start_date="2026-01",
        end_date="2026-12",
        include_noise=False
    )
    generator.save_training_data(df_clean, "data/final/validation_data_clean.csv")
    
    print("\n✅ All training datasets generated successfully!")
    print("\nGenerated files:")
    print("📁 data/final/training_data_5years.csv - 5 years of training data")
    print("📁 data/final/training_data_noisy.csv - High noise data for robustness")
    print("📁 data/final/validation_data_clean.csv - Clean validation data")
    
    # Show data sample
    print(f"\n📊 Sample from 5-year dataset (shape: {df_5years.shape}):")
    sample_cols = ['Year', 'Month', 'Total_Waste_kg', 'production_volume', 'rain_sum', 'Solid_Waste_Gypsum_kg']
    print(df_5years[sample_cols].head(10).to_string())

if __name__ == "__main__":
    main()