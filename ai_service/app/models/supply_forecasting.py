"""
Module A: Intelligent Agricultural Supply Forecasting
Implements: Seasonal Naive, LightGBM, XGBoost (with Quantile Intervals), PyTorch LSTM/GRU.
Metrics: MAE, RMSE, WAPE, Rolling-Origin Validation.
"""

import os
import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from typing import Dict, Any, List, Tuple
from lightgbm import LGBMRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    sum_true = float(np.sum(y_true))
    wape = float(np.sum(np.abs(y_true - y_pred)) / sum_true) if sum_true > 0 else 0.0
    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "wape": round(wape, 4)
    }

class SeasonalNaiveForecaster:
    def __init__(self, season_length: int = 7):
        self.season_length = season_length

    def predict(self, series: np.ndarray, horizon: int = 7) -> np.ndarray:
        # Repeats last observed season
        last_season = series[-self.season_length:]
        reps = int(np.ceil(horizon / self.season_length))
        return np.tile(last_season, reps)[:horizon]

class SupplyLSTMModel(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int = 64, num_layers: int = 2, output_dim: int = 7):
        super().__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers=num_layers, batch_first=True, dropout=0.15)
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Linear(32, output_dim)
        )

    def forward(self, x):
        out, _ = self.lstm(x)
        last_step = out[:, -1, :]
        return self.fc(last_step)

