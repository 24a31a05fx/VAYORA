// ============================================================
// src/components/Routine/ActionPlanChecklists.tsx
// Unified Step 4 results: Household guidance, interactive IAQ checklist,
// tailored sustainable commute note & data/AI transparency disclosure
// ============================================================

import { memo, useState, useMemo } from 'react';
import { TransitMode, type DailyRoutinePlan, type HouseholdProfile, type UrbanZone, type TelemetryDataSource } from '@/types';
import { calculateCommuteMetrics } from '@/lib/compute';
import { TransitIcon, ShieldAlertIcon } from '@/components/shared/Icons';

interface ActionPlanChecklistsProps {
  plan: DailyRoutinePlan;
  zone: UrbanZone;
  household: HouseholdProfile;
  dataSource: TelemetryDataSource;
}

const COMMUTE_MAP: Record<HouseholdProfile['commuteMode'], TransitMode> = {
  metro: TransitMode.Metro,
  bus: TransitMode.ElectricBus,
  car: TransitMode.GasCar,
  'walk-bike': TransitMode.Cycling,
  remote: TransitMode.Walking,
};

function ChecklistRow({ item, isDone, onToggle }: { item: string; isDone: boolean; onToggle: () => void }) {
  return (
    <li className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-xl p-3">
      <label className="flex items-start gap-2.5 cursor-pointer text-[#202B29]">
        <input type="checkbox" checked={isDone} onChange={onToggle} className="accent-[#153C35] w-4 h-4 mt-0.5 shrink-0" />
        <span className={isDone ? 'line-through text-[#73817B]' : 'leading-relaxed'}>{item}</span>
      </label>
    </li>
  );
}

function InteractiveChecklistCard({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const completedCount = items.filter((item) => checked[item]).length;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading font-bold text-base text-[#153C35]">Indoor Air Improvement Checklist</h3>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF2EC] text-[#153C35]">
          {completedCount} / {items.length} done
        </span>
      </div>
      <ul className="flex flex-col gap-2.5 text-xs">
        {items.map((item) => (
          <ChecklistRow key={item} item={item} isDone={Boolean(checked[item])} onToggle={() => setChecked((p) => ({ ...p, [item]: !p[item] }))} />
        ))}
      </ul>
    </div>
  );
}

function CommuteStatTile({ title, modeLabel, dose, co2, isHighlight }: { title: string; modeLabel: string; dose: number; co2: number; isHighlight?: boolean }) {
  const boxCls = isHighlight ? 'bg-[#EBF2EC] border-[#B8CDB8]' : 'bg-[#F6F7F2] border-[#E5EAE4]';
  const titleCls = isHighlight ? 'text-[#153C35]' : 'text-[#73817B]';
  return (
    <div className={`${boxCls} border rounded-xl p-3`}>
      <span className={`text-[10px] font-bold uppercase ${titleCls}`}>{title}</span>
      <div className="font-bold text-[#153C35] mt-1">{modeLabel}</div>
      <div className="text-[11px] text-[#73817B] mt-0.5 tabular-nums">Dose ~{dose} µg • CO₂ ~{co2} kg</div>
    </div>
  );
}

function CommuteGuidanceCard({ suggestion, zone, commuteMode }: { suggestion: string; zone: UrbanZone; commuteMode: HouseholdProfile['commuteMode'] }) {
  const metrics = useMemo(() => ({
    chosen: calculateCommuteMetrics(8, COMMUTE_MAP[commuteMode], zone.aqi),
    metro: calculateCommuteMetrics(8, TransitMode.Metro, zone.aqi),
  }), [commuteMode, zone.aqi]);

  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
      <div>
        <h3 className="font-heading font-bold text-base text-[#153C35] flex items-center gap-2">
          <TransitIcon size={16} className="text-[#398F83]" /> Sustainable Commute Suggestion
        </h3>
        <p className="text-xs text-[#202B29] mt-2 leading-relaxed">{suggestion}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E5EAE4]">
        <CommuteStatTile title="Your Current Mode (8 km est.)" modeLabel={metrics.chosen.modeLabel} dose={metrics.chosen.pm25ExposureDoseUg} co2={metrics.chosen.co2EmissionsKg} />
        <CommuteStatTile title="Clean Alternative (8 km est.)" modeLabel={metrics.metro.modeLabel} dose={metrics.metro.pm25ExposureDoseUg} co2={metrics.metro.co2EmissionsKg} isHighlight />
      </div>
    </div>
  );
}

export const ActionPlanChecklists = memo(function ActionPlanChecklists({ plan, zone, household, dataSource }: ActionPlanChecklistsProps) {
  const aiLabel = plan.source === 'gemini-ai' ? 'Google Gemini API' : plan.source === 'server-heuristic' ? 'Server Deterministic Fallback' : 'Offline Client Heuristic';
  const airLabel = dataSource === 'open-meteo-live' ? 'Live Open-Meteo Telemetry' : dataSource === 'simulated-scenario' ? 'Simulated Stress Test' : 'Demonstration Baseline';

  return (
    <div className="flex flex-col gap-4">
      {plan.householdGuidance && (
        <div className="bg-[#EBF2EC] border border-[#B8CDB8] rounded-2xl p-4 text-xs text-[#153C35] flex items-start gap-2.5">
          <ShieldAlertIcon size={16} className="shrink-0 mt-0.5 text-[#153C35]" />
          <div><strong>Household Guidance:</strong> {plan.householdGuidance}</div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InteractiveChecklistCard items={plan.indoorChecklist ?? plan.generalAdvice} />
        <CommuteGuidanceCard suggestion={plan.commuteSuggestion ?? ''} zone={zone} commuteMode={household.commuteMode} />
      </div>
      <div className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-4 text-[11px] text-[#73817B] leading-relaxed">
        <strong className="text-[#153C35]">Data & Model Transparency:</strong> Telemetry Source = <strong>{airLabel}</strong> | Recommendation Engine = <strong>{aiLabel}</strong>. {plan.methodologyNote || 'Values marked as estimates are modelled from standard EPA & ASHRAE equations.'}
      </div>
    </div>
  );
});
