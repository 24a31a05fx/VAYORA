// ============================================================
// src/components/Dashboard/SmogHeatmap.tsx
// Pure SVG Spatial Smog Heatmap with WCAG SC 1.1.1 Twin Representation
// Nature Meets Urban Intelligence Design Direction
// ============================================================

import { memo } from 'react';
import type { UrbanZone } from '@/types';
import { getAQIColor } from '@/lib/aqiCompute';

interface SmogHeatmapProps {
  zones: UrbanZone[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
}

const NODE_COORDINATES = [
  { cx: 300, cy: 155 }, // Central Business District
  { cx: 160, cy: 80 },  // North Industrial
  { cx: 450, cy: 95 },  // Eastern Residential
  { cx: 460, cy: 235 }, // Riverside Park & Wetlands
  { cx: 160, cy: 230 }, // Transit Hub & Rail Depot
];

export const SmogHeatmap = memo(function SmogHeatmap({
  zones,
  selectedZoneId,
  onSelectZone,
}: SmogHeatmapProps) {
  return (
    <div className="lg:col-span-7 bg-[#FFFFFF] rounded-3xl border border-[#E5EAE4] p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-sm shadow-[#153C35]/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2">
            <span aria-hidden="true">🗺️</span> Urban Smog Heatmap & Dispersion Grid
          </h2>
          <p className="text-xs text-[#73817B] mt-0.5">
            Real-time spatial visualization across municipal telemetry monitoring nodes
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#398F83] bg-[#E8F0EA] px-2.5 py-1 rounded-full w-fit">
          5 Monitored Sectors
        </span>
      </div>

      {/* WCAG SC 1.1.1 Twin Representation Rule: Textual equivalent */}
      <ul className="sr-only" aria-label="Urban air quality heatmap description">
        {zones.map((zone) => (
          <li key={zone.zoneId}>
            Sector {zone.zoneName}: AQI is {zone.aqi}, Category {zone.category},
            PM2.5 is {zone.pm25} micrograms per cubic meter,
            dominant pollutant is {zone.dominantPollutant},
            inversion risk is {zone.inversionRisk ? 'Active hazard' : 'Normal atmospheric mixing'}.
          </li>
        ))}
      </ul>

      {/* Native SVG Heatmap Canvas (Zero external heavy chart libraries) */}
      <div className="w-full bg-[#F6F7F2] rounded-2xl border border-[#E5EAE4] p-3 sm:p-4 overflow-hidden relative">
        <svg
          viewBox="0 0 600 320"
          aria-hidden="true"
          role="presentation"
          className="w-full h-auto max-h-[340px]"
        >
          <defs>
            {/* Soft Ambient Radial Blur for Atmospheric Zones */}
            <radialGradient id="natureMapGrad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#EBF2EC" stopOpacity="0.4" />
            </radialGradient>
            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#153C35" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Map Base Canvas */}
          <rect x="0" y="0" width="600" height="320" fill="url(#natureMapGrad)" rx="14" />

          {/* Subtle Topographical & Municipal Grid Lines */}
          {[60, 120, 180, 240].map((y) => (
            <line key={`grid-h-${y}`} x1="20" y1={y} x2="580" y2={y} stroke="#DDE5DE" strokeWidth="1" strokeDasharray="4 4" />
          ))}
          {[120, 240, 360, 480].map((x) => (
            <line key={`grid-v-${x}`} x1={x} y1="20" x2={x} y2="300" stroke="#DDE5DE" strokeWidth="1" strokeDasharray="4 4" />
          ))}

          {/* Inter-Sector Atmospheric Dispersion Corridors */}
          <path d="M 160 80 Q 230 115 300 155" fill="none" stroke="#B8CDB8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
          <path d="M 300 155 Q 375 125 450 95" fill="none" stroke="#B8CDB8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
          <path d="M 300 155 Q 380 195 460 235" fill="none" stroke="#B8CDB8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
          <path d="M 160 230 Q 230 195 300 155" fill="none" stroke="#B8CDB8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />

          {/* Meteorological Wind Streamlines */}
          <g stroke="#398F83" strokeWidth="1.2" opacity="0.5" strokeLinecap="round">
            <path d="M 40 45 Q 160 25 280 50 T 520 40" fill="none" strokeDasharray="6 4" />
            <path d="M 60 160 Q 210 135 360 165 T 560 145" fill="none" strokeDasharray="6 4" />
            <path d="M 80 275 Q 230 255 380 280 T 540 265" fill="none" strokeDasharray="6 4" />
          </g>

          {/* Sector Telemetry Nodes */}
          {zones.map((zone, idx) => {
            const pos = NODE_COORDINATES[idx] || { cx: 200 + idx * 60, cy: 150 };
            const color = getAQIColor(zone.aqi);
            const isSelected = zone.zoneId === selectedZoneId;

            return (
              <g
                key={zone.zoneId}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSelectZone(zone.zoneId)}
              >
                {/* Severe Inversion Ambient Halo */}
                {zone.aqi > 200 && (
                  <circle cx={pos.cx} cy={pos.cy} r="34" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" className="animate-ping" />
                )}

                {/* Selection Halo Ring */}
                {isSelected && (
                  <circle cx={pos.cx} cy={pos.cy} r="30" fill="none" stroke="#153C35" strokeWidth="2.5" strokeDasharray="5 3" />
                )}

                {/* Main Node Disc */}
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r="23"
                  fill="#FFFFFF"
                  stroke={color}
                  strokeWidth="3.5"
                  filter="url(#nodeGlow)"
                />

                {/* Numeric AQI Value */}
                <text
                  x={pos.cx}
                  y={pos.cy + 5}
                  textAnchor="middle"
                  fill="#202B29"
                  fontSize="13"
                  fontWeight="800"
                  fontFamily="'Manrope', 'Inter', sans-serif"
                >
                  {zone.aqi}
                </text>

                {/* Sector Label Pill Background */}
                <rect
                  x={pos.cx - 44}
                  y={pos.cy + 27}
                  width="88"
                  height="18"
                  rx="9"
                  fill={isSelected ? '#153C35' : '#FFFFFF'}
                  stroke={isSelected ? '#153C35' : '#E5EAE4'}
                  strokeWidth="1"
                />
                <text
                  x={pos.cx}
                  y={pos.cy + 40}
                  textAnchor="middle"
                  fill={isSelected ? '#FFFFFF' : '#202B29'}
                  fontSize="10"
                  fontWeight="700"
                >
                  {zone.zoneName.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* EPA Breakpoints Visual Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#73817B] pt-3 border-t border-[#E5EAE4] gap-2">
        <span className="font-semibold text-[#202B29]">EPA Breakpoints:</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-[#1B8055]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" aria-hidden="true" /> Good (0-50)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#B45309]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" aria-hidden="true" /> Moderate (51-100)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#C2410C]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" aria-hidden="true" /> Unhealthy (101-200)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#991B1B]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" aria-hidden="true" /> Severe (201+)
          </span>
        </div>
      </div>
    </div>
  );
});
