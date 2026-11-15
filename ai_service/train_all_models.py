"""
Master Model Training & Artifact Generation Pipeline
Executes full training, rolling evaluation, and artifact serialization for:
1. Supply Forecasting (Module A)
2. Demand Forecasting (Module B)
3. Spoilage Prediction (Module D)
"""

import os
import json
import pandas as pd
from app.data.preprocessor import TimeSeriesPreprocessor
from app.models.supply_forecasting import SupplyForecastingEngine
from app.models.demand_forecasting import DemandForecastingEngine
from app.models.spoilage_engine import SpoilagePredictionEngine

def run_training_pipeline():
    data_dir = os.path.join(os.path.dirname(__file__), "data_store")
    artifacts_dir = os.path.join(os.path.dirname(__file__), "app", "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)
    
    preprocessor = TimeSeriesPreprocessor()
    
    print("==================================================================")
    print("STEP 1: TRAINING MODULE A (SUPPLY FORECASTING)")
    print("==================================================================")
    supply_df = pd.read_csv(os.path.join(data_dir, "supply_history.csv"))
    clean_supply, supply_features = preprocessor.build_supply_features(supply_df)
    tr_s, val_s, te_s = preprocessor.temporal_split(clean_supply, 0.70, 0.15)
    
    supply_engine = SupplyForecastingEngine(artifacts_dir=artifacts_dir)
    supply_metrics = supply_engine.train_and_evaluate(tr_s, val_s, te_s, supply_features)
    print("Supply Models Evaluation Results:")
    print(json.dumps(supply_metrics, indent=2))
    
    print("\n==================================================================")
    print("STEP 2: TRAINING MODULE B (DEMAND FORECASTING)")
    print("==================================================================")
    demand_df = pd.read_csv(os.path.join(data_dir, "demand_history.csv"))
    clean_demand, demand_features = preprocessor.build_demand_features(demand_df)
    tr_d, val_d, te_d = preprocessor.temporal_split(clean_demand, 0.70, 0.15)
    
    demand_engine = DemandForecastingEngine(artifacts_dir=artifacts_dir)
    demand_metrics = demand_engine.train_and_evaluate(tr_d, val_d, te_d, demand_features)
    print("Demand Models Evaluation Results:")
    print(json.dumps(demand_metrics, indent=2))
    
    print("\n==================================================================")
    print("STEP 3: TRAINING MODULE D (DEEP LEARNING SPOILAGE PREDICTION)")
    print("==================================================================")
    with open(os.path.join(data_dir, "batches_normal.json"), "r") as f:
        batches_normal = json.load(f)
    with open(os.path.join(data_dir, "batches_heatwave.json"), "r") as f:
        batches_heatwave = json.load(f)
        
    all_batches = batches_normal + batches_heatwave
    spoilage_engine = SpoilagePredictionEngine(artifacts_dir=artifacts_dir)
    spoilage_metrics = spoilage_engine.train_models(all_batches)
    print("Spoilage Models Classification Metrics:")
    print(json.dumps(spoilage_metrics, indent=2))
    
    # Save combined experiment report
    combined_results = {
        "supply_forecasting": supply_metrics,
        "demand_forecasting": demand_metrics,
        "spoilage_prediction": spoilage_metrics
    }
    with open(os.path.join(artifacts_dir, "training_summary.json"), "w") as f:
        json.dump(combined_results, f, indent=2)
        
    print("\n[SUCCESS] ALL MODELS TRAINED AND SAVED SUCCESSFULLY IN:", artifacts_dir)

if __name__ == "__main__":
    run_training_pipeline()
