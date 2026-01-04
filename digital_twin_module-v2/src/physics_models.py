import numpy as np

class WasteCompositionModel:
    """
    Physics-based model to determine the composition of salt production waste
    based on environmental conditions and production volume.
    
    Context: Puttalam, Sri Lanka (Tropical, Monsoonal).
    """
    
    def __init__(self):
        # --- 1. SOLID WASTE (In the Bags) ---
        # These ratios determine how the "Waste Bag" weight is distributed.
        self.solid_ratios = {
            'Limestone': 0.15,      # CaCO3 - Early precipitate/crust
            'Gypsum': 0.60,         # CaSO4 - The primary impurity in salt pans
            'Industrial_Salt': 0.25 # NaCl - Dirty/Washed out salt
        }
        
        # --- 2. BITTERN-BASED POTENTIAL (From Production Capacity & Utilization) ---
        # Realistic physics: Bittern generation depends on infrastructure capacity
        # and production intensity, not just raw production volume.
        
        # Base infrastructure bittern generation (always occurs)
        self.base_bittern_ratio = 0.3      # Liters per KG of capacity (infrastructure baseline)
        
        # Additional bittern from production intensity
        self.intensity_bittern_ratio = 0.7  # Liters per KG of actual production above baseline 
        
        # Yield Factors: KG of product per Liter of Bittern (Theoretical max)
        self.recovery_factors = {
            'Epsom_Salt': 0.05,     # kg MgSO4 per Liter Bittern
            'Potash': 0.02,         # kg KCl per Liter Bittern
            'Magnesium_Oil': 0.10   # Liters MgCl2 per Liter Bittern
        }

    def calculate_composition(self, row):
        """
        Calculates the breakdown of waste for a single row (month).
        Returns a dictionary of masses (kg) for solids and Volume (L)/Mass(kg) for liquid derivatives.
        """
        
        total_solid_waste = row['predicted_waste_kg']
        production_vol = row['production_volume']
        production_capacity = row.get('production_capacity', production_vol / 0.8)  # Estimate if missing
        rain = row['rain_sum']
        temp = row['temperature_mean']
        humidity = row['humidity_mean']
        wind = row['wind_speed_mean']
        
        # ==========================================
        # 1. Distribute SOLID WASTE (The Bags) - WITH CAPACITY EFFECTS
        # ==========================================
        
        # Production intensity factor (higher intensity = different waste profile)
        production_intensity = production_vol / production_capacity
        
        # Facility scale factor (larger capacity = more efficient separation)
        # Normalized to typical Puttalam scale (50,000 kg capacity baseline)
        scale_efficiency = min(1.2, production_capacity / 50000.0)  # Max 20% efficiency gain
        
        # Limestone: Stable baseline, but large facilities reduce limestone waste
        limestone_score = self.solid_ratios['Limestone'] / scale_efficiency
        
        # Gypsum: Weather + Capacity effects
        # Higher temp increases gypsum, but larger facilities handle it better
        gypsum_base = self.solid_ratios['Gypsum'] * (1 + 0.01 * (temp - 25))
        gypsum_score = gypsum_base / (scale_efficiency ** 0.5)  # Partial efficiency gain
        
        # Industrial Salt: Weather + Intensity effects  
        # Rain dissolves good salt + high intensity operations create more salt waste
        salt_base = self.solid_ratios['Industrial_Salt'] * (1 + 0.02 * rain)
        intensity_factor = 1 + 0.1 * (production_intensity - 0.8)  # More waste at high intensity
        salt_waste_score = salt_base * intensity_factor
        
        solid_scores = {
            'Limestone': limestone_score,
            'Gypsum': gypsum_score,
            'Industrial_Salt': salt_waste_score
        }
        
        total_solid_score = sum(solid_scores.values())
        
        composition = {}
        
        # Calculate Solid Mass (KG) - Sums exactly to total_solid_waste
        for category, score in solid_scores.items():
            fraction = score / total_solid_score
            composition[f'Solid_Waste_{category}_kg'] = total_solid_waste * fraction

        # ==========================================
        # 2. Calculate BITTERN & DERIVATIVES (From Production)
        # ==========================================
        
        # A. Raw Bittern Volume (Liters) - IMPROVED PHYSICS MODEL
        # Realistic Logic: 
        # 1. Base bittern from infrastructure (capacity-dependent, always generated)
        # 2. Additional bittern from production intensity above baseline
        # 3. Weather affects recovery efficiency, not generation volume
        
        # Estimate production capacity (assume 80% average utilization in calibration data)
        # estimated_capacity = production_vol / 0.8  # Now use actual capacity from data
        
        # Weather efficiency factor for bittern recovery
        weather_efficiency = (1 + 0.01 * (temp - 25)) * (1 / (1 + 0.002 * rain))
        
        # Base bittern from infrastructure (independent of current production)
        base_bittern = production_capacity * self.base_bittern_ratio * weather_efficiency
        
        # Additional bittern from production intensity
        production_intensity = production_vol / production_capacity  # Utilization ratio
        intensity_bittern = production_vol * self.intensity_bittern_ratio * weather_efficiency
        
        # Total bittern generation
        bittern_vol = base_bittern + intensity_bittern
        composition['Liquid_Waste_Bittern_Liters'] = bittern_vol
        
        # B. Epsom Salt Potential (KG)
        # Logic: Needs evaporation (Wind/Temp). High Humidity reduces yield.
        # FIXED: Season-independent effects - wind helps regardless of season
        base_epsom_yield = bittern_vol * self.recovery_factors['Epsom_Salt']
        wind_boost = 1 + 0.02 * (wind / 20.0)  # Normalized wind benefit (20 m/s max)
        humidity_reduction = max(0.4, 1 - 0.01 * ((humidity - 50) / 50.0))  # Normalized humidity penalty
        epsom_yield = base_epsom_yield * wind_boost * humidity_reduction
        composition['Potential_Epsom_Salt_kg'] = max(0, epsom_yield)
        
        # C. Potash Potential (KG)
        # Logic: Needs extreme evaporation. High Rain destroys yield.
        # FIXED: Stronger temperature effect for extreme evaporation
        temp_evaporation_factor = 1 + 0.02 * max(0, temp - 25)  # Only hot temps help
        rain_destruction_factor = 1 / (1 + 0.008 * rain)  # Stronger rain penalty
        potash_yield = bittern_vol * self.recovery_factors['Potash'] * \
                       temp_evaporation_factor * rain_destruction_factor
        composition['Potential_Potash_kg'] = max(0, potash_yield)
        
        # D. Magnesium Oil (Liters)
        # Logic: Hygroscopic. High Humidity increases volume (absorbs water).
        # FIXED: Season-independent humidity effect - always helps when humid
        base_mag_oil = bittern_vol * self.recovery_factors['Magnesium_Oil']
        humidity_boost = 1 + 0.015 * (humidity / 100.0)  # Normalized humidity benefit
        mag_oil_vol = base_mag_oil * humidity_boost
        composition['Potential_Magnesium_Oil_Liters'] = max(0, mag_oil_vol)
            
        return composition
