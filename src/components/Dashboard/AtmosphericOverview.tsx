// ============================================================
// src/components/Dashboard/AtmosphericOverview.tsx
// Atmospheric overview header with dynamic date, live telemetry sync & workflow CTA
// ============================================================

import { memo, useState } from 'react';
import type { UrbanZone, TelemetryDataSource } from '@/types';
import { LeafIcon, SparklesIcon } from '@/components/shared/Icons';

interface AtmosphericOverviewProps {
  currentZone: UrbanZone;
  dataSource: TelemetryDataSource;
  isSyncingLive: boolean;
  syncError: string | null;
  onSyncLive?: () => void;
  onStartActionPlan?: () => void;
}

const REACTIONS = [
  { id: 'clean', label: 'Crisp' },
  { id: 'breezy', label: 'Breezy' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'smog', label: 'Smog' },
  { id: 'heavy', label: 'Severe' },
];

function getFormattedDateParts() {
  const now = new Date();
  return {
    dayNum: new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(now),
    weekday: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now),
    monthYear: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now),
  };
}

function getSourceBadge(dataSource: TelemetryDataSource) {
  if (dataSource === 'open-meteo-live') {
    return { label: 'Live Open-Meteo Feed', cls: 'bg-[#EBF2EC] text-[#153C35] border-[#B8CDB8]' };
  }
  if (dataSource === 'simulated-scenario') {
    return { label: 'Simulated Scenario', cls: 'bg-amber-50 text-amber-900 border-amber-200' };
  }
  return { label: 'Demonstration Baseline', cls: 'bg-amber-50 text-amber-900 border-amber-200' };
}

function DateActionPill({ dataSource, isSyncingLive, onSyncLive }: { dataSource: TelemetryDataSource; isSyncingLive: boolean; onSyncLive?: () => void }) {
  const d = getFormattedDateParts();
  const badge = getSourceBadge(dataSource);
  return (
    <div className="flex flex-wrap items-center gap-3 bg-[#FFFFFF] border border-[#E5EAE4] rounded-2xl p-2.5 sm:px-4 shadow-sm shadow-[#153C35]/5">
      <div className="flex items-center gap-2.5">
        <span className="font-heading font-black text-2xl text-[#153C35] leading-none tabular-nums">{d.dayNum}</span>
        <div className="text-left">
          <span className="text-[11px] font-bold text-[#73817B] block uppercase tracking-wider">{d.weekday}</span>
          <span className="text-xs font-bold text-[#202B29] block -mt-0.5">{d.monthYear}</span>
        </div>
      </div>
      <div className="h-6 w-px bg-[#E5EAE4] hidden sm:block" />
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.cls}`}>{badge.label}</span>
      <button type="button" onClick={onSyncLive} disabled={isSyncingLive} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#153C35] text-white hover:bg-[#1C4E46] disabled:opacity-50 transition-colors cursor-pointer">
        <span>{isSyncingLive ? 'Syncing Feed…' : 'Fetch Live Open-Meteo'}</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

function WorkflowLauncherCard({ zoneName, onStartActionPlan }: { zoneName: string; onStartActionPlan?: () => void }) {
  return (
    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#EBF2EC] border border-[#B8CDB8] rounded-2xl p-3 sm:px-4">
      <div>
        <div className="flex items-center gap-1.5 text-xs">
          <SparklesIcon size={14} className="text-[#153C35]" />
          <span className="font-bold text-[#153C35]">Need a Family Air Action Plan?</span>
        </div>
        <p className="text-[11px] text-[#1E4E45] mt-0.5">
          Tailor routines, indoor air steps & commute choices for {zoneName}.
        </p>
      </div>
      {onStartActionPlan && (
        <button type="button" onClick={onStartActionPlan} className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#153C35] text-white hover:bg-[#0D2823] shrink-0 cursor-pointer">
          Build Action Plan →
        </button>
      )}
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
          <button key={r.id} type="button" onClick={() => onSelect(r.id)} aria-pressed={isSel} className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] uppercase tracking-wider text-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${selClass}`}>
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
        <h4 className="font-heading font-bold text-sm text-white mt-1 leading-snug">How is the air quality feeling outside today?</h4>
      </div>
      <ReactionButtons selected={selected} onSelect={setSelected} />
    </div>
  );
}

export const AtmosphericOverview = memo(function AtmosphericOverview(props: AtmosphericOverviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        <DateActionPill dataSource={props.dataSource} isSyncingLive={props.isSyncingLive} onSyncLive={props.onSyncLive} />
        <WorkflowLauncherCard zoneName={props.currentZone.zoneName} onStartActionPlan={props.onStartActionPlan} />
      </div>
      {props.syncError && (
        <div role="status" className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
          <strong>Telemetry Status:</strong> {props.syncError}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <WeatherWindCard currentZone={props.currentZone} />
        <AssessmentReactionCard />
      </div>
    </div>
  );
});
