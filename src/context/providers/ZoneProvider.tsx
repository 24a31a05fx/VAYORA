// ============================================================
// src/context/providers/ZoneProvider.tsx
// Provider component for urban zones and telemetry state
// ============================================================

import { useMemo, type ReactNode } from 'react';
import { ZoneContext, type ZoneContextValue } from '../contextInstances';
import { useZoneState } from '../hooks/useZoneState';

export function ZoneProvider({ children }: { children: ReactNode }) {
  const { zones, selectedZoneId, selectedZone, setSelectedZoneId, updateZone } = useZoneState();

  const value = useMemo<ZoneContextValue>(() => ({
    zones,
    selectedZoneId,
    selectedZone,
    setSelectedZoneId,
    updateZone,
  }), [zones, selectedZoneId, selectedZone, setSelectedZoneId, updateZone]);

  return <ZoneContext.Provider value={value}>{children}</ZoneContext.Provider>;
}
