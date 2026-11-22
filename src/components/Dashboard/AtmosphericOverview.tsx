// ============================================================
// src/components/Dashboard/AtmosphericOverview.tsx
// Atmospheric Intelligence Header, Date Pill & Assessment
// Directly inspired by Reference Design Image 1
// ============================================================

import { memo, useState } from 'react';
import type { UrbanZone } from '@/types';
import { LeafIcon, SparklesIcon } from '@/components/shared/Icons';

interface AtmosphericOverviewProps {
  currentZone: UrbanZone;
  onRefresh?: () => void;
}

const REACTIONS = [
  { id: 'clean', label: 'Crisp' },
  { id: 'breezy', label: 'Breezy' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'smog', label: 'Smog' },
  { id: 'heavy', label: 'Severe' },
];

function DateActionPill({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-[#FFFFFF] border border-[#E5EAE4] rounded-2xl p-2.5 sm:px-4 shadow-sm shadow-[#153C35]/5">
      <div className="flex items-center gap-2.5">
        <span className="font-heading font-black text-2xl text-[#153C35] leading-none">20</span>
        <div className="text-left">
          <span className="text-[11px] font-bold text-[#73817B] block uppercase tracking-wider">Monday</span>
          <span className="text-xs font-bold text-[#202B29] block -mt-0.5">January 2026</span>
        </div>
      </div>
      <div className="h-6 w-px bg-[#E5EAE4] hidden sm:block" />
      <button
        type="button"
        onClick={onRefresh}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#153C35] text-white hover:bg-[#1C4E46] transition-colors cursor-pointer"
      >
        <span>Show Real-Time Telemetry</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

function SearchPromptBar() {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="flex items-center gap-1.5 text-xs text-[#73817B]">
        <SparklesIcon size={14} className="text-[#398F83]" />
        <span className="font-semibold text-[#153C35]">Hey, Need a Forecast?</span>
      </div>
      <p className="text-xs text-[#73817B] mt-0.5">
        Ask VAYORA Intelligence about hyperlocal inversions, wind corridors, or air filtration.
      </p>
    </div>
  );
}

function WeatherWindCard({ currentZone }: { currentZone: UrbanZone }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-2xl p-4 flex flex-col justify-between shadow-sm shadow-[#153C35]/5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#73817B]">Wind & Atmosphere</span>
        <span className="text-xs font-bold text-[#398F83]">{currentZone.temperatureC}°C</span>
      </div>
      <div className="my-2">
        <div className="font-heading font-black text-2xl text-[#153C35] tabular-nums">
          {currentZone.windSpeedKmh} <span className="text-xs font-medium text-[#73817B]">km/h</span>
        </div>
        <p className="text-[11px] text-[#73817B] mt-0.5">Humidity: {currentZone.humidityPercent}% RH</p>
      </div>
      <div className="h-6 w-full flex items-center" aria-hidden="true">
        <svg viewBox="0 0 100 20" className="w-full h-full text-[#34D399]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M 0 10 Q 25 2 50 10 T 100 10" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function ReactionButtons({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-1.5 mt-3 pt-2 border-t border-white/15">
      {REACTIONS.map((r) => {
        const isSel = selected === r.id;
        const selClass = isSel ? 'bg-white text-[#153C35] font-bold shadow-xs' : 'bg-white/10 text-white/90 hover:bg-white/20 font-medium';
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            aria-pressed={isSel}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] uppercase tracking-wider text-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${selClass}`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function AssessmentReactionCard() {
  const [selected, setSelected] = useState<string>('moderate');

  return (
    <div className="bg-gradient-to-br from-[#153C35] to-[#1C4E46] text-white rounded-2xl p-4 flex flex-col justify-between shadow-md">
      <div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#99D5C9]">
          <LeafIcon size={12} />
          <span>Local Ambient Check</span>
        </div>
        <h4 className="font-heading font-bold text-sm text-white mt-1 leading-snug">
          How is the air quality treating you today?
        </h4>
      </div>
      <ReactionButtons selected={selected} onSelect={setSelected} />
    </div>
  );
}

export const AtmosphericOverview = memo(function AtmosphericOverview({ currentZone, onRefresh }: AtmosphericOverviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <DateActionPill onRefresh={onRefresh} />
        <SearchPromptBar />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <WeatherWindCard currentZone={currentZone} />
        <AssessmentReactionCard />
      </div>
    </div>
  );
});
