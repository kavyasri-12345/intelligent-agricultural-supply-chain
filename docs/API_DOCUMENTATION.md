# REST API DOCUMENTATION & CONTRACTS

## 1. Architecture Overview
- **AI Service Gateway (FastAPI)**: Default port `8000` (Swagger UI at `/docs`).
- **Application Backend (Express.js)**: Default port `5000` (`/api/v1/...`).

---

## 2. AI Service Endpoints (`http://localhost:8000`)

### Supply Forecasting
- `POST /api/v1/forecast/supply`
  - Request: `{ "crop": "tomato", "horizon_days": 7, "model": "lightgbm" | "xgboost" | "lstm" | "ensemble" }`
  - Response: `{ "forecast": [...], "prediction_intervals": { "p10": [...], "p90": [...] }, "metrics": { "mae": 142.3, "rmse": 188.7, "wape": 0.084 }, "alerts": [...] }`

### Demand Forecasting
- `POST /api/v1/forecast/demand`
  - Request: `{ "retailer_ids": [...], "horizon_days": 7, "model": "lightgbm" | "xgboost" | "bilstm" }`
  - Response: `{ "retailer_forecasts": { "<id>": [...] }, "total_demand_kg": 15400, "stockout_risks": [...] }`

### Farm Clustering
- `POST /api/v1/clustering/farms`
  - Request: `{ "method": "kmeans" | "dbscan", "n_clusters": 5, "capacity_weight": true }`
  - Response: `{ "clusters": [ { "id": 0, "centroid": [lat, lng], "farm_ids": [...], "total_yield_kg": 4500 } ] }`

### Spoilage Prediction & FEFO
- `POST /api/v1/spoilage/predict`
  - Request: `{ "batches": [ { "batch_id": "B-101", "crop": "tomato", "harvest_age_hours": 36, "sensor_readings": [{ "temp_c": 28.5, "humidity": 75 }] } ] }`
  - Response: `{ "predictions": [ { "batch_id": "B-101", "spoilage_prob": 0.28, "risk_category": "MEDIUM", "remaining_shelf_life_hours": 72.5, "fefo_priority": 3 } ] }`

### Storage Allocation & Route Optimization
- `POST /api/v1/optimization/solve`
  - Request: `{ "scenario": "NORMAL" | "HEATWAVE" | "DEMAND_SPIKE" | "FLEET_OUTAGE", "weights": { "spoilage": 1.0, "transport": 1.0, "storage": 1.0, "unmet_demand": 2.5 } }`
  - Response: `{ "objective_value": 42150.0, "cost_breakdown": { "spoilage": 8200, "transport": 16400, "storage": 4350, "penalties": 0 }, "storage_assignments": [...], "vehicle_routes": [...], "fulfillment_rate": 0.985, "explanations": [...] }`

### Explainable AI
- `GET /api/v1/explainability/feature-importance?module=supply&model=lightgbm`
  - Response: `{ "features": ["lag_7", "temp_max", "solar_rad", "lag_14"], "shap_values": [0.42, 0.28, 0.15, 0.08] }`
- `POST /api/v1/explainability/batch-spoilage-force`
  - Response: `{ "base_value": 0.12, "features": [...], "shap_contributions": [...] }`

---

## 3. Application Backend Endpoints (`http://localhost:5000/api/v1`)

### Authentication & RBAC
- `POST /auth/login` -> `{ token, user: { id, email, role, full_name } }`
- `POST /auth/register` -> `{ message, user }`
- `GET /auth/me` -> `{ user }`

### Operational Modules
- `GET /farms` & `POST /farms`
- `GET /batches` & `POST /batches` (Harvest registration)
- `GET /retailers` & `POST /retailers/orders`
- `GET /storage` (Capacity, temperature, assigned batches)
- `GET /transport/vehicles` & `GET /transport/routes`
- `POST /optimization/run` (Triggers solver and records solution)
- `POST /optimization/approve` (Supply Chain Planner approval)
- `GET /analytics/dashboard-summary` (Aggregated KPIs)
