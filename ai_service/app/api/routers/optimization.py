from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import json
from app.optimization.multi_objective import IntegratedMultiObjectiveOptimizer
from app.optimization.baselines import BenchmarkBaselines

router = APIRouter(prefix="/optimization", tags=["Multi-Objective Optimization"])

class OptimizationSolveRequest(BaseModel):
    scenario: str = "NORMAL" # NORMAL, HEATWAVE, DEMAND_SPIKE, FLEET_OUTAGE
    planning_horizon_days: int = 7
    weights: Optional[Dict[str, float]] = None

@router.post("/solve")
def run_integrated_optimization(req: OptimizationSolveRequest):
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data_store")
    
    # Load Scenario Batches
    batch_file = os.path.join(data_dir, f"batches_{req.scenario.lower()}.json")
    if not os.path.exists(batch_file):
        batch_file = os.path.join(data_dir, "batches_normal.json")
    with open(batch_file, "r") as f:
        batches = json.load(f)
        
    with open(os.path.join(data_dir, "storage_facilities.json"), "r") as f:
        facilities = json.load(f)
    with open(os.path.join(data_dir, "retailers.json"), "r") as f:
        retailers = json.load(f)
    with open(os.path.join(data_dir, "vehicles.json"), "r") as f:
        vehicles = json.load(f)
        
    # If FLEET_OUTAGE scenario, take 2 reefer trucks offline
    if req.scenario.upper() == "FLEET_OUTAGE":
        vehicles = [v for v in vehicles if v["id"] not in ("VEH-RF-01", "VEH-RF-02")]
        
    optimizer = IntegratedMultiObjectiveOptimizer()
    solution = optimizer.optimize_supply_chain(
        batches=batches,
        facilities=facilities,
        retailers=retailers,
        vehicles=vehicles,
        scenario=req.scenario,
        weights=req.weights
    )
    return solution

@router.post("/compare-baselines")
def compare_baselines(req: OptimizationSolveRequest):
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data_store")
    batch_file = os.path.join(data_dir, f"batches_{req.scenario.lower()}.json")
    if not os.path.exists(batch_file):
        batch_file = os.path.join(data_dir, "batches_normal.json")
    with open(batch_file, "r") as f:
        batches = json.load(f)
    with open(os.path.join(data_dir, "storage_facilities.json"), "r") as f:
        facilities = json.load(f)
    with open(os.path.join(data_dir, "retailers.json"), "r") as f:
        retailers = json.load(f)
    with open(os.path.join(data_dir, "vehicles.json"), "r") as f:
        vehicles = json.load(f)
        
    bench = BenchmarkBaselines()
    result = bench.run_all_baselines(batches, facilities, retailers, vehicles, scenario=req.scenario)
    return result
