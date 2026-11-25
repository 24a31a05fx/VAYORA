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

function getSlotCardClass(recommendation: string): string {
  if (recommendation === 'indoor-only') return 'bg-rose-50/50 border-rose-200/80 hover:border-rose-300';
  if (recommendation === 'safe-outdoor') return 'bg-emerald-50/50 border-emerald-200/80 hover:border-emerald-300';
  return 'bg-[#F6F7F2] border-[#E5EAE4] hover:border-[#B8CDB8]';
}

function getSlotBadgeClass(recommendation: string): string {
  if (recommendation === 'indoor-only') return 'bg-rose-100 text-rose-800 border-rose-200';
  if (recommendation === 'safe-outdoor') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (recommendation === 'moderate-caution') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-sky-100 text-sky-900 border-sky-200';
}

function getInversionClass(likelihood: string): string {
  if (likelihood === 'high') return 'text-[#DC2626]';
  if (likelihood === 'moderate') return 'text-[#D97706]';
  return 'text-[#16A34A]';
}

function TimelineHeader({ persona, zoneName }: { persona: string; zoneName: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h3 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2">
          Hour-by-Hour Exposure & Routine Timeline
        </h3>
        <p className="text-xs text-[#73817B] mt-0.5">
          Tailored for <strong className="text-[#202B29]">{persona}</strong> in <strong className="text-[#202B29]">{zoneName}</strong>
        </p>
      </div>
      <span className="text-xs font-semibold text-[#398F83] bg-[#E8F0EA] px-3 py-1 rounded-full w-fit">
        Meteorologically Optimized
      </span>
    </div>
  );
}

function SlotMetrics({ predictedAQI, inversionLikelihood }: { predictedAQI: number; inversionLikelihood: string }) {
  return (
    <div className="flex items-center gap-4 text-xs min-w-[170px] justify-end border-t md:border-t-0 pt-2 md:pt-0 border-[#E5EAE4]">
      <div className="text-right">
        <div className="text-[#73817B] text-[10px] font-semibold">Predicted AQI</div>
        <div className="font-heading font-bold text-[#202B29] text-sm tabular-nums">{predictedAQI}</div>
      </div>
      <div className="text-right">
        <div className="text-[#73817B] text-[10px] font-semibold">Inversion Risk</div>
        <div className={`font-bold capitalize text-xs ${getInversionClass(inversionLikelihood)}`}>{inversionLikelihood}</div>
      </div>
    </div>
  );
}

function TimelineSlotCard({ slot }: { slot: DailyRoutinePlan['hourlySchedule'][number] }) {
  const period = slot.hour < 12 ? 'Morning Session' : slot.hour < 17 ? 'Afternoon Session' : 'Evening Session';
  const cardClass = getSlotCardClass(slot.recommendation);
  const badgeClass = getSlotBadgeClass(slot.recommendation);

  return (
    <div className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardClass}`}>
      <div className="flex items-center gap-3 min-w-[150px]">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">{period}</span>
          <span className="font-heading text-base font-extrabold text-[#202B29] tabular-nums">{slot.timeLabel}</span>
        </div>
        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${badgeClass}`}>
          {slot.recommendation.replace('-', ' ')}
        </span>
      </div>
      <div className="flex-1">
        <h4 className="font-heading font-bold text-[#202B29] text-sm leading-snug">{slot.activity}</h4>
        <p className="text-xs text-[#73817B] mt-1 leading-relaxed">{slot.healthImpactNotes}</p>
        {slot.environmentalOffsetNotes && <p className="text-[11px] text-[#398F83] font-medium mt-1"><span className="font-bold">•</span> {slot.environmentalOffsetNotes}</p>}
      </div>
      <SlotMetrics predictedAQI={slot.predictedAQI} inversionLikelihood={slot.inversionLikelihood} />
    </div>
  );
}

export const RoutineTimeline = memo(function RoutineTimeline({ routinePlan, zoneName }: RoutineTimelineProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-5 sm:p-7 flex flex-col gap-5 shadow-sm shadow-[#153C35]/5">
      <TimelineHeader persona={routinePlan.persona} zoneName={zoneName} />
      <div className="flex flex-col gap-3">
        {routinePlan.hourlySchedule.map((slot) => (
          <TimelineSlotCard key={slot.hour} slot={slot} />
        ))}
      </div>
    </div>
  );
});
