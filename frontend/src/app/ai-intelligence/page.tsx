"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import { 
  BrainCircuit, 
  Cpu, 
  BarChart2, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getBackendUrl } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function AIIntelligencePage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [supplyShap, setSupplyShap] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAiData = async () => {
    setLoading(true);
    try {
      const res = await fetch(getBackendUrl('/api/v1/analytics/ai-intelligence'));
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setSupplyShap(data.supply_shap);
      }
    } catch (err) {
      console.warn('AI Intel fetch err:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiData();
  }, []);

  // Format SHAP bar data
  const shapData = supplyShap?.feature_importance?.map((item: any) => ({
    feature: item.feature.split('(')[0].trim(),
    importance: Math.round(item.importance * 1000) / 10
  })) || [
    { feature: 'supply_lag_7', importance: 38.0 },
    { feature: 'temp_max', importance: 22.0 },
    { feature: 'supply_roll_mean_7', importance: 16.0 },
    { feature: 'rainfall_mm', importance: 11.0 },
    { feature: 'market_modal_price', importance: 8.0 },
    { feature: 'supply_lag_14', importance: 5.0 }
  ];

  return (
    <AuthGuard allowedRoles={['ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar 
        title="AI Intelligence & Explainability Center (XAI)" 
        subtitle="Empirical Model Benchmarks, SHAP Feature Importance & Deep Learning Validation Reports" 
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            title="Active Model Suites"
            value="3 Domains"
            subtitle="Supply, Demand & Spoilage"
            icon={BrainCircuit}
            color="emerald"
          />
          <KPICard
            title="Best Supply Forecaster"
            value="LightGBM"
            subtitle="WAPE: 25.4% (vs Naive 43.1%)"
            icon={TrendingUp}
            color="blue"
            trend="Lowest MAE"
          />
          <KPICard
            title="Demand Predictor"
            value="LightGBM"
            subtitle="WAPE: 11.3% (Store-level)"
            icon={BarChart2}
            color="violet"
            trend="High Precision"
          />
          <KPICard
            title="Spoilage Classification"
            value="XGBoost + LSTM"
            subtitle="ROC-AUC: 0.911 | Acc: 94.4%"
            icon={ShieldCheck}
            color="amber"
            trend="Calibrated"
          />
        </div>

        {/* SHAP Feature Importance Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                SHAP Global Feature Importance (Supply Forecasting - LightGBM)
              </h3>
              <p className="text-xs text-slate-500">
                Mean absolute SHAP value $|\phi_i|$ quantifying relative predictive contribution of agricultural covariates
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-semibold">
              TreeSHAP Explainer
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={shapData} margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" tick={{ fill: '#334155', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Bar dataKey="importance" fill="#059669" radius={[0, 6, 6, 0]} name="SHAP Contribution (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Empirical Benchmark Tables for All 3 Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Module A: Supply */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="pb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Module A: Supply Forecasting</h4>
              <p className="text-[11px] text-slate-500">7-Day Rolling Origin Validation</p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'LightGBM (Proposed)', mae: '1,791 kg', rmse: '2,174 kg', wape: '25.4%' },
                { name: 'XGBoost Regressor', mae: '2,684 kg', rmse: '2,995 kg', wape: '38.1%' },
                { name: 'PyTorch LSTM', mae: '3,036 kg', rmse: '3,369 kg', wape: '43.1%' },
                { name: 'Seasonal Naive Baseline', mae: '7,018 kg', rmse: '7,281 kg', wape: '99.5%' }
              ].map((m, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span>{m.name}</span>
                    <span className="font-mono text-emerald-700">{m.wape}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>MAE: {m.mae}</span>
                    <span>RMSE: {m.rmse}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module B: Demand */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="pb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Module B: Demand Forecasting</h4>
              <p className="text-[11px] text-slate-500">Store-level Restocking Evaluation</p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'LightGBM (Proposed)', mae: '105.5 kg', rmse: '134.1 kg', wape: '11.3%' },
                { name: 'XGBoost Regressor', mae: '106.3 kg', rmse: '135.5 kg', wape: '11.4%' },
                { name: 'PyTorch BiLSTM', mae: '795.0 kg', rmse: '831.1 kg', wape: '85.2%' }
              ].map((m, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span>{m.name}</span>
                    <span className="font-mono text-emerald-700">{m.wape}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>MAE: {m.mae}</span>
                    <span>RMSE: {m.rmse}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module D: Spoilage */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="pb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Module D: Spoilage Classification</h4>
              <p className="text-[11px] text-slate-500">Environmental Thermal Trajectory</p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'XGBoost Classifier', acc: '94.4%', f1: '0.80', roc: '0.911' },
                { name: 'Random Forest Baseline', acc: '88.9%', f1: '0.50', roc: '1.000' },
                { name: 'PyTorch Sensor LSTM', acc: '83.3%', f1: '0.00', roc: '0.422' }
              ].map((m, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span>{m.name}</span>
                    <span className="font-mono text-emerald-700">{m.acc}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>F1: {m.f1}</span>
                    <span>ROC-AUC: {m.roc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
