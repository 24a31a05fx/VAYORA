// ============================================================
// src/context/hooks/useZoneState.ts
// Urban zone telemetry state slice with Open-Meteo live sync & demo mode flag
// ============================================================

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { UrbanZone, TelemetryDataSource, LiveTelemetryPayload } from '@/types';
import { DEFAULT_ZONES } from '@/lib/constants';
import { storageService } from '@/services/storageService';
import { apiService } from '@/services/apiService';

function toZonePatch(live: LiveTelemetryPayload, history: number[]): Partial<UrbanZone> {
  return {
    aqi: live.aqi,
    category: live.category,
    dominantPollutant: live.dominantPollutant,
    pm25: live.pm25,
    pm10: live.pm10,
    no2: live.no2,
    co: live.co,
    o3: live.o3,
    temperatureC: live.temperatureC,
    humidityPercent: live.humidityPercent,
    windSpeedKmh: live.windSpeedKmh,
    inversionRisk: live.inversionRisk,
    history: [...history.slice(1), live.aqi],
  };
}

async function fetchZonePatch(zone: UrbanZone, signal: AbortSignal) {
  try {
    const live = await apiService.fetchLiveAirQuality(zone.zoneId, zone.lat, zone.lng, signal);
    if (live.source !== 'open-meteo-live') {
      return { source: 'demonstration-baseline' as TelemetryDataSource, err: 'Live station feed unavailable; showing Demonstration Baseline.' };
    }
    return { source: 'open-meteo-live' as TelemetryDataSource, err: null, patch: toZonePatch(live, zone.history) };
  } catch {
    return { source: 'demonstration-baseline' as TelemetryDataSource, err: 'Using offline Demonstration Baseline (live feed unreachable).' };
  }
}

function useZoneLiveSync(
  selectedZone: UrbanZone,
  updateZone: (id: string, patch: Partial<UrbanZone>, src: TelemetryDataSource) => void,
  setDataSource: (s: TelemetryDataSource) => void
) {
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const refreshLiveTelemetry = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsSyncingLive(true);
    const result = await fetchZonePatch(selectedZone, ctrl.signal);
    if (ctrl.signal.aborted) return;
    if (result.patch) updateZone(selectedZone.zoneId, result.patch, result.source);
    else setDataSource(result.source);
    setLastSyncedAt(Date.now());
    setSyncError(result.err);
    setIsSyncingLive(false);
  }, [selectedZone, updateZone, setDataSource]);

  return { lastSyncedAt, isSyncingLive, syncError, refreshLiveTelemetry };
}

export function useZoneState() {
  const [zones, setZones] = useState<UrbanZone[]>(() => storageService.getZones());
  const [selectedZoneId, setSelectedZoneIdState] = useState<string>(() => storageService.getSelectedZoneId());
  const [dataSource, setDataSource] = useState<TelemetryDataSource>('demonstration-baseline');

  const selectedZone = useMemo(
    () => zones.find((z) => z.zoneId === selectedZoneId) || zones[0] || DEFAULT_ZONES[0],
    [zones, selectedZoneId]
  );
  const setSelectedZoneId = useCallback((id: string) => {
    setSelectedZoneIdState(id);
    storageService.saveSelectedZoneId(id);
  }, []);
  const updateZone = useCallback((zoneId: string, updates: Partial<UrbanZone>, nextSource: TelemetryDataSource = 'simulated-scenario') => {
    setDataSource(nextSource);
    setZones((prev) => {
      const next = prev.map((z) => (z.zoneId === zoneId ? { ...z, ...updates, lastUpdated: Date.now() } : z));
      storageService.saveZones(next);
      return next;
    });
  }, []);
  const sync = useZoneLiveSync(selectedZone, updateZone, setDataSource);

  return { zones, selectedZoneId, selectedZone, setSelectedZoneId, updateZone, dataSource, ...sync };
}
