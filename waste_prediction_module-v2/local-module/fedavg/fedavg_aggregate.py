"""
Federated Averaging (FedAvg) Aggregation Script
===============================================
Aggregates multiple waste predictor models (from different instances) using FedAvg.

Usage:
    python fedavg_aggregate.py model1.pkl model2.pkl model3.pkl model4.pkl model5.pkl --output fedavg_model.pkl

All input models must be trained with the same architecture and feature set.
"""

import pickle
import sys
import argparse
import os
import numpy as np
import copy
from collections import defaultdict

# Import required classes for unpickling the model files
try:
    # Try importing from installed package
    from waste_predictor.train import (
        AdvancedFeatureEngineer,
        GradientBoostingWasteModel,
        StackedEnsembleModel,
        NeuralNetworkTrainer,
        ProductionWastePredictor,
        DeepNeuralNetworkModel
    )
    sys.modules['train'] = sys.modules['waste_predictor.train']
except ImportError:
    # Fallback to local import if package not installed
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'waste_predictor'))
    from train import (
        AdvancedFeatureEngineer,
        GradientBoostingWasteModel,
        StackedEnsembleModel,
        NeuralNetworkTrainer,
        ProductionWastePredictor,
        DeepNeuralNetworkModel
    )


class CompatibilityUnpickler(pickle.Unpickler):
    """Custom unpickler for backward compatibility with models trained outside the package."""
    
    def find_class(self, module, name):
        # Redirect old module references to new package structure
        if module == '__main__' or module == 'train':
            try:
                from waste_predictor import train
                return getattr(train, name)
            except (ImportError, AttributeError):
                try:
                    import train as local_train
                    return getattr(local_train, name)
                except:
                    pass
        return super().find_class(module, name)


def load_model(path):
    """Load a pickled model with compatibility handling."""
    with open(path, 'rb') as f:
        return CompatibilityUnpickler(f).load()

def save_model(model_obj, path):
    with open(path, 'wb') as f:
        pickle.dump(model_obj, f)

def average_models(model_list):
    """
    Perform FedAvg on a list of ProductionWastePredictor models.
    
    Args:
        model_list: List of loaded model dictionaries
        
    Returns:
        Averaged model dictionary
    """
    n = len(model_list)
    print(f"  Averaging {n} models using FedAvg algorithm...")
    
    # Start with a deep copy of the first model
    averaged_model = copy.deepcopy(model_list[0])
    
    # Average ensemble weights
    print("  - Averaging ensemble weights...")
    if 'weights' in averaged_model:
        for key in averaged_model['weights']:
            weights_sum = sum(m['weights'][key] for m in model_list)
            averaged_model['weights'][key] = weights_sum / n
    
    # Average each sub-model in the ensemble
    print("  - Averaging sub-models...")
    if 'models' in averaged_model:
        for model_name in averaged_model['models']:
            print(f"    * Averaging {model_name}...")
            submodels = [m['models'][model_name] for m in model_list]
            
            # Handle different model types
            base_model = submodels[0]
            
            # For sklearn-based models
            if hasattr(base_model, 'estimators_'):
                # Average tree-based ensemble models
                # Note: For tree ensembles, we can't directly average trees
                # Instead, we keep all trees from all models
                print(f"      (Combining {len(submodels)} tree ensembles)")
                all_estimators = []
                for submodel in submodels:
                    if hasattr(submodel, 'estimators_'):
                        all_estimators.extend(submodel.estimators_)
                if all_estimators:
                    averaged_model['models'][model_name].estimators_ = all_estimators
                    
            # For neural network models (PyTorch)
            elif hasattr(base_model, 'state_dict'):
                print(f"      (Averaging neural network weights)")
                try:
                    import torch
                    # Average all parameters in state_dict
                    state_dicts = [s.state_dict() for s in submodels]
                    avg_state = {}
                    for key in state_dicts[0]:
                        tensors = [sd[key].float() for sd in state_dicts]
                        avg_state[key] = torch.stack(tensors).mean(dim=0)
                    averaged_model['models'][model_name].load_state_dict(avg_state)
                except Exception as e:
                    print(f"      Warning: Could not average neural network: {e}")
                    print(f"      Keeping first model's weights")
                
            # For other sklearn models with coef_ attribute
            elif hasattr(base_model, 'coef_'):
                print(f"      (Averaging linear model coefficients)")
                coefs = [s.coef_ for s in submodels]
                averaged_model['models'][model_name].coef_ = np.mean(coefs, axis=0)
                if hasattr(base_model, 'intercept_'):
                    intercepts = [s.intercept_ for s in submodels]
                    averaged_model['models'][model_name].intercept_ = np.mean(intercepts, axis=0)
    
    print("  ✅ Averaging complete!")
    return averaged_model

def main():
    parser = argparse.ArgumentParser(description="Federated Averaging for Waste Predictor models")
    parser.add_argument('model_files', nargs='+', help='Paths to model .pkl files (at least 2)')
    parser.add_argument('--output', '-o', default='fedavg_model.pkl', help='Output path for aggregated model')
    args = parser.parse_args()

    if len(args.model_files) < 2:
        print("❌ Error: Need at least 2 model files for FedAvg.")
        sys.exit(1)

    print("=" * 70)
    print("FEDERATED AVERAGING (FedAvg) - Waste Predictor Models")
    print("=" * 70)
    print(f"\n📥 Loading {len(args.model_files)} models...")
    
    models = []
    for i, filepath in enumerate(args.model_files, 1):
        if not os.path.exists(filepath):
            print(f"❌ Error: File not found: {filepath}")
            sys.exit(1)
        print(f"   {i}. Loading {filepath}...", end=' ', flush=True)
        try:
            model = load_model(filepath)
            models.append(model)
            print("✅")
        except Exception as e:
            print(f"\n❌ Error loading model: {e}")
            sys.exit(1)
    
    print(f"\n✅ Successfully loaded {len(models)} models")

    print("\n🔄 Performing Federated Averaging...")
    fedavg_model = average_models(models)

    print(f"\n💾 Saving aggregated model to: {args.output}")
    save_model(fedavg_model, args.output)
    
    print("\n" + "=" * 70)
    print("✅ FEDAVG AGGREGATION COMPLETE!")
    print("=" * 70)
    print(f"\n📦 Aggregated model saved: {args.output}")
    print(f"📊 Combined {len(models)} models from different data instances")
    print("\nYou can now use this model for predictions:")
    print(f"  from waste_predictor import get_waste_prediction")
    print(f"  # The model will use the federated averaged weights")
    print()

if __name__ == '__main__':
    main()
