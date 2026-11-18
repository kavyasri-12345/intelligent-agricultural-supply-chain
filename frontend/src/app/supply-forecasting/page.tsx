"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import { 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  Cpu, 
  BarChart2, 
  Layers, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { getAiUrl } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function SupplyForecastingPage() {
  const [horizon, setHorizon] = useState<number>(7);
  const [model, setModel] = useState<string>('lightgbm');
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch(getAiUrl('/api/v1/forecast/supply'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop: 'tomato', horizon_days: horizon, model })
      });
      if (res.ok) {
        const data = await res.json();
        setForecastData(data);
      }

      const histRes = await fetch(getAiUrl('/api/v1/forecast/supply/historical?limit_days=21'));
      if (histRes.ok) {
        const hData = await histRes.json();
        setHistoricalData(hData);
      }
    } catch (e) {
      console.warn('Forecast fetch fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [horizon, model]);

  // Combine forecast series for chart
  const chartSeries = forecastData?.forecast?.map((f: any) => ({
    date: f.date,
    predicted: f.predicted_supply_kg,
    lower_p10: f.prediction_interval_p10,
    upper_p90: f.prediction_interval_p90,
    alert: f.alert
  })) || [];

  return (
    <AuthGuard allowedRoles={['FARMER', 'ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Navbar 
        title="Agricultural Supply Forecasting Engine" 
        subtitle="Multi-Horizon Autoregressive Trees, Sequence Deep Learning & Prediction Intervals" 
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Horizon Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Forecasting Horizon
              </label>
              <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {[3, 7, 14].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                      horizon === h
                        ? 'bg-emerald-600 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {h} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Model Architecture Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Model Architecture
              </label>
              <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {[
                  { id: 'lightgbm', label: 'LightGBM' },
                  { id: 'xgboost', label: 'XGBoost Quantile' },
                  { id: 'lstm', label: 'PyTorch LSTM' },
                  { id: 'seasonal_naive', label: 'Seasonal Naive' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                      model === m.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">District Focus</span>
            <span className="text-sm font-bold text-emerald-400">Kolar District Mandi Catchment</span>
          </div>
        </div>

        {/* Prediction Interval Curve & Ribbon */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {horizon}-Day Tomato Harvest Forecast with 90% Prediction Intervals
              </h3>
              <p className="text-xs text-slate-400">
                Median expected yield (y-hat) bounded by lower 10th percentile (p10) and upper 90th percentile (p90)
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-1 bg-emerald-400 rounded-full" />
                Predicted Supply (kg)
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-3 h-3 bg-blue-500/20 border border-blue-500/50 rounded" />
                Confidence Band (p10 - p90)
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartSeries} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="upper_p90" stroke="#38bdf8" strokeWidth={1} strokeDasharray="3 3" fill="#0284c7" fillOpacity={0.15} name="Upper 90% Bound" />
                <Area type="monotone" dataKey="lower_p10" stroke="#38bdf8" strokeWidth={1} strokeDasharray="3 3" fill="#0f172a" fillOpacity={1} name="Lower 10% Bound" />
                <Line type="monotone" dataKey="predicted" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 4 }} name="Expected Supply (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Benchmark Performance Cards */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            Rolling-Origin Model Evaluation Metrics (Kolar Test Partition)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {forecastData?.model_metrics && Object.entries(forecastData.model_metrics).map(([mName, mVals]: [string, any]) => (
              <div 
                key={mName}
                className={`p-5 rounded-xl border ${
                  mName === 'LightGBM' || (model === 'xgboost' && mName === 'XGBoost')
                    ? 'bg-emerald-950/20 border-emerald-500/40' 
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-bold text-slate-200">{mName}</h5>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {mName.includes('LSTM') ? 'Deep Learning' : 'Gradient Boosted'}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>MAE:</span>
                    <span className="font-mono text-white">{mVals.mae} kg</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>RMSE:</span>
                    <span className="font-mono text-white">{mVals.rmse} kg</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>WAPE:</span>
                    <span className="font-mono font-bold text-emerald-400">{(mVals.wape * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Forecast Breakdown Table with Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Detailed Daily Harvest Forecast Schedule</h4>
            <span className="text-xs text-slate-400">Aggregated across all 100 pilot farms</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Predicted Supply (kg)</th>
                  <th className="py-3 px-4">Lower Bound (p10)</th>
                  <th className="py-3 px-4">Upper Bound (p90)</th>
                  <th className="py-3 px-4">Status & Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {forecastData?.forecast?.map((f: any) => (
                  <tr key={f.horizon_day} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">Day {f.horizon_day}</td>
                    <td className="py-3 px-4 font-medium text-white">{f.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {f.predicted_supply_kg.toLocaleString()} kg
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {f.prediction_interval_p10.toLocaleString()} kg
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {f.prediction_interval_p90.toLocaleString()} kg
                    </td>
                    <td className="py-3 px-4">
                      {f.alert ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <AlertCircle className="w-3 h-3" />
                          {f.alert}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                          Nominal Inflow
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
