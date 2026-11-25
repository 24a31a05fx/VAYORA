// ============================================================
// src/components/Routine/ActionPlanRecommendations.tsx
// Step 3 & 4 Priority Recommendations across Routine, Indoor Air, and Transit
// Explicitly surfaces What to Change, Why, Environmental Benefit, Exposure Note & Effort
// ============================================================

import { memo } from 'react';
import type { PriorityRecommendation } from '@/types';
import { LightbulbIcon } from '@/components/shared/Icons';

const CATEGORY_LABELS: Record<PriorityRecommendation['category'], { label: string; cls: string }> = {
  'daily-routine': { label: 'A. Daily Routine', cls: 'bg-[#EBF2EC] text-[#153C35] border-[#B8CDB8]' },
  'indoor-air': { label: 'B. Indoor Air Quality', cls: 'bg-sky-50 text-sky-900 border-sky-200' },
  'sustainable-transit': { label: 'C. Sustainable Transit', cls: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
};

function ImpactRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="text-xs leading-relaxed">
      <span className="font-bold text-[#153C35]">{label}: </span>
      <span className="text-[#202B29]">{text}</span>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: PriorityRecommendation }) {
  const cat = CATEGORY_LABELS[rec.category];
  return (
    <article className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cat.cls}`}>{cat.label}</span>
        <div className="flex items-center gap-1.5">
          {rec.isEstimate && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F6F7F2] text-[#73817B] border border-[#E5EAE4]">Estimated Model</span>}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">{rec.effort} Effort</span>
        </div>
      </div>
      <h4 className="font-heading font-bold text-sm text-[#153C35] leading-snug">{rec.title}</h4>
      <div className="flex flex-col gap-2 pt-2 border-t border-[#E5EAE4]/80">
        <ImpactRow label="What to change" text={rec.whatToChange} />
        <ImpactRow label="Why it matters" text={rec.whyItMatters} />
        <ImpactRow label="Environmental benefit" text={rec.environmentalBenefit} />
        <ImpactRow label="Exposure note" text={rec.exposureNote} />
      </div>
    </article>
  );
}

export const ActionPlanRecommendations = memo(function ActionPlanRecommendations({
  recommendations,
}: {
  recommendations?: PriorityRecommendation[];
}) {
  if (!recommendations || recommendations.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h3 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2">
          <LightbulbIcon size={18} className="text-[#398F83]" /> Priority Family Action Plan & Impact Guide
        </h3>
        <span className="text-[11px] text-[#73817B]">Structured across Routines, Indoor Air & Sustainable Commuting</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => <RecommendationCard key={rec.id} rec={rec} />)}
      </div>
    </div>
  );
});
