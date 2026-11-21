// ============================================================
// src/components/Community/CommunityHub.tsx
// Neighborhood collective pledges, live emission offsets, and multilingual advisories
// Per PROBLEM_ALIGNMENT.md §1.5 & ACCESSIBILITY.md §7
// ============================================================

import { memo, useState, useMemo, useCallback } from 'react';
import { useAppContext } from '@/context/useAppContext';
import { calculateCommunityOffset } from '@/lib/compute';
import { apiService } from '@/services/apiService';
import { TRANSLATIONS } from '@/lib/constants';
import type { CommunityAlert, CommunityPledge } from '@/types';
import { PledgeCard } from './PledgeCard';
import { WarningIcon, ShieldAlertIcon, BroadcastIcon, LeafIcon } from '@/components/shared/Icons';

function CollectiveResilienceBanner({ totalCo2Kg, totalPm25Grams }: { totalCo2Kg: number; totalPm25Grams: number }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-[#EBF2EC] to-transparent rounded-full -mr-20 -mt-20 pointer-events-none opacity-70" />
      <div className="relative z-10">
        <span className="text-xs uppercase font-bold tracking-wider text-[#398F83]">Collective Neighborhood Resilience Impact</span>
        <h2 className="font-heading text-2xl font-black text-[#153C35] mt-1">Community Smog Abatement Dashboard</h2>
        <p className="text-xs text-[#73817B] mt-1.5 max-w-xl leading-relaxed">When neighbors coordinate emission curbs (eliminating backyard burning, coordinating carpools, and wet-sweeping streets), local PM2.5 levels decrease by up to 28%.</p>
      </div>
      <div className="flex flex-wrap sm:flex-nowrap gap-4 relative z-10">
        <div className="bg-[#EBF2EC] border border-[#B8CDB8] rounded-2xl p-4 text-center min-w-[140px] flex-1 sm:flex-none shadow-xs">
          <span className="text-[10px] text-[#153C35] uppercase font-bold">CO₂ Prevented</span>
          <div className="font-heading text-3xl font-black text-[#153C35] mt-1 tabular-nums">{totalCo2Kg} <span className="text-xs font-normal text-[#1E4E45]">kg</span></div>
        </div>
        <div className="bg-[#F6F7F2] border border-[#E5EAE4] rounded-2xl p-4 text-center min-w-[140px] flex-1 sm:flex-none shadow-xs">
          <span className="text-[10px] text-[#73817B] uppercase font-bold">PM2.5 Averted</span>
          <div className="font-heading text-3xl font-black text-[#398F83] mt-1 tabular-nums">{totalPm25Grams} <span className="text-xs font-normal text-[#73817B]">g</span></div>
        </div>
      </div>
    </div>
  );
}

