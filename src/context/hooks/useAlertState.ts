// ============================================================
// src/context/hooks/useAlertState.ts
// Community alert feeds and global emergency banner state slice
// ============================================================

import { useState, useCallback } from 'react';
import type { CommunityAlert } from '@/types';
import { DEFAULT_ALERTS } from '@/lib/constants';

export function useAlertState() {
  const [alerts, setAlerts] = useState<CommunityAlert[]>(DEFAULT_ALERTS);
  const [globalBanner, setGlobalBanner] = useState<string | null>(null);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { alerts, dismissAlert, globalBanner, setGlobalBanner };
}
