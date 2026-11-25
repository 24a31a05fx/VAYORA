// ============================================================
// src/types/routine.ts
// Persona profiles, hourly schedules, and VAYORA Intelligence routine plans
// ============================================================

export type CommuteHabit = 'metro' | 'bus' | 'car' | 'walk-bike' | 'remote';
export type OutdoorActivityType = 'school-run' | 'exercise' | 'errands' | 'outdoor-work';
export type PurifierStatus = 'hepa' | 'diy-box' | 'none';

export interface HouseholdProfile {
  householdComposition: string;
  hasChildren: boolean;
  hasElderly: boolean;
  sensitivities: string;
  commuteMode: CommuteHabit;
  outdoorActivity: OutdoorActivityType;
  indoorPurifier: PurifierStatus;
}

export interface PriorityRecommendation {
  id: string;
  category: 'daily-routine' | 'indoor-air' | 'sustainable-transit';
  title: string;
  whatToChange: string;
  whyItMatters: string;
  environmentalBenefit: string;
  exposureNote: string;
  effort: 'Low' | 'Medium' | 'High';
  isEstimate: boolean;
}

export interface PersonaProfile {
  id: string;
  name: string;
  subCategory: 'infant' | 'elderly' | 'asthmatic' | 'school-run' | 'cyclist' | 'transit-rider' | 'neighborhood-lead';
  sensitivityLevel: 'high' | 'moderate' | 'low';
  preferredStartHour: number;
  preferredEndHour: number;
  description: string;
}

export interface RoutineHour {
  hour: number;
  timeLabel: string;
  activity: string;
  recommendation: 'safe-outdoor' | 'moderate-caution' | 'indoor-only' | 'mask-required';
  predictedAQI: number;
  smogDispersionFactor: number;
  inversionLikelihood: 'low' | 'moderate' | 'high';
  healthImpactNotes: string;
  environmentalOffsetNotes: string;
}

export interface DailyRoutinePlan {
  generatedAt: number;
  persona: string;
  source?: 'gemini-ai' | 'server-heuristic' | 'client-offline-heuristic';
  dataModeLabel?: string;
  optimalOutdoorWindow: {
    startHour: number;
    endHour: number;
    rationale: string;
  };
  hourlySchedule: RoutineHour[];
  totalExposureScore: number;
  carbonOffsetKg: number;
  generalAdvice: string[];
  priorityRecommendations?: PriorityRecommendation[];
  indoorChecklist?: string[];
  commuteSuggestion?: string;
  householdGuidance?: string;
  methodologyNote?: string;
}
