// ============================================================
// src/components/Dashboard/AqiGauge.tsx
// Prominent radial slotted notch AQI gauge and sector identity
// ============================================================

import { memo } from 'react';

interface AqiGaugeProps {
  aqi: number;
  aqiColor: string;
  aqiCategory: string;
  zoneName: string;
  dominantPollutant: string;
}

const TOTAL_TICKS = 44;

function calculateTickCoords(index: number) {
  const angleDeg = (index / TOTAL_TICKS) * 360 - 90;
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x1: 50 + 36 * Math.cos(rad),
    y1: 50 + 36 * Math.sin(rad),
    x2: 50 + 46 * Math.cos(rad),
    y2: 50 + 46 * Math.sin(rad),
  };
}

function RadialTicks({ aqi, aqiColor }: { aqi: number; aqiColor: string }) {
  const activeFraction = Math.min(500, Math.max(0, aqi)) / 500;
  const activeCount = Math.round(activeFraction * TOTAL_TICKS);

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
      {Array.from({ length: TOTAL_TICKS }).map((_, i) => {
        const coords = calculateTickCoords(i);
        const isActive = i <= activeCount;
        return (
          <line
            key={`tick-${i}`}
            x1={coords.x1.toFixed(2)}
            y1={coords.y1.toFixed(2)}
            x2={coords.x2.toFixed(2)}
            y2={coords.y2.toFixed(2)}
            stroke={isActive ? aqiColor : '#E5EAE4'}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function GaugeCenter({ aqi, aqiColor }: { aqi: number; aqiColor: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
      <span className="font-heading text-4xl sm:text-5xl font-black tracking-tight tabular-nums" style={{ color: aqiColor }}>
        {aqi}
      </span>
      <div className="flex items-center gap-1 -mt-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">US-EPA AQI</span>
      </div>
    </div>
  );
}

function GaugeDetails({ zoneName, aqiCategory, aqiColor, dominantPollutant }: { zoneName: string; aqiCategory: string; aqiColor: string; dominantPollutant: string }) {
  return (
    <div className="flex flex-col text-center sm:text-left">
      <div className="flex items-center justify-center sm:justify-start gap-2">
        <span className="text-xs uppercase font-bold tracking-wider text-[#73817B]">Hyperlocal Sector</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#398F83]" />
        <span className="text-xs text-[#153C35] font-bold">{zoneName}</span>
      </div>
      <div className="mt-1 flex items-center justify-center sm:justify-start gap-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wide border" style={{ backgroundColor: `${aqiColor}15`, borderColor: `${aqiColor}40`, color: aqiColor }}>
          {aqiCategory}
        </span>
      </div>
      <p className="text-xs text-[#73817B] mt-2">
        Dominant Pollutant: <strong className="text-[#202B29] font-bold">{dominantPollutant}</strong>
      </p>
    </div>
  );
}

export const AqiGauge = memo(function AqiGauge({ aqi, aqiColor, aqiCategory, zoneName, dominantPollutant }: AqiGaugeProps) {
  return (
    <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
        <RadialTicks aqi={aqi} aqiColor={aqiColor} />
        <GaugeCenter aqi={aqi} aqiColor={aqiColor} />
      </div>
      <GaugeDetails zoneName={zoneName} aqiCategory={aqiCategory} aqiColor={aqiColor} dominantPollutant={dominantPollutant} />
    </div>
  );
});
