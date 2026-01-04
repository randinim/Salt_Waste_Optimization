import pandas as pd
import numpy as np
import os
import mlflow
from src.physics_models import WasteCompositionModel

class WasteDistributor:
    def __init__(self, production_weight=1.0, rain_weight=0.0, temp_weight=0.0):
        """
        Physics-based/Correlation model parameters.
        Score = Production^prod_weight * (1 + rain_weight * Rain_Norm + temp_weight * Temp_Norm)
        """
        self.production_weight = production_weight
        self.rain_weight = rain_weight
        self.temp_weight = temp_weight
        self.composition_model = WasteCompositionModel()
        self.calibration_factor = 1.0 # Default, will be updated by calibrate()

    def calibrate(self, yearly_waste_df, monthly_features_df):
        """
        Calibrates the model to find the relationship between 'Score' and 'Actual KG'.
        k = Total_Actual_Waste / Total_Calculated_Score
        """
        # Filter for common years
        years_waste = yearly_waste_df['Year'].unique()
        years_features = monthly_features_df['Year'].unique()
        common_years = set(years_waste) & set(years_features)
        
        total_actual_waste = 0
        total_calc_score = 0
        
        for year in common_years:
            # Actual
            actual = yearly_waste_df[yearly_waste_df['Year'] == year]['Waste_KG'].values[0]
            total_actual_waste += actual
            
            # Calculated Score
            feats = monthly_features_df[monthly_features_df['Year'] == year].copy()
            scores = self.calculate_waste_potential(feats)
            total_calc_score += scores.sum()
            
        if total_calc_score > 0:
            self.calibration_factor = total_actual_waste / total_calc_score
            print(f"Model Calibrated. Factor k = {self.calibration_factor:.4f} kg/score_unit")
        else:
            print("Calibration failed: No score calculated.")

    def predict_one_month(self, production, rain, temp, humidity, wind, production_capacity=None):
        """
        Predicts waste for a single hypothetical month using the calibrated factor.
        
        Args:
            production: Actual production volume (kg)
            rain: Rainfall (mm)
            temp: Temperature (°C) 
            humidity: Humidity (%)
            wind: Wind speed (m/s)
            production_capacity: Production capacity (kg). If None, estimated as production/0.8
        """
        # Create a single-row DataFrame for the score calculation
        # Note: calculate_waste_potential expects a DataFrame and uses max() for normalization.
        # For a single point prediction, we need reference values for normalization.
        # Ideally, these should be stored during calibration. 
        # For now, we will use hardcoded approximate max values based on the Puttalam context 
        # to ensure the 'score' is on the same scale as the calibrated model.
        
        # Approx Max values observed in data: Rain=500, Temp=35
        rain_norm = rain / 500.0
        temp_norm = temp / 35.0
        
        base_potential = production ** self.production_weight
        weather_modifier = 1.0 + (self.rain_weight * rain_norm) + (self.temp_weight * temp_norm)
        score = base_potential * weather_modifier
        
        # Predict Total Waste
        predicted_total_kg = score * self.calibration_factor
        
        # Predict Composition
        # We construct a 'row' dict to pass to the composition model
        row = {
            'predicted_waste_kg': predicted_total_kg,
            'production_volume': production,
            'production_capacity': production_capacity or (production / 0.8),  # Estimate if not provided
            'rain_sum': rain,
            'temperature_mean': temp,
            'humidity_mean': humidity,
            'wind_speed_mean': wind
        }
        
        composition = self.composition_model.calculate_composition(row)
        
        # Add the total to the result
        result = {'Total_Waste_kg': predicted_total_kg}
        result.update(composition)
        
        return result

    def calculate_waste_potential(self, df):
        """
        Calculates a dimensionless 'waste potential' score for each month.
        """
        # Normalize features for the score calculation to avoid scale issues
        # We use simple min-max scaling or just raw values if weights are tuned.
        # Here we assume weights are small coefficients for raw values or we normalize first.
        
        # Let's normalize rain and temp relative to the yearly average or max to keep it robust
        # UPDATED: Use fixed reference values for consistency with predict_one_month
        rain_norm = df['rain_sum'] / 500.0 
        temp_norm = df['temperature_mean'] / 35.0
        
        # Base potential driven by production
        # If production is 0, waste might not be 0 (fixed waste), but let's assume proportional for now.
        base_potential = df['production_volume'] ** self.production_weight
        
        # Weather modifiers (e.g. rain increases waste weight)
        weather_modifier = 1.0 + (self.rain_weight * rain_norm) + (self.temp_weight * temp_norm)
        
        score = base_potential * weather_modifier
        return score

    def distribute(self, yearly_waste_df, monthly_features_df):
        """
        Distributes yearly waste to months and calculates composition.
        """
        results = []
        
        # Filter for years present in both
        years_with_waste = yearly_waste_df['Year'].unique()
        years_with_features = monthly_features_df['Year'].unique()
        common_years = set(years_with_waste) & set(years_with_features)
        
        print(f"Distributing waste for years: {common_years}")
        
        for year in common_years:
            # Get yearly total
            year_waste_row = yearly_waste_df[yearly_waste_df['Year'] == year]
            if year_waste_row.empty:
                continue
            
            total_waste_kg = year_waste_row['Waste_KG'].values[0]
            total_waste_bags = year_waste_row['Waste_Bags'].values[0]
            
            # Get monthly features
            year_features = monthly_features_df[monthly_features_df['Year'] == year].copy()
            
            if year_features.empty:
                continue
                
            # Calculate Potential Score
            year_features['waste_potential'] = self.calculate_waste_potential(year_features)
            
            # Estimate production capacity (assume 80% average utilization)
            year_features['production_capacity'] = year_features['production_volume'] / 0.8
            
            # Calculate Fractions
            total_score = year_features['waste_potential'].sum()
            if total_score == 0:
                year_features['waste_fraction'] = 1.0 / len(year_features) # Uniform if no signal
            else:
                year_features['waste_fraction'] = year_features['waste_potential'] / total_score
            
            # Distribute Total Waste
            year_features['predicted_waste_kg'] = total_waste_kg * year_features['waste_fraction']
            year_features['predicted_waste_bags'] = total_waste_bags * year_features['waste_fraction']
            
            # --- Calculate Composition for each month ---
            composition_list = []
            for index, row in year_features.iterrows():
                comp = self.composition_model.calculate_composition(row)
                composition_list.append(comp)
            
            # Create DataFrame from composition list
            comp_df = pd.DataFrame(composition_list, index=year_features.index)
            
            # Concatenate with original features
            year_features = pd.concat([year_features, comp_df], axis=1)
            
            results.append(year_features)
            
        if not results:
            return pd.DataFrame()
            
        return pd.concat(results)

