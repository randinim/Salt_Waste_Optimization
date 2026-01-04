"""
Analyze Liquid_Waste_Bittern_Liters correlations in the physics model
"""

import pandas as pd
import numpy as np

def analyze_bittern_physics():
    # Load the generated training data with production capacity
    df = pd.read_csv('data/final/training_data_5years.csv', comment='#')
    
    print("🔬 BITTERN PHYSICS MODEL ANALYSIS (WITH PRODUCTION CAPACITY)")
    print("=" * 60)
    
    # Calculate correlations with input features
    features = ['production_volume', 'production_capacity', 'rain_sum', 'temperature_mean', 'humidity_mean', 'wind_speed_mean']
    target = 'Liquid_Waste_Bittern_Liters'
    
    print(f"\n📊 Correlations with {target}:")
    for feature in features:
        if feature in df.columns:
            corr = df[feature].corr(df[target])
            print(f"   {feature:20}: {corr:6.3f}")
    
    # Analyze the NEW physics formula components
    print(f"\n🧮 NEW Physics Formula Analysis:")
    print("   Formula: base_bittern + intensity_bittern")
    print("   base_bittern = capacity * 0.3 * weather_efficiency") 
    print("   intensity_bittern = production * 0.7 * weather_efficiency")
    
    # Calculate each component manually to verify
    df['weather_efficiency'] = (1 + 0.01 * (df['temperature_mean'] - 25)) / (1 + 0.002 * df['rain_sum'])
    df['estimated_capacity'] = df['production_volume'] / 0.8
    df['base_component'] = df['estimated_capacity'] * 0.3 * df['weather_efficiency']
    df['intensity_component'] = df['production_volume'] * 0.7 * df['weather_efficiency']
    df['calculated_bittern'] = df['base_component'] + df['intensity_component']
    
    print(f"\n   Weather efficiency range: {df['weather_efficiency'].min():.3f} to {df['weather_efficiency'].max():.3f}")
    print(f"   Base component range:     {df['base_component'].min():.1f} to {df['base_component'].max():.1f}")
    print(f"   Intensity component range:{df['intensity_component'].min():.1f} to {df['intensity_component'].max():.1f}")
    
    # Verify calculation accuracy
    bittern_diff = abs(df['calculated_bittern'] - df[target]).mean()
    print(f"   Calculation accuracy (avg diff): {bittern_diff:.2f} L")
    
    # Individual factor correlations
    print(f"\n🔗 Component correlations with Bittern:")
    print(f"   Production volume:    {df['production_volume'].corr(df[target]):6.3f}")
    print(f"   Production capacity:  {df['production_capacity'].corr(df[target]):6.3f}")
    print(f"   Weather efficiency:   {df['weather_efficiency'].corr(df[target]):6.3f}")
    print(f"   Base component:       {df['base_component'].corr(df[target]):6.3f}")
    print(f"   Intensity component:  {df['intensity_component'].corr(df[target]):6.3f}")
    
    # Check if the physics makes sense
    print(f"\n🎯 Physics Logic Check:")
    
    # Rain effect: Should be negative (more rain = less bittern)
    rain_corr = df['rain_sum'].corr(df[target])
    print(f"   Rain correlation: {rain_corr:6.3f} {'✅ CORRECT (negative)' if rain_corr < -0.1 else '❌ PROBLEM'}")
    
    # Temperature effect: Should be positive (more temp = more bittern)
    temp_corr = df['temperature_mean'].corr(df[target])
    print(f"   Temp correlation: {temp_corr:6.3f} {'✅ CORRECT (positive)' if temp_corr > 0.1 else '❌ PROBLEM'}")
    
    # Production effect: Should be strongly positive
    prod_corr = df['production_volume'].corr(df[target])
    print(f"   Production corr:  {prod_corr:6.3f} {'✅ CORRECT (strong +)' if prod_corr > 0.8 else '❌ PROBLEM'}")
    
    # Statistical summary
    print(f"\n📈 Bittern Statistics:")
    print(f"   Mean:     {df[target].mean():8.1f} Liters")
    print(f"   Std Dev:  {df[target].std():8.1f} Liters")
    print(f"   Min:      {df[target].min():8.1f} Liters")
    print(f"   Max:      {df[target].max():8.1f} Liters")
    
    # Check for any problematic values
    if (df[target] < 0).any():
        print(f"   ❌ WARNING: {(df[target] < 0).sum()} negative values found!")
    
    # Seasonal analysis
    print(f"\n📅 Seasonal Pattern Analysis:")
    seasonal = df.groupby('Month')[target].mean()
    print("   Month    Avg Bittern (L)")
    for month in range(1, 13):
        if month in seasonal.index:
            print(f"   {month:2d}       {seasonal[month]:8.1f}")
    
    # Check monsoon vs dry season
    monsoon_months = [5, 6, 10, 11, 12, 1]  # High rain months
    dry_months = [3, 4, 7, 8]  # Low rain months
    
    monsoon_bittern = df[df['Month'].isin(monsoon_months)][target].mean()
    dry_bittern = df[df['Month'].isin(dry_months)][target].mean()
    
    print(f"\n🌧️ Seasonal Comparison:")
    print(f"   Monsoon months avg: {monsoon_bittern:8.1f} Liters")
    print(f"   Dry months avg:     {dry_bittern:8.1f} Liters")
    print(f"   Ratio (Dry/Monsoon): {dry_bittern/monsoon_bittern:.2f}")
    
    if dry_bittern > monsoon_bittern:
        print("   ✅ Physics correct: More bittern in dry season")
    else:
        print("   ❌ Physics issue: Less bittern in dry season")
    
    return df

if __name__ == "__main__":
    analyze_bittern_physics()