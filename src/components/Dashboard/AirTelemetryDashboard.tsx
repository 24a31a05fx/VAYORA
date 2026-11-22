// ============================================================
// src/components/Dashboard/AirTelemetryDashboard.tsx
// Redesigned Hyperlocal AQI telemetry, circular gauge, custom SVG heatmap, and pollutant sparklines
// ============================================================

import { memo } from 'react';
import { useAirAnalytics } from '@/hooks/useAirAnalytics';
import { getPrimaryHealthAdvice, type HealthDirective, type InversionRiskResult } from '@/lib/compute';
import { ZoneCard } from '@/components/shared/ZoneCard';
import type { UrbanZone, PollutantReading } from '@/types';
import { SmogHeatmap } from './SmogHeatmap';
import { AqiGauge } from './AqiGauge';
import { PollutantSparklinesPanel } from './PollutantSparklinesPanel';
import { AtmosphericOverview } from './AtmosphericOverview';
import { AtmosphericExposureReport } from './AtmosphericExposureReport';
import { EmissionSourceTreemap } from './EmissionSourceTreemap';
import { AirForecastCard } from './AirForecastCard';
import { WarningIcon, LeafIcon, SparklesIcon } from '@/components/shared/Icons';

function HealthDirectiveCard({ advice }: { advice: HealthDirective }) {
  return (
    <div className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">Health Guidance</span>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${advice.badgeClass}`}>{advice.badge}</span>
        </div>
        <h3 className="font-heading font-bold text-sm text-[#202B29] mt-1.5 leading-snug">{advice.title}</h3>
        <p className="text-xs text-[#73817B] mt-1.5 leading-relaxed">{advice.action}</p>
      </div>
    </div>
  );
}

function InversionStatusCard({ currentZone, inversionStatus }: { currentZone: UrbanZone; inversionStatus: InversionRiskResult }) {
  const isInv = inversionStatus.isInversion;
  const style = isInv ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]' : 'bg-[#F2F7F4] border-[#B8CDB8]/60 text-[#153C35]';

  return (
    <div className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${style}`}>
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">Sky Conditions</span>
          <span aria-hidden="true" className="shrink-0">{isInv ? <WarningIcon size={16} /> : <LeafIcon size={16} />}</span>
        </div>
        <div className="font-heading font-bold text-sm mt-1 capitalize text-[#202B29]">{inversionStatus.severity} Risk Trap</div>
        <p className="text-[11px] text-[#73817B] mt-1 leading-snug line-clamp-2">{inversionStatus.rationale}</p>
      </div>
      <div className="flex items-center justify-between text-xs font-semibold pt-2.5 mt-2 border-t border-[#E5EAE4] text-[#202B29]">
        <span>{currentZone.temperatureC}°C / {currentZone.humidityPercent}% RH</span>
        <span>Wind {currentZone.windSpeedKmh} km/h</span>
      </div>
    </div>
  );
}

function SimulationControls({ onSpike, onClean }: { onSpike: () => void; onClean: () => void }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm shadow-[#153C35]/5">
      <div>
        <h3 className="font-heading font-bold text-base text-[#153C35] flex items-center gap-2">
          <SparklesIcon size={16} className="text-[#398F83]" /> Environmental Progress & Simulation
        </h3>
        <p className="text-xs text-[#73817B] mt-0.5">Test real-time system reaction to sudden inversion clamping or wind dispersion</p>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button type="button" onClick={onSpike} className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 cursor-pointer">
          Simulate Winter Smog Spike (+45 AQI)
        </button>
        <button type="button" onClick={onClean} className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer">
          Simulate Solar Wind Cleansing (-50 AQI)
        </button>
      </div>
    </div>
  );
}

function ZoneCardList({ zones, selectedZoneId, onSelect }: { zones: UrbanZone[]; selectedZoneId: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-base text-[#153C35]">Area Explorer: Municipal Sectors</h3>
        <span className="text-xs text-[#73817B]">Select any sector to inspect hyperlocal telemetry</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {zones.map((zone) => (
          <ZoneCard key={zone.zoneId} zone={zone} isSelected={zone.zoneId === selectedZoneId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function PrimaryTelemetryHero({ currentZone, aqiColor, aqiCategory, advice, inversionStatus }: { currentZone: UrbanZone; aqiColor: string; aqiCategory: string; advice: HealthDirective; inversionStatus: InversionRiskResult }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-sm shadow-[#153C35]/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        <AqiGauge aqi={currentZone.aqi} aqiColor={aqiColor} aqiCategory={aqiCategory} zoneName={currentZone.zoneName} dominantPollutant={currentZone.dominantPollutant} />
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <HealthDirectiveCard advice={advice} />
          <InversionStatusCard currentZone={currentZone} inversionStatus={inversionStatus} />
        </div>
      </div>
    </div>
  );
}

function AnalyticsGrids({ zones, selectedZoneId, onSelectZone, currentZone, pollutantBreakdown }: { zones: UrbanZone[]; selectedZoneId: string; onSelectZone: (id: string) => void; currentZone: UrbanZone; pollutantBreakdown: PollutantReading[] }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SmogHeatmap zones={zones} selectedZoneId={selectedZoneId} onSelectZone={onSelectZone} />
        <PollutantSparklinesPanel zoneName={currentZone.zoneName} pollutantBreakdown={pollutantBreakdown} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <AtmosphericExposureReport />
        </div>
        <div className="lg:col-span-5">
          <AirForecastCard />
        </div>
      </div>
      <EmissionSourceTreemap />
    </>
  );
}

export const AirTelemetryDashboard = memo(function AirTelemetryDashboard() {
  const { zones, currentZone, selectedZoneId, setSelectedZoneId, aqiCategory, aqiColor, inversionStatus, pollutantBreakdown, simulateSmogSpike, simulateCleanDispersion } = useAirAnalytics();
  const advice = getPrimaryHealthAdvice(currentZone.aqi);

  return (
    <section aria-label="Hyperlocal AQI Telemetry Dashboard" className="flex flex-col gap-6 fade-in">
      <AtmosphericOverview currentZone={currentZone} onRefresh={simulateCleanDispersion} />
      <PrimaryTelemetryHero currentZone={currentZone} aqiColor={aqiColor} aqiCategory={aqiCategory} advice={advice} inversionStatus={inversionStatus} />
      <AnalyticsGrids zones={zones} selectedZoneId={selectedZoneId} onSelectZone={setSelectedZoneId} currentZone={currentZone} pollutantBreakdown={pollutantBreakdown} />
      <SimulationControls onSpike={simulateSmogSpike} onClean={simulateCleanDispersion} />
      <ZoneCardList zones={zones} selectedZoneId={selectedZoneId} onSelect={setSelectedZoneId} />
    </section>
  );
});
