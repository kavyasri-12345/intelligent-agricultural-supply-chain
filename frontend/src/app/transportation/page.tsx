"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import MapLibreMap from '@/components/MapLibreMap';
import { 
  Truck, 
  Navigation, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Snowflake,
  Fuel
} from 'lucide-react';
import { getBackendUrl, getAiUrl } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function TransportationPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  const fetchTransportData = async () => {
    try {
      const vRes = await fetch(getBackendUrl('/api/v1/transport/vehicles'));
      if (vRes.ok) setVehicles(await vRes.json());

      // Fetch sample VRPTW solution routes
      const optRes = await fetch(getAiUrl('/api/v1/optimization/solve'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'NORMAL' })
      });
      if (optRes.ok) {
        const sol = await optRes.json();
        const r = sol.vehicle_routing?.routes || [];
        setActiveRoutes(r);
        if (r.length > 0) setSelectedRoute(r[0]);
      }
    } catch (err) {
      console.warn('Transport fetch err:', err);
    }
  };

  useEffect(() => {
    fetchTransportData();
  }, []);

  return (
    <AuthGuard allowedRoles={['DISTRIBUTOR', 'TRANSPORT_MANAGER', 'ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Navbar 
        title="Fleet Logistics & VRPTW Route Dispatch" 
        subtitle="Capacitated Vehicle Routing with Time Windows, Cold-Chain Compartments & Delivery Timelines" 
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        {/* KPI Metric Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            title="Active Fleet Size"
            value={vehicles.length}
            subtitle="4 Reefers, 4 Vans, 4 Pickups"
            icon={Truck}
            color="emerald"
          />
          <KPICard
            title="Cold-Chain Reefer Fleet"
            value="4 Trucks"
            subtitle="Active chilling 4-10°C"
            icon={Snowflake}
            color="blue"
            trend="100% Online"
          />
          <KPICard
            title="Total Dispatched Distance"
            value={`${activeRoutes.reduce((a, b) => a + (b.route_distance_km || 0), 0).toFixed(1)} km`}
            subtitle="NH-75 / Peri-urban corridors"
            icon={Navigation}
            color="violet"
          />
          <KPICard
            title="Delivered Produce"
            value={`${(activeRoutes.reduce((a, b) => a + (b.carried_load_kg || 0), 0) / 1000).toFixed(1)} MT`}
            subtitle="Zero time-window violations"
            icon={CheckCircle}
            color="amber"
          />
        </div>

        {/* Fleet Route Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">Multi-Drop Delivery Corridors (VRPTW Optimal Solution)</h3>
            <span className="text-xs font-mono text-emerald-400">Google OR-Tools Guided Local Search</span>
          </div>
          <MapLibreMap routes={activeRoutes} height="420px" />
        </div>

        {/* Dual Panel: Fleet Vehicles & Route Turn-by-Turn */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Vehicles Directory */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Heterogeneous Fleet Directory</h4>
              <p className="text-xs text-slate-400">Classified by refrigeration capability</p>
            </div>

            <div className="divide-y divide-slate-800 max-h-[420px] overflow-y-auto">
              {vehicles.map((v) => (
                <div key={v.id} className="p-3.5 hover:bg-slate-800/50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-white">{v.plate}</span>
                    {v.is_refrigerated ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        <Snowflake className="w-2.5 h-2.5" />
                        Reefer
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Ambient / Van
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Capacity: <strong className="text-slate-200">{v.capacity_kg} kg</strong></span>
                    <span>Cost: <strong className="text-slate-200">₹{v.cost_per_km}/km</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 2 Cols: Dispatched Route Schedules */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">Active Delivery Timelines & Manifest</h4>
                <p className="text-xs text-slate-400">Arrival minutes calculated with 20-min store unloading window</p>
              </div>
              <span className="text-xs font-mono text-emerald-400">{activeRoutes.length} Routes Assigned</span>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {activeRoutes.map((r, rIdx) => (
                <div key={rIdx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Truck className={`w-4 h-4 ${r.is_refrigerated ? 'text-blue-400' : 'text-emerald-400'}`} />
                      <span className="font-bold text-white text-xs">{r.plate_number} ({r.vehicle_type})</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {r.carried_load_kg} / {r.capacity_kg} kg ({r.utilization_pct}%)
                    </span>
                  </div>

                  {/* Stops progression */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    {r.stops?.map((s: any, sIdx: number) => (
                      <div key={sIdx} className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        <span className="text-slate-400 font-mono">[{s.estimated_time || `${s.arrival_minute}m`}]</span>
                        <span className="text-white font-medium truncate max-w-[140px]">{s.name}</span>
                        {sIdx < r.stops.length - 1 && <span className="text-slate-600">→</span>}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Stops: {r.stops_count} Supermarkets</span>
                    <span>Distance: {r.route_distance_km} km</span>
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
