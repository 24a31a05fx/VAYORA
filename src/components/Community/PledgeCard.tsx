// ============================================================
// src/components/Community/PledgeCard.tsx
// Community pledge card with participation progress bar
// Nature Meets Urban Intelligence Design Direction
// ============================================================

import { memo } from 'react';
import type { CommunityPledge } from '@/types';

interface PledgeCardProps {
  pledge: CommunityPledge;
  onToggle: (id: string) => void;
  pledgedLabel: string;
  pledgeNowLabel: string;
}

export const PledgeCard = memo(function PledgeCard({
  pledge,
  onToggle,
  pledgedLabel,
  pledgeNowLabel,
}: PledgeCardProps) {
  const progress = Math.min(
    100,
    Math.round((pledge.currentParticipants / pledge.targetParticipants) * 100)
  );

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl border flex flex-col justify-between gap-5 transition-all duration-200 shadow-sm shadow-[#153C35]/5 ${
        pledge.userPledged
          ? 'bg-[#FFFFFF] border-[#153C35] ring-2 ring-[#153C35]/15 shadow-md shadow-[#153C35]/10'
          : 'bg-[#FFFFFF] border-[#E5EAE4] hover:border-[#B8CDB8] hover:shadow-md'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-heading font-bold text-[#202B29] text-base leading-snug">
            {pledge.title}
          </h4>
          {pledge.userPledged && (
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E8F0EA] text-[#153C35] border border-[#B8CDB8] shrink-0">
              {pledgedLabel}
            </span>
          )}
        </div>

        <p className="text-xs text-[#73817B] mt-2 leading-relaxed">
          {pledge.impactDescription}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between text-xs text-[#73817B]">
          <span>
            Participation: <strong className="text-[#202B29] font-bold tabular-nums">{pledge.currentParticipants}</strong> / {pledge.targetParticipants} households
          </span>
          <span className="font-heading font-extrabold text-[#153C35] tabular-nums">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[#EBF2EC] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#153C35] to-[#398F83] transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={pledge.currentParticipants}
            aria-valuemin={0}
            aria-valuemax={pledge.targetParticipants}
            aria-label={`${pledge.title} progress`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#E5EAE4] mt-1 gap-2">
          <span className="text-xs text-[#73817B]">
            Est. Relief: <strong className="text-[#153C35] font-bold tabular-nums">~{pledge.estimatedEmissionReductionKg} kg CO₂ / wk</strong>
          </span>

          <button
            type="button"
            onClick={() => onToggle(pledge.id)}
            aria-pressed={pledge.userPledged}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35] ${
              pledge.userPledged
                ? 'bg-[#F6F7F2] text-[#202B29] hover:bg-[#EBF2EC] hover:text-[#153C35] border border-[#E5EAE4]'
                : 'bg-[#153C35] text-white hover:bg-[#0D2823] shadow-sm shadow-[#153C35]/20'
            }`}
          >
            {pledge.userPledged ? 'Cancel Pledge' : pledgeNowLabel}
          </button>
        </div>
      </div>
    </div>
  );
});
