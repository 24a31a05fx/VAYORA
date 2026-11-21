// Redesigned Navigation: Nature Meets Urban Intelligence
// Elegant left sidebar on desktop, intuitive touch-friendly header on mobile

import { memo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { TabId } from '@/types';
import { TRANSLATIONS } from '@/lib/constants';
import { getAQIColor } from '@/lib/aqiCompute';
import { SidebarSectorCard } from './SidebarSectorCard';
import { NavControls } from './NavControls';

export const Header = memo(function Header() {
  const {
    activeTab,
    setActiveTab,
    selectedZone,
    zones,
    setSelectedZoneId,
    language,
    setLanguage,
    accessibilityMode,
    setAccessibilityMode,
  } = useAppContext();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const aqiColor = getAQIColor(selectedZone.aqi);

  const tabs = [
    {
      id: TabId.Dashboard,
      label: t.tabDashboard || 'Air Telemetry',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      id: TabId.Routine,
      label: t.tabRoutine || 'Routine Optimizer',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: TabId.Transit,
      label: t.tabTransit || 'Low-Emission Transit',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="3" width="16" height="16" rx="2" />
          <path d="M4 11h16" />
          <path d="M12 3v8" />
          <path d="m8 19-2 3" />
          <path d="m18 22-2-3" />
          <circle cx="8" cy="15" r="1" />
          <circle cx="16" cy="15" r="1" />
        </svg>
      ),
    },
    {
      id: TabId.IAQ,
      label: t.tabIAQ || 'Indoor Air & Hacks',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      ),
    },
    {
      id: TabId.Community,
      label: t.tabCommunity || 'Community Action',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    if (idx === -1) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab(tabs[(idx + 1) % tabs.length].id);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab(tabs[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab(tabs[tabs.length - 1].id);
    }
  };

  return (
    <header
      aria-label="VAYORA application header"
      className="bg-[#FFFFFF] border-b lg:border-b-0 lg:border-r border-[#E5EAE4] sticky top-0 lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:w-72 lg:h-screen lg:flex lg:flex-col lg:justify-between z-40 transition-all shadow-[0_1px_4px_rgba(21,60,53,0.03)]"
    >
      {/* Top Section: Brand & Telemetry Indicator */}
      <div className="p-4 sm:p-5 flex flex-col gap-4 border-b border-[#E5EAE4] lg:border-b-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* VAYORA Clean Organic Emblem */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#153C35] to-[#398F83] text-white flex items-center justify-center shadow-md shadow-[#153C35]/15 shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-xl font-black text-[#153C35] tracking-tight">
                  {t.appTitle || 'VAYORA'}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F0EA] text-[#153C35] border border-[#B8CDB8]/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#398F83] animate-pulse" aria-hidden="true" />
                  LIVE
                </span>
              </div>
              <p className="text-[10px] font-bold text-[#398F83] tracking-wide hidden sm:block uppercase">
                {t.tagline || 'Breathe better. Live smarter.'}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Zone Quick Telemetry Banner (Desktop Sidebar Widget) */}
        <SidebarSectorCard
          selectedZone={selectedZone}
          zones={zones}
          onSelectZone={setSelectedZoneId}
          aqiColor={aqiColor}
        />
      </div>

      {/* Middle Section: Navigation Tab List */}
      <nav aria-label="Main application tabs" className="px-3 sm:px-4 lg:py-2 flex-1 overflow-x-auto lg:overflow-y-auto scrollbar-none">
        <div className="hidden lg:block text-[10px] font-bold uppercase tracking-wider text-[#73817B] px-3 mb-2">
          Environmental Modules
        </div>
        <div
          role="tablist"
          aria-label="Main navigation panels"
          onKeyDown={handleTabKeyDown}
          className="flex lg:flex-col gap-1.5 py-1 lg:py-0 min-w-max lg:min-w-0"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls="main-content"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 sm:py-3 text-xs font-semibold rounded-xl transition-all duration-200 text-left cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35] ${
                  isActive
                    ? 'bg-[#153C35] text-white shadow-sm shadow-[#153C35]/20 font-bold'
                    : 'text-[#202B29] hover:bg-[#EBF2EC] hover:text-[#153C35]'
                }`}
              >
                <span className={isActive ? 'text-[#B8CDB8]' : 'text-[#73817B]'}>
                  {tab.icon}
                </span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section: Controls & Accessibility */}
      <NavControls
        language={language}
        onLanguageChange={setLanguage}
        accessibilityMode={accessibilityMode}
        onAccessibilityChange={setAccessibilityMode}
      />
    </header>
  );
});
