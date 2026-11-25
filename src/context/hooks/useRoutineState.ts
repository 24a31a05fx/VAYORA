// ============================================================
// src/context/hooks/useRoutineState.ts
// Active household persona, customized family profile, and routine plan state
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import type { PersonaProfile, HouseholdProfile, DailyRoutinePlan } from '@/types';
import { deriveHouseholdFromPersona } from '@/lib/constants';
import { storageService } from '@/services/storageService';

function useHouseholdActions() {
  const [householdProfile, setHouseholdState] = useState<HouseholdProfile>(() => storageService.getHouseholdProfile());
  const setHouseholdProfile = useCallback((profile: HouseholdProfile) => {
    setHouseholdState(profile);
    storageService.saveHouseholdProfile(profile);
  }, []);
  const updateHouseholdField = useCallback(<K extends keyof HouseholdProfile>(key: K, val: HouseholdProfile[K]) => {
    setHouseholdState((prev) => {
      const next = { ...prev, [key]: val };
      storageService.saveHouseholdProfile(next);
      return next;
    });
  }, []);
  return { householdProfile, setHouseholdProfile, updateHouseholdField, setHouseholdState };
}

export function useRoutineState() {
  const [activePersona, setActivePersonaState] = useState<PersonaProfile>(() => storageService.getActivePersona());
  const [routinePlan, setRoutinePlanState] = useState<DailyRoutinePlan | null>(() => storageService.getRoutinePlan());
  const { setHouseholdState, ...hh } = useHouseholdActions();

  const setActivePersona = useCallback((persona: PersonaProfile) => {
    setActivePersonaState(persona);
    storageService.saveActivePersona(persona);
    setHouseholdState((prev) => {
      const next = deriveHouseholdFromPersona(persona, prev);
      storageService.saveHouseholdProfile(next);
      return next;
    });
  }, [setHouseholdState]);

  const setRoutinePlan = useCallback((plan: DailyRoutinePlan | null) => {
    setRoutinePlanState(plan);
    if (plan) storageService.saveRoutinePlan(plan);
  }, []);

  return useMemo(
    () => ({ activePersona, setActivePersona, ...hh, routinePlan, setRoutinePlan }),
    [activePersona, setActivePersona, hh, routinePlan, setRoutinePlan]
  );
}
