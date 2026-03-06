import pandas as pd

print("="*80)
print("DIGITAL TWIN OUTPUT VERIFICATION")
print("="*80)

df = pd.read_csv('data/final/monthly_waste_distributed.csv')

print("\n1. WASTE-TO-PRODUCTION RATIOS (Should be ~3-4% for salt production)")
print("-"*80)
print(f"{'Year':<10} {'Production (kg)':<20} {'Waste (kg)':<20} {'Ratio %':<15} {'Bittern (L/kg)'}")
print("-"*80)

for year in sorted(df['Year'].unique()):
    year_data = df[df['Year'] == year]
    prod = year_data['production_volume'].sum()
    waste = year_data['predicted_waste_kg'].sum()
    bittern = year_data['Liquid_Waste_Bittern_Liters'].sum()
    ratio = (waste/prod)*100
    bittern_ratio = bittern/prod
    print(f"{year:<10} {prod:<20,.0f} {waste:<20,.0f} {ratio:<15.3f} {bittern_ratio:.4f}")

print("\n2. PHYSICS VALIDATION - Sample Month (Jan 2024)")
print("-"*80)
jan = df[(df['Year']==2024) & (df['Month']==1)].iloc[0]
print(f"Production: {jan['production_volume']:,.0f} kg salt")
print(f"\nSOLID WASTE: {jan['predicted_waste_kg']:,.0f} kg ({(jan['predicted_waste_kg']/jan['production_volume'])*100:.3f}% of production)")
print(f"  Breakdown:")
print(f"    - Gypsum (CaSO4):       {jan['Solid_Waste_Gypsum_kg']:,.0f} kg ({(jan['Solid_Waste_Gypsum_kg']/jan['predicted_waste_kg'])*100:.1f}%)")
print(f"    - Limestone (CaCO3):    {jan['Solid_Waste_Limestone_kg']:,.0f} kg ({(jan['Solid_Waste_Limestone_kg']/jan['predicted_waste_kg'])*100:.1f}%)")
print(f"    - Industrial Salt:      {jan['Solid_Waste_Industrial_Salt_kg']:,.0f} kg ({(jan['Solid_Waste_Industrial_Salt_kg']/jan['predicted_waste_kg'])*100:.1f}%)")
print(f"  Total Check: {jan['Total_Solid_Waste_kg']:,.0f} kg ✓" if abs(jan['Total_Solid_Waste_kg'] - jan['predicted_waste_kg']) < 1 else f"  Total Check: MISMATCH")

print(f"\nLIQUID WASTE (Bittern): {jan['Liquid_Waste_Bittern_Liters']:,.0f} L ({jan['Liquid_Waste_Bittern_Liters']/jan['production_volume']:.3f} L/kg production)")
print(f"  Typical range: 0.08-0.15 L/kg → {'✓ VALID' if 0.08 < jan['Liquid_Waste_Bittern_Liters']/jan['production_volume'] < 0.20 else '⚠ CHECK'}")

print(f"\nPOTENTIAL BY-PRODUCTS FROM BITTERN:")
print(f"  - Epsom Salt (MgSO4):         {jan['Potential_Epsom_Salt_kg']:,.0f} kg")
print(f"  - Potash (KCl):               {jan['Potential_Potash_kg']:,.0f} kg")
print(f"  - Magnesium Oil (MgCl2):      {jan['Potential_Magnesium_Oil_Liters']:,.0f} L")

print("\n3. WEATHER CORRELATION CHECK")
print("-"*80)
print("High Rain Months (>300mm):")
high_rain = df[df['rain_sum'] > 300].sort_values('rain_sum', ascending=False).head(3)
for idx, row in high_rain.iterrows():
    waste_ratio = (row['predicted_waste_kg']/row['production_volume'])*100
    print(f"  {int(row['Year'])}-{int(row['Month']):02d}: Rain={row['rain_sum']:.0f}mm, Waste={waste_ratio:.3f}%")

print("\nLow Rain Months (<50mm):")
low_rain = df[df['rain_sum'] < 50].sort_values('rain_sum').head(3)
for idx, row in low_rain.iterrows():
    waste_ratio = (row['predicted_waste_kg']/row['production_volume'])*100
    print(f"  {int(row['Year'])}-{int(row['Month']):02d}: Rain={row['rain_sum']:.0f}mm, Waste={waste_ratio:.3f}%")

print("\n" + "="*80)
print("✓ VERIFICATION COMPLETE")
print("="*80)
