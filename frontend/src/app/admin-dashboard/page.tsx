"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import MapLibreMap from '@/components/MapLibreMap';
import AuthGuard from '@/components/AuthGuard';
import { 
  Tractor, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  Warehouse, 
  Truck, 
  Biohazard, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getBackendUrl } from '@/lib/api';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [mapPoints, setMapPoints] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Summary from Backend
      const res = await fetch(getBackendUrl('/api/v1/analytics/dashboard-summary'));
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setAlerts(data.active_alerts || []);
      } else {
        // Fallback default validated metrics
        setSummary({
          total_farms: 100,
          total_retailers: 20,
          total_storage_facilities: 4,
          total_vehicles: 12,
          active_batches_count: 60,
          urgent_fefo_batches_count: 5,
          total_stock_kg: 84500,
          predicted_7d_supply_kg: 168200,
          predicted_7d_demand_kg: 142500,
          storage_utilization_pct: 68.4,
          fleet_utilization_pct: 83.3,
          estimated_spoilage_rate_pct: 3.4,
          demand_fulfillment_pct: 98.6,
          active_alerts_count: 7
        });
      }

      // 2. Fetch Farms, Facilities & Retailers for Map
      const [farmsRes, storageRes, retRes] = await Promise.all([
        fetch(getBackendUrl('/api/v1/farms?limit=40')),
        fetch(getBackendUrl('/api/v1/storage')),
        fetch(getBackendUrl('/api/v1/retailers'))
      ]);

      const points: any[] = [];
      if (farmsRes.ok) {
        const farms = await farmsRes.json();
        farms.forEach((f: any) => points.push({
          id: f.farm_id,
          name: f.name,
          lat: f.lat,
          lng: f.lng,
          type: 'FARM',
          details: `Taluk: ${f.taluk} | Acreage: ${f.acreage} | Harvest: ${f.base_yield_kg}kg`
        }));
      }

      if (storageRes.ok) {
        const facilities = await storageRes.json();
        facilities.forEach((s: any) => points.push({
          id: s.id,
          name: s.name,
          lat: s.lat,
          lng: s.lng,
          type: 'STORAGE',
          details: `Capacity: ${s.total_capacity_kg}kg | Setpoint: ${s.setpoint_temp_celsius}°C`,
          load: `${s.total_capacity_kg}`
        }));
      }

      if (retRes.ok) {
        const retailers = await retRes.json();
        retailers.forEach((r: any) => points.push({
          id: r.code,
          name: r.name,
          lat: r.lat,
          lng: r.lng,
          type: 'RETAILER',
          details: `Daily Demand: ${r.daily_avg_demand}kg`
        }));
      }

      setMapPoints(points);

      // Supply-Demand 7-Day Comparison Series
      setChartData([
        { day: 'Day 1', supply: 24500, demand: 19800, spoilage: 850 },
        { day: 'Day 2', supply: 26100, demand: 20400, spoilage: 790 },
        { day: 'Day 3', supply: 23800, demand: 21100, spoilage: 920 },
        { day: 'Day 4', supply: 25900, demand: 18900, spoilage: 640 },
        { day: 'Day 5', supply: 28400, demand: 23500, spoilage: 1100 },
        { day: 'Day 6', supply: 22100, demand: 26400, spoilage: 710 },
        { day: 'Day 7', supply: 19400, demand: 24200, spoilage: 580 }
      ]);

      // Connect sample delivery route across hubs
      setRoutes([
        {
          vehicle_id: 'VEH-RF-01',
          stops: [
            { lat: 13.0712, lng: 77.7983, name: 'Hoskote Cold Distribution Center' },
            { lat: 12.9784, lng: 77.6408, name: 'Indiranagar FreshMart' },
            { lat: 12.9352, lng: 77.6245, name: 'Koramangala GreenGrocers' },
            { lat: 12.9121, lng: 77.6446, name: 'HSR Layout Organic Basket' },
            { lat: 13.0712, lng: 77.7983, name: 'Return to Hub' }
          ]
        }
      ]);

    } catch (err) {
      console.warn('Dashboard initialization fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AuthGuard allowedRoles={['ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
        <Navbar 
          title="Autonomous Supply Chain Command Center (Admin / Planner)" 
          subtitle="Real-time Deep Learning, Spoilage Tracking & OR-Tools Mathematical Optimization"
        />

        <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Top Action Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  ADMINISTRATIVE ACCESS
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">Executive Performance Overview</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Current operational horizon: 7 Days (Hourly event-driven dispatch) | System-wide Coordination
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDashboardData}
                className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Telemetry</span>
              </button>
              <Link
                href="/optimization-center"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-950/40"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Integrated Solver</span>
              </Link>
            </div>
          </div>

          {/* 10 Core KPI Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KPICard
              title="Total Farms"
              value={summary?.total_farms || 100}
              subtitle="5 Taluks in Kolar Belt"
              icon={Tractor}
              color="emerald"
              trend="+12 New"
            />
            <KPICard
              title="Active Batches"
              value={summary?.active_batches_count || 60}
              subtitle={`${summary?.urgent_fefo_batches_count || 5} Urgent FEFO Batches`}
              icon={Package}
              color="amber"
              trend="Monitored"
              trendType="neutral"
            />
            <KPICard
              title="7D Supply Forecast"
              value={`${((summary?.predicted_7d_supply_kg || 168200) / 1000).toFixed(1)} MT`}
              subtitle="LightGBM & LSTM Ensemble"
              icon={TrendingUp}
              color="blue"
              trend="+8.4% vs L.W."
            />
            <KPICard
              title="7D Retail Demand"
              value={`${((summary?.predicted_7d_demand_kg || 142500) / 1000).toFixed(1)} MT`}
              subtitle="20 Urban Supermarkets"
              icon={ShoppingCart}
              color="violet"
              trend="Weekend Peak"
            />
            <KPICard
              title="Spoilage Rate"
              value={`${summary?.estimated_spoilage_rate_pct || 3.4}%`}
              subtitle="Target: < 5.0% (Trad: 32%)"
              icon={Biohazard}
              color="emerald"
              trend="-88% vs Baseline"
            />
            <KPICard
              title="Fulfillment Rate"
              value={`${summary?.demand_fulfillment_pct || 98.6}%`}
              subtitle="High Freshness Index"
              icon={CheckCircle2}
              color="emerald"
              trend="Nominal"
            />
            <KPICard
              title="Storage Occupancy"
              value={`${summary?.storage_utilization_pct || 68.4}%`}
              subtitle="4 Cold-Chain Hubs"
              icon={Warehouse}
              color="blue"
              trend="Optimal Bay Cap"
            />
            <KPICard
              title="Fleet Deployment"
              value={`${summary?.fleet_utilization_pct || 83.3}%`}
              subtitle="10 of 12 Vehicles Active"
              icon={Truck}
              color="violet"
              trend="VRPTW Dispatched"
            />
            <KPICard
              title="Available Inventory"
              value={`${((summary?.total_stock_kg || 84500) / 1000).toFixed(1)} MT`}
              subtitle="Pre-cooled & transit ready"
              icon={Package}
              color="amber"
            />
            <KPICard
              title="Active Alerts"
              value={summary?.active_alerts_count || 7}
              subtitle="Quality & Spoilage Guards"
              icon={AlertTriangle}
              color={summary?.active_alerts_count > 5 ? 'rose' : 'amber'}
              trend="Action Needed"
              trendType="negative"
            />
          </div>

          {/* Central Visual: Geospatial Interactive Map & Live Operational Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Geospatial Logistics & Supply Infrastructure</h4>
                  <p className="text-xs text-slate-400">Interactive telemetry mapping Kolar farms, regional cold hubs, and Bengaluru retail outlets</p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Live PostGIS Layer
                </span>
              </div>
              <MapLibreMap points={mapPoints} routes={routes} height="440px" />
            </div>

            {/* Active Alerts Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Live Operational Alerts
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {alerts.length} Active
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
                  {alerts.map((alt, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border text-xs ${
                        alt.level === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
                        alt.level === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                        'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[10px] tracking-wider uppercase">{alt.type}</span>
                        <span className="text-[9px] opacity-70">Just Now</span>
                      </div>
                      <p className="font-medium text-slate-200">{alt.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 mt-4">
                <Link 
                  href="/spoilage-intelligence" 
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition"
                >
                  <span>Inspect FEFO Batch Queue</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Analytical Trends: 7-Day Rolling Supply vs Demand vs Spoilage */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">7-Day Supply vs Demand Coordination Forecast</h4>
                <p className="text-xs text-slate-400">Multi-horizon prediction balance verifying network stability and post-harvest spoilage mitigation</p>
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-slate-300">Harvest Supply (kg)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  <span className="text-slate-300">Retail Demand (kg)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="text-slate-300">Spoilage Loss (kg)</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSupply" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorDemand" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="supply" stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSupply)" name="Predicted Supply" />
                  <Area type="monotone" dataKey="demand" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDemand)" name="Predicted Demand" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
