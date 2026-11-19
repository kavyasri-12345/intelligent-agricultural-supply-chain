"use client";

import React, { useState } from 'react';
import { MapPin, Navigation, Info, Warehouse, Store, Tractor } from 'lucide-react';

interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'FARM' | 'STORAGE' | 'RETAILER' | 'CLUSTER_HUB';
  details?: string;
  load?: string | number;
}

interface MapLibreMapProps {
  points?: MapPoint[];
  routes?: Array<{
    vehicle_id: string;
    stops: Array<{ lat: number; lng: number; name: string }>;
  }>;
  height?: string;
}

export default function MapLibreMap({
  points = [],
  routes = [],
  height = '500px'
}: MapLibreMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  // Geographic bounds for projection:
  // Lat: 12.80N to 13.40N (span 0.60 deg)
  // Lng: 77.50E to 78.45E (span 0.95 deg)
  const minLat = 12.80, maxLat = 13.40;
  const minLng = 77.50, maxLng = 78.45;

  const projectToPct = (lat: number, lng: number) => {
    const x = Math.max(5, Math.min(95, ((lng - minLng) / (maxLng - minLng)) * 100));
    // Invert y because top is 0%
    const y = Math.max(5, Math.min(95, ((maxLat - lat) / (maxLat - minLat)) * 100));
    return { x, y };
  };

  return (
    <div className="relative w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-inner" style={{ height }}>
      {/* Background Map Grid & Regional Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

      {/* Region labels */}
      <div className="absolute top-3 left-4 sm:top-4 sm:left-6 pointer-events-none z-10 hidden sm:block">
        <h4 className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest">
          Bengaluru Urban (West)
        </h4>
        <span className="text-[10px] text-slate-400 font-medium">NH-75 Logistics Corridor</span>
      </div>

      <div className="absolute top-3 right-4 sm:top-4 sm:right-6 pointer-events-none z-10 text-right hidden sm:block">
        <h4 className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest">
          Kolar Production (East)
        </h4>
        <span className="text-[10px] text-slate-400 font-medium">Tomato Farms & Mandi</span>
      </div>

      {/* SVG Vector Connections (Routes) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="routeGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {routes.map((route, rIdx) => {
          if (!route.stops || route.stops.length < 2) return null;
          const pathPoints = route.stops.map(s => {
            const { x, y } = projectToPct(s.lat, s.lng);
            return `${x.toFixed(2)} ${y.toFixed(2)}`;
          }).join(' L ');

          return (
            <path
              key={`route-${rIdx}`}
              d={`M ${pathPoints}`}
              fill="none"
              stroke="url(#routeGradLight)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="4 2"
              className="opacity-80"
            />
          );
        })}
      </svg>

      {/* Render Markers */}
      {points.map((pt) => {
        const { x, y } = projectToPct(pt.lat, pt.lng);
        const isSelected = selectedPoint?.id === pt.id;

        const getMarkerStyle = () => {
          switch (pt.type) {
            case 'FARM':
              return 'bg-emerald-600 border-white text-white shadow-sm';
            case 'STORAGE':
              return 'bg-blue-600 border-white text-white shadow-md scale-125';
            case 'RETAILER':
              return 'bg-amber-500 border-white text-white shadow-sm';
            case 'CLUSTER_HUB':
              return 'bg-violet-600 border-white text-white shadow-sm scale-110';
            default:
              return 'bg-slate-500 border-white text-white';
          }
        };

        return (
          <button
            key={pt.id}
            onClick={() => setSelectedPoint(pt)}
            style={{ left: `${x}%`, top: `${y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full border-2 transition-transform duration-150 hover:scale-150 z-10 ${getMarkerStyle()} ${
              isSelected ? 'ring-4 ring-emerald-300 scale-150 z-20' : ''
            }`}
            title={`${pt.name} (${pt.type})`}
          >
            {pt.type === 'FARM' && <Tractor className="w-2.5 h-2.5" />}
            {pt.type === 'STORAGE' && <Warehouse className="w-3 h-3" />}
            {pt.type === 'RETAILER' && <Store className="w-2.5 h-2.5" />}
            {pt.type === 'CLUSTER_HUB' && <Navigation className="w-3 h-3" />}
          </button>
        );
      })}

      {/* Selected Point Popover */}
      {selectedPoint && (
        <div className="absolute bottom-16 sm:bottom-4 left-3 right-3 sm:right-auto sm:left-6 bg-white/95 border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xl z-20 max-w-sm backdrop-blur-md text-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {selectedPoint.type}
              </span>
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">{selectedPoint.name}</h5>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Coords: {selectedPoint.lat.toFixed(4)}°N, {selectedPoint.lng.toFixed(4)}°E
              </p>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-slate-400 hover:text-slate-700 text-xs px-1"
            >
              ✕
            </button>
          </div>
          {selectedPoint.details && (
            <p className="text-[11px] sm:text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-200">
              {selectedPoint.details}
            </p>
          )}
          {selectedPoint.load && (
            <div className="mt-2 text-xs text-emerald-700 font-semibold">
              Load / Capacity: {selectedPoint.load} kg
            </div>
          )}
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-6 bg-white/95 border border-slate-200 rounded-lg p-2 sm:p-2.5 text-[10px] sm:text-[11px] text-slate-700 z-10 flex flex-wrap items-center gap-2 sm:gap-3.5 backdrop-blur-md shadow-xs">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
          <span>Farms</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" />
          <span>Hub Centroids</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
          <span>Cold Warehouses</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>Retail Outlets</span>
        </div>
      </div>
    </div>
  );
}
