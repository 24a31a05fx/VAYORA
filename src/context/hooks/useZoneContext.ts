// ============================================================
// src/context/hooks/useZoneContext.ts
// Hook to consume ZoneContext
// ============================================================

import { useContext } from 'react';
import { ZoneContext, type ZoneContextValue } from '../contextInstances';

export function useZoneContext(): ZoneContextValue {
  const ctx = useContext(ZoneContext);
  if (!ctx) {
    throw new Error('useZoneContext must be used within a ZoneProvider');
  }
  return ctx;
}
