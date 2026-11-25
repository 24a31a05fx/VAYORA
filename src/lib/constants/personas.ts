// ============================================================
// src/lib/constants/personas.ts
// Persona vulnerability profiles for smog mitigation scheduling
// ============================================================

import type { PersonaProfile, HouseholdProfile } from '@/types';

export const DEFAULT_HOUSEHOLD_PROFILE: HouseholdProfile = {
  householdComposition: 'Family with child & elder',
  hasChildren: true,
  hasElderly: false,
  sensitivities: 'Asthma / respiratory airway sensitivity',
  commuteMode: 'metro',
  outdoorActivity: 'school-run',
  indoorPurifier: 'hepa',
};

const PERSONA_DEFAULTS: Record<PersonaProfile['subCategory'], Partial<HouseholdProfile>> = {
  asthmatic: { householdComposition: 'Family with child', hasChildren: true, hasElderly: false, sensitivities: 'Pediatric asthma', commuteMode: 'metro', outdoorActivity: 'school-run' },
  infant: { householdComposition: 'Parents & newborn infant', hasChildren: true, hasElderly: false, sensitivities: 'Infant pulmonary vulnerability', commuteMode: 'car', outdoorActivity: 'errands' },
  elderly: { householdComposition: 'Multi-generational with elder', hasChildren: false, hasElderly: true, sensitivities: 'Cardiopulmonary sensitivity', commuteMode: 'bus', outdoorActivity: 'errands' },
  'transit-rider': { householdComposition: 'Working adult / couple', hasChildren: false, hasElderly: false, sensitivities: '', commuteMode: 'metro', outdoorActivity: 'exercise' },
  'school-run': { householdComposition: 'School-run household', hasChildren: true, hasElderly: false, sensitivities: 'Morning traffic corridor exposure', commuteMode: 'bus', outdoorActivity: 'school-run' },
  cyclist: { householdComposition: 'Active adult commuter', hasChildren: false, hasElderly: false, sensitivities: 'High exercise breathing rate', commuteMode: 'walk-bike', outdoorActivity: 'exercise' },
  'neighborhood-lead': { householdComposition: 'Community household', hasChildren: true, hasElderly: true, sensitivities: 'Monitoring neighborhood risk', commuteMode: 'metro', outdoorActivity: 'outdoor-work' },
};

export function deriveHouseholdFromPersona(persona: PersonaProfile, current: HouseholdProfile): HouseholdProfile {
  return { ...current, ...PERSONA_DEFAULTS[persona.subCategory] };
}

export const DEFAULT_PERSONAS: [PersonaProfile, ...PersonaProfile[]] = [
  {
    id: 'persona-asthma',
    name: 'Asthmatic Child & Family',
    subCategory: 'asthmatic',
    sensitivityLevel: 'high',
    preferredStartHour: 7,
    preferredEndHour: 19,
    description: 'Pediatric asthma profile. Requires strict morning smog avoidance, HEPA filtration, and zero outdoor PE during temperature inversions.',
  },
  {
    id: 'persona-infant',
    name: 'Newborn Infant & Nursing Mother',
    subCategory: 'infant',
    sensitivityLevel: 'high',
    preferredStartHour: 8,
    preferredEndHour: 18,
    description: 'Underdeveloped pulmonary defense. High risk from ultrafine PM2.5 and NO2. Focus on sealed indoor nurseries and CADR tuning.',
  },
  {
    id: 'persona-elderly',
    name: 'Elderly Relative (Cardiovascular Risk)',
    subCategory: 'elderly',
    sensitivityLevel: 'high',
    preferredStartHour: 9,
    preferredEndHour: 17,
    description: 'Hypertension and cardiac sensitivity. Extreme risk during sudden winter smog spikes. Priority on midday sun windows with low inversion.',
  },
  {
    id: 'persona-commuter',
    name: 'Daily Urban Commuter',
    subCategory: 'transit-rider',
    sensitivityLevel: 'moderate',
    preferredStartHour: 8,
    preferredEndHour: 20,
    description: 'Professional navigating peak-hour congestion. Balancing metro transit, cycling corridors, and cabin-filtered vehicle options.',
  },
  {
    id: 'persona-school',
    name: 'School Run Coordinator',
    subCategory: 'school-run',
    sensitivityLevel: 'high',
    preferredStartHour: 7,
    preferredEndHour: 16,
    description: 'Managing morning school drop-off and afternoon pick-up across multiple urban zones during winter temperature inversions.',
  },
  {
    id: 'persona-lead',
    name: 'Community Resilience Coordinator',
    subCategory: 'neighborhood-lead',
    sensitivityLevel: 'low',
    preferredStartHour: 6,
    preferredEndHour: 22,
    description: 'Managing neighborhood air monitoring, vulnerable resident welfare checks, and anti-waste burning taskforces.',
  },
];
