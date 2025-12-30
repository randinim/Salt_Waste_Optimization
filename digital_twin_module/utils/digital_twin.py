"""
Digital Twin for Salt Production Waste Management.
Predicts waste generation, forecasts, and enables scenario simulation.
Provides decision support for production planning and optimization.
"""

import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from typing import Dict, Tuple, List, Optional
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


class SaltProductionDigitalTwin:
    """
    Digital Twin for salt production waste management.
    Predicts waste from weather and production conditions.
    Enables scenario simulation and optimization.
    """
    
    def __init__(self, model_path: str = None,
                 scaler_path: str = None,
                 features_path: str = None):
        """
        Initialize digital twin with trained model and data.
        
        Args:
            model_path: Path to trained model
            scaler_path: Path to feature scaler
            features_path: Path to training features for reference
        """
        # Use absolute paths from workspace root
        if model_path is None:
            model_path = str(Path(__file__).parent.parent / "data" / "processed" / "waste_prediction_model.pkl")
        if scaler_path is None:
            scaler_path = str(Path(__file__).parent.parent / "data" / "processed" / "scaler.pkl")
        if features_path is None:
            features_path = str(Path(__file__).parent.parent / "data" / "processed" / "features_engineered.csv")
        
        # Load model and scaler
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)
        
        with open(scaler_path, 'rb') as f:
            self.scaler = pickle.load(f)
        
        # Load historical data for context
        self.historical_data = pd.read_csv(features_path)
        self.historical_data['date'] = pd.to_datetime(self.historical_data['date'])
        
        # Feature names in order
        self.feature_names = [
            'production volume', 'temperature_mean (°C)', 'relative_humidity_mean (%)',
            'rain_sum (mm)', 'wind_speed_mean (km/h)', 'month', 'is_summer', 'is_winter',
            'evaporation_index', 'waste_per_unit_prod', 'prod_ma3'
        ]
        
        # Statistics for normalization reference
        self.feature_stats = self._calculate_feature_stats()
        
        print("Digital Twin initialized")
        print("  Model: Ridge Regression (alpha=10.0)")
        print("  R2 Score: 0.735")
        print("  Historical data: {} records".format(len(self.historical_data)))
    
    def _calculate_feature_stats(self) -> Dict[str, Dict[str, float]]:
        """Calculate min/max/mean for reference ranges."""
        stats = {}
        for feat in self.feature_names:
            if feat in self.historical_data.columns:
                col_data = self.historical_data[feat].dropna()
                stats[feat] = {
                    'mean': col_data.mean(),
                    'min': col_data.min(),
                    'max': col_data.max(),
                    'std': col_data.std()
                }
        return stats
    
    def predict_waste(self, production: float, temperature: float, humidity: float,
                     rain: float, wind_speed: float, month: int,
                     prev_prod: Optional[float] = None) -> Dict[str, float]:
        """
        Predict waste for a given month's conditions.
        
        Args:
            production: Monthly production volume
            temperature: Average temperature (°C)
            humidity: Average relative humidity (%)
            rain: Total rainfall (mm)
            wind_speed: Average wind speed (km/h)
            month: Month number (1-12)
            prev_prod: Previous month's production (for MA calculation)
        
        Returns:
            Dictionary with prediction and confidence metrics
        """
        # Calculate derived features
        is_summer = 1 if month in [6, 7, 8] else 0
        is_winter = 1 if month in [12, 1, 2] else 0
        
        # Evaporation index
        temp_norm = (temperature - self.feature_stats['temperature_mean (°C)']['min']) / \
                   (self.feature_stats['temperature_mean (°C)']['max'] - 
                    self.feature_stats['temperature_mean (°C)']['min'])
        humid_norm = (humidity - self.feature_stats['relative_humidity_mean (%)']['min']) / \
                    (self.feature_stats['relative_humidity_mean (%)']['max'] - 
                     self.feature_stats['relative_humidity_mean (%)']['min'])
        wind_norm = (wind_speed - self.feature_stats['wind_speed_mean (km/h)']['min']) / \
                   (self.feature_stats['wind_speed_mean (km/h)']['max'] - 
                    self.feature_stats['wind_speed_mean (km/h)']['min'])
        
        evaporation_index = 0.5 * temp_norm + 0.3 * (1 - humid_norm) + 0.2 * wind_norm
        
        # Waste per unit production
        waste_per_unit = np.mean(self.historical_data['waste_per_unit_prod'].dropna())
        
        # 3-month moving average of production
        if prev_prod is not None:
            prod_ma3 = (production + prev_prod + self.historical_data['prod_ma3'].iloc[-1]) / 3
        else:
            prod_ma3 = self.historical_data['prod_ma3'].iloc[-1]
        
        # Prepare feature vector
        features = np.array([
            production, temperature, humidity, rain, wind_speed,
            month, is_summer, is_winter, evaporation_index,
            waste_per_unit, prod_ma3
        ]).reshape(1, -1)
        
        # Scale and predict
        features_scaled = self.scaler.transform(features)
        prediction = self.model.predict(features_scaled)[0]
        
        # Ensure non-negative
        prediction = max(0, prediction)
        
        # Calculate confidence (based on feature ranges)
        confidence = self._calculate_confidence(
            temperature, humidity, rain, wind_speed, production
        )
        
        return {
            'predicted_waste_bags': prediction,
            'temperature': temperature,
            'humidity': humidity,
            'rain': rain,
            'wind_speed': wind_speed,
            'production': production,
            'evaporation_index': evaporation_index,
            'confidence': confidence,
            'month': month
        }
    
    def forecast_month(self, month: int, weather_forecast: Dict) -> Dict:
        """
        Forecast waste for a specific month using weather forecast.
        
        Args:
            month: Month number (1-12)
            weather_forecast: Dict with 'temperature', 'humidity', 'rain', 'wind_speed'
        
        Returns:
            Forecast with waste prediction
        """
        # Get typical production for this month from historical data
        month_data = self.historical_data[self.historical_data['month'] == month]
        typical_production = month_data['production volume'].mean()
        
        if pd.isna(typical_production):
            typical_production = self.historical_data['production volume'].mean()
        
        # Predict
        result = self.predict_waste(
            production=typical_production,
            temperature=weather_forecast['temperature'],
            humidity=weather_forecast['humidity'],
            rain=weather_forecast['rain'],
            wind_speed=weather_forecast['wind_speed'],
            month=month
        )
        
        result['forecast_type'] = 'weather_forecast'
        result['typical_production'] = typical_production
        
        return result
    
    def simulate_scenario(self, scenario_name: str, changes: Dict) -> Dict:
        """
        Simulate what-if scenarios to understand waste drivers.
        
        Args:
            scenario_name: Name of scenario
            changes: Dict with parameters to change {'production': +10000, 'temperature': +2, ...}
            print(f"  Waste: {result['predicted_waste_bags']:.0f} bags")
        Returns:
            Scenario results vs baseline
        """
        # Get baseline (recent month)
        baseline = self.historical_data[
            self.historical_data['Waste_Bags'].notna()
        ].iloc[-1]
        
        # Apply changes
        scenario_params = {
            'production': baseline['production volume'] + changes.get('production', 0),
            'temperature': baseline['temperature_mean (°C)'] + changes.get('temperature', 0),
            'humidity': baseline['relative_humidity_mean (%)'] + changes.get('humidity', 0),
            'rain': baseline['rain_sum (mm)'] + changes.get('rain', 0),
            'wind_speed': baseline['wind_speed_mean (km/h)'] + changes.get('wind_speed', 0),
            'month': int(baseline['month'])
        }
        
        # Ensure parameters are in valid ranges
        scenario_params['temperature'] = np.clip(
            scenario_params['temperature'],
            self.feature_stats['temperature_mean (°C)']['min'],
            self.feature_stats['temperature_mean (°C)']['max']
        )
        scenario_params['humidity'] = np.clip(scenario_params['humidity'], 10, 95)
        scenario_params['production'] = max(0, scenario_params['production'])
        scenario_params['rain'] = max(0, scenario_params['rain'])
        scenario_params['wind_speed'] = max(0, scenario_params['wind_speed'])
        
        # Predict baseline
        baseline_result = self.predict_waste(
            production=baseline['production volume'],
            temperature=baseline['temperature_mean (°C)'],
            humidity=baseline['relative_humidity_mean (%)'],
            rain=baseline['rain_sum (mm)'],
            wind_speed=baseline['wind_speed_mean (km/h)'],
            month=int(baseline['month'])
        )
        
        # Predict scenario
        scenario_result = self.predict_waste(**scenario_params)
        
        # Calculate impact
        waste_change = scenario_result['predicted_waste_bags'] - baseline_result['predicted_waste_bags']
        waste_pct_change = (waste_change / baseline_result['predicted_waste_bags']) * 100
        
        return {
            'scenario_name': scenario_name,
            'baseline_waste': baseline_result['predicted_waste_bags'],
            'scenario_waste': scenario_result['predicted_waste_bags'],
            'waste_change': waste_change,
            'waste_pct_change': waste_pct_change,
            'baseline_params': {
                'production': baseline['production volume'],
                'temperature': baseline['temperature_mean (°C)'],
                'humidity': baseline['relative_humidity_mean (%)'],
                'rain': baseline['rain_sum (mm)'],
                'wind_speed': baseline['wind_speed_mean (km/h)']
            },
            'scenario_params': scenario_params,
            'recommendation': self._generate_recommendation(waste_pct_change)
        }
    
    def sensitivity_analysis(self, variable: str, range_pct: float = 0.2) -> Dict:
        """
        Analyze sensitivity of waste to individual variables.
        
        Args:
            variable: Variable to analyze ('temperature', 'humidity', 'rain', 'wind_speed', 'production')
            range_pct: Percentage range to vary (-range_pct to +range_pct)
        
        Returns:
            Sensitivity analysis results
        """
        baseline = self.historical_data[
            self.historical_data['Waste_Bags'].notna()
        ].iloc[-1]
        
        base_prediction = self.predict_waste(
            production=baseline['production volume'],
            temperature=baseline['temperature_mean (°C)'],
            humidity=baseline['relative_humidity_mean (%)'],
            rain=baseline['rain_sum (mm)'],
            wind_speed=baseline['wind_speed_mean (km/h)'],
            month=int(baseline['month'])
        )['predicted_waste_bags']
        
        # Map variable names
        var_map = {
            'temperature': ('temperature_mean (°C)', 'production volume'),
            'humidity': ('relative_humidity_mean (%)', 'production volume'),
            'rain': ('rain_sum (mm)', 'production volume'),
            'wind_speed': ('wind_speed_mean (km/h)', 'production volume'),
            'production': ('production volume', 'temperature_mean (°C)')
        }
        
        if variable not in var_map:
            return {'error': f'Unknown variable: {variable}'}
        
        var_col, _ = var_map[variable]
        base_value = baseline[var_col]
        
        # Calculate range
        variation = base_value * range_pct
        low_value = base_value - variation
        high_value = base_value + variation
        
        # Predictions at different values
        values = np.linspace(low_value, high_value, 5)
        predictions = []
        
        for val in values:
            params = {
                'production': baseline['production volume'],
                'temperature': baseline['temperature_mean (°C)'],
                'humidity': baseline['relative_humidity_mean (%)'],
                'rain': baseline['rain_sum (mm)'],
                'wind_speed': baseline['wind_speed_mean (km/h)'],
                'month': int(baseline['month'])
            }
            
            # Update the variable
            var_label = var_map[variable][0]
            if var_label == 'temperature_mean (°C)':
                params['temperature'] = val
            elif var_label == 'relative_humidity_mean (%)':
                params['humidity'] = val
            elif var_label == 'rain_sum (mm)':
                params['rain'] = val
            elif var_label == 'wind_speed_mean (km/h)':
                params['wind_speed'] = val
            elif var_label == 'production volume':
                params['production'] = val
            
            pred = self.predict_waste(**params)['predicted_waste_bags']
            predictions.append(pred)
        
        # Calculate elasticity (% change in waste / % change in variable)
        elasticity = ((predictions[-1] - predictions[0]) / base_prediction) / range_pct / 2
        
        return {
            'variable': variable,
            'baseline_value': base_value,
            'baseline_waste': base_prediction,
            'range': [float(low_value), float(high_value)],
            'sensitivity_values': [float(v) for v in values],
            'sensitivity_predictions': [float(p) for p in predictions],
            'elasticity': elasticity,
            'interpretation': self._interpret_elasticity(variable, elasticity)
        }
    
    def _calculate_confidence(self, temperature: float, humidity: float,
                             rain: float, wind_speed: float, production: float) -> float:
        """Calculate prediction confidence (0-1)."""
        # Check if inputs are within historical ranges
        confidence = 1.0
        
        for value, feat in [(temperature, 'temperature_mean (°C)'),
                           (humidity, 'relative_humidity_mean (%)'),
                           (rain, 'rain_sum (mm)'),
                           (wind_speed, 'wind_speed_mean (km/h)'),
                           (production, 'production volume')]:
            
            if feat in self.feature_stats:
                stats = self.feature_stats[feat]
                # Penalize if outside 1 std range
                if value < stats['mean'] - stats['std'] or value > stats['mean'] + stats['std']:
                    confidence *= 0.9
        
        return max(0.5, confidence)  # Minimum 50% confidence
    
    def _generate_recommendation(self, waste_pct_change: float) -> str:
        """Generate actionable recommendation based on scenario impact."""
        if waste_pct_change < -20:
            return "HIGHLY RECOMMENDED: This scenario significantly reduces waste"
        elif waste_pct_change < -5:
            return "RECOMMENDED: This scenario moderately reduces waste"
        elif waste_pct_change < 5:
            return "NEUTRAL: This scenario has minimal impact on waste"
        elif waste_pct_change < 20:
            return "CAUTION: This scenario moderately increases waste"
        else:
            return "NOT RECOMMENDED: This scenario significantly increases waste"
    
    def _interpret_elasticity(self, variable: str, elasticity: float) -> str:
        """Interpret elasticity coefficient."""
        abs_elasticity = abs(elasticity)
        
        if abs_elasticity < 0.1:
            sensitivity = "very low"
        elif abs_elasticity < 0.5:
            sensitivity = "low"
        elif abs_elasticity < 1.0:
            sensitivity = "moderate"
        elif abs_elasticity < 2.0:
            sensitivity = "high"
        else:
            sensitivity = "very high"
        
        direction = "increases" if elasticity > 0 else "decreases"
        
        return f"Waste {direction} with {sensitivity} sensitivity to {variable} changes"
    
    def generate_report(self, output_path: str = "../data/processed/digital_twin_report.txt") -> str:
        """Generate comprehensive digital twin report."""
        report = []
        report.append("=" * 80)
        report.append("SALT PRODUCTION DIGITAL TWIN - ANALYSIS REPORT")
        report.append("=" * 80)
        report.append(f"\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # Model info
        report.append("MODEL INFORMATION")
        report.append("-" * 80)
        report.append("Model Type: Ridge Regression (L2 Regularization)")
        report.append("R² Score: 0.735 (Full Dataset)")
        report.append("CV R²: 0.012 ± 0.960 (5-Fold Cross-Validation)")
        report.append("Training Samples: 31 months")
        report.append("Features: 11 (production, weather, temporal, derived)\n")
        
        # Feature importance
        report.append("TOP WASTE DRIVERS (by importance)")
        report.append("-" * 80)
        report.append("1. Evaporation Index (43.7%)")
        report.append("   - Combination of temperature, humidity, and wind")
        report.append("   - Higher evaporation → more salt crystallization → more waste")
        report.append("")
        report.append("2. Relative Humidity (14.9%)")
        report.append("   - Lower humidity increases evaporation and waste")
        report.append("   - Strong negative correlation (-0.681)")
        report.append("")
        report.append("3. Temperature (14.7%)")
        report.append("   - Higher temperatures drive evaporation")
        report.append("   - Strong positive correlation (+0.690)")
        report.append("")
        report.append("4. Rainfall (8.1%)")
        report.append("   - Rain reduces evaporation and waste generation")
        report.append("   - Negative correlation (-0.502)")
        report.append("")
        report.append("5. Production Volume (5.4%)")
        report.append("   - More production → more waste")
        report.append("   - Moderate correlation (+0.587)\n")
        
        # Latest prediction
        report.append("CURRENT STATUS")
        report.append("-" * 80)
        latest = self.historical_data[self.historical_data['Waste_Bags'].notna()].iloc[-1]
        latest_pred = self.predict_waste(
            production=latest['production volume'],
            temperature=latest['temperature_mean (°C)'],
            humidity=latest['relative_humidity_mean (%)'],
            rain=latest['rain_sum (mm)'],
            wind_speed=latest['wind_speed_mean (km/h)'],
            month=int(latest['month'])
        )
        report.append(f"Date: {latest['date']}")
        report.append(f"Production: {latest['production volume']:,.0f} units")
        report.append(f"Actual Waste: {latest['Waste_Bags']:,.0f} bags")
        report.append(f"Predicted Waste: {latest_pred['predicted_waste_bags']:,.0f} bags")
        report.append(f"Temperature: {latest['temperature_mean (°C)']:.1f}°C")
        report.append(f"Humidity: {latest['relative_humidity_mean (%)']:.1f}%")
        report.append(f"Rainfall: {latest['rain_sum (mm)']:.1f} mm\n")
        
        # Recommendations
        report.append("KEY RECOMMENDATIONS")
        report.append("-" * 80)
        report.append("1. Monitor evaporation index as primary waste driver")
        report.append("   - Focus on managing humidity levels when possible")
        report.append("   - High temperature + low humidity = peak waste risk")
        report.append("")
        report.append("2. Leverage rainfall patterns")
        report.append("   - Rain periods offer opportunity for lower waste")
        report.append("   - Plan high-production activities strategically")
        report.append("")
        report.append("3. Seasonal optimization")
        report.append("   - July-August: Peak evaporation (higher waste expected)")
        report.append("   - November-January: Low evaporation (lower waste)")
        report.append("")
        report.append("4. Waste reduction targets")
        report.append("   - 10% humidity reduction → ~7% waste reduction")
        report.append("   - Implement moisture control measures in high-evaporation months\n")
        
        report.append("=" * 80)
        
        report_text = "\n".join(report)
        
        # Save report
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report_text)
        
        print(f"✓ Report saved: {output_path}")
        return report_text


