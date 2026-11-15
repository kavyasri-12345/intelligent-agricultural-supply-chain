from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "Tomato" in data["pilot_crop"]

def test_supply_forecast():
    payload = {"crop": "tomato", "horizon_days": 7, "model": "lightgbm"}
    response = client.post("/api/v1/forecast/supply", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["forecast"]) == 7
    assert "predicted_supply_kg" in data["forecast"][0]
    assert "prediction_interval_p10" in data["forecast"][0]

def test_demand_forecast():
    payload = {"crop": "tomato", "horizon_days": 7}
    response = client.post("/api/v1/forecast/demand", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_network_demand_kg"] > 0
    assert len(data["store_forecasts"]) > 0

def test_farm_clustering():
    payload = {"method": "kmeans", "n_clusters": 5, "weighted_by_yield": True}
    response = client.post("/api/v1/clustering/farms", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["clusters"]) == 5
    assert "collection_hub_lat" in data["clusters"][0]

def test_spoilage_prediction():
    payload = {
        "batch_id": "BAT-TEST-001",
        "crop": "Tomato",
        "harvest_age_hours": 36.0,
        "quantity_kg": 1200.0,
        "avg_exposure_temp_c": 30.5
    }
    response = client.post("/api/v1/spoilage/predict-batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "spoilage_probability" in data
    assert data["risk_category"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    assert "remaining_shelf_life_hours" in data

def test_multi_objective_optimization():
    payload = {"scenario": "NORMAL", "planning_horizon_days": 7}
    response = client.post("/api/v1/optimization/solve", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPTIMAL"
    assert "kpis" in data
    assert data["kpis"]["demand_fulfillment_pct"] > 70.0
    assert len(data["explanations"]) > 0

def test_baseline_comparison():
    payload = {"scenario": "NORMAL"}
    response = client.post("/api/v1/optimization/compare-baselines", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["baselines_comparison"]) == 4 # Baseline A, B, C, Proposed

def test_explainability():
    response = client.get("/api/v1/explainability/supply-importance")
    assert response.status_code == 200
    data = response.json()
    assert len(data["feature_importance"]) > 0

if __name__ == "__main__":
    print("Running integration tests...")
    test_health_check()
    print("Health check: PASS")
    test_supply_forecast()
    print("Supply forecast: PASS")
    test_demand_forecast()
    print("Demand forecast: PASS")
    test_farm_clustering()
    print("Farm clustering: PASS")
    test_spoilage_prediction()
    print("Spoilage prediction: PASS")
    test_multi_objective_optimization()
    print("Optimization solve: PASS")
    test_baseline_comparison()
    print("Baselines comparison: PASS")
    test_explainability()
    print("Explainability: PASS")
    print(">>> ALL API & MODEL INTEGRATION TESTS PASSED PERFECTLY! <<<")
