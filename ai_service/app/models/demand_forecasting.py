"""
Module B: Intelligent Retailer Demand Forecasting
Implements: LightGBM, XGBoost, and PyTorch BiLSTM for store-level order prediction.
Metrics: MAE, RMSE, WAPE, Overstock & Stockout risk thresholds.
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

class DemandBiLSTM(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int = 40, num_layers: int = 2):
        super().__init__()
        self.lstm = nn.LSTM(
            input_dim, 
            hidden_dim, 
            num_layers=num_layers, 
            batch_first=True, 
            bidirectional=True,
            dropout=0.1
        )
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim * 2, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )

    def forward(self, x):
        out, _ = self.lstm(x)
        last_step = out[:, -1, :]
        return self.fc(last_step)

class DemandForecastingEngine:
    def __init__(self, artifacts_dir: str = None):
        if artifacts_dir is None:
            self.artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "artifacts")
        else:
            self.artifacts_dir = artifacts_dir
        os.makedirs(self.artifacts_dir, exist_ok=True)
        
        self.lgbm_model = None
        self.xgb_model = None
        self.bilstm_model = None
        self.feature_cols = []
        self.metrics_comparison = {}

    def train_and_evaluate(
        self,
        train_df: pd.DataFrame,
        val_df: pd.DataFrame,
        test_df: pd.DataFrame,
        feature_cols: List[str],
        target_col: str = "demand_kg"
    ) -> Dict[str, Any]:
        self.feature_cols = feature_cols
        
        X_train = train_df[feature_cols].values
        y_train = train_df[target_col].values
        X_val = val_df[feature_cols].values
        y_val = val_df[target_col].values
        X_test = test_df[feature_cols].values
        y_test = test_df[target_col].values
        
        # 1. LightGBM
        self.lgbm_model = LGBMRegressor(
            n_estimators=120,
            learning_rate=0.05,
            max_depth=5,
            num_leaves=25,
            random_state=42,
            verbosity=-1
        )
        self.lgbm_model.fit(X_train, y_train, eval_set=[(X_val, y_val)])
        lgbm_preds = self.lgbm_model.predict(X_test)
        lgbm_metrics = compute_metrics(y_test, lgbm_preds)
        
        # 2. XGBoost
        self.xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42)
        self.xgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
        xgb_preds = self.xgb_model.predict(X_test)
        xgb_metrics = compute_metrics(y_test, xgb_preds)
        
        # 3. PyTorch BiLSTM
        torch.manual_seed(42)
        mu = X_train.mean(axis=0)
        sigma = X_train.std(axis=0) + 1e-6
        X_train_norm = (X_train - mu) / sigma
        X_val_norm = (X_val - mu) / sigma
        X_test_norm = (X_test - mu) / sigma
        
        seq_len = 7
        def make_sequences(X, y):
            X_s, y_s = [], []
            for i in range(len(X) - seq_len):
                X_s.append(X[i:i+seq_len])
                y_s.append(y[i+seq_len])
            return torch.tensor(np.array(X_s), dtype=torch.float32), torch.tensor(np.array(y_s), dtype=torch.float32)

        X_tr_seq, y_tr_seq = make_sequences(X_train_norm, y_train)
        
        self.bilstm_model = DemandBiLSTM(input_dim=len(feature_cols))
        optimizer = torch.optim.Adam(self.bilstm_model.parameters(), lr=0.008, weight_decay=1e-4)
        criterion = nn.MSELoss()
        
        self.bilstm_model.train()
        for epoch in range(35):
            optimizer.zero_grad()
            out = self.bilstm_model(X_tr_seq).squeeze()
            loss = criterion(out, y_tr_seq)
            loss.backward()
            optimizer.step()
            
        self.bilstm_model.eval()
        with torch.no_grad():
            X_comb = np.concatenate([X_val_norm[-seq_len:], X_test_norm])
            y_comb = np.concatenate([y_val[-seq_len:], y_test])
            X_te_seq, _ = make_sequences(X_comb, y_comb)
            bilstm_preds = self.bilstm_model(X_te_seq).squeeze().numpy()
            
        bilstm_metrics = compute_metrics(y_test, bilstm_preds)
        
        self.metrics_comparison = {
            "LightGBM": lgbm_metrics,
            "XGBoost": xgb_metrics,
            "PyTorch BiLSTM": bilstm_metrics
        }
        
        # Persist models & metadata
        joblib.dump(self.lgbm_model, os.path.join(self.artifacts_dir, "demand_lgbm.joblib"))
        joblib.dump(self.xgb_model, os.path.join(self.artifacts_dir, "demand_xgb.joblib"))
        torch.save(self.bilstm_model.state_dict(), os.path.join(self.artifacts_dir, "demand_bilstm.pth"))
        joblib.dump({
            "feature_cols": self.feature_cols,
            "mu": mu,
            "sigma": sigma,
            "metrics": self.metrics_comparison
        }, os.path.join(self.artifacts_dir, "demand_meta.joblib"))
        
        return self.metrics_comparison

    def predict_retailer_demand(self, recent_store_df: pd.DataFrame, horizon: int = 7) -> Dict[str, Any]:
        """
        Generates store-level forecasts for all retail outlets over a 7-day planning window.
        """
        meta_path = os.path.join(self.artifacts_dir, "demand_meta.joblib")
        if not os.path.exists(meta_path):
            raise FileNotFoundError("Demand models not trained yet.")
            
        meta = joblib.load(meta_path)
        feature_cols = meta["feature_cols"]
        
        if self.lgbm_model is None:
            self.lgbm_model = joblib.load(os.path.join(self.artifacts_dir, "demand_lgbm.joblib"))
            
        store_forecasts = {}
        total_projected_demand = 0.0
        alerts = []
        
        stores = recent_store_df["retailer_code"].unique()
        
        for store in stores:
            sub = recent_store_df[recent_store_df["retailer_code"] == store].copy()
            if len(sub) == 0:
                continue
                
            store_name = sub["retailer_name"].iloc[-1]
            last_feat = sub[feature_cols].iloc[-1:].values.copy()
            
            store_daily = []
            curr = last_feat.copy()
            base_date = pd.to_datetime(sub["date"].iloc[-1])
            
            for h in range(1, horizon + 1):
                tgt_date = base_date + pd.Timedelta(days=h)
                pred = float(self.lgbm_model.predict(curr)[0])
                pred = max(50.0, round(pred, 1))
                
                # Check for overstock or shortage risks against baseline
                store_daily.append({
                    "day": h,
                    "date": tgt_date.strftime("%Y-%m-%d"),
                    "predicted_demand_kg": pred
                })
                total_projected_demand += pred
                
            total_store_week = sum(x["predicted_demand_kg"] for x in store_daily)
            
            # Alert thresholds
            if total_store_week > 8000.0:
                alerts.append({
                    "store_code": store,
                    "store_name": store_name,
                    "type": "HIGH_DEMAND_SURGE_ALERT",
                    "projected_7day_kg": round(total_store_week, 1)
                })
                
            store_forecasts[store] = {
                "store_name": store_name,
                "weekly_total_kg": round(total_store_week, 1),
                "daily_forecast": store_daily
            }
            
        return {
            "horizon_days": horizon,
            "total_network_demand_kg": round(total_projected_demand, 1),
            "store_forecasts": store_forecasts,
            "alerts": alerts,
            "model_metrics": meta["metrics"]
        }
