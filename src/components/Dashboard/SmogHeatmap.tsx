// ============================================================
// src/components/Dashboard/SmogHeatmap.tsx
// Pure SVG Spatial Smog Heatmap with WCAG SC 1.1.1 Twin Representation
// Directly inspired by Reference Design Image 1 (Isometric Dark Map Card)
// ============================================================

import { memo } from 'react';
import type { UrbanZone } from '@/types';
import { getAQIColor } from '@/lib/compute';

interface SmogHeatmapProps {
  zones: UrbanZone[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
}

const NODE_COORDINATES = [
  { cx: 300, cy: 155 },
  { cx: 160, cy: 80 },
  { cx: 450, cy: 95 },
  { cx: 460, cy: 235 },
  { cx: 160, cy: 230 },
];

function HeatmapScreenReaderTwin({ zones }: { zones: UrbanZone[] }) {
  return (
    <ul className="sr-only" aria-label="Urban air quality heatmap description">
      {zones.map((zone) => (
        <li key={zone.zoneId}>
          Sector {zone.zoneName}: AQI is {zone.aqi}, Category {zone.category},
          PM2.5 is {zone.pm25} micrograms per cubic meter, dominant pollutant is {zone.dominantPollutant},
          inversion risk is {zone.inversionRisk ? 'Active hazard' : 'Normal atmospheric mixing'}.
        </li>
      ))}
    </ul>
  );
}

function HeatmapBackground() {
  return (
    <>
      <rect x="0" y="0" width="600" height="320" fill="url(#natureMapGrad)" rx="14" />
      {[60, 120, 180, 240].map((y) => (
        <line key={`grid-h-${y}`} x1="20" y1={y} x2="580" y2={y} stroke="#DDE5DE" strokeWidth="1" strokeDasharray="4 4" />
      ))}
      {[120, 240, 360, 480].map((x) => (
        <line key={`grid-v-${x}`} x1={x} y1="20" x2={x} y2="300" stroke="#DDE5DE" strokeWidth="1" strokeDasharray="4 4" />
      ))}
      <path d="M 160 80 Q 230 115 300 155" fill="none" stroke="#34D399" strokeWidth="2.5" strokeDasharray="4 2" opacity="0.8" />
      <path d="M 300 155 Q 375 125 450 95" fill="none" stroke="#34D399" strokeWidth="2.5" strokeDasharray="4 2" opacity="0.8" />
      <path d="M 300 155 Q 380 195 460 235" fill="none" stroke="#34D399" strokeWidth="2.5" strokeDasharray="4 2" opacity="0.8" />
      <path d="M 160 230 Q 230 195 300 155" fill="none" stroke="#34D399" strokeWidth="2.5" strokeDasharray="4 2" opacity="0.8" />
    </>
  );
}

function HeatmapNode({ zone, coord, isSelected, onSelect }: { zone: UrbanZone; coord: { cx: number; cy: number }; isSelected: boolean; onSelect: (id: string) => void }) {
  const color = getAQIColor(zone.aqi);
  return (
    <g key={zone.zoneId} onClick={() => onSelect(zone.zoneId)} className="cursor-pointer transition-transform hover:scale-105">
      <circle cx={coord.cx} cy={coord.cy} r={isSelected ? 32 : 24} fill={color} fillOpacity={isSelected ? 0.25 : 0.15} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
      <circle cx={coord.cx} cy={coord.cy} r={isSelected ? 18 : 14} fill={color} filter="url(#nodeGlow)" />
      <text x={coord.cx} y={coord.cy + 4} textAnchor="middle" fill="#FFFFFF" fontSize={isSelected ? "11" : "10"} fontWeight="800">{zone.aqi}</text>
      <text x={coord.cx} y={coord.cy + (isSelected ? 32 : 26)} textAnchor="middle" fill="#202B29" fontSize="9" fontWeight="700">{zone.zoneName}</text>
    </g>
  );
}

function HeatmapTelemetryOverlay({ currentZone }: { currentZone?: UrbanZone }) {
  if (!currentZone) return null;
  return (
    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
      <div className="flex flex-wrap items-center gap-2 bg-[#153C35]/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-[11px] shadow-sm">
        <span>PM2.5: <strong className="text-[#34D399]">{currentZone.pm25} µg/m³</strong></span>
        <span className="opacity-40">•</span>
        <span>Wind: <strong className="text-[#34D399]">{currentZone.windSpeedKmh} km/h</strong></span>
        <span className="opacity-40">•</span>
        <span>Temp: <strong className="text-[#34D399]">{currentZone.temperatureC}°C</strong></span>
      </div>
      <div className="hidden sm:flex items-center gap-1 bg-[#FFFFFF]/90 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[10px] font-bold text-[#153C35] border border-[#E5EAE4]">
        <span>Sector: {currentZone.zoneName}</span>
      </div>
    </div>
  );
}

function HeatmapSvgCanvas({ zones, selectedZoneId, onSelectZone }: SmogHeatmapProps) {
  const currentZone = zones.find((z) => z.zoneId === selectedZoneId) || zones[0];
  return (
    <div className="w-full bg-[#F6F7F2] rounded-2xl border border-[#E5EAE4] p-3 sm:p-4 overflow-hidden relative">
      <svg viewBox="0 0 600 320" aria-hidden="true" role="presentation" className="w-full h-auto max-h-[340px]">
        <defs>
          <radialGradient id="natureMapGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EBF2EC" stopOpacity="0.5" />
          </radialGradient>
          <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#153C35" floodOpacity="0.12" /></filter>
        </defs>
        <HeatmapBackground />
        {zones.map((zone, idx) => (
          <HeatmapNode key={zone.zoneId} zone={zone} coord={NODE_COORDINATES[idx % NODE_COORDINATES.length]!} isSelected={zone.zoneId === selectedZoneId} onSelect={onSelectZone} />
        ))}
      </svg>
      <HeatmapTelemetryOverlay currentZone={currentZone} />
    </div>
  );
}

function HeatmapLegend() {
  const legendItems = [
    { label: 'Good (0-50)', color: '#10b981' },
    { label: 'Moderate (51-100)', color: '#f59e0b' },
    { label: 'Unhealthy (101-200)', color: '#ef4444' },
    { label: 'Hazardous (201+)', color: '#881337' },
  ];
  return (
    <div className="flex flex-wrap items-center justify-between text-xs text-[#73817B] pt-2 px-1">
      <div className="flex items-center gap-3">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[11px]">{item.label}</span>
          </div>
        ))}
      </div>
      <span className="text-[11px] text-[#398F83] font-medium hidden sm:inline">Click node to inspect sector</span>
    </div>
  );
}

export const SmogHeatmap = memo(function SmogHeatmap({ zones, selectedZoneId, onSelectZone }: SmogHeatmapProps) {
  return (
    <div className="lg:col-span-7 bg-[#FFFFFF] rounded-3xl border border-[#E5EAE4] p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-sm shadow-[#153C35]/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2">
          Pollution Landscape — Urban Smog Heatmap & Dispersion Grid
        </h2>
        <span className="text-[11px] font-semibold text-[#398F83] bg-[#E8F0EA] px-2.5 py-1 rounded-full w-fit">5 Monitored Sectors</span>
      </div>
      <HeatmapScreenReaderTwin zones={zones} />
      <HeatmapSvgCanvas zones={zones} selectedZoneId={selectedZoneId} onSelectZone={onSelectZone} />
      <HeatmapLegend />
    </div>
  );
});
