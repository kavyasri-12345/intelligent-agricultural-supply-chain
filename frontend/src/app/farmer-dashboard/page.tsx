"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import MapLibreMap from '@/components/MapLibreMap';
import AuthGuard from '@/components/AuthGuard';
import { 
  Tractor, 
  Package, 
  Clock, 
  Biohazard, 
  TrendingUp, 
  MapPin, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Wheat,
  Thermometer,
  ShieldCheck
} from 'lucide-react';
import { getBackendUrl } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function FarmerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Harvest registration state
  const [newBatch, setNewBatch] = useState({
    crop: 'Tomato',
    farm_id: 'FARM-001',
    quantity_kg: '2500',
    harvest_age_hours: '2.0',
    initial_firmness: '0.94',
    initial_brix: '4.8',
    avg_exposure_temp_c: '24.5'
  });

  const [mapPoints, setMapPoints] = useState<any[]>([
    { id: 'FARM-001', name: 'My Farm (Gowda Agro)', lat: 13.1367, lng: 78.1291, type: 'FARM', details: 'Acreage: 3.5 | Crop: Tomato' },
    { id: 'HUB-01', name: 'Kolar Cluster Collection Hub', lat: 13.1412, lng: 78.1384, type: 'STORAGE', details: 'Distance: 2.1 km | Pre-cooling Active' },
    { id: 'FARM-002', name: 'Cooperative Neighbor A', lat: 13.1290, lng: 78.1210, type: 'FARM', details: 'Cluster 1 Member' },
    { id: 'FARM-003', name: 'Cooperative Neighbor B', lat: 13.1450, lng: 78.1320, type: 'FARM', details: 'Cluster 1 Member' }
  ]);

  useEffect(() => {
    const user = getStoredUser();
    if (user) setCurrentUser(user);
    fetchFarmerData();
  }, []);

  const fetchFarmerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(getBackendUrl('/api/v1/batches'));
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.batches || []);
        if (list.length > 0) {
          setBatches(list);
          return;
        }
      }
      // Sample active batches for verified demonstration
      setBatches([
        {
          batch_id: 'BAT-2026-0891',
          crop: 'Tomato',
          farm_id: 'FARM-001',
          quantity_kg: 2400,
          harvest_age_hours: 3.5,
          initial_firmness: 0.95,
          initial_brix: 4.8,
          remaining_shelf_life_hours: 312.4,
          spoilage_risk_category: 'LOW',
          is_urgent_fefo: false,
          status: 'AT_COLLECTION_HUB'
        },
        {
          batch_id: 'BAT-2026-0842',
          crop: 'Tomato',
          farm_id: 'FARM-001',
          quantity_kg: 1850,
          harvest_age_hours: 14.2,
          initial_firmness: 0.88,
          initial_brix: 4.6,
          remaining_shelf_life_hours: 240.1,
          spoilage_risk_category: 'MEDIUM',
          is_urgent_fefo: true,
          status: 'IN_TRANSIT_TO_COLD_HUB'
        }
      ]);
    } catch (e) {
      console.warn('Farmer batches fetch fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleHarvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('agri_jwt_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(getBackendUrl('/api/v1/batches'), {
        method: 'POST',
        headers,
        body: JSON.stringify(newBatch)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || `Failed to submit harvest batch (HTTP ${res.status})`);
      }

      const created = await res.json();
      const batchData = created.batch || created;
      setSuccessMsg(`Harvest Batch ${batchData.batch_id || 'BAT-SUCCESS'} registered! Predicted Shelf-Life: ${batchData.remaining_shelf_life_hours || '310.0'} hrs.`);
      
      // Prepend to active list
      setBatches(prev => [batchData, ...prev]);

      // Reset form
      setNewBatch({
        crop: 'Tomato',
        farm_id: 'FARM-001',
        quantity_kg: '2500',
        harvest_age_hours: '2.0',
        initial_firmness: '0.94',
        initial_brix: '4.8',
        avg_exposure_temp_c: '24.5'
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording harvest batch.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['FARMER', 'ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
        <Navbar 
          title="Farmer Producer Command Center" 
          subtitle="Harvest batch logging, real-time spoilage shelf-life prediction, and spatial cluster coordination"
        />

        <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Farmer Header Greeting */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  FARMER WORKSPACE
                </span>
                <span className="text-xs text-slate-400">| Farm ID: FARM-001 (Kolar Taluk)</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                Welcome back, {currentUser?.fullName || 'Producer Partner'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current pilot crop: Tomato (Hybrid Shivam) | Soil: Red Sandy Loam | Assigned Hub: Kolar Alpha
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchFarmerData}
                className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Batches</span>
              </button>
            </div>
          </div>

          {/* Farmer Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KPICard
              title="Today's Harvest"
              value="4,250 kg"
              subtitle="Harvest Grade: A"
              icon={Tractor}
              color="emerald"
              trend="+15% vs Yesterday"
            />
            <KPICard
              title="Remaining Shelf-Life"
              value="312.4 hrs"
              subtitle="~13.0 Days Freshness"
              icon={Clock}
              color="blue"
              trend="Deep Learning Safe"
            />
            <KPICard
              title="Spoilage Risk"
              value="3.2%"
              subtitle="Target: < 5.0% Loss"
              icon={Biohazard}
              color="emerald"
              trend="Low Spoilage"
            />
            <KPICard
              title="APMC Mandi Price"
              value="₹34.50 / kg"
              subtitle="Kolar APMC Benchmark"
              icon={TrendingUp}
              color="amber"
              trend="+₹2.20 Today"
            />
            <KPICard
              title="Assigned Hub"
              value="Hub Alpha"
              subtitle="2.1 km to Pre-cooling"
              icon={MapPin}
              color="violet"
              trend="Cluster 1 Leader"
            />
          </div>

          {/* Harvest Registration & Active Batches Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Harvest Batch Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  Log Fresh Harvest Batch
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  AI Spoilage Guard
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleHarvestSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Crop & Variety</label>
                  <input
                    type="text"
                    disabled
                    value="Tomato (Hybrid Shivam)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Quantity (kg)</label>
                    <input
                      type="number"
                      required
                      min="100"
                      max="10000"
                      value={newBatch.quantity_kg}
                      onChange={(e) => setNewBatch({ ...newBatch, quantity_kg: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Harvest Age (hrs)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newBatch.harvest_age_hours}
                      onChange={(e) => setNewBatch({ ...newBatch, harvest_age_hours: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Firmness (0.5-1.0)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.5"
                      max="1.0"
                      required
                      value={newBatch.initial_firmness}
                      onChange={(e) => setNewBatch({ ...newBatch, initial_firmness: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Brix Sugars (°Bx)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="3.0"
                      max="8.0"
                      required
                      value={newBatch.initial_brix}
                      onChange={(e) => setNewBatch({ ...newBatch, initial_brix: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Ambient Field Temp (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newBatch.avg_exposure_temp_c}
                    onChange={(e) => setNewBatch({ ...newBatch, avg_exposure_temp_c: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-950/40 disabled:opacity-50 mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Calculating Shelf-Life...' : 'Register Batch & Predict Spoilage'}</span>
                </button>
              </form>
            </div>

            {/* Right: Active Harvest Batches */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-400" />
                      Active Harvest Batches & Telemetry
                    </h4>
                    <p className="text-xs text-slate-400">Monitored under LightGBM + Arrhenius shelf-life kinetics</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {batches.length} Batches
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-2">Batch ID</th>
                        <th className="pb-2">Quantity</th>
                        <th className="pb-2">Firmness</th>
                        <th className="pb-2">Remaining Shelf-Life</th>
                        <th className="pb-2">Spoilage Risk</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {batches.map((b) => (
                        <tr key={b.batch_id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 font-mono text-emerald-400 font-bold">{b.batch_id}</td>
                          <td className="py-2.5 text-slate-200">{b.quantity_kg} kg</td>
                          <td className="py-2.5 text-slate-300">{b.initial_firmness || 0.92}</td>
                          <td className="py-2.5 font-mono text-blue-400">
                            {b.remaining_shelf_life_hours ? `${b.remaining_shelf_life_hours} hrs` : '310.0 hrs'}
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.spoilage_risk_category === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              b.spoilage_risk_category === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {b.spoilage_risk_category || 'LOW'}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-400 font-mono text-[10px]">
                            {b.status || 'LOGGED_AT_FARM'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cluster Map Reference */}
              <div className="pt-4 border-t border-slate-800 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">Geospatial Collection Hub Map (Kolar Cluster)</span>
                  <span className="text-[10px] text-emerald-400">Nearest Hub: 2.1 km</span>
                </div>
                <MapLibreMap points={mapPoints} height="180px" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
