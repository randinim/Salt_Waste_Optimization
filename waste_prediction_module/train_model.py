"""
Production-Ready Waste Composition Prediction Model with Online Learning
========================================================================

This module implements an incremental learning ML pipeline for predicting waste composition
based on weather and production data. Uses SGDRegressor for online learning capability.

Features:
- Multi-output regression for 7 waste components
- Incremental learning (online learning with partial_fit)
- Advanced feature engineering with temporal and interaction features
- Proper train/validation/test split
- Comprehensive metrics and logging
- Model persistence with version control
"""

import pandas as pd
import numpy as np
from pathlib import Path
import logging
from datetime import datetime
from typing import Tuple, Dict

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import SGDRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import json

from utils.data_loader import DataLoader
from utils.feature_engineering import FeatureEngineer
from utils.model_utils import ModelManager, PredictionFormatter
from utils.validators import DataValidator

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class WasteCompositionPredictor:
    """Production-ready waste composition prediction model"""
    
    def __init__(self, model_dir: str = "models", random_state: int = 42):
        """Initialize predictor
        
        Args:
            model_dir: Directory for model storage
            random_state: Random seed for reproducibility
        """
        self.model_dir = model_dir
        self.random_state = random_state
        self.model_manager = ModelManager(model_dir)
        
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.target_names = [
            'Organic Matter (%)',
            'Gypsum (%)',
            'Magnesium (%)',
            'Iron Oxides (%)',
            'Silica/Clay (%)',
            'Residual Salt (%)',
            'Moisture (%)'
        ]
        self.metadata = None
    
    def train(self, data_path: str, test_size: float = 0.2, val_size: float = 0.1) -> Dict:
        """Train production model
        
        Args:
            data_path: Path to training_data.xlsx
            test_size: Proportion for test set
            val_size: Proportion for validation set
            
        Returns:
            Dictionary with training metrics
        """
        
        logger.info("=" * 80)
        logger.info("WASTE COMPOSITION PREDICTION MODEL - TRAINING PIPELINE")
        logger.info("=" * 80)
        
        # Step 1: Load and validate data
        logger.info("\n[STEP 1] Loading and validating training data...")
        df = DataLoader.load_training_data(data_path)
        df = DataLoader.validate_data(df)
        
        is_valid, errors = DataValidator.validate_training_data(df)
        if not is_valid:
            logger.error("Data validation failed:")
            for error in errors:
                logger.error(f"  - {error}")
            raise ValueError("Invalid training data")
        
        logger.info(f"✓ Data validation passed ({len(df)} records)")
        
        # Step 2: Feature engineering
        logger.info("\n[STEP 2] Engineering features...")
        X, y, feature_names, target_names = FeatureEngineer.engineer_features(df)
        
        self.feature_names = feature_names
        self.target_names = target_names
        
        logger.info(f"✓ Features engineered: {len(feature_names)} input features")
        logger.info(f"✓ Targets defined: {len(target_names)} waste components")
        logger.info(f"  - {', '.join(target_names)}")
        
        # Step 3: Data splitting
        logger.info("\n[STEP 3] Splitting data into train/val/test sets...")
        
        # First split: separate test set
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, test_size=test_size, random_state=self.random_state
        )
        
        # Second split: separate validation set from remaining
        val_size_adjusted = val_size / (1 - test_size)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=val_size_adjusted, random_state=self.random_state
        )
        
        logger.info(f"✓ Train set: {len(X_train)} samples ({len(X_train)/len(X)*100:.1f}%)")
        logger.info(f"✓ Validation set: {len(X_val)} samples ({len(X_val)/len(X)*100:.1f}%)")
        logger.info(f"✓ Test set: {len(X_test)} samples ({len(X_test)/len(X)*100:.1f}%)")
        
        # Step 4: Feature scaling
        logger.info("\n[STEP 4] Scaling features...")
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        X_test_scaled = self.scaler.transform(X_test)
        logger.info("✓ Feature scaling complete")
        
        # Step 5: Model training
        logger.info("\n[STEP 5] Training online learning model...")
        
        # Use SGDRegressor with MultiOutput wrapper for incremental learning
        base_model = SGDRegressor(
            loss='squared_error',
            penalty='l2',
            alpha=0.0001,
            max_iter=1000,
            random_state=self.random_state,
            verbose=0,
            warm_start=False,
            early_stopping=True,
            validation_fraction=0.1,
            n_iter_no_change=10
        )
        
        self.model = MultiOutputRegressor(base_model)
        self.model.fit(X_train_scaled, y_train)
        logger.info("✓ Model training complete")
        logger.info("  ℹ Model supports incremental learning (partial_fit)")
        
        
        # Step 6: Validation and metrics
        logger.info("\n[STEP 6] Evaluating model...")
        
        y_train_pred = self.model.predict(X_train_scaled)
        y_val_pred = self.model.predict(X_val_scaled)
        y_test_pred = self.model.predict(X_test_scaled)
        
        # Calculate metrics for each target
        metrics = self._calculate_metrics(
            y_train, y_train_pred, y_val, y_val_pred, y_test, y_test_pred
        )
        
        # Overall metrics
        train_r2 = r2_score(y_train, y_train_pred, multioutput='uniform_average')
        val_r2 = r2_score(y_val, y_val_pred, multioutput='uniform_average')
        test_r2 = r2_score(y_test, y_test_pred, multioutput='uniform_average')
        
        logger.info(f"\n  Overall R² Scores:")
        logger.info(f"    Train: {train_r2:.4f}")
        logger.info(f"    Validation: {val_r2:.4f}")
        logger.info(f"    Test: {test_r2:.4f}")
        
        logger.info(f"\n  Per-Component R² Scores (Test Set):")
        test_r2_per_output = [r2_score(y_test[:, i], y_test_pred[:, i]) 
                             for i in range(len(target_names))]
        for target, score in zip(target_names, test_r2_per_output):
            logger.info(f"    {target}: {score:.4f}")
        
        # Step 7: Save model
        logger.info("\n[STEP 7] Saving model and artifacts...")
        
        metadata = {
            'version': f'v{datetime.now().strftime("%Y%m%d_%H%M%S")}',
            'train_r2': float(train_r2),
            'val_r2': float(val_r2),
            'test_r2': float(test_r2),
            'test_rmse': float(np.sqrt(mean_squared_error(y_test, y_test_pred))),
            'test_mae': float(mean_absolute_error(y_test, y_test_pred)),
            'n_train_samples': len(X_train),
            'n_val_samples': len(X_val),
            'n_test_samples': len(X_test),
            'n_features': len(feature_names),
            'training_date': datetime.now().isoformat(),
            'per_target_r2': {name: float(score) for name, score in zip(target_names, test_r2_per_output)}
        }
        
        self.model_manager.save_model(
            self.model, self.scaler, feature_names, target_names, metadata
        )
        self.metadata = metadata
        
        logger.info("✓ Model saved successfully")
        logger.info(f"  Location: {self.model_dir}/")
        
        logger.info("\n" + "=" * 80)
        logger.info("TRAINING COMPLETE")
        logger.info("=" * 80)
        
        return metrics
    
    def _calculate_metrics(self, y_train, y_train_pred, y_val, y_val_pred, 
                          y_test, y_test_pred) -> Dict:
        """Calculate comprehensive metrics"""
        
        metrics = {
            'target_names': self.target_names,
            'train_metrics': [],
            'val_metrics': [],
            'test_metrics': []
        }
        
        for i, target in enumerate(self.target_names):
            y_train_i = y_train[:, i]
            y_train_pred_i = y_train_pred[:, i]
            y_val_i = y_val[:, i]
            y_val_pred_i = y_val_pred[:, i]
            y_test_i = y_test[:, i]
            y_test_pred_i = y_test_pred[:, i]
            
            metrics['train_metrics'].append({
                'target': target,
                'r2': r2_score(y_train_i, y_train_pred_i),
                'rmse': np.sqrt(mean_squared_error(y_train_i, y_train_pred_i)),
                'mae': mean_absolute_error(y_train_i, y_train_pred_i)
            })
            
            metrics['val_metrics'].append({
                'target': target,
                'r2': r2_score(y_val_i, y_val_pred_i),
                'rmse': np.sqrt(mean_squared_error(y_val_i, y_val_pred_i)),
                'mae': mean_absolute_error(y_val_i, y_val_pred_i)
            })
            
            metrics['test_metrics'].append({
                'target': target,
                'r2': r2_score(y_test_i, y_test_pred_i),
                'rmse': np.sqrt(mean_squared_error(y_test_i, y_test_pred_i)),
                'mae': mean_absolute_error(y_test_i, y_test_pred_i)
            })
        
        return metrics
    
    def learn_from_new_data(self, new_samples: pd.DataFrame) -> Dict:
        """Incrementally learn from new data samples (online learning)
        
        Args:
            new_samples: DataFrame with new data to learn from (same structure as training data)
                Columns: [Date, Temperature, Humidity, Rain, Wind Speed, ..., Organic Matter %, ...]
        
        Returns:
            Dictionary with learning metrics for new samples
        """
        if self.model is None or self.scaler is None:
            logger.error("Model not loaded. Train or load model first.")
            raise ValueError("Model not initialized")
        
        logger.info("\n" + "=" * 80)
        logger.info("ONLINE LEARNING - Learning from New Data Points")
        logger.info("=" * 80)
        
        # Validate new data
        is_valid, errors = DataValidator.validate_training_data(new_samples)
        if not is_valid:
            logger.error("New data validation failed:")
            for error in errors:
                logger.error(f"  - {error}")
            raise ValueError("Invalid new data")
        
        logger.info(f"\n[NEW DATA] Validating {len(new_samples)} new samples...")
        logger.info(f"✓ New data validation passed")
        
        # Engineer features for new data - ensure we maintain feature count
        logger.info(f"\n[FEATURE ENGINEERING] Processing new samples...")
        
        # Engineer features using the same pipeline as training
        X_new_engineered, y_new, _, _ = FeatureEngineer.engineer_features(new_samples)
        
        # Handle feature mismatch - if rolling features weren't computed, add zeros
        if X_new_engineered.shape[1] < len(self.feature_names):
            logger.warning(f"  Feature count mismatch: {X_new_engineered.shape[1]} vs {len(self.feature_names)}")
            logger.info(f"  Padding missing features with zeros...")
            
            # Create full-sized array with expected features
            X_new_full = np.zeros((X_new_engineered.shape[0], len(self.feature_names)))
            X_new_full[:, :X_new_engineered.shape[1]] = X_new_engineered
            X_new = X_new_full
            
            logger.info(f"  Adjusted feature shape to {X_new.shape}")
        else:
            X_new = X_new_engineered[:, :len(self.feature_names)]
        
        logger.info(f"✓ {len(X_new)} new samples engineered with {X_new.shape[1]} features")
        
        # Scale new data
        X_new_scaled = self.scaler.transform(X_new)
        
        # Perform online learning (incremental update)
        logger.info(f"\n[ONLINE LEARNING] Learning from {len(X_new)} new samples...")
        
        # Use partial_fit for incremental learning
        # Note: MultiOutputRegressor requires looping through estimators and targets
        for i, estimator in enumerate(self.model.estimators_):
            # Pass single output target for each estimator
            estimator.partial_fit(X_new_scaled, y_new[:, i])
        
        logger.info(f"✓ Model updated with new data")
        
        # Calculate metrics on new data
        y_new_pred = self.model.predict(X_new_scaled)
        
        new_r2 = r2_score(y_new, y_new_pred, multioutput='uniform_average')
        new_rmse = np.sqrt(mean_squared_error(y_new, y_new_pred))
        new_mae = mean_absolute_error(y_new, y_new_pred)
        
        logger.info(f"\n[METRICS] Performance on new data:")
        logger.info(f"  R² Score: {new_r2:.4f}")
        logger.info(f"  RMSE: {new_rmse:.4f}")
        logger.info(f"  MAE: {new_mae:.4f}")
        
        # Per-target metrics
        logger.info(f"\n[PER-COMPONENT] R² Scores (New Data):")
        new_r2_per_output = [r2_score(y_new[:, i], y_new_pred[:, i]) 
                             for i in range(len(self.target_names))]
        for target, score in zip(self.target_names, new_r2_per_output):
            logger.info(f"  - {target}: {score:.4f}")
        
        # Save updated model
        logger.info(f"\n[SAVE] Saving updated model...")
        
        old_metadata = self.metadata or {}
        metadata = {
            'version': f'v{datetime.now().strftime("%Y%m%d_%H%M%S")}',
            'learning_type': 'online_learning',
            'last_updated': datetime.now().isoformat(),
            'samples_trained': old_metadata.get('samples_trained', 0) + len(X_new),
            'new_data_r2': float(new_r2),
            'new_data_rmse': float(new_rmse),
            'new_data_mae': float(new_mae),
            'per_target_r2_new': {name: float(score) for name, score in zip(self.target_names, new_r2_per_output)}
        }
        
        # Merge with old metadata
        if old_metadata:
            metadata['previous_version'] = old_metadata.get('version', 'unknown')
        
        self.model_manager.save_model(
            self.model, self.scaler, self.feature_names, self.target_names, metadata
        )
        self.metadata = metadata
        
        logger.info(f"✓ Updated model saved")
        logger.info("\n" + "=" * 80)
        logger.info("ONLINE LEARNING COMPLETE")
        logger.info("=" * 80 + "\n")
        
        return {
            'samples_learned': len(X_new),
            'r2_score': new_r2,
            'rmse': new_rmse,
            'mae': new_mae,
            'component_r2_scores': {name: float(score) for name, score in zip(self.target_names, new_r2_per_output)}
        }
    
    def predict(self, input_data: dict) -> dict:
        """Make predictions for waste composition
        
        Args:
            input_data: Dictionary with weather and production features
                Example:
                {
                    'Temperature (°C)': 28.5,
                    'Humidity (%)': 65,
                    'Rain (mm)': 5.2,
                    'Wind Speed (km/h)': 12,
                    'Production Volume': 1500,
                    'Evaporation Index': 45,
                    'Predicted Waste (bags)': 250,
                    'Confidence': 0.85
                }
        
        Returns:
            Dictionary with waste composition predictions
        """
        if self.model is None:
            self.model, self.scaler, self.feature_names, self.metadata = \
                self.model_manager.load_model()
        
        # Build feature array matching the feature names used in training
        features = []
        for fname in self.feature_names:
            if fname in input_data:
                features.append(input_data[fname])
            else:
                # For rolling features that can't be computed from single record,
                # use a default based on the corresponding base feature
                if 'Rolling' in fname:
                    # Extract base feature name
                    base_name = fname.replace('_Rolling3', '').replace('_Rolling6', '').replace('_Rolling12', '')
                    features.append(input_data.get(base_name, 0.0))
                else:
                    features.append(0.0)
        
        features = np.array(features).reshape(1, -1)
        
        # Scale and predict
        X_scaled = self.scaler.transform(features)
        predictions = self.model.predict(X_scaled)
        
        # Format output
        result = {
            'timestamp': datetime.now().isoformat(),
            'model_version': self.metadata.get('version', 'unknown'),
            'input': input_data,
            'waste_composition': {}
        }
        
        for target, pred_value in zip(self.target_names, predictions[0]):
            result['waste_composition'][target] = {
                'percentage': float(np.clip(pred_value, 0, 100)),
                'confidence': 'High' if 0 < pred_value < 100 else 'Medium'
            }
        
        return result


def main():
    """Main training pipeline"""
    
    # Configuration
    training_data_path = Path("./data/training/training_data.xlsx")
    
    if not training_data_path.exists():
        logger.error(f"Training data not found: {training_data_path}")
        return
    
    # Initialize and train model
    predictor = WasteCompositionPredictor(model_dir="models")
    metrics = predictor.train(str(training_data_path))
    print("\n[TRAINING METRICS]")
    print(json.dumps(metrics, indent=2))

    # Test prediction
    print("\n[BONUS] Testing model with sample prediction...")
    test_input = {
        'Temperature (°C)': 28.0,
        'Humidity (%)': 65.0,
        'Rain (mm)': 5.0,
        'Wind Speed (km/h)': 12.0,
        'Production Volume': 1500.0,
        'Evaporation Index': 45.0,
        'Predicted Waste (bags)': 250.0,
        'Confidence': 0.85
    }
    prediction = predictor.predict(test_input)
    print("Sample prediction result:")
    print(json.dumps(prediction, indent=2))


if __name__ == "__main__":
    main()
