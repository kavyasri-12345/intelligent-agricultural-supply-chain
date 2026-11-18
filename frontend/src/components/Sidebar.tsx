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
  X
} from 'lucide-react';
import { clearSession, getStoredUser } from '@/lib/auth';
import { useNav } from '@/context/NavContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, closeSidebar } = useNav();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser({ fullName: 'Dr. Suresh Kumar', role: 'ADMIN', email: 'admin@agri.org' });
    }
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    closeSidebar();
    router.push('/login');
  };

  const handleLinkClick = () => {
    closeSidebar();
  };

  const role = (currentUser?.role || 'ADMIN').toUpperCase();
  const isAdminOrPlanner = role === 'ADMIN' || role === 'PLANNER';
  const isFarmer = role === 'FARMER';
  const isDistributor = role === 'DISTRIBUTOR' || role === 'TRANSPORT_MANAGER' || role === 'STORAGE_MANAGER';
  const isRetailer = role === 'RETAILER';

  // Navigation sections filtered by user role
  let navSections: { sectionTitle: string; items: { name: string; href: string; icon: any }[] }[] = [];

  if (isAdminOrPlanner) {
    navSections = [
      {
        sectionTitle: 'Command Portals',
        items: [
          { name: 'Admin Command Center', href: '/admin-dashboard', icon: LayoutDashboard },
          { name: 'Farmer Production View', href: '/farmer-dashboard', icon: Tractor },
          { name: 'Logistics & Fleet View', href: '/distributor-dashboard', icon: Truck },
          { name: 'Retailer Demand View', href: '/retailer-dashboard', icon: Store },
        ]
      },
      {
        sectionTitle: 'Supply Chain Operations',
        items: [
          { name: 'Supply Forecasting', href: '/supply-forecasting', icon: TrendingUp },
          { name: 'Demand Forecasting', href: '/demand-forecasting', icon: ShoppingCart },
          { name: 'Farm Spatial Clustering', href: '/farm-management', icon: Tractor },
          { name: 'Retail Store Network', href: '/retailer-management', icon: Store },
          { name: 'Spoilage & Shelf Life', href: '/spoilage-intelligence', icon: Biohazard },
          { name: 'Cold Storage Facilities', href: '/cold-storage', icon: Snowflake },
          { name: 'Fleet Telematics & Routing', href: '/transportation', icon: Truck },
          { name: 'Forecasting Analytics', href: '/ai-intelligence', icon: BrainCircuit },
          { name: 'Optimization Engine', href: '/optimization-center', icon: Sliders },
        ]
      }
    ];
  } else if (isFarmer) {
    navSections = [
      {
        sectionTitle: 'Producer Portal',
        items: [
          { name: 'Farmer Dashboard', href: '/farmer-dashboard', icon: Tractor },
          { name: 'Harvest Batch Records', href: '/spoilage-intelligence', icon: Biohazard },
          { name: 'Collection Hubs', href: '/farm-management', icon: Tractor },
          { name: 'Mandi Prices & Trends', href: '/supply-forecasting', icon: TrendingUp },
        ]
      }
    ];
  } else if (isDistributor) {
    navSections = [
      {
        sectionTitle: 'Logistics Operations',
        items: [
          { name: 'Distributor Dashboard', href: '/distributor-dashboard', icon: Truck },
          { name: 'Cold Storage Hubs', href: '/cold-storage', icon: Snowflake },
          { name: 'Vehicle Fleet & Routes', href: '/transportation', icon: Truck },
          { name: 'FEFO Dispatch Queue', href: '/spoilage-intelligence', icon: Biohazard },
          { name: 'Logistics Optimization', href: '/optimization-center', icon: Sliders },
        ]
      }
    ];
  } else if (isRetailer) {
    navSections = [
      {
        sectionTitle: 'Supermarket Operations',
        items: [
          { name: 'Retailer Dashboard', href: '/retailer-dashboard', icon: Store },
          { name: 'Produce Orders & Intake', href: '/retailer-management', icon: Store },
          { name: 'Store Demand Forecast', href: '/demand-forecasting', icon: ShoppingCart },
          { name: 'Arrival Quality Inspection', href: '/spoilage-intelligence', icon: Biohazard },
        ]
      }
    ];
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={closeSidebar}
          aria-hidden="true"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 max-w-[80vw] bg-slate-900 border-r border-slate-800/80 flex flex-col h-screen z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-md shadow-emerald-900/30">
              <Wheat className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Agri<span className="text-emerald-400">Optima</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Supply Chain Logistics</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={closeSidebar}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
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
                    onClick={handleLinkClick}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Session Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xs font-semibold text-emerald-400 shrink-0">
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
            onClick={handleLinkClick}
            className="block text-center text-[11px] text-slate-400 hover:text-emerald-400 font-medium transition mt-1"
          >
            Switch Role Profile
          </Link>
        </div>
      </aside>
    </>
  );
}