def run_digital_twin_pipeline():
    mlflow.set_experiment("Waste_Distribution_Digital_Twin_V2")
    
    with mlflow.start_run():
        # Load Data
        processed_dir = 'data/processed'
        original_dir = 'data/original'
        
        monthly_features = pd.read_parquet(os.path.join(processed_dir, 'monthly_features.parquet'))
        yearly_waste = pd.read_excel(os.path.join(original_dir, 'actual_waste_data.xlsx'))
        
        # Log params
        prod_w = 1.0
        rain_w = 0.5 
        temp_w = 0.1
        
        mlflow.log_param("production_weight", prod_w)
        mlflow.log_param("rain_weight", rain_w)
        mlflow.log_param("temp_weight", temp_w)
        
        # Initialize Model
        distributor = WasteDistributor(production_weight=prod_w, rain_weight=rain_w, temp_weight=temp_w)
        
        # Run Distribution
        final_df = distributor.distribute(yearly_waste, monthly_features)
        
        if final_df.empty:
            print("No overlapping years found to distribute data.")
            return
        
        # Save Final Dataset
        final_dir = 'data/final'
        os.makedirs(final_dir, exist_ok=True)
        output_path = os.path.join(final_dir, 'monthly_waste_composition.parquet')
        final_df.to_parquet(output_path)
        
        # Save as CSV for easy inspection
        final_df.to_csv(os.path.join(final_dir, 'monthly_waste_composition.csv'), index=False)
        
        print(f"Final dataset saved to {output_path}")
        
        # Display sample with new columns
        cols_to_show = ['Year', 'Month', 'predicted_waste_kg', 'Solid_Waste_Gypsum_kg', 'Liquid_Waste_Bittern_Liters', 'Potential_Epsom_Salt_kg']
        print(final_df[cols_to_show].head())
        
        # Log Artifacts
        mlflow.log_artifact(output_path)
        
        # Validation Metric: Check Sums
        for year in final_df['Year'].unique():
            calc_sum = final_df[final_df['Year'] == year]['predicted_waste_kg'].sum()
            actual_sum = yearly_waste[yearly_waste['Year'] == year]['Waste_KG'].values[0]
            diff = abs(calc_sum - actual_sum)
            print(f"Year {year}: Calculated={calc_sum:.2f}, Actual={actual_sum}, Diff={diff:.2f}")
            mlflow.log_metric(f"diff_waste_kg_{year}", diff)

if __name__ == "__main__":
    run_digital_twin_pipeline()
