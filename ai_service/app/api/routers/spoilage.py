from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import json
from app.models.spoilage_engine import SpoilagePredictionEngine
from app.models.shelf_life_model import ShelfLifeKineticEngine

router = APIRouter(prefix="/spoilage", tags=["Spoilage & Shelf Life"])

class BatchPredictionRequest(BaseModel):
    batch_id: str
    crop: str = "Tomato"
    harvest_age_hours: float
    quantity_kg: float
    initial_firmness: float = 0.92
    initial_brix: float = 4.8
    avg_exposure_temp_c: float = 26.0
    avg_humidity: float = 65.0
    telemetry_sequence: Optional[List[Dict[str, float]]] = None

@router.post("/predict-batch")
def predict_batch_spoilage(batch: BatchPredictionRequest):
    engine = SpoilagePredictionEngine()
    shelf_engine = ShelfLifeKineticEngine()
    
    b_dict = batch.dict()
    spoilage_res = engine.predict_batch(b_dict)
    
    # Calculate RSL and FEFO feasibility
    temp_hist = [s["temp_c"] for s in batch.telemetry_sequence] if batch.telemetry_sequence else [batch.avg_exposure_temp_c]
    shelf_res = shelf_engine.estimate_remaining_shelf_life(
        harvest_age_hours=batch.harvest_age_hours,
        temperature_history=temp_hist,
        projected_future_temp_c=26.0
    )
    
    return {
        "batch_id": batch.batch_id,
        "spoilage_probability": spoilage_res["spoilage_probability"],
        "risk_category": spoilage_res["risk_category"],
        "remaining_shelf_life_hours": shelf_res["remaining_shelf_life_hours"],
        "quality_index": shelf_res["quality_index"],
        "is_salable": shelf_res["is_salable"],
        "delivery_feasible": shelf_res["remaining_shelf_life_hours"] >= 16.0,
        "recommended_action": "PRIORITY_DISPATCH" if spoilage_res["risk_category"] in ("HIGH", "CRITICAL") else "STANDARD_STORAGE"
    }

@router.get("/active-batches")
def get_active_batches(scenario: str = "NORMAL"):
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data_store")
    scen_file = os.path.join(data_dir, f"batches_{scenario.lower()}.json")
    if not os.path.exists(scen_file):
        scen_file = os.path.join(data_dir, "batches_normal.json")
    with open(scen_file, "r") as f:
        batches = json.load(f)
    shelf_engine = ShelfLifeKineticEngine()
    evaluated = shelf_engine.prioritize_batches_fefo(batches)
    return evaluated
