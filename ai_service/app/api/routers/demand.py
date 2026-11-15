from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import pandas as pd
from app.models.demand_forecasting import DemandForecastingEngine

router = APIRouter(prefix="/forecast/demand", tags=["Demand Forecasting"])

class DemandForecastRequest(BaseModel):
    crop: str = "tomato"
    horizon_days: int = 7
    retailer_code: Optional[str] = None

@router.post("")
def get_demand_forecast(req: DemandForecastRequest):
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data_store")
    demand_csv = os.path.join(data_dir, "demand_history.csv")
    
    if not os.path.exists(demand_csv):
        raise HTTPException(status_code=404, detail="Demand historical dataset missing.")
        
    df = pd.read_csv(demand_csv)
    from app.data.preprocessor import TimeSeriesPreprocessor
    preprocessor = TimeSeriesPreprocessor()
    clean_df, feature_cols = preprocessor.build_demand_features(df)
    
    engine = DemandForecastingEngine()
    result = engine.predict_retailer_demand(clean_df, horizon=req.horizon_days)
    
    if req.retailer_code and req.retailer_code in result["store_forecasts"]:
        return {
            "horizon_days": req.horizon_days,
            "store_forecast": result["store_forecasts"][req.retailer_code],
            "model_metrics": result["model_metrics"]
        }
        
    return result
