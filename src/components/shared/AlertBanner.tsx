// ============================================================
// src/components/shared/AlertBanner.tsx
// Assertive emergency smog notification banner (WCAG role="alert")
// ============================================================

import { memo } from 'react';
import type { CommunityAlert } from '@/types';
import { WarningIcon, ShieldAlertIcon, CloseIcon } from '@/components/shared/Icons';

interface AlertBannerProps {
  alerts: CommunityAlert[];
  onDismiss: (id: string) => void;
}

function AlertBadge({ zone, badgeStyle }: { zone: string; badgeStyle: string }) {
  return (
    <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle}`}>
      {zone}
    </span>
  );
}

function DismissButton({ zone, onDismiss }: { zone: string; onDismiss: () => void }) {
  return (
    <button
      type="button"
      onClick={onDismiss}
      aria-label={`Dismiss alert for ${zone}`}
      className="text-[#73817B] hover:text-[#202B29] p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153C35] cursor-pointer"
    >
      <CloseIcon size={14} />
    </button>
  );
}

function AlertItem({ alert, onDismiss }: { alert: CommunityAlert; onDismiss: (id: string) => void }) {
  const isEmergency = alert.severity === 'emergency';
  const cardStyle = isEmergency ? 'bg-rose-50/95 border-rose-300 text-rose-950' : 'bg-amber-50/95 border-amber-300 text-amber-950';
  const badgeStyle = isEmergency ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <div className={`pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all ${cardStyle}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="shrink-0 mt-0.5" aria-hidden="true">{isEmergency ? <ShieldAlertIcon size={18} /> : <WarningIcon size={18} />}</span>
          <div>
            <AlertBadge zone={alert.zone} badgeStyle={badgeStyle} />
            <h4 className="font-heading font-bold text-sm text-[#202B29] mt-1 leading-snug">{alert.headline}</h4>
          </div>
        </div>
        <DismissButton zone={alert.zone} onDismiss={() => onDismiss(alert.id)} />
      </div>
      <p className="text-xs text-[#73817B] mt-2 leading-relaxed">{alert.instructions}</p>
    </div>
  );
}

export const AlertBanner = memo(function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="false"
      className="fixed top-20 right-4 left-4 md:left-auto md:w-96 z-50 flex flex-col gap-2.5 pointer-events-none"
    >
      {alerts.slice(0, 2).map((alert) => (
        <AlertItem key={alert.id} alert={alert} onDismiss={onDismiss} />
      ))}
    </div>
  );
});
