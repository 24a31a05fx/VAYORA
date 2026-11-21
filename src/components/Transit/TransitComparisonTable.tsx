// ============================================================
// src/components/Transit/TransitComparisonTable.tsx
// Multi-modal transit comparison table with health risk indicators
// Nature Meets Urban Intelligence Design Direction
// ============================================================

import { memo } from 'react';
import type { TransitRouteComparison } from '@/types';

interface TransitComparisonTableProps {
  modalComparisons: TransitRouteComparison[];
}

export const TransitComparisonTable = memo(function TransitComparisonTable({
  modalComparisons,
}: TransitComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E5EAE4]">
      <table className="w-full text-left text-xs text-[#202B29] border-collapse bg-[#FFFFFF]">
        <caption className="sr-only">
          Comparison of transit modes by duration, PM2.5 exposure dose, carbon emissions, and health risk
        </caption>
        <thead>
          <tr className="border-b border-[#E5EAE4] bg-[#F6F7F2] text-[#73817B] uppercase text-[10px] font-bold tracking-wider">
            <th scope="col" className="py-3.5 px-4">Transit Mode</th>
            <th scope="col" className="py-3.5 px-3">Duration</th>
            <th scope="col" className="py-3.5 px-3">PM2.5 Inhaled Dose</th>
            <th scope="col" className="py-3.5 px-3">CO₂ Footprint</th>
            <th scope="col" className="py-3.5 px-3">Health Risk</th>
            <th scope="col" className="py-3.5 px-4">Clinical Advisory</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5EAE4]">
          {modalComparisons.map((item) => (
            <tr
              key={item.mode}
              className={`transition-colors duration-150 ${
                item.isRecommended
                  ? 'bg-[#EBF2EC]/70 font-semibold text-[#153C35]'
                  : 'hover:bg-[#F6F7F2]'
              }`}
            >
              <td className="py-3.5 px-4 flex items-center gap-2.5">
                {item.isRecommended && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#153C35] shrink-0"
                    title="Recommended Option"
                    aria-hidden="true"
                  />
                )}
                <span className="font-heading font-bold text-[#202B29] text-xs">
                  {item.modeLabel}
                </span>
              </td>
              <td className="py-3.5 px-3 whitespace-nowrap tabular-nums font-medium text-[#202B29]">
                {item.durationMinutes} mins
              </td>
              <td className="py-3.5 px-3 font-mono font-bold tabular-nums">
                <span
                  className={
                    item.pm25ExposureDoseUg > 40
                      ? 'text-[#DC2626]'
                      : item.pm25ExposureDoseUg > 20
                      ? 'text-[#D97706]'
                      : 'text-[#16A34A]'
                  }
                >
                  {item.pm25ExposureDoseUg} µg
                </span>
              </td>
              <td className="py-3.5 px-3 whitespace-nowrap tabular-nums text-[#73817B] font-medium">
                {item.co2EmissionsKg} kg
              </td>
              <td className="py-3.5 px-3">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    item.healthRiskRating === 'severe'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : item.healthRiskRating === 'moderate'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : item.healthRiskRating === 'low'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {item.healthRiskRating}
                </span>
              </td>
              <td className="py-3.5 px-4 text-[#73817B] max-w-xs leading-relaxed text-xs">
                {item.advisory}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
