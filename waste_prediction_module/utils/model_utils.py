"""
Model management and prediction utilities
"""

import joblib
import json
import logging
from pathlib import Path
from datetime import datetime
import numpy as np

logger = logging.getLogger(__name__)


class ModelManager:
    """Manage model training, saving, and loading"""
    
    def __init__(self, model_dir: str = "models"):
        """Initialize model manager
        
        Args:
            model_dir: Directory to store models
        """
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
    
    def save_model(self, model, scaler, feature_names, target_names, metadata: dict = None):
        """Save trained model and associated artifacts
        
        Args:
            model: Trained model object
            scaler: Feature scaler
            feature_names: List of feature names used
            target_names: List of target variable names
            metadata: Additional metadata to save
        """
        try:
            # Save model
            model_path = self.model_dir / 'waste_predictor.joblib'
            joblib.dump(model, model_path)
            logger.info(f"Model saved to {model_path}")
            
            # Save scaler
            scaler_path = self.model_dir / 'scaler.joblib'
            joblib.dump(scaler, scaler_path)
            logger.info(f"Scaler saved to {scaler_path}")
            
            # Save feature names
            features_path = self.model_dir / 'feature_names.json'
            with open(features_path, 'w') as f:
                json.dump(feature_names, f, indent=2)
            logger.info(f"Feature names saved to {features_path}")
            
            # Save metadata
            meta_path = self.model_dir / 'metadata.json'
            meta = metadata or {}
            meta['timestamp'] = datetime.now().isoformat()
            meta['targets'] = target_names
            meta['n_features'] = len(feature_names)
            meta['n_targets'] = len(target_names)
            
            with open(meta_path, 'w') as f:
                json.dump(meta, f, indent=2)
            logger.info(f"Metadata saved to {meta_path}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
            return False
    
    def load_model(self):
        """Load trained model and artifacts
        
        Returns:
            Tuple of (model, scaler, feature_names, metadata)
        """
        try:
            model_path = self.model_dir / 'waste_predictor.joblib'
            scaler_path = self.model_dir / 'scaler.joblib'
            features_path = self.model_dir / 'feature_names.json'
            meta_path = self.model_dir / 'metadata.json'
            
            model = joblib.load(model_path)
            scaler = joblib.load(scaler_path)
            
            with open(features_path, 'r') as f:
                feature_names = json.load(f)
            
            with open(meta_path, 'r') as f:
                metadata = json.load(f)
            
            logger.info(f"Model loaded from {self.model_dir}")
            return model, scaler, feature_names, metadata
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def predict(self, model, scaler, X):
        """Make predictions with proper scaling
        
        Args:
            model: Trained model
            scaler: Feature scaler
            X: Input features (can be 1D or 2D)
            
        Returns:
            Predictions array
        """
        # Ensure 2D shape
        if X.ndim == 1:
            X = X.reshape(1, -1)
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Make predictions
        predictions = model.predict(X_scaled)
        
        return predictions


class PredictionFormatter:
    """Format predictions for API response"""
    
    @staticmethod
    def format_composition(predictions: np.ndarray, target_names: list) -> dict:
        """Format waste composition predictions
        
        Args:
            predictions: Array of predictions (can be 2D for multiple samples)
            target_names: Names of waste components
            
        Returns:
            Dictionary with formatted predictions
        """
        if predictions.ndim == 1:
            predictions = predictions.reshape(1, -1)
        
        result = {}
        for i, target in enumerate(target_names):
            value = float(predictions[0, i])
            result[target] = {
                'percentage': round(value, 2),
                'confidence': 'High' if value > 0 else 'Low'
            }
        
        return result
