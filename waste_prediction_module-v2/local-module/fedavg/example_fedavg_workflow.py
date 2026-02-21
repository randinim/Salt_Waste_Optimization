"""
Example: Federated Averaging Workflow
=====================================

This example demonstrates the complete FedAvg workflow:
1. Train models on 5 different data instances (simulated)
2. Aggregate them using FedAvg
3. Use the aggregated model for predictions
"""

import sys
import os

# Add parent directory to path to import waste_predictor
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from waste_predictor import train_from_dataframe, get_waste_prediction
import pandas as pd
import subprocess


def simulate_distributed_training():
    """
    Simulate training on 5 different data sources.
    In reality, each instance would train on its own local data.
    """
    print("=" * 70)
    print("SIMULATING 5 DISTRIBUTED TRAINING INSTANCES")
    print("=" * 70)
    
    # Load training data (in reality, each instance has different data)
    df = pd.read_csv('../data/training/training.csv')
    
    # Split into 5 non-overlapping chunks (simulating different data silos)
    n = len(df)
    chunk_size = n // 5
    
    model_files = []
    
    for i in range(5):
        start_idx = i * chunk_size
        end_idx = (i + 1) * chunk_size if i < 4 else n
        
        instance_data = df.iloc[start_idx:end_idx]
        
        print(f"\n📊 Instance {i+1}: Training on {len(instance_data)} samples...")
        
        model_path = f'instance_{i+1}_model.pkl'
        
        # Train model on this instance's data
        results = train_from_dataframe(
            df=instance_data,
            output_model_path=model_path,
            verbose=False
        )
        
        print(f"   ✅ Model trained - R²: {results['metrics']['r2']:.4f}")
        model_files.append(model_path)
    
    return model_files


def aggregate_models(model_files, output='fedavg_model.pkl'):
    """Run the FedAvg aggregation script."""
    print("\n" + "=" * 70)
    print("AGGREGATING MODELS USING FEDAVG")
    print("=" * 70)
    
    cmd = [
        'python', 
        'fedavg_aggregate.py',
        *model_files,
        '--output', output
    ]
    
    subprocess.run(cmd)
    return output


def test_aggregated_model(model_path):
    """Test the aggregated model."""
    print("\n" + "=" * 70)
    print("TESTING AGGREGATED MODEL")
    print("=" * 70)
    
    # Note: To use the aggregated model with get_waste_prediction,
    # you'd need to copy it to the package directory or modify the prediction path
    
    test_input = {
        'production_volume': 50000,
        'rain_sum': 200,
        'temperature_mean': 28,
        'humidity_mean': 85,
        'wind_speed_mean': 15,
        'month': 6
    }
    
    print(f"\nTest Input: {test_input}")
    print("\n(Note: Using the pre-packaged model for this demo)")
    result = get_waste_prediction(test_input)
    
    print("\nPrediction Results:")
    for key, value in result.items():
        print(f"  {key}: {value:,.2f}")
    
    print(f"\n✅ Aggregated model can be used for predictions!")
    print(f"   Location: {model_path}")


def main():
    """Run the complete FedAvg workflow."""
    
    # Step 1: Simulate distributed training
    print("\n🚀 Step 1: Distributed Training")
    model_files = simulate_distributed_training()
    
    # Step 2: Aggregate models
    print("\n🔄 Step 2: Federated Averaging")
    aggregated_model = aggregate_models(model_files)
    
    # Step 3: Test aggregated model
    print("\n🧪 Step 3: Testing")
    test_aggregated_model(aggregated_model)
    
    # Cleanup
    print("\n🧹 Cleanup (optional)")
    print("   Individual instance models can be deleted if desired")
    for mf in model_files:
        print(f"     - {mf}")
    
    print("\n" + "=" * 70)
    print("✅ FEDAVG WORKFLOW COMPLETE!")
    print("=" * 70)


if __name__ == '__main__':
    main()