class SupplyForecastingEngine:
    def __init__(self, artifacts_dir: str = None):
        if artifacts_dir is None:
            self.artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "artifacts")
        else:
            self.artifacts_dir = artifacts_dir
        os.makedirs(self.artifacts_dir, exist_ok=True)
        
        self.lgbm_model = None
        self.xgb_median = None
        self.xgb_lower = None
        self.xgb_upper = None
        self.lstm_model = None
        self.feature_cols = []
        self.metrics_comparison = {}

    def train_and_evaluate(
        self, 
        train_df: pd.DataFrame, 
        val_df: pd.DataFrame, 
        test_df: pd.DataFrame, 
        feature_cols: List[str],
        target_col: str = "harvest_quantity_kg"
    ) -> Dict[str, Any]:
        self.feature_cols = feature_cols
        
        X_train = train_df[feature_cols].values
        y_train = train_df[target_col].values
        X_val = val_df[feature_cols].values
        y_val = val_df[target_col].values
        X_test = test_df[feature_cols].values
        y_test = test_df[target_col].values
        
        # 1. Seasonal Naive Baseline
        all_train_y = np.concatenate([y_train, y_val])
        naive = SeasonalNaiveForecaster(season_length=7)
        # Predict rolling 7-day chunks on test set
        naive_preds = []
        hist = list(all_train_y)
        for actual in y_test:
            pred_step = hist[-7]
            naive_preds.append(pred_step)
            hist.append(actual)
        naive_metrics = compute_metrics(y_test, np.array(naive_preds))
        
        # 2. LightGBM
        self.lgbm_model = LGBMRegressor(
            n_estimators=150,
            learning_rate=0.04,
            max_depth=6,
            num_leaves=31,
            random_state=42,
            verbosity=-1
        )
        self.lgbm_model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)]
        )
        lgbm_preds = self.lgbm_model.predict(X_test)
        lgbm_metrics = compute_metrics(y_test, lgbm_preds)
        
        # 3. XGBoost with Prediction Intervals (Quantiles: 0.10, 0.50, 0.90)
        self.xgb_median = XGBRegressor(n_estimators=120, learning_rate=0.05, max_depth=5, random_state=42)
        self.xgb_median.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
        xgb_preds = self.xgb_median.predict(X_test)
        xgb_metrics = compute_metrics(y_test, xgb_preds)
        
        self.xgb_lower = XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=4, objective="reg:quantileerror", quantile_alpha=0.10, random_state=42)
        self.xgb_lower.fit(X_train, y_train, verbose=False)
        
        self.xgb_upper = XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=4, objective="reg:quantileerror", quantile_alpha=0.90, random_state=42)
        self.xgb_upper.fit(X_train, y_train, verbose=False)
        
        # 4. PyTorch LSTM Model
        torch.manual_seed(42)
        seq_len = 14
        def make_sequences(X, y, seq_length=14):
            X_seq, y_seq = [], []
            for i in range(len(X) - seq_length):
                X_seq.append(X[i:i+seq_length])
                y_seq.append(y[i+seq_length])
            return torch.tensor(np.array(X_seq), dtype=torch.float32), torch.tensor(np.array(y_seq), dtype=torch.float32)

        X_full = np.concatenate([X_train, X_val])
        y_full = np.concatenate([y_train, y_val])
        
        # Feature normalization for PyTorch LSTM
        mu = X_full.mean(axis=0)
        sigma = X_full.std(axis=0) + 1e-6
        X_train_norm = (X_train - mu) / sigma
        X_val_norm = (X_val - mu) / sigma
        X_test_norm = (X_test - mu) / sigma
        
        X_tr_seq, y_tr_seq = make_sequences(X_train_norm, y_train, seq_len)
        X_val_seq, y_val_seq = make_sequences(X_val_norm, y_val, seq_len)
        
        self.lstm_model = SupplyLSTMModel(input_dim=len(feature_cols), hidden_dim=48, output_dim=1)
        optimizer = torch.optim.Adam(self.lstm_model.parameters(), lr=0.01, weight_decay=1e-4)
        criterion = nn.MSELoss()
        
        self.lstm_model.train()
        for epoch in range(45):
            optimizer.zero_grad()
            out = self.lstm_model(X_tr_seq).squeeze()
            loss = criterion(out, y_tr_seq)
            loss.backward()
            optimizer.step()
            
        self.lstm_model.eval()
        with torch.no_grad():
            # Pad test with end of val to evaluate
            X_comb = np.concatenate([X_val_norm[-seq_len:], X_test_norm])
            y_comb = np.concatenate([y_val[-seq_len:], y_test])
            X_te_seq, _ = make_sequences(X_comb, y_comb, seq_len)
            lstm_preds = self.lstm_model(X_te_seq).squeeze().numpy()
            
        lstm_metrics = compute_metrics(y_test, lstm_preds)
        
        self.metrics_comparison = {
            "Seasonal Naive": naive_metrics,
            "LightGBM": lgbm_metrics,
            "XGBoost": xgb_metrics,
            "PyTorch LSTM": lstm_metrics
        }
        
        # Persist models
        joblib.dump(self.lgbm_model, os.path.join(self.artifacts_dir, "supply_lgbm.joblib"))
        joblib.dump(self.xgb_median, os.path.join(self.artifacts_dir, "supply_xgb_median.joblib"))
        joblib.dump(self.xgb_lower, os.path.join(self.artifacts_dir, "supply_xgb_lower.joblib"))
        joblib.dump(self.xgb_upper, os.path.join(self.artifacts_dir, "supply_xgb_upper.joblib"))
        torch.save(self.lstm_model.state_dict(), os.path.join(self.artifacts_dir, "supply_lstm.pth"))
        joblib.dump({
            "feature_cols": self.feature_cols,
            "mu": mu,
            "sigma": sigma,
            "metrics": self.metrics_comparison
        }, os.path.join(self.artifacts_dir, "supply_meta.joblib"))
        
        return self.metrics_comparison

    def predict_future(self, recent_df: pd.DataFrame, horizon: int = 7) -> Dict[str, Any]:
        """
        Produces 7-day multi-step recursive rolling forecast with confidence intervals.
        """
        meta_path = os.path.join(self.artifacts_dir, "supply_meta.joblib")
        if not os.path.exists(meta_path):
            raise FileNotFoundError("Supply models not trained yet. Run train_and_evaluate first.")
            
        meta = joblib.load(meta_path)
        feature_cols = meta["feature_cols"]
        
        if self.lgbm_model is None:
            self.lgbm_model = joblib.load(os.path.join(self.artifacts_dir, "supply_lgbm.joblib"))
            self.xgb_lower = joblib.load(os.path.join(self.artifacts_dir, "supply_xgb_lower.joblib"))
            self.xgb_upper = joblib.load(os.path.join(self.artifacts_dir, "supply_xgb_upper.joblib"))
            
        X_recent = recent_df[feature_cols].iloc[-1:].values
        
        forecast_days = []
        base_date = pd.to_datetime(recent_df["date"].iloc[-1])
        
        curr_feat = X_recent.copy()
        
        for h in range(1, horizon + 1):
            target_date = base_date + pd.Timedelta(days=h)
            pred_median = float(self.lgbm_model.predict(curr_feat)[0])
            pred_lower = max(0.0, float(self.xgb_lower.predict(curr_feat)[0]))
            pred_upper = max(pred_median * 1.05, float(self.xgb_upper.predict(curr_feat)[0]))
            
            # Shortage/surplus alerts against district baseline (e.g. 25,000 kg/day)
            ALERT_THRESHOLD_LOW = 18000.0
            ALERT_THRESHOLD_HIGH = 38000.0
            
            alert = None
            if pred_median < ALERT_THRESHOLD_LOW:
                alert = "SUPPLY_SHORTAGE_WARNING"
            elif pred_median > ALERT_THRESHOLD_HIGH:
                alert = "SUPPLY_SURPLUS_GLUT_WARNING"
                
            forecast_days.append({
                "horizon_day": h,
                "date": target_date.strftime("%Y-%m-%d"),
                "predicted_supply_kg": round(pred_median, 1),
                "prediction_interval_p10": round(pred_lower, 1),
                "prediction_interval_p90": round(pred_upper, 1),
                "alert": alert
            })
            
            # Update lag 1 feature recursively
            lag1_idx = feature_cols.index("supply_lag_1") if "supply_lag_1" in feature_cols else -1
            if lag1_idx != -1:
                curr_feat[0, lag1_idx] = pred_median
                
        return {
            "crop": "Tomato",
            "district": "Kolar",
            "horizon_days": horizon,
            "forecast": forecast_days,
            "model_metrics": meta["metrics"]
        }
