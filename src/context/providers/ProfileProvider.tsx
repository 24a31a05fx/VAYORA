// ============================================================
// src/context/providers/ProfileProvider.tsx
// Provider component for persona, household profile, and routine state
// ============================================================

import { useMemo, type ReactNode } from 'react';
import { ProfileContext, type ProfileContextValue } from '../contextInstances';
import { DEFAULT_PERSONAS } from '@/lib/constants';
import { useRoutineState } from '../hooks/useRoutineState';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const state = useRoutineState();

  const value = useMemo<ProfileContextValue>(() => ({
    personas: DEFAULT_PERSONAS,
    activePersona: state.activePersona,
    setActivePersona: state.setActivePersona,
    householdProfile: state.householdProfile,
    setHouseholdProfile: state.setHouseholdProfile,
    updateHouseholdField: state.updateHouseholdField,
    routinePlan: state.routinePlan,
    setRoutinePlan: state.setRoutinePlan,
  }), [
    state.activePersona,
    state.setActivePersona,
    state.householdProfile,
    state.setHouseholdProfile,
    state.updateHouseholdField,
    state.routinePlan,
    state.setRoutinePlan,
  ]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
