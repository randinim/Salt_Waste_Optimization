import pandas as pd
import os

def preprocess_data():
    print("=" * 80)
    print("DIGITAL TWIN DATA PREPROCESSING - PUTTALAM SALT PRODUCTION")
    print("=" * 80)
    
    # Paths (relative to project root)
    data_dir = 'data/original'
    processed_dir = 'data/processed'
    os.makedirs(processed_dir, exist_ok=True)
    
    weather_path = os.path.join(data_dir, 'weather_data_total.xlsx')
    production_path = os.path.join(data_dir, 'production_data_total.xlsx')
    
    # --- Process Weather Data ---
    print("\n[1/3] Processing weather data...")
    df_weather = pd.read_excel(weather_path)
    
    # Clean column names (strip whitespace) - CRITICAL FIX
    df_weather.columns = [c.strip() for c in df_weather.columns]
    print(f"   Cleaned columns: {df_weather.columns.tolist()}")
    
    # Convert date
    df_weather['date'] = pd.to_datetime(df_weather['date'])
    
    # Set index to date for resampling
    df_weather.set_index('date', inplace=True)
    
    # Resample to Monthly
    # Aggregation rules: Sum for rain, Mean for temp/humidity/wind
    agg_rules = {
        'temperature_mean (°C)': 'mean',
        'rain_sum (mm)': 'sum',
        'relative_humidity_mean (%)': 'mean',
        'wind_speed_mean (km/h)': 'mean'
    }
    
    # Only aggregate columns that exist
    available_rules = {k: v for k, v in agg_rules.items() if k in df_weather.columns}
    
    df_weather_monthly = df_weather.resample('ME').agg(available_rules)
    
    # Reset index to make date a column again
    df_weather_monthly.reset_index(inplace=True)
    
    # Normalize date to the first of the month for easier merging
    df_weather_monthly['month_start'] = df_weather_monthly['date'].dt.to_period('M').dt.to_timestamp()
    
    print(f"   ✓ Weather data aggregated to monthly. Shape: {df_weather_monthly.shape}")
    print(f"   Date range: {df_weather_monthly['date'].min()} to {df_weather_monthly['date'].max()}")
    
    # --- Process Production Data ---
    print("\n[2/3] Processing production data...")
    df_prod = pd.read_excel(production_path)
    df_prod.columns = [c.strip() for c in df_prod.columns]
    
    df_prod['date'] = pd.to_datetime(df_prod['date'])
    df_prod['month_start'] = df_prod['date'].dt.to_period('M').dt.to_timestamp()
    
    # CRITICAL FIX: Convert bags to KG (1 bag = 50kg)
    # The 'production volume' column contains BAGS, not KG
    print(f"   CRITICAL: Converting production from BAGS to KG (1 bag = 50kg)")
    df_prod['production_bags'] = df_prod['production volume']  # Keep original bags
    df_prod['production_volume_kg'] = df_prod['production volume'] * 50.0  # Convert to KG
    
    # Calculate statistics
    total_bags = df_prod['production_bags'].sum()
    total_kg = df_prod['production_volume_kg'].sum()
    print(f"   Total production: {total_bags:,.0f} bags = {total_kg:,.0f} kg")
    print(f"   Production data loaded. Shape: {df_prod.shape}")
    
    # --- Merge ---
    print("\n[3/3] Merging datasets...")
    df_merged = pd.merge(df_prod, df_weather_monthly, on='month_start', how='inner', suffixes=('_prod', '_weather'))
    
    # Rename columns for clarity
    df_merged.rename(columns={
        'production_volume_kg': 'production_volume',  # Use KG as the standard unit
        'temperature_mean (°C)': 'temperature_mean',
        'rain_sum (mm)': 'rain_sum',
        'relative_humidity_mean (%)': 'humidity_mean',
        'wind_speed_mean (km/h)': 'wind_speed_mean'
    }, inplace=True)
    
    # Add Year and Month columns
    df_merged['Year'] = df_merged['month_start'].dt.year
    df_merged['Month'] = df_merged['month_start'].dt.month
    
    # Add production capacity estimation (assume 85% average utilization)
    df_merged['production_capacity'] = df_merged['production_volume'] / 0.85
    
    # Save
    output_path = os.path.join(processed_dir, 'monthly_features.parquet')
    df_merged.to_parquet(output_path, engine='pyarrow')
    
    print(f"\n{'='*80}")
    print(f"✓ PREPROCESSING COMPLETE")
    print(f"{'='*80}")
    print(f"Output saved to: {output_path}")
    print(f"Final shape: {df_merged.shape}")
    print(f"Years covered: {sorted(df_merged['Year'].unique())}")
    print(f"\nFirst few rows:")
    print(df_merged[['Year', 'Month', 'production_bags', 'production_volume', 'temperature_mean', 'rain_sum']].head())
    
    # Print summary statistics
    print(f"\n{'='*80}")
    print("SUMMARY STATISTICS")
    print(f"{'='*80}")
    for year in sorted(df_merged['Year'].unique()):
        year_data = df_merged[df_merged['Year'] == year]
        total_prod = year_data['production_volume'].sum()
        print(f"  {year}: {total_prod:,.0f} kg salt produced ({len(year_data)} months of data)")
    
    return df_merged

if __name__ == "__main__":
    preprocess_data()
