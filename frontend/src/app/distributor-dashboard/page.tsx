"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import MapLibreMap from '@/components/MapLibreMap';
import AuthGuard from '@/components/AuthGuard';
import { 
  Truck, 
  Warehouse, 
  Clock, 
  Thermometer, 
  Biohazard, 
  CheckCircle2, 
  RefreshCw, 
  ArrowUpRight,
  ShieldCheck,
  Navigation,
  Sliders
} from 'lucide-react';
import Link from 'next/link';
import { getBackendUrl } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function DistributorDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [mapPoints, setMapPoints] = useState<any[]>([
    { id: 'HUB-01', name: 'Hoskote Central Cold Hub', lat: 13.0712, lng: 77.7983, type: 'STORAGE', details: 'Capacity: 50 MT | Setpoint: 4°C' },
    { id: 'HUB-02', name: 'Kolar APMC Cold Facility', lat: 13.1367, lng: 78.1291, type: 'STORAGE', details: 'Capacity: 40 MT | Setpoint: 4°C' },
    { id: 'RET-01', name: 'Indiranagar FreshMart', lat: 12.9784, lng: 77.6408, type: 'RETAILER', details: 'Delivery Window: 07:00-09:30' },
    { id: 'RET-02', name: 'Koramangala GreenGrocers', lat: 12.9352, lng: 77.6245, type: 'RETAILER', details: 'Delivery Window: 08:00-10:00' },
    { id: 'RET-03', name: 'HSR Layout Organic Basket', lat: 12.9121, lng: 77.6446, type: 'RETAILER', details: 'Delivery Window: 07:30-10:00' }
  ]);

  const [routes, setRoutes] = useState<any[]>([
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

  useEffect(() => {
    const user = getStoredUser();
    if (user) setCurrentUser(user);
    fetchDistributorData();
  }, []);

  const defaultFacilities = [
    { id: 'WH-01', name: 'Hoskote Central Cold Hub', total_capacity_kg: 50000, current_utilization_kg: 34500, setpoint_temp_celsius: 4.0 },
    { id: 'WH-02', name: 'Kolar APMC Cold Facility', total_capacity_kg: 40000, current_utilization_kg: 27200, setpoint_temp_celsius: 4.5 },
    { id: 'WH-03', name: 'Malur Pre-cooling Unit', total_capacity_kg: 25000, current_utilization_kg: 18100, setpoint_temp_celsius: 4.0 },
    { id: 'WH-04', name: 'Bangarapet Hub', total_capacity_kg: 25000, current_utilization_kg: 15900, setpoint_temp_celsius: 5.0 }
  ];

  const defaultVehicles = [
    { id: 'VEH-RF-01', type: 'Refrigerated 3.5T', capacity_kg: 3500, current_temp_c: 4.2, status: 'EN_ROUTE', eta_next_stop: '18 mins' },
    { id: 'VEH-RF-02', type: 'Refrigerated 3.5T', capacity_kg: 3500, current_temp_c: 4.0, status: 'EN_ROUTE', eta_next_stop: '32 mins' },
    { id: 'VEH-RF-03', type: 'Refrigerated 5.0T', capacity_kg: 5000, current_temp_c: 4.8, status: 'LOADING_AT_HUB', eta_next_stop: 'Departs 06:30' },
    { id: 'VEH-RF-04', type: 'Refrigerated 2.5T', capacity_kg: 2500, current_temp_c: 4.1, status: 'STANDBY', eta_next_stop: 'Available' }
  ];

  const fetchDistributorData = async () => {
    setLoading(true);
    try {
      try {
        const storageRes = await fetch(getBackendUrl('/api/v1/storage'));
        if (storageRes.ok) {
          const s = await storageRes.json();
          if (Array.isArray(s) && s.length > 0) setFacilities(s);
          else setFacilities(defaultFacilities);
        } else {
          setFacilities(defaultFacilities);
        }
      } catch (e) {
        setFacilities(defaultFacilities);
      }

      try {
        const fleetRes = await fetch(getBackendUrl('/api/v1/transport/vehicles'));
        if (fleetRes.ok) {
          const f = await fleetRes.json();
          const vList = Array.isArray(f) ? f : (f.vehicles || []);
          if (vList.length > 0) setVehicles(vList);
          else setVehicles(defaultVehicles);
        } else {
          setVehicles(defaultVehicles);
        }
      } catch (e) {
        setVehicles(defaultVehicles);
      }
    } catch (e) {
      console.warn('Distributor data fallback:', e);
      setFacilities(defaultFacilities);
      setVehicles(defaultVehicles);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['DISTRIBUTOR', 'TRANSPORT_MANAGER', 'STORAGE_MANAGER', 'ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
        <Navbar 
          title="Distributor & Cold-Chain Logistics Hub" 
          subtitle="Refrigerated fleet dispatch, cold hub bay allocation, and VRPTW delivery routing"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-mono text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  DISTRIBUTOR WORKSPACE
                </span>
                <span className="text-xs text-slate-500">| Regional Logistics Hub: Hoskote & Kolar</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1">
                Logistics Command: {currentUser?.fullName || 'Distributor Coordinator'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active Cold Fleet: 10 / 12 Vehicles Active | Target Transit Temp: 4.0°C | FEFO Dispatch Priority
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDistributorData}
                className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Refresh Telematics</span>
              </button>
              <Link
                href="/transportation"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-2 transition shadow-sm"
              >
                <Navigation className="w-4 h-4" />
                <span>Optimize VRPTW Routes</span>
              </Link>
            </div>
          </div>

          {/* Distributor KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <KPICard
              title="Active Fleet"
              value="10 / 12"
              subtitle="Refrigerated Reefer Fleet"
              icon={Truck}
              color="violet"
              trend="83.3% Deployed"
            />
            <KPICard
              title="Cold Hub Capacity"
              value="68.4%"
              subtitle="95.7 MT in Storage"
              icon={Warehouse}
              color="blue"
              trend="Optimal Bay Cap"
            />
            <KPICard
              title="On-Time Delivery"
              value="98.2%"
              subtitle="Within Retail Windows"
              icon={CheckCircle2}
              color="emerald"
              trend="Target: > 95%"
            />
            <KPICard
              title="Transit Spoilage"
              value="0.8%"
              subtitle="Cold-Chain Loss Rate"
              icon={Biohazard}
              color="emerald"
              trend="-90% vs Ambient"
            />
            <KPICard
              title="Avg Reefer Temp"
              value="4.2°C"
              subtitle="Target: 4.0°C - 5.0°C"
              icon={Thermometer}
              color="blue"
              trend="Stable Cooling"
            />
          </div>

          {/* Map & Active Fleet Telematics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Interactive Logistics Map */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">Active VRPTW Transit Routes</h4>
                  <p className="text-xs text-slate-500">Real-time GPS telematics from Kolar collection hubs to Bengaluru retail supermarkets</p>
                </div>
                <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                  OR-Tools Solver Connected
                </span>
              </div>
              <MapLibreMap points={mapPoints} routes={routes} height="380px" />
            </div>

            {/* Right: Fleet Vehicles Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    Fleet Reefer Telematics
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    Live Sensors
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                  {vehicles.map((v) => (
                    <div key={v.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-slate-900">{v.id}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          v.status === 'EN_ROUTE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          v.status === 'LOADING_AT_HUB' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {v.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px] mt-1">
                        <span>Cap: {v.capacity_kg} kg</span>
                        <span className="font-mono text-blue-700 flex items-center gap-1 font-semibold">
                          <Thermometer className="w-3 h-3" />
                          {v.current_temp_c}°C
                        </span>
                        <span>ETA: {v.eta_next_stop}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 mt-4">
                <Link
                  href="/transportation"
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center space-x-2 transition"
                >
                  <span>Detailed Fleet Dispatch & Routing</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Cold Storage Hub Allocation Overview */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">Cold Storage Facilities & Bay Occupancy</h4>
                <p className="text-xs text-slate-500">Pre-cooling and multi-chamber cold hubs with FEFO inventory prioritisation</p>
              </div>
              <Link
                href="/cold-storage"
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <span>Adjust Climate Setpoints</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {facilities.map((fac) => {
                const utilPct = Math.round(((fac.current_utilization_kg || 25000) / fac.total_capacity_kg) * 100);
                return (
                  <div key={fac.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">{fac.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        {fac.setpoint_temp_celsius}°C
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Utilization</span>
                        <span className="font-bold text-slate-800">{utilPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${utilPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Cap: {(fac.total_capacity_kg / 1000).toFixed(0)} MT</span>
                      <span>Bay: Active FEFO</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
