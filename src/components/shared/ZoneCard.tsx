// ============================================================
// src/components/shared/ZoneCard.tsx
// Memoized urban zone status card with AQI badge & inversion indicators
// Per CODING_CONVENTIONS.md §4 & ACCESSIBILITY.md §7
// ============================================================

import { memo } from 'react';
import type { UrbanZone } from '@/types';
import { getAQIColor } from '@/lib/aqiCompute';

interface ZoneCardProps {
  zone: UrbanZone;
  isSelected: boolean;
  onSelect: (zoneId: string) => void;
}

export const ZoneCard = memo(function ZoneCard({
  zone,
  isSelected,
  onSelect,
}: ZoneCardProps) {
  const aqiColor = getAQIColor(zone.aqi);

  return (
    <div
      role="article"
      aria-label={`${zone.zoneName} air quality status`}
      className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all duration-200 ${
        isSelected
          ? 'bg-[#FFFFFF] border-[#153C35] ring-2 ring-[#153C35]/15 shadow-md shadow-[#153C35]/10'
          : 'bg-[#FFFFFF] border-[#E5EAE4] hover:border-[#B8CDB8] hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading font-bold text-[#202B29] text-sm leading-snug">{zone.zoneName}</h3>
          <p className="text-xs text-[#73817B] mt-0.5">
            Primary: <span className="text-[#202B29] font-semibold">{zone.dominantPollutant}</span>
          </p>
        </div>
        <div
          className="px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border shrink-0"
          style={{
            backgroundColor: `${aqiColor}15`,
            borderColor: `${aqiColor}40`,
            color: aqiColor,
          }}
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: aqiColor }} aria-hidden="true" />
          <span>AQI {zone.aqi}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 px-3 bg-[#F6F7F2] rounded-xl border border-[#E5EAE4]">
        <div>
          <div className="text-[#73817B] text-[10px] font-semibold uppercase">PM2.5</div>
          <div className="font-bold text-[#202B29] tabular-nums">{zone.pm25} µg</div>
        </div>
        <div>
          <div className="text-[#73817B] text-[10px] font-semibold uppercase">Wind</div>
          <div className="font-bold text-[#202B29] tabular-nums">{zone.windSpeedKmh} km/h</div>
        </div>
        <div>
          <div className="text-[#73817B] text-[10px] font-semibold uppercase">Temp</div>
          <div className="font-bold text-[#202B29] tabular-nums">{zone.temperatureC}°C</div>
        </div>
      </div>

      {zone.inversionRisk && (
        <div className="flex items-center gap-1.5 text-xs text-[#E4A34A] bg-[#FFFBEB] px-2.5 py-1 rounded-lg border border-[#FDE68A]">
          <span aria-hidden="true">⚠️</span>
          <span className="font-semibold text-[#92400E]">Atmospheric Inversion Trap</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => onSelect(zone.zoneId)}
        aria-pressed={isSelected}
        className={`w-full py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35] ${
          isSelected
            ? 'bg-[#153C35] text-white shadow-sm shadow-[#153C35]/20 font-bold'
            : 'bg-[#F6F7F2] text-[#202B29] hover:bg-[#EBF2EC] hover:text-[#153C35] border border-[#E5EAE4]'
        }`}
      >
        {isSelected ? 'Active Telemetry' : 'Switch Telemetry'}
      </button>
    </div>
  );
});
