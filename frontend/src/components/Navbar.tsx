"use client";

import React, { useEffect, useState } from 'react';
import { Activity, MapPin, Clock, Menu } from 'lucide-react';
import { useNav } from '@/context/NavContext';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const { toggleSidebar } = useNav();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 w-full shadow-xs">
      <div className="flex items-center space-x-3 overflow-hidden">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={toggleSidebar}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="truncate">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">{title}</h2>
          {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Geographic Scope Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-medium">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Kolar – Bengaluru</span>
        </div>

        {/* Pilot Crop Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Tomato (Hybrid Shivam)</span>
        </div>

        {/* Solver Status */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] text-blue-800 font-medium">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>OR-Tools Ready</span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center space-x-1 text-slate-500 font-mono text-[11px] sm:text-xs pl-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr}</span>
        </div>
      </div>
    </header>
  );
}
