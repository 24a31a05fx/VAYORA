// ============================================================
// server/routineSchema.ts
// Household recommendation builders and runtime AI JSON normalizer
// Ensures incomplete/malformed Gemini outputs degrade safely without crashes
// ============================================================

import type { ValidatedHousehold, ValidatedPersona, ValidatedZone } from './validators';

export interface ServerRecommendation {
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

export interface ServerRoutinePlan {
  generatedAt: number;
  persona: string;
  language: string;
  source: 'gemini-ai' | 'server-heuristic';
  dataModeLabel: string;
  optimalOutdoorWindow: { startHour: number; endHour: number; rationale: string };
  hourlySchedule: Array<Record<string, unknown>>;
  totalExposureScore: number;
  carbonOffsetKg: number;
  generalAdvice: string[];
  priorityRecommendations: ServerRecommendation[];
  indoorChecklist: string[];
  commuteSuggestion: string;
  householdGuidance: string;
  methodologyNote: string;
}

const DEFAULT_HH: ValidatedHousehold = {
  householdComposition: 'Urban household',
  hasChildren: false,
  hasElderly: false,
  sensitivities: '',
  commuteMode: 'metro',
  outdoorActivity: 'errands',
  indoorPurifier: 'none',
};

export function resolveServerHousehold(hh?: ValidatedHousehold): ValidatedHousehold {
  return hh ?? DEFAULT_HH;
}

export function estimateServerCo2Kg(mode: ValidatedHousehold['commuteMode']): number {
  const FACTORS: Record<ValidatedHousehold['commuteMode'], number> = {
    metro: 0.02,
    bus: 0.04,
    'walk-bike': 0,
    remote: 0,
    car: 0.19,
  };
  return Math.round(Math.max(0, 1.9 - 10 * FACTORS[mode]) * 10) / 10;
}

function buildDailyRec(zone: ValidatedZone, safeStart: number, safeEnd: number, hh: ValidatedHousehold): ServerRecommendation {
  return {
    id: 'rec-routine',
    category: 'daily-routine',
    title: `Schedule ${hh.outdoorActivity} within ${safeStart}:00-${safeEnd}:00`,
    whatToChange: `Shift discretionary outdoor ${hh.outdoorActivity} trips to midday solar mixing hours; wear a fitted N95/FFP2 when AQI exceeds 150.`,
    whyItMatters: `Stagnant morning winds (${zone.windSpeedKmh} km/h) limit vertical mixing until solar warming rises.`,
    environmentalBenefit: 'Spreads neighborhood travel out of cold-start congestion hours.',
    exposureNote: 'Avoids peak calm-wind surface PM2.5 windows (qualitative guidance; personal exposure varies).',
    effort: 'Low',
    isEstimate: true,
  };
}

function buildIndoorRec(zone: ValidatedZone, hh: ValidatedHousehold): ServerRecommendation {
  const purifierText = hh.indoorPurifier === 'none'
    ? 'Clean floors with damp mops, seal window/door gaps, and consider a DIY MERV-13 box-fan purifier.'
    : 'Run filtration continuously during evening inversions and damp-dust hard surfaces regularly.';
  return {
    id: 'rec-iaq',
    category: 'indoor-air',
    title: 'Inversion-aware sealing & clean indoor air',
    whatToChange: `Keep windows latched during calm AQI peaks (AQI ${zone.aqi}); flush air for 15 minutes during afternoon mixing. ${purifierText}`,
    whyItMatters: 'Opening windows during inversion hours allows outdoor fine particles to accumulate indoors.',
    environmentalBenefit: 'Conserves heating/cooling energy through short intentional ventilation.',
    exposureNote: 'Target 4+ Air Changes per Hour with HEPA/MERV-13 media to capture fine particulates.',
    effort: hh.indoorPurifier === 'none' ? 'Medium' : 'Low',
    isEstimate: true,
  };
}

function buildTransitRec(zone: ValidatedZone, hh: ValidatedHousehold): ServerRecommendation {
  const activeSmog = zone.aqi > 150 && hh.commuteMode === 'walk-bike';
  const savedKg = estimateServerCo2Kg(hh.commuteMode === 'car' ? 'metro' : hh.commuteMode);
  return {
    id: 'rec-transit',
    category: 'sustainable-transit',
    title: activeSmog ? 'Pause high-breathing open-air commuting' : 'Choose low-emission metro, bus, or shared rides',
    whatToChange: activeSmog
      ? 'Use underground metro or electric transit today instead of cycling/jogging near heavy traffic.'
      : 'Consolidate private car trips into public electric transit or neighborhood carpools.',
    whyItMatters: 'Physical exertion outdoors increases breathing rate, lifting inhaled particle intake near roadways.',
    environmentalBenefit: `Modelled ~${savedKg} kg CO2/day reduction vs. a 10 km gasoline car commute (estimate).`,
    exposureNote: 'Subterranean metro and filtered vehicles lower exposure to curbside NO2 peaks.',
    effort: 'Medium',
    isEstimate: true,
  };
}

export function buildServerRecommendations(zone: ValidatedZone, safeStart: number, safeEnd: number, hh: ValidatedHousehold): ServerRecommendation[] {
  return [buildDailyRec(zone, safeStart, safeEnd, hh), buildIndoorRec(zone, hh), buildTransitRec(zone, hh)];
}

function buildHouseholdGuidanceText(persona: ValidatedPersona, zone: ValidatedZone, hh: ValidatedHousehold): string {
  const flags: string[] = [];
  if (hh.hasChildren) flags.push('Protect children by moving play indoors when AQI exceeds 150.');
  if (hh.hasElderly) flags.push('Monitor older family members for respiratory strain.');
  if (hh.sensitivities) flags.push(`Reported sensitivity (${hh.sensitivities}): keep rescue inhaler/N95 accessible.`);
  return flags.join(' ') || `Guided for ${persona.name} (${hh.householdComposition}) in ${zone.zoneName}.`;
}

export function buildServerHouseholdText(persona: ValidatedPersona, zone: ValidatedZone, hh: ValidatedHousehold) {
  const purifierStep = hh.indoorPurifier === 'none'
    ? 'Low-cost Corsi-Rosenthal DIY option: 20-inch box fan paired with MERV-13 furnace filters.'
    : 'Keep bedroom purifier running continuously for sleeping children and elders.';
  const checklist = [
    `Keep windows sealed during calm stagnation peaks (current zone AQI: ${zone.aqi}).`,
    'Wet-mop hard floors rather than dry-sweeping to keep coarse PM10 settled.',
    'Ventilate exhaust hoods during stove cooking to clear indoor NO2.',
    purifierStep,
  ];
  const commute = hh.commuteMode === 'walk-bike' && zone.aqi > 180
    ? `At AQI ${zone.aqi}, switch open-air biking/walking to enclosed metro or electric bus.`
    : `Prioritize subterranean rail, clean-corridor green links, or carpooling across ${zone.zoneName}.`;
  return { checklist, commute, guidance: buildHouseholdGuidanceText(persona, zone, hh) };
}

function pickStr(val: unknown, fallback: string): string {
  return typeof val === 'string' && val.length > 0 ? val : fallback;
}

function pickArr<T>(val: unknown, fallback: T[]): T[] {
  return Array.isArray(val) && val.length > 0 ? (val as T[]) : fallback;
}

function pickWindow(win: unknown, fallback: ServerRoutinePlan['optimalOutdoorWindow']) {
  if (typeof win !== 'object' || win === null) return fallback;
  const w = win as Record<string, unknown>;
  const ok = typeof w.startHour === 'number' && typeof w.endHour === 'number' && typeof w.rationale === 'string';
  return ok ? { startHour: w.startHour as number, endHour: w.endHour as number, rationale: w.rationale as string } : fallback;
}

function pickSlots(val: unknown, fallback: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  if (!Array.isArray(val) || val.length === 0) return fallback;
  const valid = val.every((s) => typeof s === 'object' && s !== null && typeof (s as Record<string, unknown>).hour === 'number');
  return valid ? (val as Array<Record<string, unknown>>) : fallback;
}

export function normalizeAiRoutineResponse(parsed: unknown, fallback: ServerRoutinePlan): ServerRoutinePlan {
  if (typeof parsed !== 'object' || parsed === null) return fallback;
  const raw = parsed as Record<string, unknown>;
  const score = typeof raw.totalExposureScore === 'number' ? raw.totalExposureScore : fallback.totalExposureScore;
  return {
    ...fallback,
    source: 'gemini-ai',
    dataModeLabel: 'Google Gemini AI Synthesis (Modelled Estimates)',
    optimalOutdoorWindow: pickWindow(raw.optimalOutdoorWindow, fallback.optimalOutdoorWindow),
    hourlySchedule: pickSlots(raw.hourlySchedule, fallback.hourlySchedule),
    totalExposureScore: score,
    generalAdvice: pickArr(raw.generalAdvice, fallback.generalAdvice),
    priorityRecommendations: pickArr(raw.priorityRecommendations, fallback.priorityRecommendations),
    indoorChecklist: pickArr(raw.indoorChecklist, fallback.indoorChecklist),
    commuteSuggestion: pickStr(raw.commuteSuggestion, fallback.commuteSuggestion),
    householdGuidance: pickStr(raw.householdGuidance, fallback.householdGuidance),
  };
}
