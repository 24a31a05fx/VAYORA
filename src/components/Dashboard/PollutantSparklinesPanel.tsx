// ============================================================
// src/components/Dashboard/PollutantSparklinesPanel.tsx
// Multi-parameter pollutant sparklines panel
// ============================================================

import { memo } from 'react';
import type { PollutantReading } from '@/types';
import { Sparkline } from '@/components/shared/Sparkline';

interface PollutantSparklinesPanelProps {
  zoneName: string;
  pollutantBreakdown: PollutantReading[];
}

export const PollutantSparklinesPanel = memo(function PollutantSparklinesPanel({
  zoneName,
  pollutantBreakdown,
}: PollutantSparklinesPanelProps) {
  return (
    <div className="lg:col-span-5 bg-[#FFFFFF] rounded-3xl border border-[#E5EAE4] p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-sm shadow-[#153C35]/5">
      <div>
        <h2 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2">
          <span aria-hidden="true">📈</span> Pollutant Trend Sparklines
        </h2>
        <p className="text-xs text-[#73817B] mt-0.5">
          Multi-parameter gas and particle telemetry ({zoneName})
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {pollutantBreakdown.map((pollutant) => {
          const isExceeded = pollutant.current > pollutant.threshold;
          return (
            <div
              key={pollutant.type}
              className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-[#B8CDB8] transition-colors"
            >
              <div className="min-w-[95px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-sm text-[#202B29]">{pollutant.type}</span>
                  <span className="text-[10px] text-[#73817B]">({pollutant.unit})</span>
                </div>
                <div className="text-xs font-bold text-[#202B29] mt-0.5 tabular-nums">
                  {pollutant.current}{' '}
                  <span className="text-[10px] text-[#73817B] font-normal">/ max {pollutant.threshold}</span>
                </div>
              </div>

              <div className="flex-1 flex justify-center">
                <Sparkline
                  values={pollutant.history}
                  color={isExceeded ? '#ef4444' : '#153C35'}
                  width={130}
                  height={32}
                  label={`${pollutant.type} 7-hour trend`}
                />
              </div>

              <div className="text-right min-w-[70px]">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    pollutant.status === 'Hazardous' || pollutant.status === 'Critical'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : pollutant.status === 'Unhealthy' || pollutant.status === 'Moderate'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {pollutant.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-[#153C35] bg-[#E8F0EA] rounded-2xl p-3.5 border border-[#B8CDB8]/60 leading-relaxed">
        💡 <strong>Winter Smog Insight:</strong> Secondary PM2.5 formation surges when ambient humidity exceeds 75% in the presence of vehicle-emitted NO2 and sulfur precursors.
      </div>
    </div>
  );
});
