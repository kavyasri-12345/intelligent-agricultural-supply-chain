from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.models.explainability import ExplainabilityEngine

router = APIRouter(prefix="/explainability", tags=["Explainable AI (SHAP)"])

class SpoilageExplanationRequest(BaseModel):
    batch_id: str = "BAT-EXPLAIN-01"
    harvest_age_hours: float = 34.0
    avg_exposure_temp_c: float = 29.5
    initial_firmness: float = 0.88
    avg_humidity: float = 78.0
    spoilage_probability: float = 0.46

@router.get("/supply-importance")
def get_supply_shap_feature_importance():
    engine = ExplainabilityEngine()
    return engine.explain_supply_forecast()

@router.post("/batch-spoilage-attribution")
def explain_batch_spoilage(req: SpoilageExplanationRequest):
    engine = ExplainabilityEngine()
    return engine.explain_spoilage_risk(req.dict())
