// ============================================================
// src/components/Routine/DailyRoutineOptimizer.tsx
// End-to-End Family Workflow: Household -> Local Air -> AI Plan -> Action Steps
// Per PROBLEM_ALIGNMENT.md §1.2 & ACCESSIBILITY.md §6
// ============================================================

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useProfileContext } from '@/context/ProfileContext';
import { useZoneContext } from '@/context/ZoneContext';
import { useUIContext } from '@/context/UIContext';
import { apiService } from '@/services/apiService';
import { generateHeuristicRoutine } from '@/lib/compute';
import type { DailyRoutinePlan, PersonaProfile, HouseholdProfile, UrbanZone, Language } from '@/types';
import { RoutineTimeline } from './RoutineTimeline';
import { PersonaSelector } from './PersonaSelector';
import { HouseholdContextForm } from './HouseholdContextForm';
import { ActionPlanRecommendations } from './ActionPlanRecommendations';
import { ActionPlanChecklists } from './ActionPlanChecklists';
import { SparklesIcon, LightbulbIcon, WarningIcon, CheckIcon } from '@/components/shared/Icons';

function GenerateButton({ isLoading, onGenerate }: { isLoading: boolean; onGenerate: () => void }) {
  return (
    <button
      type="button"
      onClick={onGenerate}
      disabled={isLoading}
      className="px-6 py-3.5 rounded-2xl font-heading font-bold text-sm bg-gradient-to-r from-[#153C35] to-[#1E4E45] text-white hover:from-[#0D2823] hover:to-[#153C35] transition-all shadow-md shadow-[#153C35]/20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span>Optimizing with VAYORA Intelligence…</span>
        </>
      ) : (
        <>
          <SparklesIcon size={14} className="text-white" />
          <span>Generate Smart Schedule</span>
        </>
      )}
    </button>
  );
}

function OptimizerHeader({ isLoading, onGenerate }: { isLoading: boolean; onGenerate: () => void }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h2 className="font-heading text-xl font-black text-[#153C35] flex items-center gap-2">
          My Day: VAYORA Intelligence Daily Routine & Smog Exposure Optimizer
        </h2>
        <p className="text-xs text-[#73817B] mt-1 max-w-2xl leading-relaxed">
          Configure your household profile and neighborhood conditions to generate personalized routines, indoor air actions, and commute advice.
        </p>
      </div>
      <GenerateButton isLoading={isLoading} onGenerate={onGenerate} />
    </div>
  );
}

function MetricHighlightCard({ label, value, sub, isGreen }: { label: string; value: string; sub: string; isGreen?: boolean }) {
  const bg = isGreen ? 'bg-[#EBF2EC] border-[#B8CDB8]' : 'bg-[#FFFFFF] border-[#E5EAE4]';
  const valColor = isGreen ? 'text-[#153C35]' : 'text-[#398F83]';
  const subColor = isGreen ? 'text-[#1E4E45] font-medium' : 'text-[#73817B]';

  return (
    <div className={`${bg} border rounded-3xl p-5 flex flex-col justify-between shadow-sm`}>
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#73817B]">{label}</span>
        <div className={`font-heading text-2xl font-black ${valColor} mt-1 tabular-nums`}>{value}</div>
      </div>
      <p className={`text-xs ${subColor} mt-2 leading-relaxed`}>{sub}</p>
    </div>
  );
}

function HighlightMetrics({ plan }: { plan: DailyRoutinePlan }) {
  const windowTime = `${plan.optimalOutdoorWindow.startHour}:00 – ${plan.optimalOutdoorWindow.endHour}:00`;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricHighlightCard label="Optimal Outdoor Window" value={windowTime} sub={plan.optimalOutdoorWindow.rationale} isGreen />
      <MetricHighlightCard label="Modelled Exposure Index (Estimate)" value={`${plan.totalExposureScore} µg·h`} sub="Calculated scenario index based on zone PM2.5 and sensitivity tier; not a clinical reading." />
      <MetricHighlightCard label="Commute Shift CO₂ Estimate" value={`${plan.carbonOffsetKg} kg / day`} sub="Illustrative comparison vs. a 10 km solo gasoline car round trip based on your selected habit." />
    </div>
  );
}