function CommunityAlertCard({ alert, onDismiss }: { alert: CommunityAlert; onDismiss: (id: string) => void }) {
  const isEmergency = alert.severity === 'emergency';
  const alertTheme = isEmergency ? 'bg-rose-50/70 border-rose-200 text-rose-950' : 'bg-amber-50/70 border-amber-200 text-amber-950';

  return (
    <div key={alert.id} role="alert" aria-live="assertive" className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${alertTheme}`}>
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5" aria-hidden="true">{isEmergency ? <ShieldAlertIcon size={18} /> : <WarningIcon size={18} />}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E5EAE4] text-[#202B29]">{alert.zone}</span>
            <h4 className="font-heading font-bold text-sm text-[#202B29]">{alert.headline}</h4>
          </div>
          <p className="text-xs text-[#73817B] mt-1">{alert.instructions}</p>
        </div>
      </div>
      <button type="button" onClick={() => onDismiss(alert.id)} className="text-xs px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F6F7F2] text-[#202B29] border border-[#E5EAE4] self-end sm:self-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35]">Acknowledge</button>
    </div>
  );
}

function EmergencyAdvisorySection({ isGenerating, onGenerate, advisory, language, alerts, onDismiss }: { isGenerating: boolean; onGenerate: () => void; advisory: string | null; language: string; alerts: CommunityAlert[]; onDismiss: (id: string) => void }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl p-6 sm:p-7 shadow-sm shadow-[#153C35]/5 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2"><BroadcastIcon /> Multilingual Emergency Smog Advisories</h3>
          <p className="text-xs text-[#73817B] mt-0.5">Live automated broadcast generation for neighborhood associations and school boards.</p>
        </div>
        <button type="button" onClick={onGenerate} disabled={isGenerating} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#153C35] text-white hover:bg-[#0D2823] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35] disabled:opacity-50 shrink-0">
          {isGenerating ? 'Synthesizing Broadcast…' : 'Generate Localized Advisory'}
        </button>
      </div>
      {advisory && (
        <div role="region" aria-label="Generated community advisory" className={`p-4 bg-[#EBF2EC] border border-[#B8CDB8] rounded-2xl text-[#153C35] text-sm leading-relaxed ${language === 'ar' ? 'font-arabic text-right' : ''}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-[#153C35] mb-2"><BroadcastIcon size={14} /><span>Official Air Resilience Broadcast ({language.toUpperCase()}):</span></div>
          <p className="text-[#202B29]">{advisory}</p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {alerts.map((alert) => <CommunityAlertCard key={alert.id} alert={alert} onDismiss={onDismiss} />)}
      </div>
    </div>
  );
}

function PledgesGrid({ pledges, onToggle, pledgedLabel }: { pledges: CommunityPledge[]; onToggle: (id: string) => void; pledgedLabel: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-heading text-lg font-bold text-[#153C35] flex items-center gap-2"><LeafIcon /> Neighborhood Emission Reduction Pledges</h3>
        <p className="text-xs text-[#73817B] mt-0.5">Join collective community pacts to eliminate localized winter pollution hotspots.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pledges.map((pledge) => (
          <PledgeCard key={pledge.id} pledge={pledge} onToggle={onToggle} pledgedLabel={pledgedLabel} pledgeNowLabel="Take the Pledge" />
        ))}
      </div>
    </div>
  );
}

function useCommunityHubState() {
  const { pledges, togglePledge, alerts, dismissAlert, selectedZone, language } = useAppContext();
  const [aiAdvisory, setAiAdvisory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const collectiveMetrics = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of pledges) counts[p.category] = p.currentParticipants;
    return calculateCommunityOffset(counts);
  }, [pledges]);

  const handleGenerateAdvisory = useCallback(async () => {
    setIsGenerating(true);
    try {
      setAiAdvisory(await apiService.generateEmergencyAdvisory(selectedZone, language));
    } catch {
      setAiAdvisory(`URGENT NOTICE for ${selectedZone.zoneName}: AQI is ${selectedZone.aqi}. Please activate indoor filtration, seal doors, and assist vulnerable neighbors.`);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedZone, language]);

  return { pledges, togglePledge, alerts, dismissAlert, language, t, aiAdvisory, isGenerating, collectiveMetrics, handleGenerateAdvisory };
}

export const CommunityHub = memo(function CommunityHub() {
  const { pledges, togglePledge, alerts, dismissAlert, language, t, aiAdvisory, isGenerating, collectiveMetrics, handleGenerateAdvisory } = useCommunityHubState();

  return (
    <section aria-label="Community Action and Collective Impact Hub" className="flex flex-col gap-6 fade-in">
      <CollectiveResilienceBanner totalCo2Kg={collectiveMetrics.totalCo2Kg} totalPm25Grams={collectiveMetrics.totalPm25Grams} />
      <EmergencyAdvisorySection isGenerating={isGenerating} onGenerate={handleGenerateAdvisory} advisory={aiAdvisory} language={language} alerts={alerts} onDismiss={dismissAlert} />
      <PledgesGrid pledges={pledges} onToggle={togglePledge} pledgedLabel={t.pledged || 'Pledged Active'} />
    </section>
  );
});
