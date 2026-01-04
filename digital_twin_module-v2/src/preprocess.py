import pandas as pd
import os
import mlflow

def preprocess_data():
    print("Starting data preprocessing...")
    
    # Paths
    data_dir = 'data/original'
    processed_dir = 'data/processed'
    os.makedirs(processed_dir, exist_ok=True)
    
    weather_path = os.path.join(data_dir, 'weather_data_total.xlsx')
    production_path = os.path.join(data_dir, 'production_data_total.xlsx')
    
    # --- Process Weather Data ---
    print("Processing weather data...")
    df_weather = pd.read_excel(weather_path)
    
    # Clean column names (strip whitespace)
    df_weather.columns = [c.strip() for c in df_weather.columns]
    
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
    
    print(f"Weather data aggregated. Shape: {df_weather_monthly.shape}")
    
    # --- Process Production Data ---
    print("Processing production data...")
    df_prod = pd.read_excel(production_path)
    df_prod.columns = [c.strip() for c in df_prod.columns]
    
    df_prod['date'] = pd.to_datetime(df_prod['date'])
    df_prod['month_start'] = df_prod['date'].dt.to_period('M').dt.to_timestamp()
    
    print(f"Production data loaded. Shape: {df_prod.shape}")
    
    # --- Merge ---
    print("Merging datasets...")
    df_merged = pd.merge(df_prod, df_weather_monthly, on='month_start', how='inner', suffixes=('_prod', '_weather'))
    
    # Rename columns for clarity
    df_merged.rename(columns={
        'production volume': 'production_volume',
        'temperature_mean (°C)': 'temperature_mean',
        'rain_sum (mm)': 'rain_sum',
        'relative_humidity_mean (%)': 'humidity_mean',
        'wind_speed_mean (km/h)': 'wind_speed_mean'
    }, inplace=True)
    
    # Add Year and Month columns
    df_merged['Year'] = df_merged['month_start'].dt.year
    df_merged['Month'] = df_merged['month_start'].dt.month
    
    # Save
    output_path = os.path.join(processed_dir, 'monthly_features.parquet')
    df_merged.to_parquet(output_path)
    
    print(f"Merged data saved to {output_path}. Shape: {df_merged.shape}")
    print(df_merged.head())
    
    return df_merged

if __name__ == "__main__":
    preprocess_data()
