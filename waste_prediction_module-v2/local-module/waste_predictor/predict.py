"""
===========================================
SIMPLE WASTE PREDICTOR - PRODUCTION USE
===========================================
Self-contained prediction module for V4 model.
R² = 0.98 | MAE = 1,607

Usage:
    from simple_predict import predict_waste, WastePredictor

    # Quick prediction
    result = predict_waste(
        production_volume=50000,
        rain_sum=200,
        temperature_mean=28,
        humidity_mean=85,
        wind_speed_mean=15,
        month=6
    )
    print(result)
"""

import pickle
import pandas as pd
import numpy as np
import os
from typing import Dict

# Import classes needed for pickle deserialization
# These MUST be imported before loading the pickle file
try:
    # When installed as a package
    from waste_predictor.train import (
        AdvancedFeatureEngineer,
        GradientBoostingWasteModel,
        StackedEnsembleModel,
        NeuralNetworkTrainer,
        ProductionWastePredictor,
        DeepNeuralNetworkModel
    )
except ImportError:
    # When running locally
    from train import (
        AdvancedFeatureEngineer,
        GradientBoostingWasteModel,
        StackedEnsembleModel,
        NeuralNetworkTrainer,
        ProductionWastePredictor,
        DeepNeuralNetworkModel
    )


