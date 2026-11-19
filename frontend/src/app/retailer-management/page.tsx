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
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Navbar 
        title="Urban Retail Distribution Network" 
        subtitle="Daily Replenishment Orders, Delivery Window Schedules & Demand Fulfillment Tracking" 
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Bengaluru Retail Outlets</h3>
            <p className="text-xs text-slate-500">20 Supermarket nodes synchronized with regional cold-chain delivery hubs</p>
          </div>
          <button
            onClick={() => setShowOrderModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-2 transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Place Retail Restocking Order</span>
          </button>
        </div>

        {/* 20 Retail Outlets Directory Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Registered Retail Outlets Directory</h4>
            <span className="text-xs text-slate-500">Coordinates mapped to PostGIS geographic nodes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Retail Outlet Name</th>
                  <th className="py-3 px-4">Urban Coordinates</th>
                  <th className="py-3 px-4">Avg Daily Demand</th>
                  <th className="py-3 px-4">Delivery Window</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {retailers.map((r) => (
                  <tr key={r.code} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{r.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {r.lat.toFixed(4)}°N, {r.lng.toFixed(4)}°E
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {r.daily_avg_demand} kg/day
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      06:30 - 09:30 AM
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
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
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  Place Daily Tomato Restocking Order
                </h4>
                <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-700 text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Select Retail Outlet</label>
                  <select
                    value={newOrder.retailer_code}
                    onChange={(e) => setNewOrder({ ...newOrder, retailer_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    {retailers.map((r) => (
                      <option key={r.code} value={r.code}>{r.name} ({r.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Requested Tomato Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    value={newOrder.requested_quantity_kg}
                    onChange={(e) => setNewOrder({ ...newOrder, requested_quantity_kg: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Preferred Morning Delivery Window</label>
                  <select
                    value={newOrder.delivery_window}
                    onChange={(e) => setNewOrder({ ...newOrder, delivery_window: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
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
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm"
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
