// ============================================================
// src/context/providers/CommunityProvider.tsx
// Provider component for community action and alerts
// ============================================================

import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { CommunityContext, type CommunityContextValue } from '../contextInstances';
import type { CommunityPledge, CommunityAlert } from '@/types';
import { DEFAULT_ALERTS } from '@/lib/constants';
import { storageService } from '@/services/storageService';

function updatePledgeList(pledges: CommunityPledge[], pledgeId: string): CommunityPledge[] {
  return pledges.map((p) => {
    if (p.id !== pledgeId) return p;
    const userPledged = !p.userPledged;
    return {
      ...p,
      userPledged,
      currentParticipants: userPledged ? p.currentParticipants + 1 : Math.max(0, p.currentParticipants - 1),
    };
  });
}

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [pledges, setPledges] = useState<CommunityPledge[]>(() => storageService.getPledges());
  const [alerts, setAlerts] = useState<CommunityAlert[]>(DEFAULT_ALERTS);

  const togglePledge = useCallback((pledgeId: string) => {
    setPledges((prev) => {
      const next = updatePledgeList(prev, pledgeId);
      storageService.savePledges(next);
      return next;
    });
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo<CommunityContextValue>(() => ({
    pledges,
    togglePledge,
    alerts,
    dismissAlert,
  }), [pledges, togglePledge, alerts, dismissAlert]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}
