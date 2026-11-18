"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Wheat,
  User,
  Users
} from 'lucide-react';
import { clearSession, getStoredUser } from '@/lib/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    } else {
      // Default fallback
      setCurrentUser({ fullName: 'Dr. Suresh Kumar', role: 'ADMIN', email: 'admin@agri.org' });
    }
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const role = (currentUser?.role || 'ADMIN').toUpperCase();
  const isAdminOrPlanner = role === 'ADMIN' || role === 'PLANNER';
  const isFarmer = role === 'FARMER';
  const isDistributor = role === 'DISTRIBUTOR' || role === 'TRANSPORT_MANAGER' || role === 'STORAGE_MANAGER';
  const isRetailer = role === 'RETAILER';

  // Role primary dashboard
  let primaryDashboard = { name: 'Admin Dashboard', href: '/admin-dashboard', icon: LayoutDashboard };
  if (isFarmer) {
    primaryDashboard = { name: 'Farmer Dashboard', href: '/farmer-dashboard', icon: Tractor };
  } else if (isDistributor) {
    primaryDashboard = { name: 'Distributor Dashboard', href: '/distributor-dashboard', icon: Truck };
  } else if (isRetailer) {
    primaryDashboard = { name: 'Retailer Dashboard', href: '/retailer-dashboard', icon: Store };
  }

  // Filtered Navigation based on Role
  let navSections: { sectionTitle: string; items: { name: string; href: string; icon: any }[] }[] = [];

  if (isAdminOrPlanner) {
    navSections = [
      {
        sectionTitle: 'Command Dashboards',
        items: [
          { name: 'Admin Command Center', href: '/admin-dashboard', icon: LayoutDashboard },
          { name: 'Farmer Operations View', href: '/farmer-dashboard', icon: Tractor },
          { name: 'Distributor Logistics View', href: '/distributor-dashboard', icon: Truck },
          { name: 'Retailer Demand View', href: '/retailer-dashboard', icon: Store },
        ]
      },
      {
        sectionTitle: 'Decision Modules',
        items: [
          { name: 'Supply Forecasting', href: '/supply-forecasting', icon: TrendingUp },
          { name: 'Demand Forecasting', href: '/demand-forecasting', icon: ShoppingCart },
          { name: 'Farm Clustering', href: '/farm-management', icon: Tractor },
          { name: 'Retail Network', href: '/retailer-management', icon: Store },
          { name: 'Spoilage & Shelf Life', href: '/spoilage-intelligence', icon: Biohazard },
          { name: 'Cold Storage Hubs', href: '/cold-storage', icon: Snowflake },
          { name: 'Fleet & Routing', href: '/transportation', icon: Truck },
          { name: 'AI Intelligence (XAI)', href: '/ai-intelligence', icon: BrainCircuit },
          { name: 'Optimization Center', href: '/optimization-center', icon: Sliders },
        ]
      }
    ];
  } else if (isFarmer) {
    navSections = [
      {
        sectionTitle: 'Farmer Workspace',
        items: [
          { name: 'Farmer Dashboard', href: '/farmer-dashboard', icon: Tractor },
          { name: 'Harvest & Spoilage', href: '/spoilage-intelligence', icon: Biohazard },
          { name: 'Farm Clustering Hubs', href: '/farm-management', icon: Tractor },
          { name: 'Supply Trends & Mandi', href: '/supply-forecasting', icon: TrendingUp },
        ]
      }
    ];
  } else if (isDistributor) {
    navSections = [
      {
        sectionTitle: 'Distributor Workspace',
        items: [
          { name: 'Distributor Hub', href: '/distributor-dashboard', icon: Truck },
          { name: 'Cold Storage Facilities', href: '/cold-storage', icon: Snowflake },
          { name: 'Fleet & VRPTW Routes', href: '/transportation', icon: Truck },
          { name: 'FEFO Spoilage Queue', href: '/spoilage-intelligence', icon: Biohazard },
          { name: 'Integrated Optimization', href: '/optimization-center', icon: Sliders },
        ]
      }
    ];
  } else if (isRetailer) {
    navSections = [
      {
        sectionTitle: 'Retailer Workspace',
        items: [
          { name: 'Retailer Dashboard', href: '/retailer-dashboard', icon: Store },
          { name: 'Store Orders & Network', href: '/retailer-management', icon: Store },
          { name: 'Demand Forecasting', href: '/demand-forecasting', icon: ShoppingCart },
          { name: 'Produce Freshness', href: '/spoilage-intelligence', icon: Biohazard },
        ]
      }
    ];
  }

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

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {sec.sectionTitle}
            </div>
            {sec.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-emerald-400 shrink-0">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.fullName || 'Active User'}</p>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 inline shrink-0" />
                <span className="truncate">{currentUser?.role || 'PLANNER'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition shrink-0"
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
