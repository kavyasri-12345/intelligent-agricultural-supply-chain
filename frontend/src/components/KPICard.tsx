"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet';
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'positive',
  color = 'emerald'
}: KPICardProps) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      iconText: 'text-emerald-400',
      glow: 'group-hover:border-emerald-500/40'
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      iconText: 'text-blue-400',
      glow: 'group-hover:border-blue-500/40'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      iconText: 'text-amber-400',
      glow: 'group-hover:border-amber-500/40'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      iconText: 'text-rose-400',
      glow: 'group-hover:border-rose-500/40'
    },
    violet: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      iconText: 'text-violet-400',
      glow: 'group-hover:border-violet-500/40'
    }
  };

  const scheme = colorMap[color];

  return (
    <div className={`group p-3.5 sm:p-5 rounded-xl bg-slate-900 border ${scheme.border} ${scheme.glow} transition-all duration-200 shadow-sm relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{title}</span>
        <div className={`p-1.5 sm:p-2 rounded-lg ${scheme.bg} ${scheme.iconText} shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-lg sm:text-2xl font-bold text-white tracking-tight">{value}</span>
        {trend && (
          <span className={`text-[10px] sm:text-[11px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
            trendType === 'positive' ? 'text-emerald-400 bg-emerald-500/10' :
            trendType === 'negative' ? 'text-rose-400 bg-rose-500/10' :
            'text-slate-400 bg-slate-800'
          }`}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] sm:text-xs text-slate-400 truncate">{subtitle}</p>
      )}
    </div>
  );
}
