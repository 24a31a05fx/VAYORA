// ============================================================
// src/context/hooks/useIAQContext.ts
// Hook to consume IAQContext
// ============================================================

import { useContext } from 'react';
import { IAQContext, type IAQContextValue } from '../contextInstances';

export function useIAQContext(): IAQContextValue {
  const ctx = useContext(IAQContext);
  if (!ctx) {
    throw new Error('useIAQContext must be used within an IAQProvider');
  }
  return ctx;
}
