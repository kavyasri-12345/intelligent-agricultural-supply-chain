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

  const defaultVehicles = [
    { id: 1, plate: 'KA-04-E-1044', vehicle_type: 'Reefer Truck', capacity_kg: 2500, cost_per_km: 18.5, is_refrigerated: true },
    { id: 2, plate: 'KA-04-E-2190', vehicle_type: 'Reefer Truck', capacity_kg: 2500, cost_per_km: 18.5, is_refrigerated: true },
    { id: 3, plate: 'KA-04-E-3301', vehicle_type: 'Reefer Truck', capacity_kg: 3000, cost_per_km: 20.0, is_refrigerated: true },
    { id: 4, plate: 'KA-04-E-4552', vehicle_type: 'Reefer Truck', capacity_kg: 3000, cost_per_km: 20.0, is_refrigerated: true },
    { id: 5, plate: 'KA-04-E-8831', vehicle_type: 'Insulated Van', capacity_kg: 1500, cost_per_km: 14.0, is_refrigerated: false },
    { id: 6, plate: 'KA-04-E-9022', vehicle_type: 'Insulated Van', capacity_kg: 1500, cost_per_km: 14.0, is_refrigerated: false },
    { id: 7, plate: 'KA-04-E-7124', vehicle_type: 'Pickup Flatbed', capacity_kg: 1000, cost_per_km: 11.5, is_refrigerated: false },
    { id: 8, plate: 'KA-04-E-6218', vehicle_type: 'Pickup Flatbed', capacity_kg: 1000, cost_per_km: 11.5, is_refrigerated: false }
  ];

  const defaultRoutes = [
    {
      vehicle_id: 1,
      plate_number: 'KA-04-E-1044',
      vehicle_type: 'Reefer Truck',
      carried_load_kg: 2400,
      capacity_kg: 2500,
      utilization_pct: 96,
      stops_count: 4,
      route_distance_km: 74.2,
      is_refrigerated: true,
      color: '#059669',
      coordinates: [
        [78.1292, 13.1367],
        [77.7981, 13.0711],
        [77.7500, 12.9698],
        [77.6387, 12.9352]
      ],
      stops: [
        { name: 'Kolar Pre-Cool Hub', arrival_minute: 0, estimated_time: '06:00 AM' },
        { name: 'Hoskote Cross-Dock', arrival_minute: 45, estimated_time: '06:45 AM' },
        { name: 'More Megastore Whitefield', arrival_minute: 90, estimated_time: '07:30 AM' },
        { name: 'Fresh Basket Koramangala', arrival_minute: 140, estimated_time: '08:20 AM' }
      ]
    },
    {
      vehicle_id: 2,
      plate_number: 'KA-04-E-2190',
      vehicle_type: 'Reefer Truck',
      carried_load_kg: 2350,
      capacity_kg: 2500,
      utilization_pct: 94,
      stops_count: 3,
      route_distance_km: 68.5,
      is_refrigerated: true,
      color: '#0284c7',
      coordinates: [
        [78.1292, 13.1367],
        [77.7981, 13.0711],
        [77.6412, 12.9716],
        [77.5946, 12.9299]
      ],
      stops: [
        { name: 'Kolar Pre-Cool Hub', arrival_minute: 0, estimated_time: '06:15 AM' },
        { name: 'Spencers Indiranagar', arrival_minute: 85, estimated_time: '07:40 AM' },
        { name: 'Nature Basket Jayanagar', arrival_minute: 130, estimated_time: '08:25 AM' }
      ]
    },
    {
      vehicle_id: 5,
      plate_number: 'KA-04-E-8831',
      vehicle_type: 'Insulated Van',
      carried_load_kg: 1400,
      capacity_kg: 1500,
      utilization_pct: 93,
      stops_count: 3,
      route_distance_km: 42.1,
      is_refrigerated: false,
      color: '#8b5cf6',
      coordinates: [
        [77.7981, 13.0711],
        [77.5407, 13.0281],
        [77.5701, 13.0034]
      ],
      stops: [
        { name: 'Hoskote Cross-Dock', arrival_minute: 0, estimated_time: '07:00 AM' },
        { name: 'Yeshwanthpur Wholesale', arrival_minute: 60, estimated_time: '08:00 AM' },
        { name: 'Smart Bazaar Malleshwaram', arrival_minute: 95, estimated_time: '08:35 AM' }
      ]
    }
  ];

  const fetchTransportData = async () => {
    try {
      const vRes = await fetch(getBackendUrl('/api/v1/transport/vehicles'));
      if (vRes.ok) {
        const vData = await vRes.json();
        if (Array.isArray(vData) && vData.length > 0) setVehicles(vData);
        else setVehicles(defaultVehicles);
      } else {
        setVehicles(defaultVehicles);
      }

      const optRes = await fetch(getAiUrl('/api/v1/optimization/solve'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'NORMAL' })
      });
      if (optRes.ok) {
        const sol = await optRes.json();
        const r = sol.vehicle_routing?.routes || [];
        if (r.length > 0) {
          setActiveRoutes(r);
          setSelectedRoute(r[0]);
          return;
        }
      }
    } catch (err) {
      console.warn('Transport fallback activated:', err);
    }
    setVehicles(defaultVehicles);
    setActiveRoutes(defaultRoutes);
    setSelectedRoute(defaultRoutes[0]);
  };

  useEffect(() => {
    fetchTransportData();
  }, []);

  return (
    <AuthGuard allowedRoles={['DISTRIBUTOR', 'TRANSPORT_MANAGER', 'ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900">
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
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Multi-Drop Delivery Corridors (VRPTW Optimal Solution)</h3>
            <span className="text-xs font-mono text-emerald-700 font-semibold">Google OR-Tools Guided Local Search</span>
          </div>
          <MapLibreMap routes={activeRoutes} height="420px" />
        </div>

        {/* Dual Panel: Fleet Vehicles & Route Turn-by-Turn */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Vehicles Directory */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Heterogeneous Fleet Directory</h4>
              <p className="text-xs text-slate-500">Classified by refrigeration capability</p>
            </div>

            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
              {vehicles.map((v) => (
                <div key={v.id} className="p-3.5 hover:bg-slate-50/70 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-slate-900">{v.plate}</span>
                    {v.is_refrigerated ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        <Snowflake className="w-2.5 h-2.5" />
                        Reefer
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        Ambient / Van
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Capacity: <strong className="text-slate-800">{v.capacity_kg} kg</strong></span>
                    <span>Cost: <strong className="text-slate-800">₹{v.cost_per_km}/km</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 2 Cols: Dispatched Route Schedules */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Active Delivery Timelines & Manifest</h4>
                <p className="text-xs text-slate-500">Arrival minutes calculated with 20-min store unloading window</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700">{activeRoutes.length} Routes Assigned</span>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {activeRoutes.map((r, rIdx) => (
                <div key={rIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Truck className={`w-4 h-4 ${r.is_refrigerated ? 'text-blue-600' : 'text-emerald-600'}`} />
                      <span className="font-bold text-slate-900 text-xs">{r.plate_number} ({r.vehicle_type})</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {r.carried_load_kg} / {r.capacity_kg} kg ({r.utilization_pct}%)
                    </span>
                  </div>

                  {/* Stops progression */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 text-[11px]">
                    {r.stops?.map((s: any, sIdx: number) => (
                      <div key={sIdx} className="flex items-center space-x-1.5 bg-white px-2 py-1 rounded border border-slate-200 shadow-xs">
                        <span className="text-slate-500 font-mono">[{s.estimated_time || `${s.arrival_minute}m`}]</span>
                        <span className="text-slate-800 font-medium truncate max-w-[140px]">{s.name}</span>
                        {sIdx < r.stops.length - 1 && <span className="text-slate-400">→</span>}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
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
