"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import AuthGuard from '@/components/AuthGuard';
import { 
  ShoppingCart, 
  Store, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck,
  PackageCheck,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
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
import { getStoredUser } from '@/lib/auth';

export default function RetailerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Order submission state
  const [newOrder, setNewOrder] = useState({
    retailer_code: 'RET-01',
    crop: 'Tomato',
    requested_quantity_kg: '1500',
    delivery_window: '07:00-10:00'
  });

  const [demandChartData] = useState([
    { day: 'Mon', actual: 1850, predicted: 1900 },
    { day: 'Tue', actual: 1620, predicted: 1650 },
    { day: 'Wed', actual: 1780, predicted: 1750 },
    { day: 'Thu', actual: 1950, predicted: 1920 },
    { day: 'Fri', actual: 2350, predicted: 2400 },
    { day: 'Sat', actual: 2800, predicted: 2850 },
    { day: 'Sun', actual: 2600, predicted: 2650 }
  ]);

  useEffect(() => {
    const user = getStoredUser();
    if (user) setCurrentUser(user);
    fetchRetailerData();
  }, []);

  const fetchRetailerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(getBackendUrl('/api/v1/retailers/orders'));
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      } else {
        setOrders([
          {
            id: 'ORD-2026-104',
            retailer_code: 'RET-01',
            crop: 'Tomato (Hybrid Shivam)',
            requested_quantity_kg: 1800,
            fulfilled_quantity_kg: 1800,
            order_date: '2026-11-18',
            delivery_window: '07:00-10:00',
            status: 'FULFILLED',
            freshness_index: '4.9/5.0'
          },
          {
            id: 'ORD-2026-108',
            retailer_code: 'RET-01',
            crop: 'Tomato (Hybrid Shivam)',
            requested_quantity_kg: 2200,
            fulfilled_quantity_kg: 2200,
            order_date: '2026-11-18',
            delivery_window: '07:00-10:00',
            status: 'DISPATCHED_REEFER',
            freshness_index: '4.8/5.0'
          }
        ]);
      }
    } catch (e) {
      console.warn('Retailer data fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('agri_jwt_token');
      const res = await fetch(getBackendUrl('/api/v1/retailers/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify(newOrder)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit order');
      }

      const created = await res.json();
      setSuccessMsg(`Order ${created.id || 'ORD-SUCCESS'} submitted successfully! Fulfillment scheduled for ${newOrder.delivery_window}.`);

      setOrders(prev => [created, ...prev]);

      setNewOrder({
        retailer_code: 'RET-01',
        crop: 'Tomato',
        requested_quantity_kg: '1500',
        delivery_window: '07:00-10:00'
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating retailer order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['RETAILER', 'ADMIN', 'PLANNER']}>
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
        <Navbar 
          title="Retail Supermarket Demand & Freshness Portal" 
          subtitle="Daily produce ordering, LSTM demand forecasting, and cold-chain arrival tracking"
        />

        <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 font-mono text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  RETAILER WORKSPACE
                </span>
                <span className="text-xs text-slate-400">| Supermarket Outlet: Indiranagar FreshMart (RET-01)</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                Store Operations: {currentUser?.fullName || 'Retail Partner'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Catchment: Bengaluru Central | Daily Produce Window: 07:00 - 10:00 AM | Guaranteed Freshness Score &gt; 4.5
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchRetailerData}
                className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Orders</span>
              </button>
              <Link
                href="/demand-forecasting"
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-violet-950/40"
              >
                <Sparkles className="w-4 h-4" />
                <span>Demand Forecast Model</span>
              </Link>
            </div>
          </div>

          {/* Retailer Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KPICard
              title="Predicted Demand"
              value="2,400 kg"
              subtitle="Weekend Surge Forecast"
              icon={TrendingUp}
              color="violet"
              trend="+18% vs Weekday"
            />
            <KPICard
              title="Today's Orders"
              value="2,200 kg"
              subtitle="100% Sourced"
              icon={ShoppingCart}
              color="emerald"
              trend="Fulfillment Active"
            />
            <KPICard
              title="Fulfillment Rate"
              value="98.6%"
              subtitle="High Freshness Index"
              icon={CheckCircle2}
              color="emerald"
              trend="Optimal"
            />
            <KPICard
              title="Arrival Freshness"
              value="4.9 / 5.0"
              subtitle="240+ hrs Remaining"
              icon={PackageCheck}
              color="blue"
              trend="Grade-A Quality"
            />
            <KPICard
              title="Delivery Window"
              value="07:00 - 10:00"
              subtitle="Morning Fresh Batch"
              icon={Clock}
              color="amber"
              trend="Reefer Dispatched"
            />
          </div>

          {/* Order Placement & Active Deliveries Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Place Daily Order Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-violet-400" />
                  Place Fresh Produce Order
                </h4>
                <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/30">
                  Daily Allocation
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleOrderSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Store Outlet</label>
                  <select
                    value={newOrder.retailer_code}
                    onChange={(e) => setNewOrder({ ...newOrder, retailer_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="RET-01">Indiranagar FreshMart (RET-01)</option>
                    <option value="RET-02">Koramangala GreenGrocers (RET-02)</option>
                    <option value="RET-03">HSR Layout Organic Basket (RET-03)</option>
                    <option value="RET-04">Whitefield HyperMarket (RET-04)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Produce Crop</label>
                  <input
                    type="text"
                    disabled
                    value="Tomato (Hybrid Shivam)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Requested Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    max="5000"
                    step="50"
                    value={newOrder.requested_quantity_kg}
                    onChange={(e) => setNewOrder({ ...newOrder, requested_quantity_kg: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Preferred Delivery Window</label>
                  <select
                    value={newOrder.delivery_window}
                    onChange={(e) => setNewOrder({ ...newOrder, delivery_window: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="06:00-09:00">Early Morning (06:00 - 09:00)</option>
                    <option value="07:00-10:00">Standard Morning (07:00 - 10:00)</option>
                    <option value="16:00-19:00">Evening Restock (16:00 - 19:00)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-violet-950/40 disabled:opacity-50 mt-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Order...' : 'Submit Produce Order'}</span>
                </button>
              </form>
            </div>

            {/* Right: Active Store Orders */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-violet-400" />
                      Active Daily Store Orders & Deliveries
                    </h4>
                    <p className="text-xs text-slate-400">Cold-chain tracked delivery to retail outlets</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {orders.length} Orders
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-2">Order ID</th>
                        <th className="pb-2">Outlet</th>
                        <th className="pb-2">Requested</th>
                        <th className="pb-2">Window</th>
                        <th className="pb-2">Freshness Score</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 font-mono text-violet-400 font-bold">{o.id}</td>
                          <td className="py-2.5 text-slate-200">{o.retailer_code}</td>
                          <td className="py-2.5 text-slate-300">{o.requested_quantity_kg} kg</td>
                          <td className="py-2.5 font-mono text-slate-400">{o.delivery_window}</td>
                          <td className="py-2.5 font-mono text-emerald-400">
                            {o.freshness_index || '4.9/5.0'}
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === 'FULFILLED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              o.status === 'DISPATCHED_REEFER' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {o.status || 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Demand Trend Chart */}
              <div className="pt-4 border-t border-slate-800 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">7-Day Retail Store Demand Trend (Actual vs Predicted)</span>
                  <span className="text-[10px] text-violet-400 font-mono">LSTM WAPE: 4.8%</span>
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demandChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Bar dataKey="actual" fill="#8b5cf6" name="Actual Sales (kg)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="predicted" fill="#10b981" name="Predicted Demand (kg)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
