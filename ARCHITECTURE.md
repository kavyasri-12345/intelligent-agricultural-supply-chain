# ARCHITECTURE DESIGN SPECIFICATION
## Intelligent Spoilage-Aware Coordination and Optimization of Perishable Agricultural Supply Chains

### 1. Executive Summary & Problem Formulation
Perishable agricultural goods (specifically tomatoes in our pilot catchment: Kolar / Bengaluru Rural District, Karnataka, India) suffer post-harvest losses upwards of 25–40% due to uncoordinated supply gluts, demand mismatches, ambient thermal abuse during transit, sub-optimal cold-storage utilization, and lack of dynamic First-Expired, First-Out (FEFO) routing.

This platform bridges this gap through an end-to-end mathematical, predictive, and decision-support pipeline:
```
[Historical & Real-Time Ingestion: AGMARKNET, NASA POWER, OSM, Seeded Sensors]
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
[Module A: Supply Forecasting]                  [Module B: Demand Forecasting]
(LightGBM, XGBoost, GRU/LSTM, TFT)              (LightGBM, XGBoost, BiLSTM)
           │                                                 │
           └────────────────────────┬────────────────────────┘
                                    ▼
                      [Module C: Farm Clustering]
                   (K-Means, DBSCAN, Farm Graph)
                                    │
                                    ▼
                     [Module D: Spoilage Prediction]
                   (Random Forest, XGBoost, LSTM)
                                    │
                                    ▼
                [Module E: Shelf-Life Estimation (FEFO)]
            (Kinetic Arrhenius Deterioration + Thresholds)
                                    │
                                    ▼
        [Module F: Storage Allocation] & [Module G: Fleet Routing]
            (OR-Tools CP-SAT Mixed-Integer Linear Program)
                                    │
                                    ▼
                 [Module H: Integrated Multi-Objective]
          Min(Spoilage + Transport + Storage + Penalty Costs)
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
[Explainable AI Engine]                          [Executive Decision UI]
 (SHAP, Constraint Slack)                        (Next.js, MapLibre, Charts)
```

---

### 2. Multi-Tier System Architecture

#### Tier 1: Client Presentation Layer (Next.js 14 + React + TypeScript + Tailwind CSS)
- **Role-Based Portals**:
  - `Admin`: Full system orchestration, user permissions, audit logs.
  - `Planner`: Multi-objective scenario runs, override recommendations, cost Pareto frontier.
  - `Farmer`: Harvest submission, cluster collection schedule, predicted local market price.
  - `Retailer`: Daily order placement, fulfillment tracking, freshness guarantee status.
  - `Storage Manager`: Inflow/outflow scheduling, bay occupancy, temperature alerts.
  - `Transport Manager`: Driver assignment, route turn-by-turn with delivery time-windows.
- **Geospatial & Visualization**: MapLibre GL JS for interactive farm clusters, cold-storage hubs, retailer drop-offs, and route corridors. Recharts for forecast confidence intervals and SHAP waterfall plots.

#### Tier 2: Application Orchestration Layer (Node.js + Express.js REST API)
- **JWT & Role-Based Access Control (RBAC)**: Secure stateless authentication with refresh tokens.
- **Operational Data Management**: PostgreSQL + PostGIS transactional store for users, crops, batches, orders, inventory, and audit trails.
- **Microservice Mediation**: Asynchronous HTTP client communicating with the Python AI & Optimization Engine.

#### Tier 3: AI, Deep Learning & Operations Research Engine (Python 3.13 + FastAPI)
- **FastAPI Async Gateway**: Exposing structured REST endpoints for batch predictions, clustering, training, and optimization execution.
- **Deep Learning Subsystem (PyTorch)**: Sequence models (LSTM/GRU) for multi-horizon supply/demand forecasting and sensor-driven spoilage risk.
- **Machine Learning Subsystem (LightGBM, XGBoost, Scikit-Learn)**: Gradient boosted trees for tabular supply, demand, and quality classification.
- **Mathematical Optimization Subsystem (Google OR-Tools CP-SAT)**:
  - Exact constraint programming for multi-facility capacity allocation.
  - Vehicle Routing Problem with Time Windows (VRPTW) and cold-chain constraints.
- **Explainability Engine (SHAP)**: Kernel & Tree explainers quantifying feature attributions for predictions and constraint slack reporting.

#### Tier 4: Persistence & Cache Layer (PostgreSQL + PostGIS + Redis)
- **Spatial Tables**: Points for farms, storage hubs, retailers with PostGIS geography geometry types.
- **Temporal Tables**: Sensor logs, weather observations, demand time-series with indexing.
- **Redis Cache**: Ephemeral storage for route distance matrices, active optimization runs, and session states.

---

### 3. Pilot Scope & Domain Parameters
- **Crop**: Tomato (*Solanum lycopersicum*).
- **Geography**: Kolar District / Greater Bengaluru Catchment (approx. 13.13°N, 78.13°E to 12.97°N, 77.59°E).
- **Scale**: 50–200 Farms, 3–5 Cold-Storage Facilities, 15–30 Urban Retailers, 8–15 Heterogeneous Fleet Vehicles (Reefer vs. Ambient).
- **Planning Horizon**: 7-Day rolling forecast with hourly/event-driven operational scheduling.
