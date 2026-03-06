import numpy as np

class WasteCompositionModel:
    """
    Physics-based model for solar salt production waste in Puttalam, Sri Lanka.
    
    Solar Salt Production Process:
    1. Seawater evaporation in crystallizer ponds
    2. NaCl crystallization (salt harvest)
    3. Solid waste: Impurities (CaSO4, CaCO3, dirty salt)
    4. Liquid waste: Bittern (concentrated brine after salt harvest)
    
    Key Physics:
    - Waste generation proportional to production (~3-4% by weight)
    - Weather affects both production AND waste composition
    - Hot/dry conditions: More evaporation, harder impurities
    - Wet/humid conditions: Salt dissolution, more liquid waste
    """
    
    def __init__(self):
        # --- BASE WASTE RATIOS (Calibrated for Puttalam) ---
        # These reflect the natural composition of rejected material
        
        # Solid waste ratios (for bagged solid waste)
        self.solid_base_ratios = {
            'Gypsum': 0.55,         # CaSO4·2H2O - Primary impurity (precipitates early)
            'Limestone': 0.20,       # CaCO3 - Calcium carbonate deposits/scale
            'Industrial_Salt': 0.25  # NaCl - Off-spec/contaminated/washed out salt
        }
        
        # Brine waste ratios (mother liquor after crystallization)
        # Bittern composition: Remaining concentrated salts after NaCl harvest
        self.brine_generation_ratio = 0.10  # Liters of bittern per KG of salt produced
        # (Typical range: 0.08-0.15 L/kg depending on crystallization efficiency)
        # Puttalam: ~0.10 L/kg (efficient solar evaporation)
        
        # Bittern contains recoverable salts (potential by-products)
        # These are concentrations in bittern (g/L)
        self.bittern_composition = {
            'MgSO4': 80,   # Magnesium Sulfate (Epsom Salt) - g/L in bittern
            'MgCl2': 120,  # Magnesium Chloride (Magnesium Oil) - g/L in bittern
            'KCl': 30      # Potassium Chloride (Potash) - g/L in bittern
        }

    def calculate_composition(self, row):
        """
        Calculates waste composition for a single month based on production and weather.
        
        Args:
            row: Dictionary or Series with keys:
                - predicted_waste_kg: Total solid waste (in bags) for the month
                - production_volume: Salt production in KG
                - rain_sum: Monthly rainfall (mm)
                - temperature_mean: Average temperature (°C)
                - humidity_mean: Average humidity (%)
                - wind_speed_mean: Average wind speed (km/h)
                
        Returns:
            Dictionary with waste composition breakdown
        """
        
        total_solid_waste = row['predicted_waste_kg']
        production_vol = row['production_volume']
        rain = row['rain_sum']
        temp = row['temperature_mean']
        humidity = row['humidity_mean']
        wind = row['wind_speed_mean']
        
        composition = {}
        
        # ============================================================================
        # PART 1: SOLID WASTE COMPOSITION (Bagged Waste)
        # ============================================================================
        # The solid waste is impurities removed during salt production
        # Weather affects WHAT is in the waste, not the total amount (already determined)
        
        # Temperature effect: Higher temp → more gypsum precipitation
        # Gypsum (CaSO4) is less soluble at higher temperatures
        temp_factor = 1.0 + 0.015 * (temp - 27.0)  # Normalized around 27°C (Puttalam avg)
        
        # Rain effect: Higher rain → more salt dissolution/loss
        # Industrial salt (washed out/contaminated NaCl) increases with rain
        rain_factor = 1.0 + 0.005 * rain  # More rain = more contaminated salt
        
        # Calculate weighted ratios
        gypsum_weight = self.solid_base_ratios['Gypsum'] * temp_factor
        limestone_weight = self.solid_base_ratios['Limestone']  # Relatively stable
        salt_weight = self.solid_base_ratios['Industrial_Salt'] * rain_factor
        
        total_weight = gypsum_weight + limestone_weight + salt_weight
        
        # Distribute total solid waste according to weighted ratios
        composition['Solid_Waste_Gypsum_kg'] = float(total_solid_waste * (gypsum_weight / total_weight))
        composition['Solid_Waste_Limestone_kg'] = float(total_solid_waste * (limestone_weight / total_weight))
        composition['Solid_Waste_Industrial_Salt_kg'] = float(total_solid_waste * (salt_weight / total_weight))
        composition['Total_Solid_Waste_kg'] = float(total_solid_waste)
        
        # ============================================================================
        # PART 2: LIQUID WASTE - BITTERN (Mother Liquor)
        # ============================================================================
        # Bittern is the concentrated brine remaining after salt crystallization
        # Generation is proportional to SALT PRODUCTION (not waste)
        # Weather affects generation efficiency
        
        # Base bittern generation from production
        base_bittern = production_vol * self.brine_generation_ratio
        
        # Weather efficiency modifiers:
        # 1. High evaporation (high temp, low rain) → Better crystallization → Less bittern
        # 2. Poor evaporation (high humidity, rain) → Poor crystallization → More bittern
        
        evaporation_index = (temp / 35.0) * (wind / 20.0) * (1.0 / (1.0 + rain / 500.0))
        humidity_penalty = 1.0 + 0.003 * (humidity - 70.0)  # Higher humidity = more bittern
        
        # Normalize evaporation to efficiency factor (0.6 to 1.4 range)
        efficiency_factor = max(0.6, min(1.4, evaporation_index))
        bittern_modifier = (1.0 / efficiency_factor) * humidity_penalty
        
        bittern_volume = base_bittern * bittern_modifier
        composition['Liquid_Waste_Bittern_Liters'] = float(max(0, bittern_volume))
        
        # ============================================================================
        # PART 3: POTENTIAL BY-PRODUCTS FROM BITTERN
        # ============================================================================
        # These are recoverable salts that can be extracted from bittern
        # Concentrations are fixed by seawater chemistry
        # Recovery potential depends on processing conditions
        
        # A) Epsom Salt (MgSO4·7H2O)
        # Needs: Cool temperatures, time for crystallization
        # Best in: Low temp, low humidity months
        epsom_concentration = self.bittern_composition['MgSO4']  # g/L
        temp_recovery = max(0.3, 1.0 - 0.02 * (temp - 25.0))  # Cooler is better
        humidity_recovery = max(0.5, 1.0 - 0.01 * (humidity - 60.0))  # Drier is better
        epsom_kg = (bittern_volume * epsom_concentration / 1000.0) * temp_recovery * humidity_recovery
        composition['Potential_Epsom_Salt_kg'] = float(max(0, epsom_kg))
        
        # B) Potash (KCl)
        # Needs: Extreme evaporation, hot & dry conditions
        # Rainfall destroys yield
        potash_concentration = self.bittern_composition['KCl']  # g/L
        evaporation_factor = max(0.1, (temp - 25.0) / 10.0) * max(0.1, wind / 15.0)
        rain_destruction = 1.0 / (1.0 + 0.01 * rain)
        potash_kg = (bittern_volume * potash_concentration / 1000.0) * evaporation_factor * rain_destruction
        composition['Potential_Potash_kg'] = float(max(0, potash_kg))
        
        # C) Magnesium Oil (MgCl2 solution)
        # Hygroscopic: Absorbs water from humid air
        # High humidity increases volume
        mag_concentration = self.bittern_composition['MgCl2']  # g/L
        humidity_boost = 1.0 + 0.01 * (humidity - 70.0)  # More humid = more volume
        # NOTE: This is output as LITERS of concentrated MgCl2 solution
        mag_oil_vol = (bittern_volume * mag_concentration / 1000.0) * humidity_boost * 1.2  # Convert to liquid volume
        composition['Potential_Magnesium_Oil_Liters'] = float(max(0, mag_oil_vol))
        
        # Total liquid waste (bittern + magnesium oil volume)
        total_liquid = bittern_volume + mag_oil_vol
        composition['Total_Liquid_Waste_Liters'] = float(total_liquid)
        
        return composition
