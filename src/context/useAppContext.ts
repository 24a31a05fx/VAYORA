// ============================================================
// src/context/useAppContext.ts
// Compatibility adapter and re-export of focused context hooks
// ============================================================

import { useUIContext } from './hooks/useUIContext';
import { useZoneContext } from './hooks/useZoneContext';
import { useProfileContext } from './hooks/useProfileContext';
import { useIAQContext } from './hooks/useIAQContext';
import { useCommunityContext } from './hooks/useCommunityContext';
import type { AppContextValue } from './types';

export function useAppContext(): AppContextValue {
  const ui = useUIContext();
  const zone = useZoneContext();
  const profile = useProfileContext();
  const iaq = useIAQContext();
  const community = useCommunityContext();

  return {
    ...ui,
    ...zone,
    ...profile,
    ...iaq,
    ...community,
  };
}

export const useApp = useAppContext;

export { useUIContext } from './hooks/useUIContext';
export { useZoneContext } from './hooks/useZoneContext';
export { useProfileContext } from './hooks/useProfileContext';
export { useIAQContext } from './hooks/useIAQContext';
export { useCommunityContext } from './hooks/useCommunityContext';