def main():
    """Demonstrate digital twin capabilities."""
    print("\n" + "=" * 80)
    print("SALT PRODUCTION DIGITAL TWIN - DEMONSTRATION")
    print("=" * 80)
    
    # Initialize digital twin
    twin = SaltProductionDigitalTwin()
    
    # 1. Single prediction
    print("\n" + "=" * 80)
    print("1. SINGLE MONTH PREDICTION")
    print("=" * 80)
    
    result = twin.predict_waste(
        production=100000,
        temperature=28.5,
        humidity=78.0,
        rain=3.0,
        wind_speed=5.0,
        month=7
    )
    
    print(f"\nInput Conditions (July):")
    print(f"  Production: {result['production']:,.0f} units")
    print(f"  Temperature: {result['temperature']:.1f}°C")
    print(f"  Humidity: {result['humidity']:.1f}%")
    print(f"  Rainfall: {result['rain']:.1f} mm")
    print(f"  Wind Speed: {result['wind_speed']:.1f} km/h")
    print(f"  Evaporation Index: {result['evaporation_index']:.3f}")
    print(f"\nPrediction:")
    print(f"  🗑️  Waste: {result['predicted_waste_bags']:.0f} bags")
    print(f"  📊 Confidence: {result['confidence']:.1%}")
    
    # 2. Scenario simulation
    print("\n" + "=" * 80)
    print("2. SCENARIO SIMULATION - What-If Analysis")
    print("=" * 80)
    
    scenarios = [
        {'name': 'Humidity Reduction', 'humidity': -5},
        {'name': 'Production Increase', 'production': +20000},
        {'name': 'Temperature Drop', 'temperature': -2},
        {'name': 'Heavy Rain', 'rain': +10}
    ]
    
    for scenario in scenarios:
        result = twin.simulate_scenario(scenario['name'], scenario)
        print(f"\n{scenario['name']}:")
        print(f"  Baseline Waste: {result['baseline_waste']:,.0f} bags")
        print(f"  Scenario Waste: {result['scenario_waste']:,.0f} bags")
        print(f"  Change: {result['waste_change']:+,.0f} bags ({result['waste_pct_change']:+.1f}%)")
        print(f"  ➜ {result['recommendation']}")
    
    # 3. Sensitivity analysis
    print("\n" + "=" * 80)
    print("3. SENSITIVITY ANALYSIS")
    print("=" * 80)
    
    for variable in ['temperature', 'humidity', 'production', 'rain']:
        result = twin.sensitivity_analysis(variable, range_pct=0.2)
        print(f"\n{variable.upper()}:")
        print(f"  Baseline: {result['baseline_value']:.1f}")
        print(f"  Range: {result['range'][0]:.1f} → {result['range'][1]:.1f}")
        print(f"  Elasticity: {result['elasticity']:.3f}")
        print(f"  ➜ {result['interpretation']}")
    
    # 4. Generate report
    print("\n" + "=" * 80)
    print("4. GENERATING COMPREHENSIVE REPORT")
    print("=" * 80)
    twin.generate_report()
    
    print("\n" + "=" * 80)
    print("✅ DIGITAL TWIN DEMONSTRATION COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
