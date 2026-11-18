"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import { 
  Biohazard, 
  AlertTriangle, 
  Clock, 
  Thermometer, 
  ShieldAlert, 
  CheckCircle, 
  PlusCircle, 
  ArrowUpRight,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getBackendUrl } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function SpoilageIntelligencePage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [scenario, setScenario] = useState<string>('NORMAL');
  const [explanation, setExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newHarvest, setNewHarvest] = useState({
    farm_id: 'FRM-012',
    quantity_kg: '1500',
    harvest_age_hours: '14',
    initial_firmness: '0.94',
    initial_brix: '4.8',
    avg_exposure_temp_c: '28.5'
  });

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(getBackendUrl(`/api/v1/batches?scenario=${scenario}`));
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
        if (data.length > 0 && !selectedBatch) {
          setSelectedBatch(data[0]);
        }
      }
    } catch (err) {
      console.warn('Batches fetch err:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [scenario]);

  const handleInspectBatch = async (batch: any) => {
    setSelectedBatch(batch);
    try {
      const res = await fetch(getBackendUrl('/api/v1/batches/explain'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      });
      if (res.ok) {
        setExplanation(await res.json());
      }
    } catch (e) {
      console.warn('Explain err:', e);
    }
  };

  const handleHarvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(getBackendUrl('/api/v1/batches'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('agri_jwt_token') || ''}`
        },
        body: JSON.stringify(newHarvest)
      });
      if (res.ok) {
        setShowSubmitModal(false);
        fetchBatches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskColor = (cat: string) => {
    switch (cat) {
      case 'LOW': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'HIGH': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const urgentBatches = batches.filter(b => b.spoilage_risk_category === 'HIGH' || b.spoilage_risk_category === 'CRITICAL');

  return (
    <AuthGuard allowedRoles={['FARMER', 'DISTRIBUTOR', 'RETAILER', 'STORAGE_MANAGER', 'TRANSPORT_MANAGER', 'ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Navbar 
        title="Deep Learning Spoilage Engine & Arrhenius Shelf Life" 
        subtitle="Batch-Level Biological Deterioration Tracking, FEFO Priority Ordering & IoT Sensor Telemetry" 
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        {/* Scenario Controls & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Test Scenario:</span>
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[
                { id: 'NORMAL', label: 'Normal Operations' },
                { id: 'HEATWAVE', label: 'Heatwave (+6°C Ambient)' },
                { id: 'DEMAND_SPIKE', label: 'Demand Spike' },
                { id: 'FLEET_OUTAGE', label: 'Fleet Outage' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    scenario === s.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Harvest (Real-Time AI Inference)</span>
          </button>
        </div>

        {/* Top KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            title="Monitored Batches"
            value={batches.length}
            subtitle="Active post-harvest lots"
            icon={Biohazard}
            color="emerald"
          />
          <KPICard
            title="Urgent FEFO Dispatches"
            value={urgentBatches.length}
            subtitle="RSL < 48 hours"
            icon={AlertTriangle}
            color={urgentBatches.length > 5 ? 'rose' : 'amber'}
            trend="Priority Gated"
            trendType="negative"
          />
          <KPICard
            title="Average Shelf Life"
            value={`${(batches.reduce((a, b) => a + (b.remaining_shelf_life_hours || 0), 0) / Math.max(1, batches.length) / 24).toFixed(1)} Days`}
            subtitle="Arrhenius Q10 kinetic calculation"
            icon={Clock}
            color="blue"
          />
          <KPICard
            title="Model Accuracy (XGBoost/LSTM)"
            value="94.4%"
            subtitle="ROC-AUC: 0.911"
            icon={CheckCircle}
            color="emerald"
            trend="Calibrated"
          />
        </div>

        {/* Dual Panel: FEFO Prioritization Queue & Batch Detail Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: FEFO Batch Priority Queue */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Dynamic First-Expired, First-Out (FEFO) Queue</h4>
                <p className="text-xs text-slate-400">Batches ranked in ascending order of remaining shelf life hours</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                Sorted by Ascending RSL
              </span>
            </div>

            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4">FEFO Rank</th>
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-4">Origin Farm</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Remaining Shelf Life</th>
                    <th className="py-3 px-4">Spoilage Risk</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {batches.map((b) => (
                    <tr 
                      key={b.batch_id} 
                      onClick={() => handleInspectBatch(b)}
                      className={`cursor-pointer transition ${
                        selectedBatch?.batch_id === b.batch_id ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">#{b.fefo_priority_rank || '-'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">{b.batch_id}</td>
                      <td className="py-3 px-4 text-slate-300">{b.farm_id}</td>
                      <td className="py-3 px-4 font-mono">{b.quantity_kg} kg</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {b.remaining_shelf_life_hours} hrs ({Math.round(b.remaining_shelf_life_hours / 24 * 10) / 10}d)
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskColor(b.spoilage_risk_category)}`}>
                          {b.spoilage_risk_category} ({(b.spoilage_probability * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleInspectBatch(b); }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200"
                        >
                          Telemetry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: Selected Batch Telemetry & SHAP Explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-emerald-400" />
                  Thermal Telemetry Inspector
                </h4>
                <span className="text-xs font-mono text-slate-400">{selectedBatch?.batch_id}</span>
              </div>

              {selectedBatch ? (
                <div className="space-y-4">
                  {/* Key batch traits */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Harvest Age</span>
                      <span className="font-mono font-bold text-white">{selectedBatch.harvest_age_hours} hours</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Avg Exposure</span>
                      <span className="font-mono font-bold text-amber-400">{selectedBatch.avg_exposure_temp_c}°C</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Initial Firmness</span>
                      <span className="font-mono font-bold text-emerald-400">{selectedBatch.initial_firmness}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Soluble Brix</span>
                      <span className="font-mono font-bold text-blue-400">{selectedBatch.initial_brix}°Bx</span>
                    </div>
                  </div>

                  {/* Hourly Temperature Chart */}
                  {selectedBatch.telemetry_sequence && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Hourly Thermal Profile (°C)
                      </span>
                      <div className="h-36 w-full bg-slate-950 rounded-lg p-2 border border-slate-800">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedBatch.telemetry_sequence.slice(-16)}>
                            <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                            <XAxis dataKey="hour_step" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                            <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '10px' }} />
                            <Line type="monotone" dataKey="temp_c" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp (°C)" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* SHAP Explanation Attribution */}
                  {explanation && (
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Explainable AI Attribution
                      </span>
                      <div className="space-y-1.5 text-[11px]">
                        {explanation.attributions?.map((attr: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-slate-300">
                            <span className="truncate max-w-[160px]">{attr.factor}:</span>
                            <span className={`font-mono font-bold ${attr.direction === 'RISK_INCREASING' ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {attr.shap_delta > 0 ? `+${attr.shap_delta}` : attr.shap_delta}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Select a batch to inspect its environmental telemetry.</p>
              )}
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              <span className="font-bold text-amber-400 block mb-0.5">FEFO Routing Rule:</span>
              Batches with Remaining Shelf Life &lt; 48 hours are automatically prohibited from cold-storage buffer and routed directly to high-turnaround urban supermarkets.
            </div>
          </div>
        </div>

        {/* Modal: Harvest Submission Form */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Biohazard className="w-4 h-4 text-emerald-400" />
                  Submit Producer Harvest Batch
                </h4>
                <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={handleHarvestSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Farm ID</label>
                  <input
                    type="text"
                    required
                    value={newHarvest.farm_id}
                    onChange={(e) => setNewHarvest({ ...newHarvest, farm_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Quantity (kg)</label>
                    <input
                      type="number"
                      required
                      value={newHarvest.quantity_kg}
                      onChange={(e) => setNewHarvest({ ...newHarvest, quantity_kg: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Harvest Age (Hours)</label>
                    <input
                      type="number"
                      value={newHarvest.harvest_age_hours}
                      onChange={(e) => setNewHarvest({ ...newHarvest, harvest_age_hours: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Ambient Exposure Temp (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newHarvest.avg_exposure_temp_c}
                      onChange={(e) => setNewHarvest({ ...newHarvest, avg_exposure_temp_c: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Initial Firmness (0.0-1.0)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newHarvest.initial_firmness}
                      onChange={(e) => setNewHarvest({ ...newHarvest, initial_firmness: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 text-slate-950 font-bold hover:bg-emerald-500"
                  >
                    Run Spoilage Prediction & Save
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
