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
      bg: 'bg-emerald-50',
      border: 'border-slate-200',
      iconText: 'text-emerald-600',
      glow: 'group-hover:border-emerald-300'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-slate-200',
      iconText: 'text-blue-600',
      glow: 'group-hover:border-blue-300'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-slate-200',
      iconText: 'text-amber-600',
      glow: 'group-hover:border-amber-300'
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-slate-200',
      iconText: 'text-rose-600',
      glow: 'group-hover:border-rose-300'
    },
    violet: {
      bg: 'bg-violet-50',
      border: 'border-slate-200',
      iconText: 'text-violet-600',
      glow: 'group-hover:border-violet-300'
    }
  };

  const scheme = colorMap[color];

  return (
    <div className={`group p-3.5 sm:p-5 rounded-xl bg-white border ${scheme.border} ${scheme.glow} transition-all duration-200 shadow-xs relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{title}</span>
        <div className={`p-1.5 sm:p-2 rounded-lg ${scheme.bg} ${scheme.iconText} shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span className={`text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
            trendType === 'positive' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
            trendType === 'negative' ? 'text-rose-700 bg-rose-50 border-rose-200' :
            'text-slate-600 bg-slate-100 border-slate-200'
          }`}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">{subtitle}</p>
      )}
    </div>
  );
}
