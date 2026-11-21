// ============================================================
// src/components/Navigation/Header.tsx
// Redesigned Navigation: Left sidebar on desktop, sticky header on mobile
// ============================================================

import React, { memo } from 'react';
import { useAppContext } from '@/context/useAppContext';
import { TabId } from '@/types';
import { TRANSLATIONS } from '@/lib/constants';
import { getAQIColor } from '@/lib/compute';
import { SidebarSectorCard } from './SidebarSectorCard';
import { NavControls } from './NavControls';
import { DashboardIcon, CalendarIcon, TransitIcon, LeafIcon, BroadcastIcon } from '@/components/shared/Icons';

interface TabItem {
  id: TabId;
  label: string;
}

function getTabs(t: Record<string, string>): TabItem[] {
  return [
    { id: TabId.Dashboard, label: t.tabDashboard || 'Air Telemetry' },
    { id: TabId.Routine, label: t.tabRoutine || 'Routine Optimizer' },
    { id: TabId.Transit, label: t.tabTransit || 'Low-Emission Transit' },
    { id: TabId.IAQ, label: t.tabIAQ || 'Indoor Air & Hacks' },
    { id: TabId.Community, label: t.tabCommunity || 'Community Action' },
  ];
}

function getTabIcon(tabId: TabId, isSelected: boolean) {
  const iconColor = isSelected ? 'text-white' : 'text-[#73817B] group-hover:text-[#153C35]';
  switch (tabId) {
    case TabId.Dashboard:
      return <DashboardIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />;
    case TabId.Routine:
      return <CalendarIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />;
    case TabId.Transit:
      return <TransitIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />;
    case TabId.IAQ:
      return <LeafIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />;
    case TabId.Community:
      return <BroadcastIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />;
  }
}

function getTargetTabIndex(key: string, idx: number, total: number): number | null {
  if (key === 'ArrowDown' || key === 'ArrowRight') return (idx + 1) % total;
  if (key === 'ArrowUp' || key === 'ArrowLeft') return (idx - 1 + total) % total;
  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;
  return null;
}

function handleTabKey(e: React.KeyboardEvent<HTMLDivElement>, tabs: TabItem[], activeTab: TabId, setActiveTab: (id: TabId) => void) {
  const idx = tabs.findIndex((tabItem) => tabItem.id === activeTab);
  if (idx === -1) return;
  const targetIdx = getTargetTabIndex(e.key, idx, tabs.length);
  if (targetIdx !== null) {
    e.preventDefault();
    const target = tabs[targetIdx];
    if (target) setActiveTab(target.id);
  }
}

function SidebarBrand({ appTitle, tagline }: { appTitle: string; tagline: string }) {
  return (
    <div className="p-5 border-b border-[#E5EAE4]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#153C35] to-[#398F83] flex items-center justify-center text-white shadow-md">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl text-[#153C35] tracking-tight block">{appTitle}</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F0EA] text-[#153C35] border border-[#B8CDB8]/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#398F83] animate-pulse" aria-hidden="true" />
              LIVE
            </span>
          </div>
          <span className="text-[11px] text-[#73817B] block -mt-0.5">{tagline}</span>
        </div>
      </div>
    </div>
  );
}

function MobileHeader({ appTitle, aqi, aqiColor }: { appTitle: string; aqi: number; aqiColor: string }) {
  return (
    <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#E5EAE4] bg-[#FFFFFF]">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#153C35] to-[#398F83] flex items-center justify-center text-white">
          <span className="font-black text-sm">V</span>
        </div>
        <span className="font-heading font-black text-lg text-[#153C35]">{appTitle}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full text-xs font-black border" style={{ backgroundColor: `${aqiColor}15`, borderColor: `${aqiColor}40`, color: aqiColor }}>
          AQI {aqi}
        </span>
      </div>
    </div>
  );
}

function TabList({ tabs, activeTab, onSelect, onKeyDown }: { tabs: TabItem[]; activeTab: TabId; onSelect: (id: TabId) => void; onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void }) {
  return (
    <div role="tablist" aria-label="Main application sections" onKeyDown={onKeyDown} className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 p-3">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        const btnClass = isSelected ? 'bg-[#153C35] text-white font-bold shadow-sm' : 'text-[#73817B] hover:bg-[#F6F7F2] hover:text-[#202B29] font-medium';
        return (
          <button key={tab.id} id={`tab-${tab.id}`} role="tab" aria-selected={isSelected} aria-controls="main-content" tabIndex={isSelected ? 0 : -1} onClick={() => onSelect(tab.id)} className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer text-left ${btnClass}`}>
            {getTabIcon(tab.id, isSelected)}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export const Header = memo(function Header() {
  const { activeTab, setActiveTab, selectedZone, zones, setSelectedZoneId, language, setLanguage, accessibilityMode, setAccessibilityMode } = useAppContext();
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;
  const aqiColor = getAQIColor(selectedZone.aqi);
  const tabs = getTabs(t);

  return (
    <header aria-label="Application Header" className="lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-72 bg-[#FFFFFF] border-r border-[#E5EAE4] flex flex-col justify-between z-40">
      <div className="flex flex-col">
        <MobileHeader appTitle={t.appTitle || 'VAYORA'} aqi={selectedZone.aqi} aqiColor={aqiColor} />
        <SidebarBrand appTitle={t.appTitle || 'VAYORA'} tagline={t.tagline || 'Breathe better. Live smarter.'} />
        <nav aria-label="Main application tabs" className="mt-2">
          <TabList tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} onKeyDown={(e) => handleTabKey(e, tabs, activeTab, setActiveTab)} />
        </nav>
        <div className="p-3">
          <SidebarSectorCard selectedZone={selectedZone} zones={zones} onSelectZone={setSelectedZoneId} aqiColor={aqiColor} />
        </div>
      </div>
      <NavControls language={language} onLanguageChange={setLanguage} accessibilityMode={accessibilityMode} onAccessibilityChange={setAccessibilityMode} />
    </header>
  );
});
