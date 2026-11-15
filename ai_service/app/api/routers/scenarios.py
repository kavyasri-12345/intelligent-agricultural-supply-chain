from fastapi import APIRouter
from typing import Dict, Any, List
import os
import json

router = APIRouter(prefix="/scenarios", tags=["Operational Scenarios"])

SCENARIOS_META = [
    {
        "id": "NORMAL",
        "name": "Normal Seasonal Operations",
        "description": "Standard harvesting cycles in Kolar, baseline ambient temperatures (22-28°C), and predictable urban retail consumption.",
        "spoilage_multiplier": 1.0,
        "demand_multiplier": 1.0
    },
    {
        "id": "HEATWAVE",
        "name": "Severe Summer Heatwave",
        "description": "Ambient heat peaks at +6°C (36-38°C), causing rapid Arrhenius kinetic deterioration (2.4x spoilage rate) and critical reefer demand.",
        "spoilage_multiplier": 2.4,
        "demand_multiplier": 1.05
    },
    {
        "id": "DEMAND_SPIKE",
        "name": "Festival & Weekend Demand Spike",
        "description": "Urban supermarket retail demand surges by +45% across Bengaluru central districts, testing buffer stock and vehicle turnaround.",
        "spoilage_multiplier": 1.1,
        "demand_multiplier": 1.45
    },
    {
        "id": "FLEET_OUTAGE",
        "name": "Reefer Fleet Breakdown & Logistics Disruption",
        "description": "Two heavy-duty Reefer transport trucks experience mechanical breakdown, forcing intelligent diversion of fragile produce to regional cold hubs.",
        "spoilage_multiplier": 1.6,
        "demand_multiplier": 1.0
    }
]

@router.get("")
def list_scenarios():
    return SCENARIOS_META

@router.get("/metrics-summary")
def get_model_metrics_summary():
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "artifacts")
    summary_file = os.path.join(data_dir, "training_summary.json")
    if os.path.exists(summary_file):
        with open(summary_file, "r") as f:
            return json.load(f)
    return {
        "status": "NOT_FOUND",
        "message": "Models not yet trained or artifacts file missing."
    }
