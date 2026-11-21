// ============================================================
// src/components/Dashboard/AirTelemetryDashboard.tsx
// Redesigned Hyperlocal AQI telemetry, circular gauge, custom SVG heatmap, and pollutant sparklines
// Per ACCESSIBILITY.md §3 (Twin Representation) & EFFICIENCY.md §3
// ============================================================

import { memo } from 'react';
import { useAirAnalytics } from '@/hooks/useAirAnalytics';
import { getPrimaryHealthAdvice } from '@/lib/aqiCompute';
import { ZoneCard } from '@/components/shared/ZoneCard';
import { SmogHeatmap } from './SmogHeatmap';
import { AqiGauge } from './AqiGauge';
import { PollutantSparklinesPanel } from './PollutantSparklinesPanel';

export const AirTelemetryDashboard = memo(function AirTelemetryDashboard() {
  const {
    zones,
    currentZone,
    selectedZoneId,
    setSelectedZoneId,
    aqiCategory,
    aqiColor,
    inversionStatus,
    pollutantBreakdown,
    simulateSmogSpike,
    simulateCleanDispersion,
  } = useAirAnalytics();

  const advice = getPrimaryHealthAdvice(currentZone.aqi);

  return (
    <section aria-label="Hyperlocal AQI Telemetry Dashboard" className="flex flex-col gap-6 fade-in">
      {/* Top Hero Environmental Intelligence Card */}
      <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-sm shadow-[#153C35]/5">
        {/* Soft Organic Atmospheric Backdrop Glow */}
        <div
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: aqiColor }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <AqiGauge
            aqi={currentZone.aqi}
            aqiColor={aqiColor}
            aqiCategory={aqiCategory}
            zoneName={currentZone.zoneName}
            dominantPollutant={currentZone.dominantPollutant}
          />

          {/* Right Column: Environmental Intelligence & Health Recommendation */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Actionable Health Recommendation Card */}
            <div className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">
                    Primary Health Directive
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${advice.badgeClass}`}>
                    {advice.badge}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm text-[#202B29] mt-1.5 leading-snug">
                  {advice.title}
                </h3>
                <p className="text-xs text-[#73817B] mt-1.5 leading-relaxed">
                  {advice.action}
                </p>
              </div>
            </div>

            {/* Atmospheric Boundary Layer & Inversion Card */}
            <div
              className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                inversionStatus.isInversion
                  ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                  : 'bg-[#F2F7F4] border-[#B8CDB8]/60 text-[#153C35]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">
                    Inversion Mechanics
                  </span>
                  <span aria-hidden="true" className="text-base">
                    {inversionStatus.isInversion ? '⚠️' : '🍃'}
                  </span>
                </div>
                <div className="font-heading font-bold text-sm mt-1 capitalize text-[#202B29]">
                  {inversionStatus.severity} Risk Trap
                </div>
                <p className="text-[11px] text-[#73817B] mt-1 leading-snug line-clamp-2">
                  {inversionStatus.rationale}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold pt-2.5 mt-2 border-t border-[#E5EAE4] text-[#202B29]">
                <span>{currentZone.temperatureC}°C / {currentZone.humidityPercent}% RH</span>
                <span>Wind {currentZone.windSpeedKmh} km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Simulation Controls */}
        <div className="mt-6 pt-4 border-t border-[#E5EAE4] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#73817B] font-semibold">Telemetry Simulation Engine:</span>
            <button
              type="button"
              onClick={simulateSmogSpike}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] hover:bg-[#FEE2E2] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
            >
              ⚡ Simulate Winter Smog Spike (+45 AQI)
            </button>
            <button
              type="button"
              onClick={simulateCleanDispersion}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] hover:bg-[#D1FAE5] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
            >
              🍃 Simulate Solar Wind Cleansing (-50 AQI)
            </button>
          </div>
          <span className="text-[11px] text-[#73817B] font-medium tabular-nums">
            Updated: {new Date(currentZone.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Grid: SVG Heatmap (Left 7 cols) & Pollutant Sparklines (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SmogHeatmap
          zones={zones}
          selectedZoneId={selectedZoneId}
          onSelectZone={setSelectedZoneId}
        />

        <PollutantSparklinesPanel
          zoneName={currentZone.zoneName}
          pollutantBreakdown={pollutantBreakdown}
        />
      </div>

      {/* Municipal Zone Selector Cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold text-[#153C35] flex items-center gap-2">
            <span aria-hidden="true">🏙️</span> Monitored Urban Sectors ({zones.length})
          </h2>
          <span className="text-xs text-[#73817B]">Click to switch active sector telemetry</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {zones.map((zone) => (
            <ZoneCard
              key={zone.zoneId}
              zone={zone}
              isSelected={zone.zoneId === selectedZoneId}
              onSelect={setSelectedZoneId}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
