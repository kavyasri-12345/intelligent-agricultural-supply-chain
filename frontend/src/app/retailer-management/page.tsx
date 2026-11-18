"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import { 
  Store, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  PlusCircle, 
  TrendingUp,
  MapPin
} from 'lucide-react';
import { getBackendUrl } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function RetailerManagementPage() {
  const [retailers, setRetailers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    retailer_code: 'RET-IND-01',
    requested_quantity_kg: '950',
    delivery_window: '06:30-09:30 AM'
  });

  const fetchData = async () => {
    try {
      const [rRes, oRes] = await Promise.all([
        fetch(getBackendUrl('/api/v1/retailers')),
        fetch(getBackendUrl('/api/v1/retailers/orders'))
      ]);
      if (rRes.ok) setRetailers(await rRes.json());
      if (oRes.ok) setOrders(await oRes.json());
    } catch (err) {
      console.warn('Retailer fetch err:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(getBackendUrl('/api/v1/retailers/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('agri_jwt_token') || ''}`
        },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        setShowOrderModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthGuard allowedRoles={['RETAILER', 'ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Navbar 
        title="Urban Retail Distribution Network" 
        subtitle="Daily Replenishment Orders, Delivery Window Schedules & Demand Fulfillment Tracking" 
      />

      <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Summary */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Bengaluru Retail Outlets</h3>
            <p className="text-xs text-slate-400">20 Supermarket nodes synchronized with regional cold-chain delivery hubs</p>
          </div>
          <button
            onClick={() => setShowOrderModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Place Retail Restocking Order</span>
          </button>
        </div>

        {/* 20 Retail Outlets Directory Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Registered Retail Outlets Directory</h4>
            <span className="text-xs text-slate-400">Coordinates mapped to PostGIS geographic nodes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Retail Outlet Name</th>
                  <th className="py-3 px-4">Urban Coordinates</th>
                  <th className="py-3 px-4">Avg Daily Demand</th>
                  <th className="py-3 px-4">Delivery Window</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {retailers.map((r) => (
                  <tr key={r.code} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{r.code}</td>
                    <td className="py-3 px-4 font-semibold text-white">{r.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {r.lat.toFixed(4)}°N, {r.lng.toFixed(4)}°E
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {r.daily_avg_demand} kg/day
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      06:30 - 09:30 AM
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Active Service
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Order Placement */}
        {showOrderModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  Place Daily Tomato Restocking Order
                </h4>
                <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-white text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Select Retail Outlet</label>
                  <select
                    value={newOrder.retailer_code}
                    onChange={(e) => setNewOrder({ ...newOrder, retailer_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {retailers.map((r) => (
                      <option key={r.code} value={r.code}>{r.name} ({r.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Requested Tomato Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    value={newOrder.requested_quantity_kg}
                    onChange={(e) => setNewOrder({ ...newOrder, requested_quantity_kg: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Preferred Morning Delivery Window</label>
                  <select
                    value={newOrder.delivery_window}
                    onChange={(e) => setNewOrder({ ...newOrder, delivery_window: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="06:00-08:00 AM">06:00 - 08:00 AM (Early Commercial)</option>
                    <option value="07:00-09:30 AM">07:00 - 09:30 AM (Standard Supermarket)</option>
                    <option value="08:30-11:00 AM">08:30 - 11:00 AM (Wholesale Depot)</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 text-slate-950 font-bold hover:bg-emerald-500"
                  >
                    Submit Order
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
