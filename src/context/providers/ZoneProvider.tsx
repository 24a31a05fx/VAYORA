// ============================================================
// src/context/providers/ZoneProvider.tsx
// Provider component for urban zones and telemetry state
// ============================================================

import { type ReactNode } from 'react';
import { ZoneContext } from '../contextInstances';
import { useZoneState } from '../hooks/useZoneState';

export function ZoneProvider({ children }: { children: ReactNode }) {
  const value = useZoneState();
  return <ZoneContext.Provider value={value}>{children}</ZoneContext.Provider>;
}
