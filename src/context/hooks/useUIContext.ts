// ============================================================
// src/context/hooks/useUIContext.ts
// Hook to consume UIContext
// ============================================================

import { useContext } from 'react';
import { UIContext, type UIContextValue } from '../contextInstances';

export function useUIContext(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return ctx;
}
