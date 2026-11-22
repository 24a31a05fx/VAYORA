// ============================================================
// src/components/Navigation/Header.tsx
// Redesigned Navigation: Left sidebar on desktop, sticky header on mobile
// ============================================================

import React, { memo } from 'react';
import { useUIContext } from '@/context/UIContext';
import { useZoneContext } from '@/context/ZoneContext';
import { TabId } from '@/types';
import { TRANSLATIONS } from '@/lib/constants';
import { getAQIColor } from '@/lib/compute';
import { SidebarSectorCard } from './SidebarSectorCard';
import { NavControls } from './NavControls';
import { AirscapeIcon, MyDayIcon, RoutesIcon, HomeLabIcon, ImpactIcon } from '@/components/shared/Icons';
import { VayoraLogo } from '@/components/shared/VayoraLogo';
import { preloadTab } from '@/lib/tabPreload';

interface TabItem {
  id: TabId;
  label: string;
}

function getTabs(t: Record<string, string>): TabItem[] {
  return [
    { id: TabId.Dashboard, label: t.tabDashboard || 'Airscape' },
    { id: TabId.Routine, label: t.tabRoutine || 'My Day' },
    { id: TabId.Transit, label: t.tabTransit || 'Greener Routes' },
    { id: TabId.IAQ, label: t.tabIAQ || 'Home Air Lab' },
    { id: TabId.Community, label: t.tabCommunity || 'Collective Impact' },
  ];
}

function getTabIcon(tabId: TabId, isSelected: boolean) {
  const iconColor = isSelected ? 'text-white' : 'text-[#73817B] group-hover:text-[#11322B]';
  switch (tabId) {
    case TabId.Dashboard:
      return <AirscapeIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />;
    case TabId.Routine:
      return <MyDayIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />;
    case TabId.Transit:
      return <RoutesIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />;
    case TabId.IAQ:
      return <HomeLabIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />;
    case TabId.Community:
      return <ImpactIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />;
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

function SidebarBrand({ tagline }: { tagline: string }) {
  return (
    <div className="p-5 border-b border-[#E5EAE4]">
      <VayoraLogo showTagline={false} size={36} />
      <span className="text-[11px] text-[#73817B] font-medium tracking-tight block mt-2">
        {tagline}
      </span>
    </div>
  );
}

function MobileHeader({ aqi, aqiColor }: { aqi: number; aqiColor: string }) {
  return (
    <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#E5EAE4] bg-[#FFFFFF]">
      <VayoraLogo showTagline={false} size={28} />
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold border" style={{ backgroundColor: `${aqiColor}15`, borderColor: `${aqiColor}40`, color: aqiColor }}>
          AQI {aqi}
        </span>
      </div>
    </div>
  );
}

function TabButton({ tab, isSelected, onSelect }: { tab: TabItem; isSelected: boolean; onSelect: (id: TabId) => void }) {
  const btnClass = isSelected
    ? 'bg-[#11322B] text-white font-bold shadow-sm shadow-[#11322B]/20 border-l-2 border-[#3FB4A5]'
    : 'text-[#73817B] hover:bg-[#F7F8F4] hover:text-[#11322B] font-medium';
  return (
    <button
      id={`tab-${tab.id}`}
      role="tab"
      aria-selected={isSelected}
      aria-controls="main-content"
      tabIndex={isSelected ? 0 : -1}
      onClick={() => onSelect(tab.id)}
      onMouseEnter={() => preloadTab(tab.id)}
      onFocus={() => preloadTab(tab.id)}
      className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer text-left ${btnClass}`}
    >
      {getTabIcon(tab.id, isSelected)}
      <span>{tab.label}</span>
    </button>
  );
}

function TabList({ tabs, activeTab, onSelect, onKeyDown }: { tabs: TabItem[]; activeTab: TabId; onSelect: (id: TabId) => void; onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void }) {
  return (
    <div role="tablist" aria-label="Main application sections" onKeyDown={onKeyDown} className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 p-3">
      {tabs.map((tab) => (
        <TabButton key={tab.id} tab={tab} isSelected={activeTab === tab.id} onSelect={onSelect} />
      ))}
    </div>
  );
}

export const Header = memo(function Header() {
  const { activeTab, setActiveTab, language, setLanguage, accessibilityMode, setAccessibilityMode } = useUIContext();
  const { selectedZone, zones, setSelectedZoneId } = useZoneContext();
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;
  const aqiColor = getAQIColor(selectedZone.aqi);
  const tabs = getTabs(t);

  return (
    <header aria-label="Application Header" className="lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-72 bg-[#FFFFFF] border-r border-[#E5EAE4] flex flex-col justify-between z-40">
      <div className="flex flex-col">
        <MobileHeader aqi={selectedZone.aqi} aqiColor={aqiColor} />
        <SidebarBrand tagline={t.tagline || 'Air. Awareness. Action.'} />
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
