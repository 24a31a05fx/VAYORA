// ============================================================
// src/context/hooks/useCommunityContext.ts
// Hook to consume CommunityContext
// ============================================================

import { useContext } from 'react';
import { CommunityContext, type CommunityContextValue } from '../contextInstances';

export function useCommunityContext(): CommunityContextValue {
  const ctx = useContext(CommunityContext);
  if (!ctx) {
    throw new Error('useCommunityContext must be used within a CommunityProvider');
  }
  return ctx;
}
