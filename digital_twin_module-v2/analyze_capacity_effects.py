"""
Comprehensive analysis of production capacity effects on ALL waste compositions
"""

import pandas as pd
import numpy as np

def analyze_capacity_effects():
    # Load the new dataset with production capacity
    df = pd.read_csv('data/final/training_data_5years.csv', comment='#')
    
    print("🏭 PRODUCTION CAPACITY EFFECTS ON ALL WASTE COMPOSITIONS")
    print("=" * 65)
    
    # Calculate capacity-related metrics
    df['capacity_utilization'] = df['production_volume'] / df['production_capacity'] 
    df['facility_scale'] = df['production_capacity'] / 50000  # Normalized to 50k baseline
    
    print(f"\n📊 Production Capacity Metrics:")
    print(f"   Capacity range:      {df['production_capacity'].min():8.1f} to {df['production_capacity'].max():8.1f} kg")
    print(f"   Utilization range:   {df['capacity_utilization'].min():6.1%} to {df['capacity_utilization'].max():6.1%}")
    print(f"   Facility scale range:{df['facility_scale'].min():8.2f} to {df['facility_scale'].max():8.2f}x")
    
    # Analyze correlations with production capacity
    waste_columns = [col for col in df.columns if 'Waste' in col or 'Potential' in col]
    
    print(f"\n🔗 Correlations with Production Capacity:")
    for col in waste_columns:
        corr = df['production_capacity'].corr(df[col])
        print(f"   {col:35}: {corr:6.3f}")
    
    print(f"\n🔗 Correlations with Capacity Utilization:")
    for col in waste_columns:
        corr = df['capacity_utilization'].corr(df[col])
        print(f"   {col:35}: {corr:6.3f}")
    
    print(f"\n🔗 Correlations with Facility Scale:")
    for col in waste_columns:
        corr = df['facility_scale'].corr(df[col])
        print(f"   {col:35}: {corr:6.3f}")
    
    # Analyze the three solid waste categories specifically
    print(f"\n🧱 SOLID WASTE CAPACITY EFFECTS ANALYSIS:")
    
    # Group by facility scale (small vs large facilities)
    df['facility_size'] = pd.cut(df['facility_scale'], 
                                bins=[0, 1.0, 1.5, 10], 
                                labels=['Small (<50k)', 'Medium (50-75k)', 'Large (>75k)'])
    
    solid_wastes = ['Solid_Waste_Limestone_kg', 'Solid_Waste_Gypsum_kg', 'Solid_Waste_Industrial_Salt_kg']
    
    for waste_type in solid_wastes:
        print(f"\n   {waste_type}:")
        # Calculate waste as percentage of total waste
        df[f'{waste_type}_pct'] = (df[waste_type] / df['Total_Waste_kg']) * 100
        
        by_size = df.groupby('facility_size')[f'{waste_type}_pct'].mean()
        print(f"      Small facilities:  {by_size.iloc[0]:5.1f}% of total waste")
        print(f"      Medium facilities: {by_size.iloc[1]:5.1f}% of total waste") 
        print(f"      Large facilities:  {by_size.iloc[2]:5.1f}% of total waste")
        
        # Check if large facilities are more efficient (lower waste %)
        efficiency_gain = ((by_size.iloc[0] - by_size.iloc[2]) / by_size.iloc[0]) * 100
        print(f"      Efficiency gain:   {efficiency_gain:5.1f}% reduction in large facilities")
    
    # Analyze production intensity effects
    print(f"\n⚡ PRODUCTION INTENSITY EFFECTS:")
    
    # Group by utilization level
    df['utilization_level'] = pd.cut(df['capacity_utilization'], 
                                   bins=[0, 0.7, 0.85, 1.0], 
                                   labels=['Low (<70%)', 'Medium (70-85%)', 'High (>85%)'])
    
    # Focus on Industrial Salt (should increase with intensity)
    salt_waste_pct = df.groupby('utilization_level')['Solid_Waste_Industrial_Salt_kg'].mean()
    print(f"   Industrial Salt Waste by Utilization:")
    for level, waste in salt_waste_pct.items():
        print(f"      {level:15}: {waste:8.1f} kg average")
    
    # Show weather interaction with capacity
    print(f"\n🌤️ WEATHER + CAPACITY INTERACTIONS:")
    
    # High rain periods
    high_rain = df['rain_sum'] > df['rain_sum'].quantile(0.75)
    low_capacity = df['facility_scale'] < 1.0
    high_capacity = df['facility_scale'] > 1.5
    
    print(f"   Gypsum waste in high rain periods:")
    print(f"      Small facilities: {df[high_rain & low_capacity]['Solid_Waste_Gypsum_kg'].mean():8.1f} kg")
    print(f"      Large facilities: {df[high_rain & high_capacity]['Solid_Waste_Gypsum_kg'].mean():8.1f} kg")
    
    # Bittern generation efficiency
    print(f"\n💧 BITTERN GENERATION EFFICIENCY:")
    df['bittern_per_production'] = df['Liquid_Waste_Bittern_Liters'] / df['production_volume']
    
    bittern_efficiency = df.groupby('facility_size')['bittern_per_production'].mean()
    print(f"   Bittern generation (L per kg production):")
    for size, efficiency in bittern_efficiency.items():
        print(f"      {size:15}: {efficiency:5.2f} L/kg")
    
    return df

if __name__ == "__main__":
    analyze_capacity_effects()