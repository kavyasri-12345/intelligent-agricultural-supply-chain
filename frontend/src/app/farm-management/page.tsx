"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import MapLibreMap from '@/components/MapLibreMap';
import { 
  Tractor, 
  MapPin, 
  Navigation, 
  Layers, 
  PlusCircle, 
  Check, 
  Share2, 
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { getBackendUrl } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function FarmManagementPage() {
  const [farms, setFarms] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [method, setMethod] = useState<'kmeans' | 'dbscan'>('kmeans');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: '',
    taluk: 'Kolar',
    lat: '13.1367',
    lng: '78.1291',
    acreage: '3.0',
    base_yield_kg: '3500'
  });

  const fetchFarmData = async () => {
    setLoading(true);
    try {
      const farmsRes = await fetch(getBackendUrl('/api/v1/farms'));
      if (farmsRes.ok) {
        const f = await farmsRes.json();
        setFarms(f);
      }

      const clusterRes = await fetch(getBackendUrl(`/api/v1/farms/clusters?method=${method}&n_clusters=5`));
      if (clusterRes.ok) {
        const c = await clusterRes.json();
        setClusters(c.clusters || []);
      }
    } catch (e) {
      console.warn('Farm data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmData();
  }, [method]);

  const handleRegisterFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(getBackendUrl('/api/v1/farms'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('agri_jwt_token') || ''}`
        },
        body: JSON.stringify(newFarm)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchFarmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Convert farms and cluster centroids to Map points
  const mapPoints: any[] = [
    ...farms.map((f: any) => ({
      id: f.farm_id,
      name: f.name,
      lat: f.lat,
      lng: f.lng,
      type: 'FARM',
      details: `${f.taluk} | ${f.acreage} Acres | Yield: ${f.base_yield_kg}kg`
    })),
    ...clusters.map((c: any) => ({
      id: c.cluster_code,
      name: c.collection_hub_name || `Cluster Hub (${c.cluster_code})`,
      lat: c.centroid_lat,
      lng: c.centroid_lng,
      type: 'CLUSTER_HUB',
      details: `Farms: ${c.farms_count} | Capacity: ${c.total_yield_capacity_kg}kg`,
      load: `${c.total_yield_capacity_kg}`
    }))
  ];

  return (
    <AuthGuard allowedRoles={['FARMER', 'ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Navbar 
        title="Intelligent Farmer Clustering & Spatial Consolidation" 
        subtitle="Unsupervised K-Means & DBSCAN Partitioning with Physical Feeder Hub Identification" 
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        {/* Controls & Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clustering Method:</span>
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setMethod('kmeans')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  method === 'kmeans' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Capacity-Weighted K-Means (5 Hubs)
              </button>
              <button
                onClick={() => setMethod('dbscan')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  method === 'dbscan' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Density-Based DBSCAN (Belts & Outliers)
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New Farm</span>
          </button>
        </div>

        {/* Spatial Map with Farm Points and Cluster Centroids */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">Kolar Production Catchment Cluster Centroids</h3>
            <span className="text-xs font-mono text-emerald-400">Centroids automatically assign closest farm as consolidation hub</span>
          </div>
          <MapLibreMap points={mapPoints} height="460px" />
        </div>

        {/* Cluster Breakdown Cards */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Active Spatial Consolidation Clusters ({clusters.length} Hubs)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {clusters.map((c) => (
              <div key={c.cluster_code} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-violet-400">{c.cluster_code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {c.farms_count} Farms
                  </span>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-white truncate">{c.collection_hub_name}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Centroid: {c.centroid_lat.toFixed(3)}°N, {c.centroid_lng.toFixed(3)}°E
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs flex justify-between items-baseline">
                  <span className="text-slate-400">Total Yield:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {(c.total_yield_capacity_kg / 1000).toFixed(1)} MT
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Farm Registration */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tractor className="w-4 h-4 text-emerald-400" />
                  Register Producer Farm
                </h4>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={handleRegisterFarm} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Estate / Farm Name</label>
                  <input
                    type="text"
                    required
                    value={newFarm.name}
                    onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                    placeholder="e.g. Sri Venkateshwara Tomato Farm"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Taluk</label>
                    <select
                      value={newFarm.taluk}
                      onChange={(e) => setNewFarm({ ...newFarm, taluk: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {['Kolar', 'Malur', 'Srinivaspur', 'Mulbagal', 'Bangarapet'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Acreage (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newFarm.acreage}
                      onChange={(e) => setNewFarm({ ...newFarm, acreage: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Latitude</label>
                    <input
                      type="text"
                      value={newFarm.lat}
                      onChange={(e) => setNewFarm({ ...newFarm, lat: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Longitude</label>
                    <input
                      type="text"
                      value={newFarm.lng}
                      onChange={(e) => setNewFarm({ ...newFarm, lng: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Estimated Harvest Yield (kg)</label>
                  <input
                    type="number"
                    value={newFarm.base_yield_kg}
                    onChange={(e) => setNewFarm({ ...newFarm, base_yield_kg: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 text-slate-950 font-bold hover:bg-emerald-500"
                  >
                    Save Farm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
    </AuthGuard>
  );
}
