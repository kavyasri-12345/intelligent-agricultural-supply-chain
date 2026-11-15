# IMPLEMENTATION PLAN & ROADMAP
## Intelligent Spoilage-Aware Coordination and Optimization of Perishable Agricultural Supply Chains

### Phase 1: Foundation & Data Engineering
- [x] Inspect development environment and workspace.
- [x] Verify Python 3.13, PyTorch, LightGBM, XGBoost, Google OR-Tools CP-SAT, Scikit-Learn, SHAP, FastAPI.
- [x] Create project directory layout (`ai_service`, `backend`, `frontend`, `database`, `experiments`, `docs`).
- [x] Establish architecture, database schema, and interface contracts.
- [ ] Build Seeded Synthetic Operational Data Generator (`synthetic_generator.py`):
  - 100 Farms (Kolar District coordinates), 20 Urban Retailers (Bengaluru catchment), 4 Cold-Storage Hubs, 12 Fleet Vehicles.
  - 365 Days historical daily supply & demand time-series.
  - Multi-sensor IoT batch environmental tracking (temperature, humidity, transit duration, firmness, Brix).
  - Configurable stress scenarios: Normal, Heatwave (+6°C ambient), Demand Spike (+45% weekend surge), Cold-Storage Outage (Bay 2 down), Fleet Breakdown (3 reefer trucks offline).
- [ ] Implement Public Data Ingestion Adapter (`ingestion.py`):
  - AGMARKNET tomato price and market arrivals scraper/parser.
  - NASA POWER daily solar radiation, temperature min/max, relative humidity.
  - OpenStreetMap & Haversine/OSRM road distance matrix generator.
- [ ] Implement Preprocessing & Feature Engineering Pipeline (`preprocessor.py`):
  - Rolling lags, cyclical calendar features (day-of-week sin/cos, seasonal index).
  - Train/Validation/Test strict temporal split with zero data leakage.

### Phase 2: AI & Deep Learning Model Implementation
- [ ] **Module A: Supply Forecasting**
  - Implement Seasonal Naive baseline.
  - Implement LightGBM & XGBoost multi-step autoregressive regressors.
  - Implement PyTorch LSTM and GRU temporal sequence models.
  - Multi-horizon 7-day daily forecast with 90% prediction intervals.
  - Evaluation: MAE, RMSE, WAPE across rolling-origin validation.
- [ ] **Module B: Demand Forecasting**
  - Implement LightGBM, XGBoost, and PyTorch BiLSTM retailer demand predictors.
  - Store-level daily and weekly forecasting with overstock/understock risk bands.
- [ ] **Module C: Intelligent Farmer Clustering**
  - Implement K-Means (spatial + capacity-weighted) and DBSCAN (density-based).
  - Build Farm Relationship Graph (centroids, collection vehicle access constraints).
  - Cluster visualization endpoints.
- [ ] **Module D: Deep Learning Spoilage Prediction**
  - Implement Random Forest, XGBoost Classifier, and PyTorch LSTM sequential sensor classifier.
  - Output: Spoilage probability, risk grade (Low, Medium, High, Critical), remaining hours.
- [ ] **Module E: Temperature-Aware Shelf-Life Estimation (FEFO)**
  - Kinetic deterioration model using Arrhenius temperature-dependent reaction rates:
    $$k(T) = k_0 \cdot Q_{10}^{(T - T_{ref})/10}$$
  - Dynamic FEFO priority queue sorting and infeasibility rejection.

### Phase 3: Mathematical Optimization Engine
- [ ] **Module F: Cold-Storage Allocation (OR-Tools CP-SAT)**
  - Batch assignment to facilities honoring capacity, temperature setpoints, holding costs, and remaining shelf life.
- [ ] **Module G: Vehicle Assignment & Route Optimization**
  - Capacitated Vehicle Routing Problem with Time Windows (VRPTW).
  - Heterogeneous fleet (Reefer vs. Ambient), cold-chain compatibility constraints.
- [ ] **Module H: Integrated Multi-Objective Optimization**
  - Unified mathematical model consuming live forecasts, spoilage risks, and spatial constraints.
  - Minimize: Total Cost = Spoilage Cost + Transport Cost + Storage Cost + Handling Cost + Delay Penalty + Unmet Demand Penalty.
  - Maximize: Fulfillment rate, fleet utilization, fresh delivery score.
- [ ] **Explainable AI (SHAP & Slack Attribution)**
  - TreeSHAP explanations for supply/demand predictions.
  - Spoilage risk feature impact plots.
  - Optimization binding constraint explanation.

### Phase 4: Application Backend & API Layer
- [ ] Implement Node.js Express Application Server (`backend/`):
  - RESTful routing matching database entities.
  - JWT Authentication & Role-Based Access Control (Admin, Planner, Farmer, Retailer, Storage Manager, Transport Manager).
  - Proxy client connecting with Python FastAPI AI microservice.
  - SQLite/PostgreSQL dynamic adapter for smooth standalone and docker execution.

### Phase 5: Enterprise-Grade Frontend Dashboard
- [ ] Build Next.js 14 Web Application (`frontend/`):
  - Executive Dashboard with comprehensive KPIs, live alert stream, and system overview.
  - Supply Forecasting page with model comparisons and interval ribbons.
  - Demand Forecasting page with retailer level breakdown and stockout alerts.
  - Farm Management page with interactive cluster map and harvest submission.
  - Retailer Management page with orders, fulfillment rates, and delivery windows.
  - Spoilage Intelligence page with FEFO batch queue and thermal trajectory charts.
  - Cold Storage page with bay visualizers, temperature status, and occupancy gauges.
  - Transportation page with fleet tracking, route maps, and delivery timelines.
  - AI Intelligence Center with SHAP waterfall plots, model metrics, and training controls.
  - Optimization Center with scenario selector, interactive solver run, route visualizer, and approve/override workflow.

### Phase 6: Research Benchmarks & Empirical Evaluation
- [ ] Baseline A: Nearest Feasible / Greedy Heuristic.
- [ ] Baseline B: Cost-only Vehicle Routing (ignoring shelf life & thermal abuse).
- [ ] Baseline C: Integrated optimization without shelf-life awareness.
- [ ] Proposed: Spoilage-aware integrated coordination platform.
- [ ] Run experimental evaluations across 4 operational scenarios (Normal, Heatwave, Demand Spike, Fleet Outage) with 5 random seeds.
- [ ] Generate comparative metric tables and visual publication-ready charts.

### Phase 7: Verification, Dockerization & Production Packaging
- [ ] Automated test suite: unit tests, ML inference tests, CP-SAT optimization tests, API integration tests.
- [ ] Docker Compose orchestration for all services.
- [ ] Complete documentation: `PROGRESS.md`, `README.md`, `EXPERIMENT_RESULTS.md`, `DEPLOYMENT.md`.
