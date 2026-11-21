// ============================================================
// src/components/IAQ/DIYHackGrid.tsx
// Low-Cost & DIY Indoor Air Purification Hack Cards
// Nature Meets Urban Intelligence Design Direction
// ============================================================

import { memo } from 'react';
import { DIY_HACKS } from '@/lib/constants';

export const DIYHackGrid = memo(function DIYHackGrid() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2">
          <span aria-hidden="true">💡</span> Low-Cost & DIY Indoor Air Purification Hacks
        </h3>
        <p className="text-xs text-[#73817B] mt-0.5">
          Peer-reviewed open-source solutions proven to deliver high CADR at minimal household expense.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DIY_HACKS.map((hack) => (
          <div
            key={hack.id}
            className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-[#B8CDB8] hover:shadow-md transition-all duration-200 shadow-sm shadow-[#153C35]/5"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-heading font-bold text-[#202B29] text-base leading-snug">
                  {hack.title}
                </h4>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F0EA] text-[#153C35] border border-[#B8CDB8] shrink-0">
                  {hack.costRating}
                </span>
              </div>
              <div className="text-xs text-[#398F83] font-bold mt-1.5 flex items-center gap-1.5">
                <span aria-hidden="true">💨</span>
                <span>Clean Air Output: {hack.cadrDelivery}</span>
              </div>
              <div className="text-xs text-[#202B29] mt-2.5 bg-[#F6F7F2] p-2.5 rounded-xl border border-[#E5EAE4]">
                <strong className="text-[#153C35]">Materials:</strong> {hack.materials}
              </div>
              <p className="text-xs text-[#73817B] mt-3 leading-relaxed">
                {hack.instructions}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E5EAE4] text-xs text-[#153C35] font-semibold flex items-center gap-1.5">
              <span>🎯</span>
              <span>{hack.efficiencyBonus}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
