"""
Verification of NON-SOLID (Liquid/Derivative) Physics Models
Check bittern generation and derivative recovery physics for correctness
"""

import pandas as pd
import numpy as np

def verify_nonsol_physics():
    print("🧪 NON-SOLID PHYSICS MODEL VERIFICATION")
    print("=" * 50)
    
    # Load recent data
    df = pd.read_csv('data/final/training_data_5years.csv', comment='#')
    
    print("\n📊 Current Recovery Factors from Code:")
    print("   Epsom_Salt:     0.05 kg per Liter Bittern")
    print("   Potash:         0.02 kg per Liter Bittern")  
    print("   Magnesium_Oil:  0.10 Liters per Liter Bittern")
    
    # Calculate what the factors should be based on generated data
    df['calculated_epsom_factor'] = df['Potential_Epsom_Salt_kg'] / df['Liquid_Waste_Bittern_Liters']
    df['calculated_potash_factor'] = df['Potential_Potash_kg'] / df['Liquid_Waste_Bittern_Liters'] 
    df['calculated_mag_oil_factor'] = df['Potential_Magnesium_Oil_Liters'] / df['Liquid_Waste_Bittern_Liters']
    
    print("\n📊 Actual Recovery Factors in Generated Data:")
    print(f"   Epsom Salt factor:   {df['calculated_epsom_factor'].mean():.4f} ± {df['calculated_epsom_factor'].std():.4f}")
    print(f"   Potash factor:       {df['calculated_potash_factor'].mean():.4f} ± {df['calculated_potash_factor'].std():.4f}")
    print(f"   Mag Oil factor:      {df['calculated_mag_oil_factor'].mean():.4f} ± {df['calculated_mag_oil_factor'].std():.4f}")
    
    # Check physics logic
    print("\n🔬 PHYSICS LOGIC VERIFICATION:")
    
    # 1. Bittern Generation Logic
    print("\n1️⃣ BITTERN GENERATION:")
    print("   Formula: base_bittern + intensity_bittern")
    print("   base_bittern = capacity × 0.3 × weather_efficiency")
    print("   intensity_bittern = production × 0.7 × weather_efficiency")
    
    # Verify calculation
    df['weather_eff'] = (1 + 0.01 * (df['temperature_mean'] - 25)) / (1 + 0.002 * df['rain_sum'])
    df['calc_base'] = df['production_capacity'] * 0.3 * df['weather_eff']
    df['calc_intensity'] = df['production_volume'] * 0.7 * df['weather_eff']
    df['calc_total_bittern'] = df['calc_base'] + df['calc_intensity']
    
    bittern_diff = abs(df['calc_total_bittern'] - df['Liquid_Waste_Bittern_Liters']).mean()
    print(f"   ✅ Bittern calculation accuracy: {bittern_diff:.2f} L average error")
    
    # 2. Epsom Salt Logic  
    print("\n2️⃣ EPSOM SALT POTENTIAL:")
    print("   Logic: Needs evaporation (Wind/Temp). High Humidity reduces yield.")
    print("   CORRECTED Formula: bittern × 0.05 × (1 + 0.01×wind) × max(0.3, 1-0.008×(humidity-60))")
    
    df['epsom_wind_factor'] = 1 + 0.01 * df['wind_speed_mean']
    df['epsom_humidity_penalty'] = np.maximum(0.3, 1 - 0.008 * (df['humidity_mean'] - 60))
    df['calc_epsom'] = df['Liquid_Waste_Bittern_Liters'] * 0.05 * df['epsom_wind_factor'] * df['epsom_humidity_penalty']
    df['calc_epsom'] = df['calc_epsom'].clip(lower=0)
    
    epsom_diff = abs(df['calc_epsom'] - df['Potential_Epsom_Salt_kg']).mean()
    print(f"   ✅ Epsom calculation accuracy: {epsom_diff:.2f} kg average error")
    
    # Check correlations
    print(f"   Wind correlation with Epsom:    {df['wind_speed_mean'].corr(df['Potential_Epsom_Salt_kg']):6.3f} (should be +)")
    print(f"   Humidity correlation with Epsom:{df['humidity_mean'].corr(df['Potential_Epsom_Salt_kg']):6.3f} (should be -)")
    
    # 3. Potash Logic
    print("\n3️⃣ POTASH POTENTIAL:")
    print("   Logic: Needs extreme evaporation. High Rain destroys yield.")
    print("   CORRECTED Formula: bittern × 0.02 × (1 + 0.02×max(0,temp-25)) × (1/(1+0.008×rain))")
    
    df['potash_temp_factor'] = 1 + 0.02 * np.maximum(0, df['temperature_mean'] - 25)
    df['potash_rain_factor'] = 1 / (1 + 0.008 * df['rain_sum'])
    df['calc_potash'] = df['Liquid_Waste_Bittern_Liters'] * 0.02 * df['potash_temp_factor'] * df['potash_rain_factor']
    df['calc_potash'] = df['calc_potash'].clip(lower=0)
    
    potash_diff = abs(df['calc_potash'] - df['Potential_Potash_kg']).mean()
    print(f"   ✅ Potash calculation accuracy: {potash_diff:.2f} kg average error")
    
    print(f"   Temperature correlation with Potash: {df['temperature_mean'].corr(df['Potential_Potash_kg']):6.3f} (should be +)")
    print(f"   Rain correlation with Potash:        {df['rain_sum'].corr(df['Potential_Potash_kg']):6.3f} (should be -)")
    
    # 4. Magnesium Oil Logic
    print("\n4️⃣ MAGNESIUM OIL POTENTIAL:")
    print("   Logic: Hygroscopic. High Humidity increases volume (absorbs water).")
    print("   CORRECTED Formula: bittern × 0.10 × (1 + 0.012×max(0,humidity-50))")
    
    df['mag_oil_humidity_factor'] = 1 + 0.012 * np.maximum(0, df['humidity_mean'] - 50)
    df['calc_mag_oil'] = df['Liquid_Waste_Bittern_Liters'] * 0.10 * df['mag_oil_humidity_factor']
    df['calc_mag_oil'] = df['calc_mag_oil'].clip(lower=0)
    
    mag_oil_diff = abs(df['calc_mag_oil'] - df['Potential_Magnesium_Oil_Liters']).mean()
    print(f"   ✅ Mag Oil calculation accuracy: {mag_oil_diff:.2f} L average error")
    
    print(f"   Humidity correlation with Mag Oil: {df['humidity_mean'].corr(df['Potential_Magnesium_Oil_Liters']):6.3f} (should be +)")
    
    # Check for any problematic values
    print("\n⚠️  DATA QUALITY CHECKS:")
    
    issues = []
    
    if (df['Liquid_Waste_Bittern_Liters'] < 0).any():
        issues.append("❌ Negative bittern values found")
    
    if (df['Potential_Epsom_Salt_kg'] < 0).any():
        issues.append("❌ Negative epsom salt values found")
        
    if (df['Potential_Potash_kg'] < 0).any():
        issues.append("❌ Negative potash values found")
        
    if (df['Potential_Magnesium_Oil_Liters'] < 0).any():
        issues.append("❌ Negative magnesium oil values found")
    
    # Check if derivatives exceed realistic bounds
    max_epsom_ratio = df['Potential_Epsom_Salt_kg'].max() / df['Liquid_Waste_Bittern_Liters'].max()
    if max_epsom_ratio > 0.1:  # More than 10% recovery is unrealistic
        issues.append(f"❌ Unrealistic Epsom recovery ratio: {max_epsom_ratio:.3f}")
        
    max_potash_ratio = df['Potential_Potash_kg'].max() / df['Liquid_Waste_Bittern_Liters'].max()
    if max_potash_ratio > 0.05:  # More than 5% recovery is unrealistic
        issues.append(f"❌ Unrealistic Potash recovery ratio: {max_potash_ratio:.3f}")
    
    if not issues:
        print("   ✅ All quality checks passed!")
    else:
        for issue in issues:
            print(f"   {issue}")
    
    # Final assessment
    print("\n🎯 OVERALL ASSESSMENT:")
    
    total_calc_error = (bittern_diff + epsom_diff + potash_diff + mag_oil_diff) / 4
    print(f"   Average calculation error: {total_calc_error:.2f} units")
    
    # Check physics relationships
    wind_epsom_ok = df['wind_speed_mean'].corr(df['Potential_Epsom_Salt_kg']) > 0.1
    humidity_epsom_ok = df['humidity_mean'].corr(df['Potential_Epsom_Salt_kg']) < -0.1
    temp_potash_ok = df['temperature_mean'].corr(df['Potential_Potash_kg']) > 0.1
    rain_potash_ok = df['rain_sum'].corr(df['Potential_Potash_kg']) < -0.1
    humidity_mag_ok = df['humidity_mean'].corr(df['Potential_Magnesium_Oil_Liters']) > 0.1
    
    physics_score = sum([wind_epsom_ok, humidity_epsom_ok, temp_potash_ok, rain_potash_ok, humidity_mag_ok])
    
    print(f"   Physics relationships score: {physics_score}/5")
    
    if total_calc_error < 10 and physics_score >= 4 and not issues:
        print("   ✅ NON-SOLID PHYSICS MODELS ARE CORRECT")
    else:
        print("   ❌ NON-SOLID PHYSICS MODELS NEED CORRECTION")
        if total_calc_error >= 10:
            print(f"      - High calculation error: {total_calc_error:.2f}")
        if physics_score < 4:
            print(f"      - Poor physics relationships: {physics_score}/5")
        if issues:
            print(f"      - Data quality issues: {len(issues)}")
    
    return df

if __name__ == "__main__":
    verify_nonsol_physics()