"""
Research Evaluation Runner
Benchmarks:
- Baseline A: Greedy Nearest Allocation Heuristic
- Baseline B: Cost-Only Vehicle Routing (Ignores Shelf Life)
- Baseline C: Integrated Optimization without Shelf-Life Constraints
- Proposed System: Spoilage-Aware Integrated Multi-Objective Optimization
Evaluates across 4 Operational Scenarios: NORMAL, HEATWAVE, DEMAND_SPIKE, FLEET_OUTAGE.
"""

import os
import json
import pandas as pd
import numpy as np
import sys

# Add ai_service to path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "ai_service"))
from app.optimization.baselines import BenchmarkBaselines

def run_benchmarks():
    data_dir = os.path.join(os.path.dirname(__file__), "..", "ai_service", "data_store")
    results_dir = os.path.join(os.path.dirname(__file__), "results")
    os.makedirs(results_dir, exist_ok=True)
    
    with open(os.path.join(data_dir, "storage_facilities.json"), "r") as f:
        facilities = json.load(f)
    with open(os.path.join(data_dir, "retailers.json"), "r") as f:
        retailers = json.load(f)
    with open(os.path.join(data_dir, "vehicles.json"), "r") as f:
        vehicles = json.load(f)
        
    scenarios = ["NORMAL", "HEATWAVE", "DEMAND_SPIKE", "FLEET_OUTAGE"]
    bench = BenchmarkBaselines()
    
    all_rows = []
    
    for scen in scenarios:
        print(f"--- Running Research Benchmark for Scenario: {scen} ---")
        batch_file = os.path.join(data_dir, f"batches_{scen.lower()}.json")
        if not os.path.exists(batch_file):
            batch_file = os.path.join(data_dir, "batches_normal.json")
        with open(batch_file, "r") as f:
            batches = json.load(f)
            
        cur_veh = [v for v in vehicles if v["id"] not in ("VEH-RF-01", "VEH-RF-02")] if scen == "FLEET_OUTAGE" else vehicles
        
        res = bench.run_all_baselines(batches, facilities, retailers, cur_veh, scenario=scen)
        
        for b in res["baselines_comparison"]:
            all_rows.append({
                "Scenario": scen,
                "Model_Framework": b["name"],
                "Total_Cost_INR": b["total_cost_inr"],
                "Spoilage_Cost_INR": b["spoilage_cost_inr"],
                "Transport_Cost_INR": b["transport_cost_inr"],
                "Storage_Cost_INR": b["storage_cost_inr"],
                "Spoilage_Rate_Pct": b["spoilage_rate_pct"],
                "Demand_Fulfillment_Pct": b["demand_fulfillment_pct"],
                "Total_Distance_KM": b["total_distance_km"]
            })
            
    df_results = pd.DataFrame(all_rows)
    csv_path = os.path.join(results_dir, "benchmark_comparison.csv")
    df_results.to_csv(csv_path, index=False)
    print(f"\n[SUCCESS] Benchmark Evaluation Completed! Results saved to: {csv_path}")
    print("\nSummary Table:")
    print(df_results.to_string(index=False))

if __name__ == "__main__":
    run_benchmarks()
