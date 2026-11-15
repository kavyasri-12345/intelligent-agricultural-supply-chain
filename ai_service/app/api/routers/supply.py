from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import pandas as pd
from app.models.supply_forecasting import SupplyForecastingEngine

router = APIRouter(prefix="/forecast/supply", tags=["Supply Forecasting"])

class SupplyForecastRequest(BaseModel):
    crop: str = "tomato"
    horizon_days: int = 7
    model: str = "lightgbm" # lightgbm, xgboost, lstm, seasonal_naive

@router.post("")
def get_supply_forecast(req: SupplyForecastRequest):
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data_store")
    supply_csv = os.path.join(data_dir, "supply_history.csv")
    
    if not os.path.exists(supply_csv):
        raise HTTPException(status_code=404, detail="Supply historical dataset not found.")
        
    df = pd.read_csv(supply_csv)
    from app.data.preprocessor import TimeSeriesPreprocessor
    preprocessor = TimeSeriesPreprocessor()
    clean_df, feature_cols = preprocessor.build_supply_features(df)
    
    engine = SupplyForecastingEngine()
    result = engine.predict_future(clean_df, horizon=req.horizon_days)
    return result

@router.get("/historical")
def get_historical_supply(limit_days: int = 30):
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data_store")
    supply_csv = os.path.join(data_dir, "supply_history.csv")
    if not os.path.exists(supply_csv):
        raise HTTPException(status_code=404, detail="Supply data missing.")
        
    df = pd.read_csv(supply_csv)
    agg = df.groupby("date").agg({
        "harvest_quantity_kg": "sum",
        "market_modal_price_per_kg": "mean",
        "temp_avg": "mean"
    }).reset_index().tail(limit_days)
    
    return agg.to_dict(orient="records")
