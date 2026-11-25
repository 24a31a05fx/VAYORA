// ============================================================
// src/lib/compute/heuristicRoutine.ts
// Client-side deterministic heuristic routine generation engine
// Provides offline resilience when backend AI gateway is unreachable
// ============================================================

import type { PersonaProfile, UrbanZone, DailyRoutinePlan, RoutineHour, HouseholdProfile } from '@/types';
import {
  buildPriorityRecommendations,
  buildIndoorChecklist,
  buildCommuteSuggestion,
  buildHouseholdGuidance,
  estimateDailyCo2SavingsKg,
  resolveHousehold,
} from './routineAdvice';

type RecommendationType = 'safe-outdoor' | 'moderate-caution' | 'indoor-only' | 'mask-required';

interface SlotDetail {
  recommendation: RecommendationType;
  activity: string;
  healthNote: string;
}

function getEarlySlotDetails(zone: UrbanZone, isHighRisk: boolean, isMorning: boolean, isMidday: boolean): SlotDetail | null {
  if (isMorning) {
    return {
      recommendation: 'indoor-only',
      activity: 'High-efficiency indoor routine (HEPA active)',
      healthNote: `Severe morning inversion: AQI ${zone.aqi}. Alveolar lung irritation risk. Avoid door openings.`,
    };
  }
  if (isMidday && zone.aqi < 200) {
    return {
      recommendation: isHighRisk ? 'moderate-caution' : 'safe-outdoor',
      activity: isHighRisk ? 'Gentle outdoor walk with N95' : 'Safe outdoor errands / travel window',
      healthNote: 'Solar radiation has broken thermal boundary layer. Optimum daily air dispersion.',
    };
  }
  return null;
}

function getSlotDetails(h: number, zone: UrbanZone, isHighRisk: boolean, isMorning: boolean, isMidday: boolean): SlotDetail {
  const early = getEarlySlotDetails(zone, isHighRisk, isMorning, isMidday);
  if (early) return early;

  if (h >= 17) {
    return {
      recommendation: isHighRisk ? 'indoor-only' : 'mask-required',
      activity: 'Evening indoor recreation & meal preparation',
      healthNote: 'Evening traffic peak and settling cold air elevate surface PM2.5.',
    };
  }
  return {
    recommendation: 'moderate-caution',
    activity: 'Indoor productive work / rest',
    healthNote: 'Maintain HEPA filtration and seal drafts.',
  };
}

function createRoutineSlot(h: number, zone: UrbanZone, isHighRisk: boolean, safeStart: number, safeEnd: number): RoutineHour {
  const isMorning = h >= 7 && h <= 10 && zone.inversionRisk;
  const isMidday = h >= safeStart && h <= safeEnd;
  const details = getSlotDetails(h, zone, isHighRisk, isMorning, isMidday);

  return {
    hour: h,
    timeLabel: `${h.toString().padStart(2, '0')}:00`,
    activity: details.activity,
    recommendation: details.recommendation,
    predictedAQI: Math.max(30, Math.round(isMorning ? zone.aqi * 1.15 : isMidday ? zone.aqi * 0.7 : zone.aqi)),
    smogDispersionFactor: isMidday ? 0.85 : 0.35,
    inversionLikelihood: isMorning ? 'high' : isMidday ? 'low' : 'moderate',
    healthImpactNotes: details.healthNote,
    environmentalOffsetNotes: 'Consolidating trips or using electric transit lowers roadside exhaust compared to solo driving (illustrative estimate).',
  };
}

function buildHourlySlots(persona: PersonaProfile, zone: UrbanZone): RoutineHour[] {
  const isHighRisk = persona.sensitivityLevel === 'high' || zone.aqi > 150;
  const safeStart = zone.inversionRisk ? 13 : 11;
  const safeEnd = zone.inversionRisk ? 16 : 17;

  return [7, 8, 9, 12, 14, 17, 19, 21].map((h) =>
    createRoutineSlot(h, zone, isHighRisk, safeStart, safeEnd)
  );
}

const GENERAL_ADVICE = [
  'Equip nursery and bedrooms with CADR-rated HEPA purification (minimum 4 ACH).',
  'Never ventilate rooms during early morning calm winds (6:00 AM - 10:00 AM).',
  'Use N95 / FFP2 respirators if stepping outdoors; simple cloth masks fail against PM2.5.',
  'Check in on elderly neighbors and asthmatic family members when AQI exceeds 150.',
];

function assemblePlanFields(persona: PersonaProfile, zone: UrbanZone, hh: HouseholdProfile) {
  const isHighRisk = persona.sensitivityLevel === 'high' || hh.hasChildren || hh.hasElderly || zone.aqi > 150;
  const safeStart = zone.inversionRisk ? 13 : 11;
  const safeEnd = zone.inversionRisk ? 16 : 17;
  return {
    optimalOutdoorWindow: {
      startHour: safeStart,
      endHour: safeEnd,
      rationale: `Thermal solar convection typically improves mixing between ${safeStart}:00 and ${safeEnd}:00 compared to stagnant early morning hours.`,
    },
    hourlySchedule: buildHourlySlots(persona, zone),
    totalExposureScore: Math.round(zone.pm25 * (isHighRisk ? 2.1 : 4.5)),
    carbonOffsetKg: estimateDailyCo2SavingsKg(hh.commuteMode),
    priorityRecommendations: buildPriorityRecommendations(zone, safeStart, safeEnd, hh),
  };
}

export function generateHeuristicRoutine(
  persona: PersonaProfile,
  zone: UrbanZone,
  _language = 'en',
  household?: HouseholdProfile
): DailyRoutinePlan {
  const hh = resolveHousehold(household);
  return {
    generatedAt: Date.now(),
    persona: persona.name,
    source: 'client-offline-heuristic',
    dataModeLabel: 'Deterministic Local Engine (Modelled Estimates)',
    ...assemblePlanFields(persona, zone, hh),
    generalAdvice: GENERAL_ADVICE,
    indoorChecklist: buildIndoorChecklist(zone, hh),
    commuteSuggestion: buildCommuteSuggestion(zone, hh),
    householdGuidance: buildHouseholdGuidance(persona, zone, hh),
    methodologyNote: 'Exposure score and CO2 savings are modelled scenario estimates derived from EPA-style PM2.5 inputs and average transit emission factors—not metered measurements.',
  };
}
