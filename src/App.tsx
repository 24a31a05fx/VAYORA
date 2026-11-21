// ============================================================
// src/App.tsx
// Redesigned AppShell Router and Layout Orchestrator
// ============================================================

import { memo } from 'react';
import { AppContextProvider } from '@/context/AppContext';
import { useAppContext } from '@/context/useAppContext';
import { TabId } from '@/types';
import { Header } from '@/components/Navigation/Header';
import { AlertBanner } from '@/components/shared/AlertBanner';
import { AirTelemetryDashboard } from '@/components/Dashboard/AirTelemetryDashboard';
import { DailyRoutineOptimizer } from '@/components/Routine/DailyRoutineOptimizer';
import { TransitPlanner } from '@/components/Transit/TransitPlanner';
import { IAQCenter } from '@/components/IAQ/IAQCenter';
import { CommunityHub } from '@/components/Community/CommunityHub';

function AppViewport({ activeTab }: { activeTab: TabId }) {
  return (
    <main
      id="main-content"
      role="tabpanel"
      aria-labelledby={`tab-${activeTab}`}
      tabIndex={-1}
      className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 focus:outline-none"
    >
      {activeTab === TabId.Dashboard && <AirTelemetryDashboard />}
      {activeTab === TabId.Routine && <DailyRoutineOptimizer />}
      {activeTab === TabId.Transit && <TransitPlanner />}
      {activeTab === TabId.IAQ && <IAQCenter />}
      {activeTab === TabId.Community && <CommunityHub />}
    </main>
  );
}

function AppFooter() {
  return (
    <footer aria-label="Application footer" className="border-t border-[#E5EAE4] bg-[#FFFFFF] py-6 text-xs text-[#73817B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#153C35]">VAYORA</span>
          <span>•</span>
          <span className="text-[#398F83] font-medium">Breathe better. Live smarter.</span>
          <span>•</span>
          <span>WCAG 2.2 Level AA Compliant</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[#73817B]">
          <span>VAYORA Intelligence (Gemini 3.1)</span>
          <span>•</span>
          <span>Zero-Trust Architecture</span>
        </div>
      </div>
    </footer>
  );
}

const AppShell = memo(function AppShell() {
  const { activeTab, alerts, dismissAlert, accessibilityMode } = useAppContext();
  const a11yClass = accessibilityMode === 'high-contrast' ? 'high-contrast-mode contrast-125' : accessibilityMode === 'reduced-motion' ? 'reduced-motion' : '';

  return (
    <div className={`min-h-screen bg-[#F6F7F2] text-[#202B29] flex flex-col justify-between ${a11yClass}`}>
      <Header />
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 transition-all">
        <AlertBanner alerts={alerts} onDismiss={dismissAlert} />
        <AppViewport activeTab={activeTab} />
        <AppFooter />
      </div>
    </div>
  );
});

export default function App() {
  return (
    <AppContextProvider>
      <AppShell />
    </AppContextProvider>
  );
}