class WastePredictor:
    """
    Simple waste predictor for production use.

    Example:
        predictor = WastePredictor()
        result = predictor.predict(
            production_volume=50000,
            rain_sum=200,
            temperature_mean=28,
            humidity_mean=85,
            wind_speed_mean=15,
            month=6
        )
    """

    OUTPUT_COLS = [
        'Total_Waste_kg',
        'Solid_Waste_Limestone_kg',
        'Solid_Waste_Gypsum_kg',
        'Solid_Waste_Industrial_Salt_kg',
        'Liquid_Waste_Bittern_Liters',
        'Potential_Epsom_Salt_kg',
        'Potential_Potash_kg',
        'Potential_Magnesium_Oil_Liters'
    ]

    def __init__(self, model_path: str = None):
        """Load the model from pickle file."""
        if model_path is None:
            # Default to same directory as this script
            model_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                'waste_predictor_v4.pkl'
            )

        # Custom unpickler to handle __main__ module references
        class CustomUnpickler(pickle.Unpickler):
            def find_class(self, module, name):
                # Redirect __main__ references to waste_predictor.train
                if module == '__main__':
                    try:
                        from waste_predictor import train
                        return getattr(train, name)
                    except (ImportError, AttributeError):
                        # Fallback to local train module
                        import train as local_train
                        return getattr(local_train, name)
                return super().find_class(module, name)

        with open(model_path, 'rb') as f:
            data = CustomUnpickler(f).load()

        self.models = data['models']
        self.weights = data['weights']
        self.feature_names = data['feature_names']

    def predict(
        self,
        production_volume: float,
        rain_sum: float,
        temperature_mean: float,
        humidity_mean: float,
        wind_speed_mean: float,
        month: int = 6
    ) -> Dict[str, float]:
        """
        Predict waste compositions.

        Args:
            production_volume: Production volume (units)
            rain_sum: Total rainfall (mm)
            temperature_mean: Average temperature (°C)
            humidity_mean: Average humidity (%)
            wind_speed_mean: Average wind speed (km/h)
            month: Month (1-12)

        Returns:
            Dictionary with predictions:
            - Total_Waste_kg
            - Solid_Waste_Limestone_kg
            - Solid_Waste_Gypsum_kg
            - Solid_Waste_Industrial_Salt_kg
            - Liquid_Waste_Bittern_Liters
            - Potential_Epsom_Salt_kg
            - Potential_Potash_kg
            - Potential_Magnesium_Oil_Liters
        """
        df = pd.DataFrame({
            'Year': [2026],
            'Month': [month],
            'production_volume': [production_volume],
            'rain_sum': [rain_sum],
            'temperature_mean': [temperature_mean],
            'humidity_mean': [humidity_mean],
            'wind_speed_mean': [wind_speed_mean]
        })

        results_df = self.predict_batch(df)
        return {col: float(results_df[col].iloc[0]) for col in self.OUTPUT_COLS}

    def predict_batch(self, df: pd.DataFrame) -> pd.DataFrame:
        """Predict for multiple inputs."""
        if 'Year' not in df.columns:
            df = df.copy()
            df['Year'] = 2026
        if 'Month' not in df.columns:
            df = df.copy()
            df['Month'] = 6

        # Weighted ensemble prediction
        predictions = []
        weights = []

        for name, model in self.models.items():
            pred = model.predict(df).values
            predictions.append(pred)
            weights.append(self.weights[name])

        weighted_pred = np.average(predictions, axis=0, weights=weights)
        result_df = pd.DataFrame(weighted_pred, columns=self.OUTPUT_COLS)

        # POST-PROCESSING: Enforce waste consistency
        # Total_Waste_kg should equal sum of solid waste components
        result_df = self._enforce_consistency(result_df)

        return result_df

    def _enforce_consistency(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Enforce consistency: Total_Waste_kg = Limestone + Gypsum + Industrial_Salt

        Strategy: Use the predicted Total_Waste_kg as the target,
        and scale the solid waste components proportionally to sum to it.
        """
        df = df.copy()

        solid_components = [
            'Solid_Waste_Limestone_kg',
            'Solid_Waste_Gypsum_kg',
            'Solid_Waste_Industrial_Salt_kg'
        ]

        # Calculate current sum of solid components
        solid_sum = df[solid_components].sum(axis=1)

        # Get target total (predicted Total_Waste_kg)
        target_total = df['Total_Waste_kg']

        # Calculate scaling factor for each row
        # Avoid division by zero
        scale_factor = np.where(solid_sum > 0, target_total / solid_sum, 1.0)

        # Scale each solid component proportionally
        for component in solid_components:
            df[component] = df[component] * scale_factor

        # Verify consistency (for debugging)
        # new_sum = df[solid_components].sum(axis=1)
        # assert np.allclose(new_sum, target_total, rtol=1e-5), "Consistency enforcement failed"

        return df


# Global predictor instance (lazy loaded)
_predictor = None

def predict_waste(
    production_volume: float,
    rain_sum: float,
    temperature_mean: float,
    humidity_mean: float,
    wind_speed_mean: float,
    month: int = 6
) -> Dict[str, float]:
    """
    Quick prediction function.

    Args:
        production_volume: Production volume (units)
        rain_sum: Total rainfall (mm)
        temperature_mean: Average temperature (°C)
        humidity_mean: Average humidity (%)
        wind_speed_mean: Average wind speed (km/h)
        month: Month (1-12)

    Returns:
        Dictionary with waste predictions

    Example:
        >>> result = predict_waste(50000, 200, 28, 85, 15, month=6)
        >>> print(f"Total Waste: {result['Total_Waste_kg']:,.0f} kg")
    """
    global _predictor
    if _predictor is None:
        _predictor = WastePredictor()

    return _predictor.predict(
        production_volume=production_volume,
        rain_sum=rain_sum,
        temperature_mean=temperature_mean,
        humidity_mean=humidity_mean,
        wind_speed_mean=wind_speed_mean,
        month=month
    )


if __name__ == '__main__':
    print("=" * 50)
    print("WASTE PREDICTOR V4 (R² = 0.98)")
    print("=" * 50)

    # Example prediction
    result = predict_waste(
        production_volume=60000,
        rain_sum=150,
        temperature_mean=28,
        humidity_mean=85,
        wind_speed_mean=14,
        month=5
    )

    print("\nExample Prediction:")
    print("  Input: production=60,000, rain=150mm, temp=28°C, humidity=85%, wind=14km/h, month=May")
    print("\nOutput:")
    for waste_type, amount in result.items():
        print(f"  {waste_type}: {amount:,.2f}")

