"""
Module C: Intelligent Farmer Clustering
Implements: Spatial & Capacity-Weighted K-Means, DBSCAN, Farm Adjacency Graph.
Optimizes farm consolidation points, collection routes, and vehicle capacity allocation.
"""

import math
from typing import Dict, Any, List, Tuple
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
import networkx as nx

class FarmClusteringEngine:
    def __init__(self, n_clusters: int = 5, seed: int = 42):
        self.n_clusters = n_clusters
        self.seed = seed

    def cluster_farms_kmeans(self, farms: List[Dict[str, Any]], weighted: bool = True) -> Dict[str, Any]:
        """
        Partitions farms into optimal collection hubs using spatial coordinates and harvest capacity weights.
        """
        coords = np.array([[f["lat"], f["lng"]] for f in farms])
        weights = np.array([f.get("base_yield_kg", 1000.0) for f in farms]) if weighted else None
        
        kmeans = KMeans(n_clusters=self.n_clusters, random_state=self.seed, n_init=10)
        labels = kmeans.fit_predict(coords, sample_weight=weights)
        centroids = kmeans.cluster_centers_
        
        clusters = []
        for c_idx in range(self.n_clusters):
            member_indices = np.where(labels == c_idx)[0]
            member_farms = [farms[i] for i in member_indices]
            
            c_lat = float(centroids[c_idx, 0])
            c_lng = float(centroids[c_idx, 1])
            total_yield = sum(f.get("base_yield_kg", 0.0) for f in member_farms)
            total_acreage = sum(f.get("acreage", 0.0) for f in member_farms)
            
            # Find the actual farm closest to mathematical centroid to act as physical Collection Hub
            dists = [
                math.sqrt((f["lat"] - c_lat)**2 + (f["lng"] - c_lng)**2) 
                for f in member_farms
            ]
            hub_farm = member_farms[int(np.argmin(dists))]
            
            clusters.append({
                "cluster_id": c_idx,
                "cluster_code": f"CLUST-KLR-{c_idx+1:02d}",
                "centroid_lat": round(c_lat, 6),
                "centroid_lng": round(c_lng, 6),
                "collection_hub_farm_id": hub_farm["farm_id"],
                "collection_hub_name": f"{hub_farm['name']} (Hub {c_idx+1})",
                "collection_hub_lat": hub_farm["lat"],
                "collection_hub_lng": hub_farm["lng"],
                "farms_count": len(member_farms),
                "total_yield_capacity_kg": round(total_yield, 1),
                "total_acreage": round(total_acreage, 2),
                "farm_ids": [f["farm_id"] for f in member_farms]
            })
            
        return {
            "algorithm": "Capacity-Weighted K-Means" if weighted else "Spatial K-Means",
            "n_clusters": self.n_clusters,
            "clusters": clusters
        }

    def cluster_farms_dbscan(self, farms: List[Dict[str, Any]], eps_km: float = 6.0, min_samples: int = 4) -> Dict[str, Any]:
        """
        DBSCAN clustering to detect high-density agricultural belts and isolate outlier farms.
        eps_km converted to radians for haversine metric: eps / 6371.0.
        """
        coords_rad = np.radians([[f["lat"], f["lng"]] for f in farms])
        eps_rad = eps_km / 6371.0
        
        db = DBSCAN(eps=eps_rad, min_samples=min_samples, metric="haversine")
        labels = db.fit_predict(coords_rad)
        
        unique_labels = set(labels)
        clusters = []
        outliers = []
        
        for lbl in unique_labels:
            indices = np.where(labels == lbl)[0]
            member_farms = [farms[i] for i in indices]
            if lbl == -1:
                # Noise / Outliers
                outliers = [{
                    "farm_id": f["farm_id"],
                    "name": f["name"],
                    "lat": f["lat"],
                    "lng": f["lng"],
                    "taluk": f["taluk"]
                } for f in member_farms]
            else:
                lats = [f["lat"] for f in member_farms]
                lngs = [f["lng"] for f in member_farms]
                clusters.append({
                    "cluster_id": int(lbl),
                    "cluster_code": f"DBSCAN-BELT-{lbl+1:02d}",
                    "centroid_lat": round(float(np.mean(lats)), 6),
                    "centroid_lng": round(float(np.mean(lngs)), 6),
                    "farms_count": len(member_farms),
                    "total_yield_kg": round(sum(f.get("base_yield_kg", 0.0) for f in member_farms), 1),
                    "farm_ids": [f["farm_id"] for f in member_farms]
                })
                
        return {
            "algorithm": "DBSCAN",
            "eps_km": eps_km,
            "clusters_count": len(clusters),
            "outliers_count": len(outliers),
            "clusters": clusters,
            "outliers": outliers
        }

    def build_farm_network_graph(self, farms: List[Dict[str, Any]], max_distance_km: float = 8.0) -> Dict[str, Any]:
        """
        Constructs Farm Adjacency Graph to model spatial proximity and collection feeder networks.
        """
        G = nx.Graph()
        for f in farms:
            G.add_node(f["farm_id"], name=f["name"], lat=f["lat"], lng=f["lng"], yield_kg=f.get("base_yield_kg", 1000.0))
            
        n = len(farms)
        edges = []
        R = 6371.0
        
        for i in range(n):
            lat1, lon1 = math.radians(farms[i]["lat"]), math.radians(farms[i]["lng"])
            for j in range(i + 1, n):
                lat2, lon2 = math.radians(farms[j]["lat"]), math.radians(farms[j]["lng"])
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                dist = R * c
                if dist <= max_distance_km:
                    G.add_edge(farms[i]["farm_id"], farms[j]["farm_id"], weight=round(dist, 2))
                    edges.append({
                        "source": farms[i]["farm_id"],
                        "target": farms[j]["farm_id"],
                        "distance_km": round(dist, 2)
                    })
                    
        return {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "connected_components": nx.number_connected_components(G),
            "edges_sample": edges[:50]
        }
