import pandas as pd
import numpy as np

print("="*80)
print("TRAINING DATA VERIFICATION - 2000 to 2026")
print("="*80)

# Load data
df = pd.read_csv('data/final/training_data_2000_2026.csv', comment='#')

print(f"\n✓ Total records: {len(df)}")
print(f"✓ Date range: {df['Year'].min()}-{df['Month'].min():02d} to {df['Year'].max()}-{df['Month'].max():02d}")
print(f"✓ Years covered: {len(df['Year'].unique())} years")
print(f"✓ Average records per year: {len(df) / len(df['Year'].unique()):.1f} months")

print("\n" + "="*80)
print("FEATURE STATISTICS")
print("="*80)
print(f"Production Volume:")
print(f"  Mean: {df['production_volume'].mean():,.0f} kg/month")
print(f"  Range: {df['production_volume'].min():,.0f} to {df['production_volume'].max():,.0f} kg/month")

print(f"\nWeather Patterns:")
print(f"  Rainfall: {df['rain_sum'].mean():.1f} ± {df['rain_sum'].std():.1f} mm/month")
print(f"  Temperature: {df['temperature_mean'].mean():.1f} ± {df['temperature_mean'].std():.1f} °C")
print(f"  Humidity: {df['humidity_mean'].mean():.1f} ± {df['humidity_mean'].std():.1f} %")
print(f"  Wind Speed: {df['wind_speed_mean'].mean():.1f} ± {df['wind_speed_mean'].std():.1f} km/h")

print("\n" + "="*80)
print("WASTE GENERATION STATISTICS")
print("="*80)
print(f"Solid Waste (Total):")
print(f"  Mean: {df['Total_Waste_kg'].mean():,.0f} kg/month")
print(f"  Range: {df['Total_Waste_kg'].min():,.0f} to {df['Total_Waste_kg'].max():,.0f} kg/month")
print(f"  Waste-to-Production Ratio: {(df['Total_Waste_kg'].sum() / df['production_volume'].sum())*100:.2f}%")

print(f"\nSolid Waste Composition (Average):")
print(f"  Gypsum (CaSO4): {df['Solid_Waste_Gypsum_kg'].mean():,.0f} kg/month ({(df['Solid_Waste_Gypsum_kg'].mean()/df['Total_Waste_kg'].mean())*100:.1f}%)")
print(f"  Limestone (CaCO3): {df['Solid_Waste_Limestone_kg'].mean():,.0f} kg/month ({(df['Solid_Waste_Limestone_kg'].mean()/df['Total_Waste_kg'].mean())*100:.1f}%)")
print(f"  Industrial Salt: {df['Solid_Waste_Industrial_Salt_kg'].mean():,.0f} kg/month ({(df['Solid_Waste_Industrial_Salt_kg'].mean()/df['Total_Waste_kg'].mean())*100:.1f}%)")

print(f"\nLiquid Waste (Bittern):")
print(f"  Mean: {df['Liquid_Waste_Bittern_Liters'].mean():,.0f} L/month")
print(f"  Bittern-to-Production Ratio: {df['Liquid_Waste_Bittern_Liters'].mean() / df['production_volume'].mean():.3f} L/kg")

print(f"\nPotential By-Products:")
print(f"  Epsom Salt (MgSO4): {df['Potential_Epsom_Salt_kg'].mean():,.0f} ± {df['Potential_Epsom_Salt_kg'].std():,.0f} kg/month")
print(f"  Potash (KCl): {df['Potential_Potash_kg'].mean():,.0f} ± {df['Potential_Potash_kg'].std():,.0f} kg/month")
print(f"  Magnesium Oil: {df['Potential_Magnesium_Oil_Liters'].mean():,.0f} ± {df['Potential_Magnesium_Oil_Liters'].std():,.0f} L/month")

print("\n" + "="*80)
print("SAMPLE DATA (First 5 Months)")
print("="*80)
print(df[['Year', 'Month', 'production_volume', 'rain_sum', 'Total_Waste_kg', 'Liquid_Waste_Bittern_Liters']].head().to_string(index=False))

print("\n" + "="*80)
print("SEASONAL PATTERN VERIFICATION")
print("="*80)
# Group by month to see seasonal patterns
monthly_avg = df.groupby('Month')[['production_volume', 'rain_sum', 'Total_Waste_kg']].mean()
print("\nAverage by Month:")
print(f"{'Month':<10} {'Production (kg)':<20} {'Rainfall (mm)':<15} {'Waste (kg)':<15}")
print("-"*60)
for month in range(1, 13):
    if month in monthly_avg.index:
        row = monthly_avg.loc[month]
        print(f"{month:<10} {row['production_volume']:<20,.0f} {row['rain_sum']:<15.1f} {row['Total_Waste_kg']:<15,.0f}")

print("\n" + "="*80)
print("✓ TRAINING DATA GENERATION COMPLETE")
print("="*80)
print(f"\nFile saved: data/final/training_data_2000_2026.csv")
print(f"Records: {len(df)} months of synthetic data")
print(f"Columns: {len(df.columns)} features and targets")
print(f"\nReady for ML model training!")
