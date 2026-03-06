import pandas as pd
import numpy as np
import os

# Optional MLflow import
try:
    import mlflow
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False
    print("[INFO] MLflow not available. Experiment tracking will be skipped.")

from src.physics_models import WasteCompositionModel

class WasteDistributor:
    """
    Digital Twin model for Puttalam salt production waste distribution.
    
    Distributes yearly waste totals to monthly values based on:
    1. Production volume (primary driver)
    2. Weather conditions (secondary modifiers)
    3. Physical constraints (waste proportional to production)
    """
    
    def __init__(self, production_weight=1.0, rain_weight=0.3, temp_weight=0.1):
        """
        Initialize waste distributor with physics-based parameters.
        
        Args:
            production_weight: Exponent for production influence (default 1.0 = linear)
            rain_weight: Weight for rainfall effect on waste (0.0 to 1.0)
            temp_weight: Weight for temperature effect on waste (0.0 to 1.0)
        """
        self.production_weight = production_weight
        self.rain_weight = rain_weight
        self.temp_weight = temp_weight
        self.composition_model = WasteCompositionModel()
        self.calibration_factor = 1.0  # kg of waste per score unit
        self.is_calibrated = False
        
        # Store normalization parameters for consistent predictions
        self.norm_rain_max = 500.0  # mm/month (typical monsoon max)
        self.norm_temp_max = 35.0   # °C (typical hot season max)

    def calibrate(self, yearly_waste_df, monthly_features_df):
        """
        Calibrates the model to match actual yearly waste totals.
        
        Finds the scaling factor k such that:
        Predicted_Waste = k * Waste_Potential_Score
        
        Where Waste_Potential_Score = f(production, weather)
        
        Args:
            yearly_waste_df: DataFrame with columns ['Year', 'Waste_KG', 'Waste_Bags']
            monthly_features_df: DataFrame with monthly production and weather data
        """
        print("\n" + "="*80)
        print("CALIBRATING DIGITAL TWIN MODEL")
        print("="*80)
        
        # Find common years between waste data and features
        years_waste = set(yearly_waste_df['Year'].unique())
        years_features = set(monthly_features_df['Year'].unique())
        common_years = sorted(years_waste & years_features)
        
        if not common_years:
            raise ValueError("No overlapping years between waste data and production features!")
        
        print(f"\nCalibration years: {common_years}")
        print(f"Waste data years: {sorted(years_waste)}")
        print(f"Feature data years: {sorted(years_features)}")
        
        # Accumulate totals for calibration
        total_actual_waste = 0
        total_calc_score = 0
        
        print(f"\n{'Year':<8} {'Actual Waste (kg)':<20} {'Calc Score':<20} {'Ratio (kg/score)':<20}")
        print("-" * 80)
        
        for year in common_years:
            # Get actual waste for this year
            year_waste = yearly_waste_df[yearly_waste_df['Year'] == year]['Waste_KG'].values[0]
            total_actual_waste += year_waste
            
            # Calculate waste potential scores for all months in this year
            year_features = monthly_features_df[monthly_features_df['Year'] == year].copy()
            scores = self.calculate_waste_potential(year_features)
            year_score = scores.sum()
            total_calc_score += year_score
            
            ratio = year_waste / year_score if year_score > 0 else 0
            print(f"{year:<8} {year_waste:<20,.0f} {year_score:<20,.2f} {ratio:<20,.4f}")
        
        # Calculate calibration factor
        if total_calc_score > 0:
            self.calibration_factor = total_actual_waste / total_calc_score
            self.is_calibrated = True
            print("-" * 80)
            print(f"{'TOTAL':<8} {total_actual_waste:<20,.0f} {total_calc_score:<20,.2f} {self.calibration_factor:<20,.4f}")
            print("\n" + "="*80)
            print(f"✓ MODEL CALIBRATED SUCCESSFULLY")
            print(f"  Calibration Factor: {self.calibration_factor:.6f} kg/score_unit")
            print("="*80)
        else:
            raise ValueError("Calibration failed: Total calculated score is zero!")
        
        # Calculate and store reference statistics for normalization
        self.ref_stats = {
            'production_mean': monthly_features_df['production_volume'].mean(),
            'production_std': monthly_features_df['production_volume'].std(),
            'rain_mean': monthly_features_df['rain_sum'].mean(),
            'rain_std': monthly_features_df['rain_sum'].std(),
            'temp_mean': monthly_features_df['temperature_mean'].mean(),
            'temp_std': monthly_features_df['temperature_mean'].std(),
            'humidity_mean': monthly_features_df['humidity_mean'].mean(),
            'wind_mean': monthly_features_df['wind_speed_mean'].mean()
        }
        
        print(f"\nReference Statistics (for synthetic data generation):")
        print(f"  Production: {self.ref_stats['production_mean']:,.0f} ± {self.ref_stats['production_std']:,.0f} kg/month")
        print(f"  Rainfall: {self.ref_stats['rain_mean']:.1f} ± {self.ref_stats['rain_std']:.1f} mm/month")
        print(f"  Temperature: {self.ref_stats['temp_mean']:.1f} ± {self.ref_stats['temp_std']:.1f} °C")
        print(f"  Humidity: {self.ref_stats['humidity_mean']:.1f}%")
        print(f"  Wind Speed: {self.ref_stats['wind_mean']:.1f} km/h")

    def predict_one_month(self, production, rain, temp, humidity, wind, production_capacity=None):
        """
        Predicts waste for a single hypothetical month using the calibrated model.
        
        Args:
            production: Salt production volume (kg)
            rain: Monthly rainfall (mm)
            temp: Average temperature (°C)
            humidity: Average humidity (%)
            wind: Average wind speed (km/h)
            production_capacity: Optional production capacity (kg). If None, estimated.
            
        Returns:
            Dictionary with predicted waste composition
        """
        if not self.is_calibrated:
            raise ValueError("Model must be calibrated before making predictions!")
        
        # Normalize weather variables
        rain_norm = rain / self.norm_rain_max
        temp_norm = temp / self.norm_temp_max
        
        # Calculate waste potential score
        base_potential = production ** self.production_weight
        weather_modifier = 1.0 + (self.rain_weight * rain_norm) + (self.temp_weight * temp_norm)
        score = base_potential * weather_modifier
        
        # Predict total solid waste (in kg)
        predicted_total_kg = score * self.calibration_factor
        
        # Estimate production capacity if not provided (assume 85% utilization)
        if production_capacity is None:
            production_capacity = production / 0.85
        
        # Create input row for composition model
        row = {
            'predicted_waste_kg': predicted_total_kg,
            'production_volume': production,
            'production_capacity': production_capacity,
            'rain_sum': rain,
            'temperature_mean': temp,
            'humidity_mean': humidity,
            'wind_speed_mean': wind
        }
        
        # Calculate detailed waste composition
        composition = self.composition_model.calculate_composition(row)
        
        # Add total waste to output (for compatibility)
        result = {'Total_Waste_kg': float(predicted_total_kg)}
        result.update(composition)
        
        # Sanity check: Verify solid waste components sum to total
        solid_sum = (
            result.get('Solid_Waste_Limestone_kg', 0) +
            result.get('Solid_Waste_Gypsum_kg', 0) +
            result.get('Solid_Waste_Industrial_Salt_kg', 0)
        )
        
        if abs(solid_sum - predicted_total_kg) > 0.1:
            print(f"[WARNING] Solid waste sum ({solid_sum:.2f} kg) != Total ({predicted_total_kg:.2f} kg)")
        
        return result

    def calculate_waste_potential(self, df):
        """
        Calculates a dimensionless 'waste potential' score for each month.
        
        Physics principle: Waste is primarily driven by production volume,
        with weather conditions as secondary modifiers.
        
        Score = Production^α × (1 + β×Rain_normalized + γ×Temp_normalized)
        
        Args:
            df: DataFrame with columns ['production_volume', 'rain_sum', 'temperature_mean']
            
        Returns:
            Series of waste potential scores
        """
        # Normalize weather variables to [0, 1] range using fixed reference values
        rain_norm = df['rain_sum'] / self.norm_rain_max
        temp_norm = df['temperature_mean'] / self.norm_temp_max
        
        # Base potential: Production volume (linear or power relationship)
        # For salt production, waste is roughly proportional to production
        base_potential = df['production_volume'] ** self.production_weight
        
        # Weather modifiers:
        # - Rain increases waste (more contamination, salt dissolution)
        # - Temperature affects waste composition but less impact on total
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
    """
    Main pipeline for the Digital Twin waste distribution system.
    
    Steps:
    1. Load processed monthly features and yearly waste data
    2. Calibrate the model to match actual waste totals
    3. Distribute yearly waste to monthly values based on production & weather
    4. Calculate detailed waste composition for each month
    5. Save results and validate against actual data
    """
    print("\n" + "="*80)
    print("DIGITAL TWIN PIPELINE - PUTTALAM SALT PRODUCTION WASTE MODELING")
    print("="*80)
    
    if MLFLOW_AVAILABLE:
        mlflow.set_experiment("Puttalam_Salt_Waste_Digital_Twin")
        mlflow_run = mlflow.start_run()
    else:
        mlflow_run = None
    
    try:
        # Load Data
        processed_dir = 'data/processed'
        original_dir = 'data/original'
        
        print("\n[Step 1/5] Loading data...")
        monthly_features = pd.read_parquet(os.path.join(processed_dir, 'monthly_features.parquet'))
        yearly_waste = pd.read_excel(os.path.join(original_dir, 'actual_waste_data.xlsx'))
        
        print(f"  ✓ Monthly features: {monthly_features.shape[0]} months, {monthly_features.shape[1]} features")
        print(f"  ✓ Yearly waste data: {len(yearly_waste)} years")
        
        # Model Parameters
        prod_w = 1.0   # Production is primary driver (linear relationship)
        rain_w = 0.3   # Rain increases waste (contamination, dissolution)
        temp_w = 0.1   # Temperature affects composition more than total
        
        if MLFLOW_AVAILABLE:
            mlflow.log_param("production_weight", prod_w)
            mlflow.log_param("rain_weight", rain_w)
            mlflow.log_param("temp_weight", temp_w)
            mlflow.log_param("waste_model_version", "v2.0_OpenAI_tech_lead")
        
        # Initialize and Calibrate Model
        print("\n[Step 2/5] Initializing model...")
        distributor = WasteDistributor(production_weight=prod_w, rain_weight=rain_w, temp_weight=temp_w)
        
        print("\n[Step 3/5] Calibrating model...")
        distributor.calibrate(yearly_waste, monthly_features)
        
        # Run Distribution
        print("\n[Step 4/5] Distributing waste to monthly values...")
        final_df = distributor.distribute(yearly_waste, monthly_features)
        
        if final_df.empty:
            print("\n[ERROR] No overlapping years found to distribute data.")
            return None
        
        # Save Results
        print("\n[Step 5/5] Saving results...")
        final_dir = 'data/final'
        os.makedirs(final_dir, exist_ok=True)
        
        output_parquet = os.path.join(final_dir, 'monthly_waste_distributed.parquet')
        output_csv = os.path.join(final_dir, 'monthly_waste_distributed.csv')
        
        final_df.to_parquet(output_parquet, index=False)
        final_df.to_csv(output_csv, index=False)
        
        print(f"  ✓ Saved: {output_parquet}")
        print(f"  ✓ Saved: {output_csv}")
        
        # Log to MLflow
        if MLFLOW_AVAILABLE:
            mlflow.log_artifact(output_parquet)
            mlflow.log_artifact(output_csv)
        
        # Display Sample Results
        print("\n" + "="*80)
        print("SAMPLE RESULTS (First 5 months)")
        print("="*80)
        display_cols = [
            'Year', 'Month', 'production_volume', 'rain_sum', 
            'predicted_waste_kg', 'Solid_Waste_Gypsum_kg', 
            'Liquid_Waste_Bittern_Liters', 'Potential_Epsom_Salt_kg'
        ]
        available_cols = [col for col in display_cols if col in final_df.columns]
        print(final_df[available_cols].head().to_string(index=False))
        
        # Validation: Compare yearly totals
        print("\n" + "="*80)
        print("VALIDATION: Yearly Waste Totals")
        print("="*80)
        print(f"{'Year':<10} {'Actual (kg)':<20} {'Predicted (kg)':<20} {'Diff (kg)':<15} {'Error %':<10}")
        print("-" * 80)
        
        total_actual = 0
        total_predicted = 0
        
        for year in sorted(final_df['Year'].unique()):
            predicted_sum = final_df[final_df['Year'] == year]['predicted_waste_kg'].sum()
            actual_row = yearly_waste[yearly_waste['Year'] == year]
            
            if not actual_row.empty:
                actual_sum = actual_row['Waste_KG'].values[0]
                diff = predicted_sum - actual_sum
                error_pct = (diff / actual_sum) * 100 if actual_sum > 0 else 0
                
                print(f"{year:<10} {actual_sum:<20,.0f} {predicted_sum:<20,.2f} {diff:<15,.2f} {error_pct:<10.2f}%")
                
                # Log metrics
                if MLFLOW_AVAILABLE:
                    mlflow.log_metric(f"waste_kg_actual_{year}", actual_sum)
                    mlflow.log_metric(f"waste_kg_predicted_{year}", predicted_sum)
                    mlflow.log_metric(f"waste_kg_error_{year}", abs(diff))
                    mlflow.log_metric(f"waste_error_pct_{year}", abs(error_pct))
                
                total_actual += actual_sum
                total_predicted += predicted_sum
        
        print("-" * 80)
        total_diff = total_predicted - total_actual
        total_error_pct = (total_diff / total_actual) * 100 if total_actual > 0 else 0
        print(f"{'TOTAL':<10} {total_actual:<20,.0f} {total_predicted:<20,.2f} {total_diff:<15,.2f} {total_error_pct:<10.2f}%")
        
        if MLFLOW_AVAILABLE:
            mlflow.log_metric("total_waste_actual", total_actual)
            mlflow.log_metric("total_waste_predicted", total_predicted)
            mlflow.log_metric("total_error_pct", abs(total_error_pct))
        
        # Summary Statistics
        print("\n" + "="*80)
        print("SUMMARY STATISTICS")
        print("="*80)
        print(f"Total months: {len(final_df)}")
        print(f"Years covered: {sorted(final_df['Year'].unique())}")
        print(f"\nAverage monthly waste: {final_df['predicted_waste_kg'].mean():,.2f} kg")
        print(f"Average monthly bittern: {final_df['Liquid_Waste_Bittern_Liters'].mean():,.2f} liters")
        print(f"\nSolid waste composition (average):")
        print(f"  - Gypsum: {final_df['Solid_Waste_Gypsum_kg'].mean():,.2f} kg/month")
        print(f"  - Limestone: {final_df['Solid_Waste_Limestone_kg'].mean():,.2f} kg/month")
        print(f"  - Industrial Salt: {final_df['Solid_Waste_Industrial_Salt_kg'].mean():,.2f} kg/month")
        
        print("\n" + "="*80)
        print("✓ PIPELINE COMPLETED SUCCESSFULLY")
        print("="*80)
    
    finally:
        if MLFLOW_AVAILABLE and mlflow_run is not None:
            mlflow.end_run()
        
        return final_df

if __name__ == "__main__":
    run_digital_twin_pipeline()
