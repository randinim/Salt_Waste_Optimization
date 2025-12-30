"""
Waste Optimization Engine
==========================

Inverse optimization to find optimal production conditions for desired waste outcomes.
Uses the trained waste prediction model and multi-objective optimization.

Architecture:
- Load trained prediction model
- Define optimization objectives (minimize/target waste percentages)
- Apply realistic constraints from Puttalam district
- Use scipy.optimize with multiple algorithms
- Return optimal feature configurations

Author: AI/ML Tech Lead
Date: December 2025
"""

import numpy as np
import pandas as pd
import joblib
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Union
from scipy.optimize import minimize, differential_evolution, NonlinearConstraint
from dataclasses import dataclass
import warnings

from constraints import FeatureConstraints

warnings.filterwarnings('ignore')


@dataclass
class OptimizationResult:
    """Container for optimization results"""
    success: bool
    optimal_features: Dict[str, float]
    predicted_waste: Dict[str, float]
    target_waste: Dict[str, float]
    objective_value: float
    iterations: int
    method: str
    message: str


class WasteOptimizer:
    """
    Optimize production features to achieve target waste outcomes
    
    Capabilities:
    - Minimize total waste percentage
    - Target specific waste percentages
    - Multi-objective optimization
    - Constraint handling (realistic bounds)
    - Multiple optimization algorithms
    """
    
    def __init__(self, model_dir: str = None):
        """
        Initialize optimizer with trained prediction model
        
        Args:
            model_dir: Path to trained model artifacts (defaults to local models folder)
        """
        if model_dir is None:
            model_dir = Path(__file__).parent / 'models'
        
        self.model_dir = Path(model_dir)
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.metrics = None
        
        # Load model artifacts
        self._load_model()
        
        # Feature order for optimization
        self.feature_order = [
            'temperature_c', 'humidity_pct', 'rainfall_mm',
            'wind_speed_kmh', 'production_kg', 'month'
        ]
        
        # Constraints
        self.constraints = FeatureConstraints()
        
        print("=" * 80)
        print("WASTE OPTIMIZATION ENGINE")
        print("=" * 80)
        print(f"Model loaded: {self.model_dir.name}")
        r2_score = self.metrics.get('avg_r2_test', 0)
        if isinstance(r2_score, (int, float)):
            print(f"Model R² Score: {r2_score:.4f}")
        else:
            print(f"Model R² Score: {r2_score}")
        print(f"Optimization features: {len(self.feature_order)}")
        print("=" * 80)
    
    def _load_model(self):
        """Load trained model and artifacts"""
        try:
            self.model = joblib.load(self.model_dir / 'waste_predictor.joblib')
            self.scaler = joblib.load(self.model_dir / 'scaler.joblib')
            
            with open(self.model_dir / 'feature_names.json', 'r') as f:
                self.feature_names = json.load(f)
            
            # Load metadata (contains model performance metrics)
            try:
                with open(self.model_dir / 'metadata.json', 'r') as f:
                    self.metrics = json.load(f)
            except FileNotFoundError:
                # If metadata.json doesn't exist, load metrics.json (fallback)
                with open(self.model_dir / 'metrics.json', 'r') as f:
                    self.metrics = json.load(f)
            
            print("[OK] Model artifacts loaded successfully")
            
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {e}")
    
    def _prepare_features(self, x: np.ndarray) -> np.ndarray:
        """
        Prepare raw features for model prediction
        
        Args:
            x: Raw feature values [temp, humidity, rainfall, wind, production, month]
            
        Returns:
            Engineered features ready for model
        """
        temp, humidity, rainfall, wind, production, month = x
        # Derived and placeholder features for matching feature_names.json
        evaporation_index = 0.0
        predicted_waste = 0.0
        confidence = 1.0
        day_of_year = 200  # Placeholder, should be set from context
        quarter = (month - 1) // 3 + 1
        is_summer = int(month in [6,7,8])
        is_winter = int(month in [12,1,2])
        is_monsoon = int(month in [7,8,9])
        is_spring = int(month in [3,4,5])
        temp_humidity = temp * humidity
        temp_squared = temp ** 2
        humidity_squared = humidity ** 2
        rainfall_per_day = rainfall / 30.0
        production_log = np.log(production + 1e-6)
        production_sqrt = np.sqrt(production)
        production_inv = 1.0 / (production + 1e-6)
        temp_x_production = temp * production
        humidity_x_production = humidity * production
        evaporation_x_production = evaporation_index * production
        temp_rolling3 = temp
        temp_rolling6 = temp
        temp_rolling12 = temp
        humidity_rolling3 = humidity
        humidity_rolling6 = humidity
        humidity_rolling12 = humidity
        production_rolling3 = production
        production_rolling6 = production
        production_rolling12 = production
        features = np.array([
            temp, humidity, rainfall, wind, evaporation_index, production,
            predicted_waste, confidence, day_of_year, quarter, month,
            is_summer, is_winter, is_monsoon, is_spring, temp_humidity,
            temp_squared, humidity_squared, rainfall_per_day, production_log,
            production_sqrt, production_inv, temp_x_production, humidity_x_production,
            evaporation_x_production, temp_rolling3, temp_rolling6, temp_rolling12,
            humidity_rolling3, humidity_rolling6, humidity_rolling12,
            production_rolling3, production_rolling6, production_rolling12
        ]).reshape(1, -1)
        return features
    
    def predict_waste(self, x: np.ndarray) -> Dict[str, float]:
        """
        Predict waste percentages for given features
        
        Args:
            x: Feature values
            
        Returns:
            Dictionary of waste percentages
        """
        features = self._prepare_features(x)
        features_scaled = self.scaler.transform(features)
        
        # Predict waste in kg
        predictions_kg = self.model.predict(features_scaled)[0]
        
        # Convert to percentages
        production_kg = x[4]
        percentages = {}
        waste_categories = [
            'total_waste_kg', 'salt_dust_kg', 'brine_runoff_kg',
            'organic_matter_kg', 'packaging_waste_kg', 'other_solids_kg'
        ]
        
        for i, category in enumerate(waste_categories):
            percentages[category] = (predictions_kg[i] / production_kg) * 100
        
        return percentages
    
    def _objective_minimize_total(self, x: np.ndarray) -> float:
        """
        Objective: Minimize total waste percentage
        
        Args:
            x: Feature values
            
        Returns:
            Total waste percentage (to minimize)
        """
        waste = self.predict_waste(x)
        return waste['total_waste_kg']
    
    def _objective_target_waste(self, x: np.ndarray, target: Dict[str, float],
                               weights: Optional[Dict[str, float]] = None) -> float:
        """
        Objective: Achieve target waste percentages
        
        Uses penalty method to enforce targets: zero penalty when hitting target,
        quadratic penalty for deviations (both above and below target)
        
        Args:
            x: Feature values
            target: Target waste percentages
            weights: Importance weights for each category
            
        Returns:
            Weighted squared error from target (penalty = 0 at target, increases away from target)
        """
        predicted = self.predict_waste(x)
        
        if weights is None:
            weights = {k: 1.0 for k in target.keys()}
        
        # Compute weighted MSE - penalizes deviation from target in both directions
        # This ensures optimizer tries to HIT the target, not just minimize
        error = 0.0
        for category, target_val in target.items():
            pred_val = predicted.get(category, 0.0)
            weight = weights.get(category, 1.0)
            # Quadratic penalty for any deviation from target
            deviation = pred_val - target_val
            error += weight * (deviation ** 2)
        
        return error
    
    def optimize_minimize_waste(
        self,
        month: int,
        production_kg: Optional[float] = None,
        method: str = 'SLSQP',
        use_seasonal_constraints: bool = True
    ) -> OptimizationResult:
        """
        Find optimal conditions to minimize total waste
        
        Args:
            month: Target month (1-12)
            production_kg: Fixed production level (None = optimize this too)
            method: Optimization algorithm ('SLSQP', 'trust-constr', 'differential_evolution')
            use_seasonal_constraints: Use season-specific constraints
            
        Returns:
            OptimizationResult with optimal features
        """
        print(f"\n{'='*80}")
        print(f"OPTIMIZATION: Minimize Total Waste")
        print(f"{'='*80}")
        print(f"Month: {month}")
        print(f"Production: {'Fixed' if production_kg else 'Variable'}")
        print(f"Method: {method}")
        print(f"{'='*80}\n")
        
        # Get bounds
        if use_seasonal_constraints:
            bounds_dict = self.constraints.get_seasonal_bounds(month)
        else:
            bounds_dict = self.constraints.get_bounds()
        
        # Fix production if specified
        if production_kg is not None:
            bounds_dict['production_kg'] = (production_kg, production_kg)
        
        # Fix month
        bounds_dict['month'] = (month, month)
        
        # Convert to bounds list
        bounds = [bounds_dict[f] for f in self.feature_order]
        
        # Initial guess (typical values)
        x0 = np.array([
            (bounds[i][0] + bounds[i][1]) / 2 
            for i in range(len(self.feature_order))
        ])
        
        # Optimize
        if method == 'differential_evolution':
            result = differential_evolution(
                self._objective_minimize_total,
                bounds=bounds,
                maxiter=1000,
                seed=42,
                atol=1e-6,
                tol=1e-6
            )
        else:
            result = minimize(
                self._objective_minimize_total,
                x0=x0,
                method=method,
                bounds=bounds,
                options={'maxiter': 1000, 'ftol': 1e-8}
            )
        
        # Extract results
        optimal_x = result.x
        optimal_features = {
            self.feature_order[i]: optimal_x[i] 
            for i in range(len(self.feature_order))
        }
        optimal_features['month'] = int(round(optimal_features['month']))
        
        predicted_waste = self.predict_waste(optimal_x)
        
        return OptimizationResult(
            success=result.success,
            optimal_features=optimal_features,
            predicted_waste=predicted_waste,
            target_waste={},
            objective_value=result.fun,
            iterations=result.nit if hasattr(result, 'nit') else result.nfev,
            method=method,
            message=result.message if hasattr(result, 'message') else 'Success'
        )
    
    def optimize_target_waste(
        self,
        target_percentages: Dict[str, float],
        month: int,
        production_kg: Optional[float] = None,
        weights: Optional[Dict[str, float]] = None,
        method: str = 'SLSQP',
        use_seasonal_constraints: bool = True
    ) -> OptimizationResult:
        """
        Find optimal conditions to achieve target waste percentages
        
        Args:
            target_percentages: Target waste percentages (e.g., {'total_waste_kg': 4.0})
            month: Target month (1-12)
            production_kg: Fixed production level (None = optimize this too)
            weights: Importance weights for each category
            method: Optimization algorithm
            use_seasonal_constraints: Use season-specific constraints
            
        Returns:
            OptimizationResult with optimal features
        """
        print(f"\n{'='*80}")
        print(f"OPTIMIZATION: Target Waste Percentages")
        print(f"{'='*80}")
        print(f"Targets: {target_percentages}")
        print(f"Month: {month}")
        print(f"Method: {method}")
        print(f"{'='*80}\n")
        
        # Get bounds
        if use_seasonal_constraints:
            bounds_dict = self.constraints.get_seasonal_bounds(month)
        else:
            bounds_dict = self.constraints.get_bounds()
        
        # Fix production if specified
        if production_kg is not None:
            bounds_dict['production_kg'] = (production_kg, production_kg)
        
        # Fix month
        bounds_dict['month'] = (month, month)
        
        # Convert to bounds list
        bounds = [bounds_dict[f] for f in self.feature_order]
        
        # Objective function with target
        objective = lambda x: self._objective_target_waste(x, target_percentages, weights)
        
        # For target mode, always use differential_evolution as it's better at finding
        # global optima and avoiding getting stuck at local minima (which happens to be the global minimum)
        result = differential_evolution(
            objective,
            bounds=bounds,
            maxiter=2000,
            seed=42,
            atol=1e-7,
            tol=1e-7,
            workers=1,
            updating='deferred',
            polish=True
        )
        
        # If differential_evolution result is poor, try SLSQP refinement with multiple starts
        if result.fun > 0.1:  # If error is still large, try local optimization
            best_result = result
            for _ in range(3):  # Try 3 random starting points
                x0 = np.array([
                    np.random.uniform(bounds[i][0], bounds[i][1])
                    for i in range(len(self.feature_order))
                ])
                local_result = minimize(
                    objective,
                    x0=x0,
                    method='SLSQP',
                    bounds=bounds,
                    options={'maxiter': 1000, 'ftol': 1e-9}
                )
                if local_result.fun < best_result.fun:
                    best_result = local_result
            result = best_result
        
        # Extract results
        optimal_x = result.x
        optimal_features = {
            self.feature_order[i]: optimal_x[i] 
            for i in range(len(self.feature_order))
        }
        optimal_features['month'] = int(round(optimal_features['month']))
        
        predicted_waste = self.predict_waste(optimal_x)
        
        return OptimizationResult(
            success=result.success,
            optimal_features=optimal_features,
            predicted_waste=predicted_waste,
            target_waste=target_percentages,
            objective_value=result.fun,
            iterations=result.nit if hasattr(result, 'nit') else result.nfev,
            method=method,
            message=result.message if hasattr(result, 'message') else 'Success'
        )
    
    def save_result(self, result: OptimizationResult, filename: str):
        """
        Save optimization result to JSON
        
        Args:
            result: OptimizationResult to save
            filename: Output filename
        """
        output_dir = Path('results')
        output_dir.mkdir(exist_ok=True)
        
        result_dict = {
            'success': bool(result.success),
            'optimal_features': {k: float(v) for k, v in result.optimal_features.items()},
            'predicted_waste_percentages': {k: float(v) for k, v in result.predicted_waste.items()},
            'target_waste_percentages': {k: float(v) for k, v in result.target_waste.items()},
            'objective_value': float(result.objective_value),
            'iterations': int(result.iterations),
            'method': result.method,
            'message': result.message,
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        filepath = output_dir / filename
        with open(filepath, 'w') as f:
            json.dump(result_dict, f, indent=2)
        
        print(f"\n✓ Result saved: {filepath}")


def print_optimization_result(result: OptimizationResult):
    """Pretty print optimization results"""
    print(f"\n{'='*80}")
    print(f"OPTIMIZATION RESULTS")
    print(f"{'='*80}")
    print(f"Status: {'✓ SUCCESS' if result.success else '✗ FAILED'}")
    print(f"Method: {result.method}")
    print(f"Iterations: {result.iterations}")
    print(f"Objective Value: {result.objective_value:.6f}")
    if result.message:
        print(f"Message: {result.message}")
    
    print(f"\n{'='*80}")
    print(f"OPTIMAL FEATURES")
    print(f"{'='*80}")
    
    feature_info = FeatureConstraints.get_feature_info()
    for feature, value in result.optimal_features.items():
        info = feature_info.get(feature, {})
        name = info.get('name', feature)
        unit = info.get('unit', '')
        if feature == 'month':
            print(f"{name:<20} {int(value):>10}")
        else:
            print(f"{name:<20} {value:>10.2f} {unit}")
    
    print(f"\n{'='*80}")
    print(f"PREDICTED WASTE OUTCOMES")
    print(f"{'='*80}")
    
    waste_labels = {
        'total_waste_kg': 'Total Waste',
        'salt_dust_kg': 'Salt Dust',
        'brine_runoff_kg': 'Brine Runoff',
        'organic_matter_kg': 'Organic Matter',
        'packaging_waste_kg': 'Packaging',
        'other_solids_kg': 'Other Solids'
    }
    
    for category, percentage in result.predicted_waste.items():
        label = waste_labels.get(category, category)
        target_str = ""
        if category in result.target_waste:
            target = result.target_waste[category]
            diff = percentage - target
            target_str = f" (Target: {target:.2f}%, Diff: {diff:+.2f}%)"
        print(f"{label:<20} {percentage:>8.2f}%{target_str}")
    
    print(f"{'='*80}\n")
