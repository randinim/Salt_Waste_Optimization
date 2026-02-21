"""
Production-Grade Waste Prediction Model V4
============================================
Target: R² > 0.90 for production deployment

Key Strategies:
1. Gradient Boosting (XGBoost/LightGBM) - better for tabular data
2. Neural Network ensemble for comparison
3. Stacking ensemble of multiple model types
4. Advanced feature engineering based on domain knowledge
5. Hyperparameter optimization
"""

import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
import os
import json
import warnings
from sklearn.model_selection import KFold, train_test_split
from sklearn.preprocessing import RobustScaler
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor, StackingRegressor
from sklearn.linear_model import Ridge
import pickle

warnings.filterwarnings('ignore')

# Fix for Windows joblib parallel processing issues
os.environ['LOKY_MAX_CPU_COUNT'] = '1'

# Try to import XGBoost and LightGBM
try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False
    print("XGBoost not installed. Install with: pip install xgboost")

try:
    import lightgbm as lgb
    HAS_LGB = True
except ImportError:
    HAS_LGB = False
    print("LightGBM not installed. Install with: pip install lightgbm")


class AdvancedFeatureEngineer:
    """
    Domain-driven feature engineering for waste prediction.
    Based on analysis: waste is ~2.1x production, modified by weather.
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

    def __init__(self):
        self.feature_names = []
        self.prod_mean = None

    def fit_transform(self, df: pd.DataFrame):
        self.prod_mean = df['production_volume'].mean()
        return self._create_features(df)

    def transform(self, df: pd.DataFrame):
        return self._create_features(df)

    def _create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        f = pd.DataFrame()

        # === Core Features ===
        f['production_volume'] = df['production_volume']
        f['log_production'] = np.log1p(df['production_volume'])
        f['production_sq'] = df['production_volume'] ** 2 / 1e10
        f['production_sqrt'] = np.sqrt(df['production_volume'])

        # === Weather Features ===
        f['rain_sum'] = df['rain_sum']
        f['log_rain'] = np.log1p(df['rain_sum'])
        f['temperature_mean'] = df['temperature_mean']
        f['humidity_mean'] = df['humidity_mean']
        f['wind_speed_mean'] = df['wind_speed_mean']

        # === Brine Density (°Bé) Physics ===
        # Evaporation power: temp * wind / (humidity + 1) to avoid div by zero
        evap_power = (df['temperature_mean'] * df['wind_speed_mean']) / (df['humidity_mean'] + 1)
        # Brine density base: scale evaporation power to a plausible range (domain-specific, here 20-35)
        # This is a proxy, not a physical formula
        brine_density = 20 + 15 * (evap_power / (evap_power.max() + 1e-6))
        # Dilution penalty: reduce density by rain (rain_sum in mm)
        dilution_penalty = np.exp(-df['rain_sum'] / 100)
        f['brine_density_be'] = brine_density * dilution_penalty

        # Precipitation thresholds
        f['epsom_salt_precip'] = (f['brine_density_be'] > 30).astype(float)
        f['potash_precip'] = (f['brine_density_be'] > 32).astype(float)

        # Non-linear interaction: density_rain_dilution
        f['density_rain_dilution'] = f['brine_density_be'] * np.exp(-df['rain_sum'] / 100)

        # === Temporal Features ===
        if 'Month' in df.columns:
            f['month_sin'] = np.sin(2 * np.pi * df['Month'] / 12)
            f['month_cos'] = np.cos(2 * np.pi * df['Month'] / 12)
            f['is_dry_season'] = ((df['Month'] >= 3) & (df['Month'] <= 8)).astype(float)
            f['is_peak_prod'] = df['Month'].isin([3, 4, 7, 8]).astype(float)

        # === Weather Condition Indices ===
        f['wet_index'] = (df['rain_sum'] / 400) * (df['humidity_mean'] / 100)
        f['dry_index'] = (1 - df['rain_sum'] / 400).clip(0, 1) * (1 - df['humidity_mean'] / 100).clip(0, 1)
        f['evap_index'] = evap_power

        # === Production-Weather Interactions ===
        f['prod_x_wet'] = df['production_volume'] * f['wet_index'] / 1e5
        f['prod_x_dry'] = df['production_volume'] * f['dry_index'] / 1e5
        f['prod_x_evap'] = df['production_volume'] * f['evap_index'] / 1e6
        f['prod_x_rain'] = df['production_volume'] * df['rain_sum'] / 1e7
        f['prod_x_humidity'] = df['production_volume'] * df['humidity_mean'] / 1e6
        f['prod_x_temp'] = df['production_volume'] * df['temperature_mean'] / 1e6

        # === Ratio Features (domain knowledge) ===
        f['expected_waste_base'] = df['production_volume'] * 2.1
        f['waste_multiplier'] = 1 + (f['wet_index'] - 0.5) * 0.3

        # === Polynomial Interactions ===
        f['rain_x_humidity'] = df['rain_sum'] * df['humidity_mean'] / 1e4
        f['temp_x_wind'] = df['temperature_mean'] * df['wind_speed_mean'] / 100
        f['rain_sq'] = df['rain_sum'] ** 2 / 1e5

        # === Production Efficiency (relative to mean) ===
        if self.prod_mean:
            f['prod_relative'] = df['production_volume'] / self.prod_mean
        else:
            f['prod_relative'] = df['production_volume'] / df['production_volume'].mean()

        self.feature_names = list(f.columns)
        return f


class GradientBoostingWasteModel:
    """
    Gradient Boosting ensemble for each output target.
    Generally superior for tabular data with <10k samples.
    """

    def __init__(self, n_estimators=500, learning_rate=0.05, max_depth=5):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.models = {}
        self.scalers = {}
        self.feature_engineer = AdvancedFeatureEngineer()
        self.output_cols = AdvancedFeatureEngineer.OUTPUT_COLS

    def fit(self, df: pd.DataFrame, verbose=True):
        """Train separate model for each output"""
        X = self.feature_engineer.fit_transform(df)

        # Scale features
        self.scaler_X = RobustScaler()
        X_scaled = self.scaler_X.fit_transform(X)

        for i, col in enumerate(self.output_cols):
            if verbose:
                print(f"Training model for {col}...")

            y = df[col].values

            # Log transform targets
            y_log = np.log1p(y)

            if HAS_XGB:
                model = xgb.XGBRegressor(
                    n_estimators=self.n_estimators,
                    learning_rate=self.learning_rate,
                    max_depth=self.max_depth,
                    subsample=0.8,
                    colsample_bytree=0.8,
                    reg_alpha=0.1,
                    reg_lambda=1.0,
                    random_state=42,
                    n_jobs=1,
                    verbosity=0
                )
            else:
                model = GradientBoostingRegressor(
                    n_estimators=self.n_estimators,
                    learning_rate=self.learning_rate,
                    max_depth=self.max_depth,
                    subsample=0.8,
                    random_state=42
                )

            model.fit(X_scaled, y_log)
            self.models[col] = model

        return self

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """Predict all outputs"""
        X = self.feature_engineer.transform(df)
        X_scaled = self.scaler_X.transform(X)

        predictions = {}
        for col in self.output_cols:
            pred_log = self.models[col].predict(X_scaled)
            predictions[col] = np.expm1(pred_log).clip(0)

        result_df = pd.DataFrame(predictions)

        # POST-PROCESSING: Enforce consistency
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

        return df

    def evaluate(self, df: pd.DataFrame) -> dict:
        """Evaluate on data"""
        y_true = df[self.output_cols].values
        y_pred = self.predict(df).values

        r2 = r2_score(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))

        r2_per = r2_score(y_true, y_pred, multioutput='raw_values')

        return {
            'r2': r2,
            'mae': mae,
            'rmse': rmse,
            'r2_per_target': dict(zip(self.output_cols, r2_per))
        }


class StackedEnsembleModel:
    """
    Stacked ensemble combining multiple model types.
    Level 0: XGBoost, LightGBM, Random Forest, Neural Network
    Level 1: Ridge regression meta-learner
    """

    def __init__(self):
        self.feature_engineer = AdvancedFeatureEngineer()
        self.output_cols = AdvancedFeatureEngineer.OUTPUT_COLS
        self.models = {}
        self.scaler_X = None

    def _create_base_models(self):
        """Create diverse base models"""
        models = []

        if HAS_XGB:
            models.append(('xgb', xgb.XGBRegressor(
                n_estimators=300,
                learning_rate=0.05,
                max_depth=6,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                random_state=42,
                verbosity=0
            )))

        if HAS_LGB:
            models.append(('lgb', lgb.LGBMRegressor(
                n_estimators=300,
                learning_rate=0.05,
                max_depth=6,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                random_state=43,
                verbose=-1
            )))

        models.append(('rf', RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            random_state=44,
            n_jobs=1
        )))

        models.append(('gbr', GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=5,
            subsample=0.8,
            random_state=45
        )))

        return models

    def fit(self, df: pd.DataFrame, verbose=True):
        """Train stacked ensemble for each output"""
        X = self.feature_engineer.fit_transform(df)

        self.scaler_X = RobustScaler()
        X_scaled = self.scaler_X.fit_transform(X)

        for col in self.output_cols:
            if verbose:
                print(f"Training stacked ensemble for {col}...")

            y = np.log1p(df[col].values)  # Log transform

            base_models = self._create_base_models()

            stacked = StackingRegressor(
                estimators=base_models,
                final_estimator=Ridge(alpha=1.0),
                cv=5,
                n_jobs=1,
                passthrough=True
            )

            stacked.fit(X_scaled, y)
            self.models[col] = stacked

        return self

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        X = self.feature_engineer.transform(df)
        X_scaled = self.scaler_X.transform(X)

        predictions = {}
        for col in self.output_cols:
            pred_log = self.models[col].predict(X_scaled)
            predictions[col] = np.expm1(pred_log).clip(0)

        result_df = pd.DataFrame(predictions)

        # POST-PROCESSING: Enforce consistency
        result_df = self._enforce_consistency(result_df)

        return result_df

    def _enforce_consistency(self, df: pd.DataFrame) -> pd.DataFrame:
        """Enforce solid waste consistency"""
        df = df.copy()

        solid_components = [
            'Solid_Waste_Limestone_kg',
            'Solid_Waste_Gypsum_kg',
            'Solid_Waste_Industrial_Salt_kg'
        ]

        solid_sum = df[solid_components].sum(axis=1)
        target_total = df['Total_Waste_kg']
        scale_factor = np.where(solid_sum > 0, target_total / solid_sum, 1.0)

        for component in solid_components:
            df[component] = df[component] * scale_factor

        return df

    def evaluate(self, df: pd.DataFrame) -> dict:
        y_true = df[self.output_cols].values
        y_pred = self.predict(df).values

        r2 = r2_score(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        r2_per = r2_score(y_true, y_pred, multioutput='raw_values')

        return {
            'r2': r2,
            'mae': mae,
            'rmse': rmse,
            'r2_per_target': dict(zip(self.output_cols, r2_per))
        }


class DeepNeuralNetworkModel(nn.Module):
    """Enhanced deep neural network with skip connections"""

    def __init__(self, input_dim, output_dim=8, hidden_dims=[256, 512, 256, 128]):
        super().__init__()

        self.input_bn = nn.BatchNorm1d(input_dim)

        layers = []
        prev_dim = input_dim

        for h_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, h_dim))
            layers.append(nn.BatchNorm1d(h_dim))
            layers.append(nn.GELU())  # GELU often works better than ReLU
            layers.append(nn.Dropout(0.2))
            prev_dim = h_dim

        self.hidden = nn.Sequential(*layers)

        # Multi-head output with skip connection
        self.skip = nn.Linear(input_dim, 64)
        self.output = nn.Linear(hidden_dims[-1] + 64, output_dim)

    def forward(self, x):
        x_norm = self.input_bn(x)
        hidden = self.hidden(x_norm)
        skip = torch.relu(self.skip(x_norm))
        combined = torch.cat([hidden, skip], dim=1)
        return self.output(combined)


class NeuralNetworkTrainer:
    """Train neural network with advanced techniques"""

    def __init__(self, epochs=1000, lr=0.001, patience=50):
        self.epochs = epochs
        self.lr = lr
        self.patience = patience
        self.feature_engineer = AdvancedFeatureEngineer()
        self.output_cols = AdvancedFeatureEngineer.OUTPUT_COLS
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    def fit(self, df: pd.DataFrame, verbose=True):
        X = self.feature_engineer.fit_transform(df)
        y = df[self.output_cols].values

        # Scale
        self.scaler_X = RobustScaler()
        self.scaler_y = RobustScaler()

        X_scaled = self.scaler_X.fit_transform(X)
        y_log = np.log1p(y)
        y_scaled = self.scaler_y.fit_transform(y_log)

        # Split for validation
        X_train, X_val, y_train, y_val = train_test_split(
            X_scaled, y_scaled, test_size=0.15, random_state=42
        )

        # Convert to tensors
        X_train_t = torch.tensor(X_train, dtype=torch.float32).to(self.device)
        y_train_t = torch.tensor(y_train, dtype=torch.float32).to(self.device)
        X_val_t = torch.tensor(X_val, dtype=torch.float32).to(self.device)
        y_val_t = torch.tensor(y_val, dtype=torch.float32).to(self.device)

        # Create model
        self.model = DeepNeuralNetworkModel(X_train.shape[1], len(self.output_cols)).to(self.device)

        optimizer = optim.AdamW(self.model.parameters(), lr=self.lr, weight_decay=1e-4)
        scheduler = optim.lr_scheduler.CosineAnnealingWarmRestarts(optimizer, T_0=50, T_mult=2)
        criterion = nn.HuberLoss()

        best_val_loss = float('inf')
        best_state = None
        patience_counter = 0

        for epoch in range(self.epochs):
            self.model.train()
            optimizer.zero_grad()

            pred = self.model(X_train_t)
            loss = criterion(pred, y_train_t)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()

            # Validation
            self.model.eval()
            with torch.no_grad():
                val_pred = self.model(X_val_t)
                val_loss = criterion(val_pred, y_val_t).item()

            if val_loss < best_val_loss - 1e-5:
                best_val_loss = val_loss
                best_state = {k: v.cpu().clone() for k, v in self.model.state_dict().items()}
                patience_counter = 0
            else:
                patience_counter += 1

            if patience_counter >= self.patience:
                if verbose:
                    print(f"Early stopping at epoch {epoch+1}")
                break

            if verbose and (epoch + 1) % 100 == 0:
                print(f"Epoch {epoch+1}: Train={loss.item():.6f}, Val={val_loss:.6f}")

        if best_state:
            self.model.load_state_dict(best_state)

        return self

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        X = self.feature_engineer.transform(df)
        X_scaled = self.scaler_X.transform(X)
        X_t = torch.tensor(X_scaled, dtype=torch.float32).to(self.device)

        self.model.eval()
        with torch.no_grad():
            pred_scaled = self.model(X_t).cpu().numpy()

        pred_log = self.scaler_y.inverse_transform(pred_scaled)
        pred = np.expm1(pred_log).clip(0)

        result_df = pd.DataFrame(pred, columns=self.output_cols)

        # POST-PROCESSING: Enforce consistency
        result_df = self._enforce_consistency(result_df)

        return result_df

    def _enforce_consistency(self, df: pd.DataFrame) -> pd.DataFrame:
        """Enforce solid waste consistency"""
        df = df.copy()

        solid_components = [
            'Solid_Waste_Limestone_kg',
            'Solid_Waste_Gypsum_kg',
            'Solid_Waste_Industrial_Salt_kg'
        ]

        solid_sum = df[solid_components].sum(axis=1)
        target_total = df['Total_Waste_kg']
        scale_factor = np.where(solid_sum > 0, target_total / solid_sum, 1.0)

        for component in solid_components:
            df[component] = df[component] * scale_factor

        return df

    def evaluate(self, df: pd.DataFrame) -> dict:
        y_true = df[self.output_cols].values
        y_pred = self.predict(df).values

        r2 = r2_score(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        r2_per = r2_score(y_true, y_pred, multioutput='raw_values')

        return {
            'r2': r2,
            'mae': mae,
            'rmse': rmse,
            'r2_per_target': dict(zip(self.output_cols, r2_per))
        }


class ProductionWastePredictor:
    """
    Final production model combining best approaches.
    Uses weighted ensemble of top performers.
    """

    def __init__(self):
        self.models = {}
        self.weights = {}
        self.feature_engineer = AdvancedFeatureEngineer()
        self.output_cols = AdvancedFeatureEngineer.OUTPUT_COLS

    def fit(self, df: pd.DataFrame, verbose=True):
        """Train and select best models"""
        print("=" * 60)
        print("PRODUCTION WASTE PREDICTION MODEL V4")
        print("=" * 60)

        # Split data
        train_df, test_df = train_test_split(df, test_size=0.15, random_state=42)

        print(f"\nTraining samples: {len(train_df)}")
        print(f"Test samples: {len(test_df)}")

        results = {}

        # 1. Gradient Boosting
        print("\n--- Training Gradient Boosting ---")
        gb_model = GradientBoostingWasteModel(n_estimators=500, learning_rate=0.03, max_depth=6)
        gb_model.fit(train_df, verbose=False)
        gb_metrics = gb_model.evaluate(test_df)
        results['gradient_boosting'] = {'model': gb_model, 'metrics': gb_metrics}
        print(f"R²: {gb_metrics['r2']:.4f}, MAE: {gb_metrics['mae']:.2f}")

        # 2. Stacked Ensemble (if XGBoost available)
        if HAS_XGB or HAS_LGB:
            print("\n--- Training Stacked Ensemble ---")
            stacked_model = StackedEnsembleModel()
            stacked_model.fit(train_df, verbose=False)
            stacked_metrics = stacked_model.evaluate(test_df)
            results['stacked'] = {'model': stacked_model, 'metrics': stacked_metrics}
            print(f"R²: {stacked_metrics['r2']:.4f}, MAE: {stacked_metrics['mae']:.2f}")

        # 3. Neural Network
        print("\n--- Training Deep Neural Network ---")
        nn_model = NeuralNetworkTrainer(epochs=800, lr=0.001, patience=60)
        nn_model.fit(train_df, verbose=False)
        nn_metrics = nn_model.evaluate(test_df)
        results['neural_network'] = {'model': nn_model, 'metrics': nn_metrics}
        print(f"R²: {nn_metrics['r2']:.4f}, MAE: {nn_metrics['mae']:.2f}")

        # Select best models and create weighted ensemble
        print("\n--- Creating Weighted Ensemble ---")

        # Weight by R² score
        total_r2 = sum(r['metrics']['r2'] for r in results.values())

        for name, data in results.items():
            weight = data['metrics']['r2'] / total_r2
            self.models[name] = data['model']
            self.weights[name] = weight
            print(f"  {name}: weight={weight:.3f}")

        # Evaluate ensemble
        ensemble_pred = self._ensemble_predict(test_df)
        y_true = test_df[self.output_cols].values

        ensemble_r2 = r2_score(y_true, ensemble_pred)
        ensemble_mae = mean_absolute_error(y_true, ensemble_pred)
        ensemble_rmse = np.sqrt(mean_squared_error(y_true, ensemble_pred))
        ensemble_r2_per = r2_score(y_true, ensemble_pred, multioutput='raw_values')

        print("\n" + "=" * 60)
        print("FINAL ENSEMBLE RESULTS")
        print("=" * 60)
        print(f"\nOverall Metrics:")
        print(f"  R²:   {ensemble_r2:.4f}")
        print(f"  MAE:  {ensemble_mae:.2f}")
        print(f"  RMSE: {ensemble_rmse:.2f}")

        print(f"\nPer-Target R² Scores:")
        for col, r2_val in zip(self.output_cols, ensemble_r2_per):
            print(f"  {col}: {r2_val:.4f}")

        self.test_metrics = {
            'r2': ensemble_r2,
            'mae': ensemble_mae,
            'rmse': ensemble_rmse,
            'r2_per_target': dict(zip(self.output_cols, ensemble_r2_per))
        }

        # Cross-validation for robust estimate
        print("\n--- 5-Fold Cross-Validation ---")
        self._cross_validate(df)

        return self

    def _ensemble_predict(self, df: pd.DataFrame) -> np.ndarray:
        """Weighted ensemble prediction"""
        predictions = []
        weights = []

        for name, model in self.models.items():
            pred = model.predict(df).values
            predictions.append(pred)
            weights.append(self.weights[name])

        # Weighted average
        weights = np.array(weights)
        weighted_pred = np.average(predictions, axis=0, weights=weights)

        return weighted_pred

    def _cross_validate(self, df: pd.DataFrame):
        """Run cross-validation"""
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = []

        for fold, (train_idx, val_idx) in enumerate(kf.split(df)):
            train_df = df.iloc[train_idx]
            val_df = df.iloc[val_idx]

            # Quick GB model for CV
            gb = GradientBoostingWasteModel(n_estimators=300, learning_rate=0.05, max_depth=5)
            gb.fit(train_df, verbose=False)
            metrics = gb.evaluate(val_df)
            cv_scores.append(metrics['r2'])
            print(f"Fold {fold+1}: R²={metrics['r2']:.4f}")

        print(f"\nCV Mean R²: {np.mean(cv_scores):.4f} ± {np.std(cv_scores):.4f}")

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """Make predictions"""
        pred = self._ensemble_predict(df)
        return pd.DataFrame(pred, columns=self.output_cols)

    def save(self, path: str):
        """Save model to file"""
        save_data = {
            'models': self.models,
            'weights': self.weights,
            'feature_names': self.feature_engineer.feature_names,
            'output_cols': self.output_cols,
            'metrics': self.test_metrics
        }

        with open(path, 'wb') as f:
            pickle.dump(save_data, f)

        print(f"\nModel saved to: {path}")

        # Save metadata as JSON
        metadata = {
            'output_columns': self.output_cols,
            'feature_names': self.feature_engineer.feature_names,
            'model_weights': self.weights,
            'test_metrics': {
                'r2': float(self.test_metrics['r2']),
                'mae': float(self.test_metrics['mae']),
                'rmse': float(self.test_metrics['rmse'])
            },
            'per_target_r2': {k: float(v) for k, v in self.test_metrics['r2_per_target'].items()}
        }

        json_path = path.replace('.pkl', '_metadata.json')
        with open(json_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        print(f"Metadata saved to: {json_path}")

    @classmethod
    def load(cls, path: str):
        """Load model from file"""
        with open(path, 'rb') as f:
            data = pickle.load(f)

        model = cls()
        model.models = data['models']
        model.weights = data['weights']
        model.feature_engineer.feature_names = data['feature_names']
        model.output_cols = data['output_cols']
        model.test_metrics = data.get('metrics', {})

        return model


def main():
    """Main training script"""
    data_path = os.path.join('data', 'training', 'training.csv')
    df = pd.read_csv(data_path)

    print(f"Loaded {len(df)} samples")

    # Train production model
    model = ProductionWastePredictor()
    model.fit(df)

    # Save
    model.save('waste_predictor_v4.pkl')

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)

    return model


if __name__ == '__main__':
    main()







