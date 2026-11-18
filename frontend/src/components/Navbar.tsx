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
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 w-full">
      <div className="flex items-center space-x-3 overflow-hidden">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={toggleSidebar}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="truncate">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">{title}</h2>
          {subtitle && <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Geographic Scope Badge (hidden on mobile, visible on lg) */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Kolar – Bengaluru</span>
        </div>

        {/* Pilot Crop Badge (hidden on xs, visible on md) */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Tomato (Hybrid Shivam)</span>
        </div>

        {/* Solver Status (visible on sm) */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-300 font-medium">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>OR-Tools Ready</span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center space-x-1 text-slate-400 font-mono text-[11px] sm:text-xs pl-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{timeStr}</span>
        </div>
      </div>
    </header>
  );
}
