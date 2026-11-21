// ============================================================
// src/components/Dashboard/AqiGauge.tsx
// Prominent circular AQI gauge and hyperlocal sector identity
// ============================================================

import { memo } from 'react';

interface AqiGaugeProps {
  aqi: number;
  aqiColor: string;
  aqiCategory: string;
  zoneName: string;
  dominantPollutant: string;
}

export const AqiGauge = memo(function AqiGauge({
  aqi,
  aqiColor,
  aqiCategory,
  zoneName,
  dominantPollutant,
}: AqiGaugeProps) {
  // Circular gauge calculations (0 to 500 AQI scale)
  const clampedAqi = Math.min(500, Math.max(0, aqi));
  const gaugePercent = clampedAqi / 500;
  const strokeDashoffset = 283 - 283 * gaugePercent;

  return (
    <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
      {/* Circular Gauge Ring */}
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#EBF2EC"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress Value Arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={aqiColor}
            strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Gauge Center Numerical Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="font-heading text-4xl sm:text-5xl font-black tracking-tight tabular-nums"
            style={{ color: aqiColor }}
          >
            {aqi}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B] -mt-1">
            US-EPA AQI
          </span>
        </div>
      </div>

      {/* Sector Details */}
      <div className="flex flex-col text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-[#73817B]">
            Hyperlocal Sector
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#398F83]" />
          <span className="text-xs text-[#153C35] font-bold">{zoneName}</span>
        </div>

        <div className="mt-1">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wide border mt-1"
            style={{
              backgroundColor: `${aqiColor}15`,
              borderColor: `${aqiColor}40`,
              color: aqiColor,
            }}
          >
            {aqiCategory}
          </span>
        </div>

        <p className="text-xs text-[#73817B] mt-2">
          Dominant Pollutant:{' '}
          <strong className="text-[#202B29] font-bold">{dominantPollutant}</strong>
        </p>
      </div>
    </div>
  );
});
