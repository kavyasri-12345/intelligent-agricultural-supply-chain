"""
Data Preprocessing, Temporal Feature Engineering, and Validation Pipelines
"""

import math
from typing import Tuple, Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

class TimeSeriesPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()

    def build_supply_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """
        Constructs robust autoregressive lags, rolling statistics, calendar cyclics, and weather covariates.
        """
        # Ensure daily sorted order
        daily = df.groupby("date").agg({
            "harvest_quantity_kg": "sum",
            "temp_max": "mean",
            "temp_min": "mean",
            "temp_avg": "mean",
            "relative_humidity": "mean",
            "rainfall_mm": "mean",
            "market_modal_price_per_kg": "mean"
        }).reset_index()
        
        daily["date"] = pd.to_datetime(daily["date"])
        daily = daily.sort_values("date").reset_index(drop=True)
        
        # Calendar cyclical features
        daily["doy"] = daily["date"].dt.dayofyear
        daily["dow"] = daily["date"].dt.dayofweek
        daily["sin_doy"] = np.sin(2 * np.pi * daily["doy"] / 365.25)
        daily["cos_doy"] = np.cos(2 * np.pi * daily["doy"] / 365.25)
        daily["sin_dow"] = np.sin(2 * np.pi * daily["dow"] / 7.0)
        daily["cos_dow"] = np.cos(2 * np.pi * daily["dow"] / 7.0)
        
        # Lags
        for lag in [1, 2, 7, 14, 21]:
            daily[f"supply_lag_{lag}"] = daily["harvest_quantity_kg"].shift(lag)
            
        # Rolling windows (avoiding lookahead: shift by 1 first)
        shifted = daily["harvest_quantity_kg"].shift(1)
        daily["supply_roll_mean_7"] = shifted.rolling(window=7, min_periods=1).mean()
        daily["supply_roll_std_7"] = shifted.rolling(window=7, min_periods=1).std().fillna(0)
        daily["supply_roll_mean_14"] = shifted.rolling(window=14, min_periods=1).mean()
        
        # Weather rolling indicators
        daily["temp_roll_mean_3"] = daily["temp_avg"].shift(1).rolling(3, min_periods=1).mean()
        daily["rain_roll_sum_7"] = daily["rainfall_mm"].shift(1).rolling(7, min_periods=1).sum()
        
        # Drop initial rows with NaN from lags
        clean_df = daily.dropna().reset_index(drop=True)
        
        feature_cols = [
            "temp_max", "temp_min", "temp_avg", "relative_humidity", "rainfall_mm",
            "market_modal_price_per_kg", "sin_doy", "cos_doy", "sin_dow", "cos_dow",
            "supply_lag_1", "supply_lag_2", "supply_lag_7", "supply_lag_14", "supply_lag_21",
            "supply_roll_mean_7", "supply_roll_std_7", "supply_roll_mean_14",
            "temp_roll_mean_3", "rain_roll_sum_7"
        ]
        
        return clean_df, feature_cols

    def build_demand_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """
        Features for store-level retailer demand prediction.
        """
        df = df.copy()
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values(["retailer_code", "date"]).reset_index(drop=True)
        
        df["doy"] = df["date"].dt.dayofyear
        df["sin_doy"] = np.sin(2 * np.pi * df["doy"] / 365.25)
        df["cos_doy"] = np.cos(2 * np.pi * df["doy"] / 365.25)
        
        # Group-wise lags per store
        for lag in [1, 2, 7, 14]:
            df[f"demand_lag_{lag}"] = df.groupby("retailer_code")["demand_kg"].shift(lag)
            
        df["demand_roll_mean_7"] = df.groupby("retailer_code")["demand_kg"].transform(
            lambda x: x.shift(1).rolling(7, min_periods=1).mean()
        )
        
        clean_df = df.dropna().reset_index(drop=True)
        
        feature_cols = [
            "day_of_week", "is_weekend", "selling_price_per_kg",
            "sin_doy", "cos_doy", "demand_lag_1", "demand_lag_2", "demand_lag_7", "demand_lag_14",
            "demand_roll_mean_7"
        ]
        return clean_df, feature_cols

    def temporal_split(
        self, 
        df: pd.DataFrame, 
        train_frac: float = 0.75, 
        val_frac: float = 0.15
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Strict temporal train/validation/test split without lookahead leakage.
        """
        n = len(df)
        train_end = int(n * train_frac)
        val_end = int(n * (train_frac + val_frac))
        
        train_df = df.iloc[:train_end].copy()
        val_df = df.iloc[train_end:val_end].copy()
        test_df = df.iloc[val_end:].copy()
        
        return train_df, val_df, test_df
