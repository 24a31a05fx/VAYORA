// ============================================================
// src/hooks/useAirAnalytics.ts
// Encapsulates air quality telemetry calculations, inversion risk, and history
// ============================================================

import { useMemo, useCallback } from 'react';
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
  const { zones, selectedZoneId, setSelectedZoneId, updateZone, selectedZone: currentZone } = useZoneContext();

  const aqiCategory = useMemo(() => calculateAQICategory(currentZone.aqi), [currentZone.aqi]);
  const aqiColor = useMemo(() => getAQIColor(currentZone.aqi), [currentZone.aqi]);
  const inversionStatus = useMemo(() => computeInversionStatus(currentZone), [currentZone]);
  const pollutantBreakdown = useMemo(() => computePollutantBreakdown(currentZone), [currentZone]);
  const simulations = useAirSimulations(currentZone, updateZone);

  return {
    zones,
    currentZone,
    selectedZoneId,
    setSelectedZoneId,
    aqiCategory,
    aqiColor,
    inversionStatus,
    pollutantBreakdown,
    ...simulations,
  };
}
