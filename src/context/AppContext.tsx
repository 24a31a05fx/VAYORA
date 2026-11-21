// ============================================================
// src/context/AppContext.tsx
// Cross-cutting global state management Provider for VAYORA
// ============================================================

import { useMemo, type ReactNode } from 'react';
import { DEFAULT_PERSONAS } from '@/lib/constants';
import { AppContext } from './appContextInstance';
import type { AppContextValue } from './types';
import { useTabState } from './hooks/useTabState';
import { useZoneState } from './hooks/useZoneState';
import { useLanguageState } from './hooks/useLanguageState';
import { useRoutineState } from './hooks/useRoutineState';
import { usePledgeState } from './hooks/usePledgeState';
import { useAlertState } from './hooks/useAlertState';

export function AppContextProvider({ children }: { children: ReactNode }) {
  const tab = useTabState();
  const zone = useZoneState();
  const lang = useLanguageState();
  const routine = useRoutineState();
  const pledge = usePledgeState();
  const alert = useAlertState();

  const value = useMemo<AppContextValue>(() => ({
    ...tab,
    ...zone,
    personas: DEFAULT_PERSONAS,
    ...routine,
    ...lang,
    ...pledge,
    ...alert,
  }), [tab, zone, routine, lang, pledge, alert]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContextProvider;
