"use client";

import React, { useEffect, useState } from 'react';
import { Activity, MapPin, Sparkles, Clock } from 'lucide-react';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const [timeStr, setTimeStr] = useState<string>('');

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
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Geographic Scope Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Kolar District – Bengaluru Catchment</span>
        </div>

        {/* Pilot Crop Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Crop: Tomato (Hybrid Shivam)</span>
        </div>

        {/* AI & Solver Status */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-300 font-medium">
          <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>AI / OR-Tools CP-SAT: Ready</span>
        </div>

        {/* Clock */}
        <div className="flex items-center space-x-1 text-slate-400 font-mono text-xs pl-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeStr}</span>
        </div>
      </div>
    </header>
  );
}
