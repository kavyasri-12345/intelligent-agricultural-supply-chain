"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingCart, 
  Tractor, 
  Store, 
  Biohazard, 
  Snowflake, 
  Truck, 
  BrainCircuit, 
  Sliders, 
  LogOut,
  ShieldCheck,
  Wheat
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Executive Overview', href: '/', icon: LayoutDashboard },
  { name: 'Supply Forecasting', href: '/supply-forecasting', icon: TrendingUp },
  { name: 'Demand Forecasting', href: '/demand-forecasting', icon: ShoppingCart },
  { name: 'Farm Clustering', href: '/farm-management', icon: Tractor },
  { name: 'Retail Network', href: '/retailer-management', icon: Store },
  { name: 'Spoilage & Shelf Life', href: '/spoilage-intelligence', icon: Biohazard },
  { name: 'Cold Storage Hubs', href: '/cold-storage', icon: Snowflake },
  { name: 'Fleet & Routing', href: '/transportation', icon: Truck },
  { name: 'AI Intelligence (XAI)', href: '/ai-intelligence', icon: BrainCircuit },
  { name: 'Optimization Center', href: '/optimization-center', icon: Sliders },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('agri_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {}
    } else {
      // Default to planner for showcase
      setCurrentUser({ fullName: 'Aakash Verma', role: 'PLANNER', email: 'planner@agri.org' });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agri_jwt_token');
    localStorage.removeItem('agri_user');
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-900/40">
          <Wheat className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            Agri<span className="text-emerald-400">Optima</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Spoilage-Aware Supply Chain</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Decision Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.fullName || 'Active User'}</p>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 inline" />
                {currentUser?.role || 'PLANNER'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <Link
          href="/login"
          className="block text-center text-[11px] text-slate-400 hover:text-emerald-400 font-medium transition mt-1"
        >
          Switch Role Profile
        </Link>
      </div>
    </aside>
  );
}
