// ============================================================
// src/App.tsx
// Redesigned AppShell Router and Layout Orchestrator
// Code splitting with accessible Suspense fallbacks
// ============================================================

import { memo, useState, useCallback, lazy, Suspense } from 'react';
import { AppContextProvider } from '@/context/AppContext';
import { useUIContext } from '@/context/UIContext';
import { useCommunityContext } from '@/context/CommunityContext';
import { TabId } from '@/types';
import { Header } from '@/components/Navigation/Header';
import { AlertBanner } from '@/components/shared/AlertBanner';
import { AirTelemetryDashboard } from '@/components/Dashboard/AirTelemetryDashboard';
import { LegalModal, type LegalDocType } from '@/components/Legal/LegalModal';

const DailyRoutineOptimizer = lazy(() =>
  import('@/components/Routine/DailyRoutineOptimizer').then((m) => ({ default: m.DailyRoutineOptimizer }))
);
const TransitPlanner = lazy(() =>
  import('@/components/Transit/TransitPlanner').then((m) => ({ default: m.TransitPlanner }))
);
const IAQCenter = lazy(() =>
  import('@/components/IAQ/IAQCenter').then((m) => ({ default: m.IAQCenter }))
);
const CommunityHub = lazy(() =>
  import('@/components/Community/CommunityHub').then((m) => ({ default: m.CommunityHub }))
);

function TabLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-12 bg-[#FFFFFF] border border-[#E5EAE4] rounded-3xl min-h-[320px] text-center shadow-sm shadow-[#153C35]/5"
    >
      <div className="w-8 h-8 rounded-full border-2 border-[#153C35] border-t-transparent animate-spin mb-3" aria-hidden="true" />
      <span className="text-sm font-semibold text-[#153C35]">Loading environmental module...</span>
      <span className="text-xs text-[#73817B] mt-1">Preparing hyperlocal calculations</span>
    </div>
  );
}

function AppViewport({ activeTab }: { activeTab: TabId }) {
  return (
    <main
      id="main-content"
      role="tabpanel"
      aria-labelledby={`tab-${activeTab}`}
      tabIndex={-1}
      className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 focus:outline-none"
    >
      <Suspense fallback={<TabLoadingFallback />}>
        {activeTab === TabId.Dashboard && <AirTelemetryDashboard />}
        {activeTab === TabId.Routine && <DailyRoutineOptimizer />}
        {activeTab === TabId.Transit && <TransitPlanner />}
        {activeTab === TabId.IAQ && <IAQCenter />}
        {activeTab === TabId.Community && <CommunityHub />}
      </Suspense>
    </main>
  );
}

function LegalFooterLinks({ onOpenLegal }: { onOpenLegal: (type: LegalDocType) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[#73817B]">
      <button type="button" onClick={() => onOpenLegal('privacy')} className="hover:text-[#153C35] hover:underline focus:outline-none focus:ring-1 focus:ring-[#398F83] rounded">
        Privacy Policy
      </button>
      <span>•</span>
      <button type="button" onClick={() => onOpenLegal('terms')} className="hover:text-[#153C35] hover:underline focus:outline-none focus:ring-1 focus:ring-[#398F83] rounded">
        Terms & Conditions
      </button>
      <span>•</span>
      <span>Zero-Trust Architecture</span>
    </div>
  );
}

function AppFooter({ onOpenLegal }: { onOpenLegal: (type: LegalDocType) => void }) {
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
        <LegalFooterLinks onOpenLegal={onOpenLegal} />
      </div>
    </footer>
  );
}

const AppShell = memo(function AppShell() {
  const { activeTab, accessibilityMode } = useUIContext();
  const { alerts, dismissAlert } = useCommunityContext();
  const [legalModal, setLegalModal] = useState<LegalDocType>(null);
  const handleCloseLegal = useCallback(() => setLegalModal(null), []);
  const a11yClass = accessibilityMode === 'high-contrast' ? 'high-contrast-mode contrast-125' : accessibilityMode === 'reduced-motion' ? 'reduced-motion' : '';

  return (
    <div className={`min-h-screen bg-[#F6F7F2] text-[#202B29] flex flex-col justify-between ${a11yClass}`}>
      <Header />
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 transition-all">
        <AlertBanner alerts={alerts} onDismiss={dismissAlert} />
        <AppViewport activeTab={activeTab} />
        <AppFooter onOpenLegal={setLegalModal} />
      </div>
      <LegalModal type={legalModal} onClose={handleCloseLegal} />
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
