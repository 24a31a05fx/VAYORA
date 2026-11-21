// ============================================================
// src/components/Routine/RoutineTimeline.tsx
// Hour-by-hour exposure schedule timeline list with morning/afternoon/evening grouping
// Nature Meets Urban Intelligence Design Direction
// ============================================================

import { memo } from 'react';
import type { DailyRoutinePlan } from '@/types';

interface RoutineTimelineProps {
  routinePlan: DailyRoutinePlan;
  zoneName: string;
}

export const RoutineTimeline = memo(function RoutineTimeline({
  routinePlan,
  zoneName,
}: RoutineTimelineProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-5 sm:p-7 flex flex-col gap-5 shadow-sm shadow-[#153C35]/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2">
            <span aria-hidden="true">📅</span> Hour-by-Hour Exposure & Routine Timeline
          </h3>
          <p className="text-xs text-[#73817B] mt-0.5">
            Tailored for <strong className="text-[#202B29]">{routinePlan.persona}</strong> in <strong className="text-[#202B29]">{zoneName}</strong>
          </p>
        </div>
        <span className="text-xs font-semibold text-[#398F83] bg-[#E8F0EA] px-3 py-1 rounded-full w-fit">
          Meteorologically Optimized
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {routinePlan.hourlySchedule.map((slot) => {
          const isOutdoor = slot.recommendation === 'safe-outdoor';
          const isIndoorOnly = slot.recommendation === 'indoor-only';
          const isModerate = slot.recommendation === 'moderate-caution';

          // Daypart classification
          const period =
            slot.hour < 12 ? 'Morning Session' : slot.hour < 17 ? 'Afternoon Session' : 'Evening Session';

          return (
            <div
              key={slot.hour}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isIndoorOnly
                  ? 'bg-rose-50/50 border-rose-200/80 hover:border-rose-300'
                  : isOutdoor
                  ? 'bg-emerald-50/50 border-emerald-200/80 hover:border-emerald-300'
                  : 'bg-[#F6F7F2] border-[#E5EAE4] hover:border-[#B8CDB8]'
              }`}
            >
              {/* Time & Recommendation Badge */}
              <div className="flex items-center gap-3 min-w-[150px]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">
                    {period}
                  </span>
                  <span className="font-heading text-base font-extrabold text-[#202B29] tabular-nums">
                    {slot.timeLabel}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                    isIndoorOnly
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : isOutdoor
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : isModerate
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-purple-100 text-purple-800 border-purple-200'
                  }`}
                >
                  {slot.recommendation.replace('-', ' ')}
                </span>
              </div>

              {/* Activity & Health Guidance */}
              <div className="flex-1">
                <h4 className="font-heading font-bold text-[#202B29] text-sm leading-snug">
                  {slot.activity}
                </h4>
                <p className="text-xs text-[#73817B] mt-1 leading-relaxed">
                  {slot.healthImpactNotes}
                </p>
                {slot.environmentalOffsetNotes && (
                  <p className="text-[11px] text-[#398F83] font-medium mt-1">
                    🌱 {slot.environmentalOffsetNotes}
                  </p>
                )}
              </div>

              {/* Telemetry Metrics */}
              <div className="flex items-center gap-4 text-xs min-w-[170px] justify-end border-t md:border-t-0 pt-2 md:pt-0 border-[#E5EAE4]">
                <div className="text-right">
                  <div className="text-[#73817B] text-[10px] font-semibold">Predicted AQI</div>
                  <div className="font-heading font-bold text-[#202B29] text-sm tabular-nums">
                    {slot.predictedAQI}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#73817B] text-[10px] font-semibold">Inversion Risk</div>
                  <div
                    className={`font-bold capitalize text-xs ${
                      slot.inversionLikelihood === 'high'
                        ? 'text-[#DC2626]'
                        : slot.inversionLikelihood === 'moderate'
                        ? 'text-[#D97706]'
                        : 'text-[#16A34A]'
                    }`}
                  >
                    {slot.inversionLikelihood}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
