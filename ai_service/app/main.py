"""
FastAPI AI & Optimization Microservice Entrypoint
Intelligent Spoilage-Aware Coordination and Optimization of Perishable Agricultural Supply Chains
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.routers import supply, demand, clustering, spoilage, optimization, explainability, scenarios

app = FastAPI(
    title="Intelligent AgriSupplyChain AI & Optimization Engine",
    description="Autonomous Deep Learning, Spoilage-Aware Routing, Cold-Storage Allocation & Explainable AI REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Frontend & Backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(supply.router, prefix="/api/v1")
app.include_router(demand.router, prefix="/api/v1")
app.include_router(clustering.router, prefix="/api/v1")
app.include_router(spoilage.router, prefix="/api/v1")
app.include_router(optimization.router, prefix="/api/v1")
app.include_router(explainability.router, prefix="/api/v1")
app.include_router(scenarios.router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {
        "service": "AgriSupplyChain AI & Optimization Microservice",
        "status": "HEALTHY",
        "version": "1.0.0",
        "pilot_crop": "Tomato (Solanum lycopersicum)",
        "catchment": "Kolar / Bengaluru Catchment",
        "modules_active": [
            "Module A: Supply Forecasting (LightGBM, XGBoost, PyTorch LSTM)",
            "Module B: Demand Forecasting (LightGBM, XGBoost, PyTorch BiLSTM)",
            "Module C: Intelligent Farmer Clustering (K-Means, DBSCAN)",
            "Module D: Deep Learning Spoilage Engine (Random Forest, XGBoost, LSTM)",
            "Module E: Temperature-Aware Shelf-Life & FEFO",
            "Module F: Cold-Storage Allocation (Google OR-Tools CP-SAT)",
            "Module G: Heterogeneous Fleet VRPTW Routing",
            "Module H: Integrated Multi-Objective Optimization",
            "Explainable AI (SHAP Tree & Waterfall Attributions)"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
