// ============================================================
// src/context/hooks/useZoneState.ts
// Urban zone telemetry state slice
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import type { UrbanZone } from '@/types';
import { DEFAULT_ZONES } from '@/lib/constants';
import { storageService } from '@/services/storageService';

export function useZoneState() {
  const [zones, setZones] = useState<UrbanZone[]>(() => storageService.getZones());
  const [selectedZoneId, setSelectedZoneIdState] = useState<string>(() => storageService.getSelectedZoneId());

  const selectedZone = useMemo(() => {
    return zones.find((z) => z.zoneId === selectedZoneId) || zones[0] || DEFAULT_ZONES[0];
  }, [zones, selectedZoneId]);

  const setSelectedZoneId = useCallback((id: string) => {
    setSelectedZoneIdState(id);
    storageService.saveSelectedZoneId(id);
  }, []);

  const updateZone = useCallback((zoneId: string, updates: Partial<UrbanZone>) => {
    setZones((prev) => {
      const next = prev.map((z) => (z.zoneId === zoneId ? { ...z, ...updates, lastUpdated: Date.now() } : z));
      storageService.saveZones(next);
      return next;
    });
  }, []);

  return { zones, selectedZoneId, selectedZone, setSelectedZoneId, updateZone };
}
