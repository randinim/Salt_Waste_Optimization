"""
API Wrapper for Waste Predictor
==============================
Provides a simple function to get waste predictions from input data.
"""


from typing import Dict
# Import model classes for pickle deserialization
from train import (
    AdvancedFeatureEngineer,
    GradientBoostingWasteModel,
    StackedEnsembleModel,
    NeuralNetworkTrainer,
    ProductionWastePredictor,
    DeepNeuralNetworkModel
)

from predict import predict_waste

def get_waste_prediction(input_data: Dict) -> Dict:
    """
    Wrapper function to get waste predictions from input dictionary.

    Args:
        input_data: dict with keys:
            - production_volume (float)
            - rain_sum (float)
            - temperature_mean (float)
            - humidity_mean (float)
            - wind_speed_mean (float)
            - month (int, optional, default=6)

    Returns:
        dict: Waste prediction results
    """
    return predict_waste(
        production_volume=input_data['production_volume'],
        rain_sum=input_data['rain_sum'],
        temperature_mean=input_data['temperature_mean'],
        humidity_mean=input_data['humidity_mean'],
        wind_speed_mean=input_data['wind_speed_mean'],
        month=input_data.get('month', 6)
    )

if __name__ == '__main__':
    # Example usage
    sample = {
        'production_volume': 50000,
        'rain_sum': 200,
        'temperature_mean': 28,
        'humidity_mean': 85,
        'wind_speed_mean': 15,
        'month': 6
    }
    result = get_waste_prediction(sample)
    print("Input:", sample)
    print("Prediction:")
    for k, v in result.items():
        print(f"  {k}: {v:,.2f}")
