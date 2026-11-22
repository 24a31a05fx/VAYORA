// ============================================================
// src/components/Navigation/SidebarSectorCard.tsx
// Quick-switch municipal sector telemetry widget for desktop sidebar
// ============================================================

import { memo } from 'react';
import type { UrbanZone } from '@/types';

interface SidebarSectorCardProps {
  selectedZone: UrbanZone;
  zones: UrbanZone[];
  onSelectZone: (zoneId: string) => void;
  aqiColor: string;
}

function SectorBadge({ selectedZone, aqiColor }: { selectedZone: UrbanZone; aqiColor: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[#73817B] font-semibold text-[11px] uppercase tracking-wider">Area Explorer</span>
      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border" style={{ backgroundColor: `${aqiColor}15`, borderColor: `${aqiColor}50`, color: aqiColor }}>
        AQI {selectedZone.aqi}
      </span>
    </div>
  );
}

function SectorDropdown({ selectedZone, zones, onSelectZone }: { selectedZone: UrbanZone; zones: UrbanZone[]; onSelectZone: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor="sidebar-zone-select" className="sr-only">Quick switch sector</label>
      <select id="sidebar-zone-select" value={selectedZone.zoneId} onChange={(e) => onSelectZone(e.target.value)} className="w-full text-xs font-bold text-[#202B29] bg-transparent border-none p-0 focus:outline-none cursor-pointer">
        {zones.map((z) => (
          <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
        ))}
      </select>
    </div>
  );
}

export const SidebarSectorCard = memo(function SidebarSectorCard(props: SidebarSectorCardProps) {
  return (
    <div className="hidden lg:flex flex-col gap-2 p-3.5 bg-[#F6F7F2] rounded-2xl border border-[#E5EAE4]">
      <SectorBadge selectedZone={props.selectedZone} aqiColor={props.aqiColor} />
      <SectorDropdown selectedZone={props.selectedZone} zones={props.zones} onSelectZone={props.onSelectZone} />
      <div className="flex items-center justify-between text-[11px] text-[#73817B] pt-2 border-t border-[#E5EAE4]/80">
        <span>{props.selectedZone.temperatureC}°C • {props.selectedZone.humidityPercent}% RH</span>
        <span>Wind {props.selectedZone.windSpeedKmh} km/h</span>
      </div>
    </div>
  );
});
