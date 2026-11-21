// ============================================================
// src/components/IAQ/WindowSchedule.tsx
// Smart Inversion-Aware Window Ventilation Schedule
// Nature Meets Urban Intelligence Design Direction
// ============================================================

import { memo } from 'react';

interface WindowScheduleProps {
  currentAqi: number;
}

export const WindowSchedule = memo(function WindowSchedule({ currentAqi }: WindowScheduleProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5 flex flex-col gap-4">
      <div>
        <h3 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2">
          <span aria-hidden="true">🪟</span> Smart Inversion-Aware Window Ventilation Schedule
        </h3>
        <p className="text-xs text-[#73817B] mt-0.5">
          Tailored to current outdoor AQI ({currentAqi}) and meteorological boundary layer dynamics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-1">
        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 flex flex-col justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#991B1B] block">
              Morning Inversion Lock (6:00 AM – 10:30 AM)
            </span>
            <strong className="font-heading text-sm font-bold text-[#202B29] block mt-1">
              Windows Tightly Latched
            </strong>
            <p className="text-[#73817B] text-[11px] mt-1.5 leading-relaxed">
              Cold nocturnal air traps ground-level vehicular soot. Opening windows increases indoor PM2.5 by 300%.
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#991B1B] bg-rose-100/80 px-2 py-0.5 rounded-full w-fit">
            Hazard Window: Closed
          </span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#166534] block">
              Optimal Flush Window (1:30 PM – 3:30 PM)
            </span>
            <strong className="font-heading text-sm font-bold text-[#202B29] block mt-1">
              Crack Opposing Windows (15 mins)
            </strong>
            <p className="text-[#73817B] text-[11px] mt-1.5 leading-relaxed">
              Solar radiation breaks the surface inversion, maximizing natural vertical air mixing and flushing stale CO2.
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#166534] bg-emerald-100/80 px-2 py-0.5 rounded-full w-fit">
            Recommended Air Flush
          </span>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#92400E] block">
              Evening Rush Trap (5:30 PM – 9:00 PM)
            </span>
            <strong className="font-heading text-sm font-bold text-[#202B29] block mt-1">
              Seal Perimeter & Run HEPA
            </strong>
            <p className="text-[#73817B] text-[11px] mt-1.5 leading-relaxed">
              Commuter traffic and cooling surface temperatures cause toxic secondary particulate settling.
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#92400E] bg-amber-100/80 px-2 py-0.5 rounded-full w-fit">
            Active Filtration Required
          </span>
        </div>
      </div>
    </div>
  );
});
