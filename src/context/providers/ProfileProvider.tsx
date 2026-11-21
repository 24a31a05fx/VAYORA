// ============================================================
// src/context/providers/ProfileProvider.tsx
// Provider component for persona profile and routine state
// ============================================================

import { useMemo, type ReactNode } from 'react';
import { ProfileContext, type ProfileContextValue } from '../contextInstances';
import { DEFAULT_PERSONAS } from '@/lib/constants';
import { useRoutineState } from '../hooks/useRoutineState';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { activePersona, setActivePersona, routinePlan, setRoutinePlan } = useRoutineState();

  const value = useMemo<ProfileContextValue>(() => ({
    personas: DEFAULT_PERSONAS,
    activePersona,
    setActivePersona,
    routinePlan,
    setRoutinePlan,
  }), [activePersona, setActivePersona, routinePlan, setRoutinePlan]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
