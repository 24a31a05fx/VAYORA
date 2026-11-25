// ============================================================
// src/components/Dashboard/EmissionSourceTreemap.tsx
// Segmented Rectangle Treemap for Urban Emission Attribution
// Directly inspired by Reference Design Image 2 ("My CO2 emission")
// ============================================================

import { memo } from 'react';

interface EmissionSource {
  id: string;
  name: string;
  percentage: number;
  colorClass: string;
}

const SOURCES: EmissionSource[] = [
  { id: 'traffic', name: 'Vehicular Traffic', percentage: 34, colorClass: 'bg-[#153C35]' },
  { id: 'industry', name: 'Industrial Boilers', percentage: 24, colorClass: 'bg-[#1A473E]' },
  { id: 'construction', name: 'Construction Dust', percentage: 16, colorClass: 'bg-[#1F5248]' },
  { id: 'biomass', name: 'Biomass Burning', percentage: 12, colorClass: 'bg-[#255E53]' },
  { id: 'heating', name: 'Domestic Energy', percentage: 8, colorClass: 'bg-[#2C6B5E]' },
  { id: 'precursors', name: 'Precursor VOCs', percentage: 6, colorClass: 'bg-[#33776A]' },
];

function TreemapHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-bold text-base text-[#153C35]">
            Urban Smog Emission Attribution
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F0EA] text-[#153C35] border border-[#B8CDB8]/60">
            Illustrative Weights
          </span>
        </div>
        <p className="text-xs text-[#73817B] mt-0.5">
          Typical urban winter particulate source categories for household prioritization
        </p>
      </div>
    </div>
  );
}

function TreemapTile({ source }: { source: EmissionSource }) {
  return (
    <div className={`rounded-2xl p-3.5 sm:p-4 text-white flex flex-col justify-between shadow-sm transition-transform hover:scale-[1.01] ${source.colorClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#C8E0D8]">{source.name}</span>
      </div>
      <div className="mt-3">
        <span className="font-heading font-black text-xl sm:text-2xl tracking-tight">{source.percentage}%</span>
      </div>
    </div>
  );
}

function TreemapFooter() {
  return (
    <div className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-3 text-xs text-[#73817B] flex items-center justify-between gap-2">
      <span>Reference urban emission inventory breakdown (illustrative model weights)</span>
      <span className="font-bold text-[#153C35] shrink-0">Reference Model</span>
    </div>
  );
}

export const EmissionSourceTreemap = memo(function EmissionSourceTreemap() {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-sm shadow-[#153C35]/5">
      <TreemapHeader />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {SOURCES.map((s) => (
          <TreemapTile key={s.id} source={s} />
        ))}
      </div>
      <TreemapFooter />
    </div>
  );
});