function DirectivesCard({ advice }: { advice: string[] }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5">
      <h3 className="font-heading text-base font-bold text-[#153C35] flex items-center gap-2 mb-3">
        <LightbulbIcon size={16} /> Smog Defense Directives
      </h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#202B29]">
        {advice.map((item) => (
          <li key={item} className="flex items-start gap-2.5 bg-[#F6F7F2] p-3.5 rounded-2xl border border-[#E5EAE4]">
            <CheckIcon size={14} className="text-[#398F83] shrink-0 mt-0.5" />
            <span className="leading-relaxed text-[#202B29]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function executeRoutineGeneration(
  persona: PersonaProfile,
  household: HouseholdProfile,
  zone: UrbanZone,
  language: Language,
  signal: AbortSignal,
  setPlan: (p: DailyRoutinePlan) => void,
  setError: (msg: string) => void
) {
  try {
    const plan = await apiService.generateDailyRoutine({ persona, zone, household, language }, signal);
    setPlan(plan);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return;
    setPlan(generateHeuristicRoutine(persona, zone, language, household));
    setError('Offline / Demo Fallback: Personalized plan generated locally using deterministic EPA & ASHRAE meteorology equations.');
  }
}

function useRoutineOptimizer() {
  const profile = useProfileContext();
  const zoneCtx = useZoneContext();
  const { language } = useUIContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const handleGenerate = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await executeRoutineGeneration(profile.activePersona, profile.householdProfile, zoneCtx.selectedZone, language, abortRef.current.signal, profile.setRoutinePlan, setErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [profile.activePersona, profile.householdProfile, profile.setRoutinePlan, zoneCtx.selectedZone, language]);

  return { ...profile, ...zoneCtx, isLoading, errorMessage, handleGenerate };
}

function EmptyPlanBanner() {
  return (
    <div className="bg-[#FFFFFF] border border-dashed border-[#B8CDB8] rounded-3xl p-6 text-center text-xs text-[#73817B]">
      <strong className="text-[#153C35] block text-sm mb-1">Ready to Build Your Personalized Air Action Plan</strong>
      Select your neighborhood and household profile above, then click <strong>Generate Smart Schedule</strong> to receive low-emission routine timing, indoor air checklist steps, and commute recommendations.
    </div>
  );
}

function PlanResultsView({ plan, zone, household, dataSource }: { plan: DailyRoutinePlan; zone: UrbanZone; household: HouseholdProfile; dataSource: ReturnType<typeof useZoneContext>['dataSource'] }) {
  return (
    <div className="flex flex-col gap-6 fade-in">
      <HighlightMetrics plan={plan} />
      <ActionPlanRecommendations recommendations={plan.priorityRecommendations} />
      <ActionPlanChecklists plan={plan} zone={zone} household={household} dataSource={dataSource} />
      <RoutineTimeline routinePlan={plan} zoneName={zone.zoneName} />
      <DirectivesCard advice={plan.generalAdvice} />
    </div>
  );
}

export const DailyRoutineOptimizer = memo(function DailyRoutineOptimizer() {
  const state = useRoutineOptimizer();
  return (
    <section aria-label="VAYORA Intelligence Daily Routine and Exposure Optimizer" className="flex flex-col gap-6 fade-in">
      <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5 flex flex-col gap-6">
        <OptimizerHeader isLoading={state.isLoading} onGenerate={state.handleGenerate} />
        <PersonaSelector personas={state.personas} activePersona={state.activePersona} onSelectPersona={state.setActivePersona} />
        <HouseholdContextForm zones={state.zones} selectedZone={state.selectedZone} dataSource={state.dataSource} onSelectZone={state.setSelectedZoneId} household={state.householdProfile} onUpdateField={state.updateHouseholdField} />
        <div aria-live="polite" aria-busy={state.isLoading} className="sr-only">{state.isLoading ? 'Generating schedule with VAYORA Intelligence…' : 'Schedule ready.'}</div>
        {state.errorMessage && <div role="status" className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center gap-2"><span className="shrink-0"><WarningIcon size={16} /></span><span>{state.errorMessage}</span></div>}
      </div>
      {!state.routinePlan && !state.isLoading && <EmptyPlanBanner />}
      {state.routinePlan && <PlanResultsView plan={state.routinePlan} zone={state.selectedZone} household={state.householdProfile} dataSource={state.dataSource} />}
    </section>
  );
});
