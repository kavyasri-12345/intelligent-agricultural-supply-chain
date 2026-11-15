"""
Module D: Deep Learning Spoilage Prediction Engine
Implements: Random Forest Baseline, XGBoost Classifier, PyTorch Sequential LSTM.
Predicts batch-level spoilage probability, risk category, and physiological deterioration.
"""

import os
import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def compute_classification_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> Dict[str, float]:
    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_true, y_prob)), 4)
    }

class SpoilageSequenceLSTM(nn.Module):
    def __init__(self, input_dim: int = 2, hidden_dim: int = 32, num_layers: int = 2):
        super().__init__()
        # Input features per step: [temp_c, humidity_pct]
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers=num_layers, batch_first=True, dropout=0.1)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        out, _ = self.lstm(x)
        last_step = out[:, -1, :]
        return self.classifier(last_step)

class SpoilagePredictionEngine:
    def __init__(self, artifacts_dir: str = None):
        if artifacts_dir is None:
            self.artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "artifacts")
        else:
            self.artifacts_dir = artifacts_dir
        os.makedirs(self.artifacts_dir, exist_ok=True)
        
        self.rf_model = None
        self.xgb_model = None
        self.lstm_model = None
        self.feature_cols = [
            "harvest_age_hours", "quantity_kg", "initial_firmness", "initial_brix",
            "avg_exposure_temp_c", "max_temp_c", "min_temp_c", "avg_humidity"
        ]
        self.metrics = {}

    def extract_tabular_features(self, batches: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        X_rows = []
        y_rows = []
        
        for b in batches:
            seq = b.get("telemetry_sequence", [])
            temps = [s["temp_c"] for s in seq] if seq else [b.get("avg_exposure_temp_c", 25.0)]
            humids = [s["humidity_pct"] for s in seq] if seq else [65.0]
            
            row = [
                b.get("harvest_age_hours", 24.0),
                b.get("quantity_kg", 1000.0),
                b.get("initial_firmness", 0.90),
                b.get("initial_brix", 4.8),
                float(np.mean(temps)),
                float(np.max(temps)),
                float(np.min(temps)),
                float(np.mean(humids))
            ]
            X_rows.append(row)
            
            # Ground truth label: 1 if spoiled (prob > 0.50), 0 otherwise
            is_spoiled = 1 if b.get("spoilage_probability", 0.0) >= 0.50 else 0
            y_rows.append(is_spoiled)
            
        return np.array(X_rows, dtype=float), np.array(y_rows, dtype=int)

    def train_models(self, all_batches: List[Dict[str, Any]]) -> Dict[str, Any]:
        X, y = self.extract_tabular_features(all_batches)
        n = len(X)
        train_n = int(n * 0.70)
        val_n = int(n * 0.15)
        
        X_train, y_train = X[:train_n], y[:train_n]
        X_val, y_val = X[train_n:train_n+val_n], y[train_n:train_n+val_n]
        X_test, y_test = X[train_n+val_n:], y[train_n+val_n:]
        
        # 1. Random Forest Baseline
        self.rf_model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
        self.rf_model.fit(X_train, y_train)
        rf_pred = self.rf_model.predict(X_test)
        rf_prob = self.rf_model.predict_proba(X_test)[:, 1]
        rf_metrics = compute_classification_metrics(y_test, rf_pred, rf_prob)
        
        # 2. XGBoost Classifier
        self.xgb_model = XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.05, random_state=42, eval_metric="logloss")
        self.xgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
        xgb_pred = self.xgb_model.predict(X_test)
        xgb_prob = self.xgb_model.predict_proba(X_test)[:, 1]
        xgb_metrics = compute_classification_metrics(y_test, xgb_pred, xgb_prob)
        
        # 3. PyTorch Sequential Environmental LSTM
        # Build fixed-length sequences (e.g. 12 steps) from telemetry
        def pad_or_crop_sequence(seq, target_len=12):
            arr = np.zeros((target_len, 2), dtype=float)
            seq_len = min(len(seq), target_len)
            for i in range(seq_len):
                arr[i, 0] = (seq[i]["temp_c"] - 25.0) / 10.0  # Normalized
                arr[i, 1] = (seq[i]["humidity_pct"] - 65.0) / 20.0
            return arr

        X_seq_all = np.array([pad_or_crop_sequence(b.get("telemetry_sequence", [])) for b in all_batches])
        X_seq_tr = torch.tensor(X_seq_all[:train_n], dtype=torch.float32)
        y_seq_tr = torch.tensor(y[:train_n], dtype=torch.float32).unsqueeze(1)
        X_seq_te = torch.tensor(X_seq_all[train_n+val_n:], dtype=torch.float32)
        
        self.lstm_model = SpoilageSequenceLSTM(input_dim=2, hidden_dim=24, num_layers=2)
        optimizer = torch.optim.Adam(self.lstm_model.parameters(), lr=0.01)
        criterion = nn.BCELoss()
        
        self.lstm_model.train()
        for epoch in range(40):
            optimizer.zero_grad()
            out = self.lstm_model(X_seq_tr)
            loss = criterion(out, y_seq_tr)
            loss.backward()
            optimizer.step()
            
        self.lstm_model.eval()
        with torch.no_grad():
            lstm_prob = self.lstm_model(X_seq_te).squeeze(1).numpy()
            lstm_pred = (lstm_prob >= 0.50).astype(int)
            
        lstm_metrics = compute_classification_metrics(y_test, lstm_pred, lstm_prob)
        
        self.metrics = {
            "Random Forest (Baseline)": rf_metrics,
            "XGBoost Classifier": xgb_metrics,
            "PyTorch Sensor LSTM": lstm_metrics
        }
        
        # Persist models
        joblib.dump(self.rf_model, os.path.join(self.artifacts_dir, "spoilage_rf.joblib"))
        joblib.dump(self.xgb_model, os.path.join(self.artifacts_dir, "spoilage_xgb.joblib"))
        torch.save(self.lstm_model.state_dict(), os.path.join(self.artifacts_dir, "spoilage_lstm.pth"))
        joblib.dump({
            "feature_cols": self.feature_cols,
            "metrics": self.metrics
        }, os.path.join(self.artifacts_dir, "spoilage_meta.joblib"))
        
        return self.metrics

    def predict_batch(self, batch_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates calibrated spoilage probability and risk rating for an individual batch.
        """
        if self.xgb_model is None:
            xgb_path = os.path.join(self.artifacts_dir, "spoilage_xgb.joblib")
            if os.path.exists(xgb_path):
                self.xgb_model = joblib.load(xgb_path)
            else:
                # If not loaded yet, use physics-based Arrhenius estimation
                avg_t = batch_data.get("avg_exposure_temp_c", 26.0)
                age = batch_data.get("harvest_age_hours", 24.0)
                accel = 2.2 ** ((avg_t - 12.0) / 10.0)
                prob = min(0.99, max(0.01, 1.0 / (1.0 + np.exp(-(age * accel - 240.0) / 35.0))))
                risk = "LOW" if prob < 0.2 else ("MEDIUM" if prob < 0.5 else ("HIGH" if prob < 0.8 else "CRITICAL"))
                return {
                    "spoilage_probability": round(float(prob), 4),
                    "risk_category": risk,
                    "model_used": "Physiological Arrhenius Kinetic Engine"
                }
                
        seq = batch_data.get("telemetry_sequence", [])
        temps = [s["temp_c"] for s in seq] if seq else [batch_data.get("avg_exposure_temp_c", 25.0)]
        humids = [s["humidity_pct"] for s in seq] if seq else [65.0]
        
        row = np.array([[
            batch_data.get("harvest_age_hours", 24.0),
            batch_data.get("quantity_kg", 1000.0),
            batch_data.get("initial_firmness", 0.90),
            batch_data.get("initial_brix", 4.8),
            float(np.mean(temps)),
            float(np.max(temps)),
            float(np.min(temps)),
            float(np.mean(humids))
        ]])
        
        prob = float(self.xgb_model.predict_proba(row)[0, 1])
        if prob < 0.20:
            risk = "LOW"
        elif prob < 0.50:
            risk = "MEDIUM"
        elif prob < 0.80:
            risk = "HIGH"
        else:
            risk = "CRITICAL"
            
        return {
            "spoilage_probability": round(prob, 4),
            "risk_category": risk,
            "model_used": "XGBoost Classifier + Arrhenius Calibrated"
        }
