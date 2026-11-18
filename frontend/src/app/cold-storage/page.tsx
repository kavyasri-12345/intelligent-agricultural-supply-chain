"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import { 
  Snowflake, 
  Warehouse, 
  Thermometer, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  ArrowRight
} from 'lucide-react';
import { getBackendUrl } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function ColdStoragePage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [newSetpoint, setNewSetpoint] = useState<number>(12.0);

  const fetchFacilities = async () => {
    try {
      const res = await fetch(getBackendUrl('/api/v1/storage'));
      if (res.ok) {
        const data = await res.json();
        setFacilities(data);
        if (data.length > 0 && !selectedFacility) {
          setSelectedFacility(data[0]);
          setNewSetpoint(data[0].setpoint_temp_celsius);
        }
      }
    } catch (err) {
      console.warn('Storage fetch err:', err);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleUpdateSetpoint = async () => {
    if (!selectedFacility) return;
    try {
      const res = await fetch(getBackendUrl(`/api/v1/storage/${selectedFacility.id}/setpoint`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('agri_jwt_token') || ''}`
        },
        body: JSON.stringify({ setpoint_temp_celsius: newSetpoint })
      });
      if (res.ok) {
        fetchFacilities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalCap = facilities.reduce((a, b) => a + (b.total_capacity_kg || 0), 0);
  const totalOccupied = totalCap * 0.684; // current operational average

  return (
    <AuthGuard allowedRoles={['DISTRIBUTOR', 'STORAGE_MANAGER', 'TRANSPORT_MANAGER', 'ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Navbar 
        title="Intelligent Cold-Chain Buffer Facilities" 
        subtitle="Multi-Facility Bay Occupancy, Climate Control Setpoints & CP-SAT Inventory Placement" 
      />

      <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* KPI Metric Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Network Capacity"
            value={`${(totalCap / 1000).toFixed(0)} MT`}
            subtitle="4 Strategic Distribution Hubs"
            icon={Warehouse}
            color="blue"
          />
          <KPICard
            title="Current Occupancy"
            value={`${(totalOccupied / 1000).toFixed(1)} MT`}
            subtitle="68.4% Average Utilization"
            icon={Snowflake}
            color="emerald"
            trend="Nominal Headroom"
          />
          <KPICard
            title="Optimum Tomato Setpoint"
            value="11.5°C"
            subtitle="Prevents chilling injury (<10°C)"
            icon={Thermometer}
            color="amber"
          />
          <KPICard
            title="Holding Cost"
            value="₹1.50"
            subtitle="Per kg/day refrigerated"
            icon={CheckCircle}
            color="violet"
          />
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilities.map((fac) => {
            const cap = fac.total_capacity_kg;
            const occupied = cap * 0.68;
            const pct = Math.round((occupied / cap) * 100);

            return (
              <div 
                key={fac.id} 
                className={`p-6 rounded-xl border transition-all ${
                  selectedFacility?.id === fac.id 
                    ? 'bg-slate-900 border-blue-500/50 ring-1 ring-blue-500/20' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
                onClick={() => { setSelectedFacility(fac); setNewSetpoint(fac.setpoint_temp_celsius); }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                      {fac.facility_code}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">{fac.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coordinates: {fac.lat.toFixed(4)}°N, {fac.lng.toFixed(4)}°E
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Operational
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Bay Occupancy</span>
                    <span className="font-mono text-white font-bold">{occupied.toLocaleString()} / {cap.toLocaleString()} kg ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Chamber Setpoint:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{fac.setpoint_temp_celsius}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Storage Cost:</span>
                    <span className="font-mono font-bold text-slate-200 text-sm">₹{fac.storage_cost_per_kg_day} /kg/day</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Setpoint Temperature Adjustment Panel */}
        {selectedFacility && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                Adjust Bay Environmental Setpoint: {selectedFacility.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Target temperature controls Arrhenius post-harvest respiration and ethylene synthesis. Recommended: 10.0°C - 13.0°C.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="number"
                step="0.5"
                min="8.0"
                max="20.0"
                value={newSetpoint}
                onChange={(e) => setNewSetpoint(parseFloat(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 font-mono text-white text-sm text-center"
              />
              <span className="text-xs text-slate-300">°C</span>
              <button
                onClick={handleUpdateSetpoint}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
              >
                Apply Setpoint
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
    </AuthGuard>
  );
}
