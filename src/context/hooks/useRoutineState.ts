// ============================================================
// src/context/hooks/useRoutineState.ts
// Active household persona and daily routine plan state slice
// ============================================================

import { useState, useCallback } from 'react';
import type { PersonaProfile, DailyRoutinePlan } from '@/types';
import { storageService } from '@/services/storageService';

export function useRoutineState() {
  const [activePersona, setActivePersonaState] = useState<PersonaProfile>(() => storageService.getActivePersona());
  const [routinePlan, setRoutinePlanState] = useState<DailyRoutinePlan | null>(() => storageService.getRoutinePlan());

  const setActivePersona = useCallback((persona: PersonaProfile) => {
    setActivePersonaState(persona);
    storageService.saveActivePersona(persona);
  }, []);

  const setRoutinePlan = useCallback((plan: DailyRoutinePlan | null) => {
    setRoutinePlanState(plan);
    if (plan) storageService.saveRoutinePlan(plan);
  }, []);

  return { activePersona, setActivePersona, routinePlan, setRoutinePlan };
}
