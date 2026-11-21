// ============================================================
// src/components/IAQ/WindowSchedule.tsx
// Smart Inversion-Aware Window Ventilation Schedule
// Nature Meets Urban Intelligence Design Direction
// ============================================================

import { memo } from 'react';

interface WindowScheduleProps {
  currentAqi: number;
}

interface WindowSlotProps {
  category: string;
  action: string;
  detail: string;
  status: string;
  variant: 'rose' | 'emerald' | 'amber';
}

function WindowSlotCard({ category, action, detail, status, variant }: WindowSlotProps) {
  const colorMap = {
    rose: { card: 'bg-rose-50/60 border-rose-200', text: 'text-[#991B1B]', badge: 'bg-rose-100/80 text-[#991B1B]' },
    emerald: { card: 'bg-emerald-50/60 border-emerald-200', text: 'text-[#166534]', badge: 'bg-emerald-100/80 text-[#166534]' },
    amber: { card: 'bg-amber-50/60 border-amber-200', text: 'text-[#92400E]', badge: 'bg-amber-100/80 text-[#92400E]' },
  };
  const theme = colorMap[variant];

  return (
    <div className={`${theme.card} border rounded-2xl p-4 flex flex-col justify-between gap-2`}>
      <div>
        <span className={`text-[10px] font-black uppercase tracking-wider ${theme.text} block`}>{category}</span>
        <strong className="font-heading text-sm font-bold text-[#202B29] block mt-1">{action}</strong>
        <p className="text-[#73817B] text-[11px] mt-1.5 leading-relaxed">{detail}</p>
      </div>
      <span className={`text-[10px] font-bold ${theme.badge} px-2 py-0.5 rounded-full w-fit`}>{status}</span>
    </div>
  );
}

export const WindowSchedule = memo(function WindowSchedule({ currentAqi }: WindowScheduleProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5 flex flex-col gap-4">
      <div>
        <h3 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2">
          <span aria-hidden="true">🪟</span> Smart Inversion-Aware Window Ventilation Schedule
        </h3>
        <p className="text-xs text-[#73817B] mt-0.5">Tailored to current outdoor AQI ({currentAqi}) and meteorological boundary layer dynamics.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-1">
        <WindowSlotCard category="Morning Inversion Lock (6:00 AM – 10:30 AM)" action="Windows Tightly Latched" detail="Cold nocturnal air traps ground-level vehicular soot. Opening windows increases indoor PM2.5 by 300%." status="Hazard Window: Closed" variant="rose" />
        <WindowSlotCard category="Optimal Flush Window (1:30 PM – 3:30 PM)" action="Crack Opposing Windows (15 mins)" detail="Solar radiation breaks the surface inversion, maximizing natural vertical air mixing and flushing stale CO2." status="Recommended Air Flush" variant="emerald" />
        <WindowSlotCard category="Evening Rush Trap (5:30 PM – 9:00 PM)" action="Seal Perimeter & Run HEPA" detail="Commuter traffic and cooling surface temperatures cause toxic secondary particulate settling." status="Active Filtration Required" variant="amber" />
      </div>
    </div>
  );
});
