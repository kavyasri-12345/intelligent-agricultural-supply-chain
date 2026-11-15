from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import json
from app.models.clustering import FarmClusteringEngine

router = APIRouter(prefix="/clustering", tags=["Farm Clustering"])

class ClusteringRequest(BaseModel):
    method: str = "kmeans" # kmeans, dbscan
    n_clusters: int = 5
    weighted_by_yield: bool = True
    eps_km: float = 6.0

@router.post("/farms")
def cluster_farms(req: ClusteringRequest):
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data_store")
    farms_json = os.path.join(data_dir, "farms.json")
    
    if not os.path.exists(farms_json):
        raise HTTPException(status_code=404, detail="Farms database not found.")
        
    with open(farms_json, "r") as f:
        farms = json.load(f)
        
    engine = FarmClusteringEngine(n_clusters=req.n_clusters)
    
    if req.method.lower() == "dbscan":
        result = engine.cluster_farms_dbscan(farms, eps_km=req.eps_km)
    else:
        result = engine.cluster_farms_kmeans(farms, weighted=req.weighted_by_yield)
        
    return result

@router.get("/network-graph")
def get_farm_network_graph(max_distance_km: float = 8.0):
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data_store")
    farms_json = os.path.join(data_dir, "farms.json")
    with open(farms_json, "r") as f:
        farms = json.load(f)
    engine = FarmClusteringEngine()
    return engine.build_farm_network_graph(farms, max_distance_km=max_distance_km)
