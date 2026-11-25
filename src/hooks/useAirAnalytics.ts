// ============================================================
// src/hooks/useAirAnalytics.ts
// Encapsulates air quality telemetry calculations, live sync, and simulations
// ============================================================

import { useMemo, useCallback, useEffect } from 'react';
import { useZoneContext } from '@/context/ZoneContext';
import type { UrbanZone } from '@/types';
import {
  calculateAQICategory,
  getAQIColor,
  computeInversionStatus,
  computePollutantBreakdown,
  computeZoneSimulation,
} from '@/lib/compute';

function useAirSimulations(zone: UrbanZone, updateZone: (id: string, u: Partial<UrbanZone>) => void) {
  const simulateSmogSpike = useCallback(() => {
    updateZone(zone.zoneId, computeZoneSimulation(zone, 'spike'));
  }, [zone, updateZone]);

  const simulateCleanDispersion = useCallback(() => {
    updateZone(zone.zoneId, computeZoneSimulation(zone, 'clean'));
  }, [zone, updateZone]);

  return { simulateSmogSpike, simulateCleanDispersion };
}

export function useAirAnalytics() {
  const ctx = useZoneContext();
  const { zones, selectedZoneId, setSelectedZoneId, updateZone, selectedZone: currentZone, dataSource, lastSyncedAt, isSyncingLive, syncError, refreshLiveTelemetry } = ctx;

  useEffect(() => {
    if (import.meta.env.MODE !== 'test' && dataSource === 'demonstration-baseline' && !lastSyncedAt) {
      void refreshLiveTelemetry();
    }
  }, [dataSource, lastSyncedAt, refreshLiveTelemetry]);

  const aqiCategory = useMemo(() => calculateAQICategory(currentZone.aqi), [currentZone.aqi]);
  const aqiColor = useMemo(() => getAQIColor(currentZone.aqi), [currentZone.aqi]);
  const inversionStatus = useMemo(() => computeInversionStatus(currentZone), [currentZone]);
  const pollutantBreakdown = useMemo(() => computePollutantBreakdown(currentZone), [currentZone]);
  const sims = useAirSimulations(currentZone, updateZone);

  return {
    zones, currentZone, selectedZoneId, setSelectedZoneId,
    dataSource, lastSyncedAt, isSyncingLive, syncError, refreshLiveTelemetry,
    aqiCategory, aqiColor, inversionStatus, pollutantBreakdown, ...sims,
  };
}
