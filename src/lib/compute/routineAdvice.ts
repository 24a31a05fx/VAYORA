// ============================================================
// src/lib/compute/routineAdvice.ts
// Structured recommendations (Routines, IAQ, Sustainable Transit & Impact)
// Clearly distinguishes modelled estimates from measured station telemetry
// ============================================================

import type {
  PersonaProfile,
  UrbanZone,
  HouseholdProfile,
  PriorityRecommendation,
} from '@/types';

const DEFAULT_HH: HouseholdProfile = {
  householdComposition: 'General urban household',
  hasChildren: false,
  hasElderly: false,
  sensitivities: '',
  commuteMode: 'metro',
  outdoorActivity: 'errands',
  indoorPurifier: 'none',
};

export function resolveHousehold(household?: HouseholdProfile): HouseholdProfile {
  return household ?? DEFAULT_HH;
}

export function estimateDailyCo2SavingsKg(mode: HouseholdProfile['commuteMode']): number {
  const ROUND_TRIP_KM = 10;
  const baselineGasCarKg = ROUND_TRIP_KM * 0.19;
  const modeFactors: Record<HouseholdProfile['commuteMode'], number> = {
    metro: 0.02,
    bus: 0.04,
    'walk-bike': 0,
    remote: 0,
    car: 0.19,
  };
  const saved = Math.max(0, baselineGasCarKg - ROUND_TRIP_KM * modeFactors[mode]);
  return Math.round(saved * 10) / 10;
}

const ACTIVITY_LABELS: Record<HouseholdProfile['outdoorActivity'], string> = {
  'school-run': 'school drop-off & pick-up trips',
  exercise: 'outdoor exercise sessions',
  errands: 'neighborhood errands',
  'outdoor-work': 'exposed outdoor tasks',
};

function buildRoutineRec(zone: UrbanZone, safeStart: number, safeEnd: number, hh: HouseholdProfile): PriorityRecommendation {
  const target = ACTIVITY_LABELS[hh.outdoorActivity];
  const windowLabel = `${safeStart}:00-${safeEnd}:00`;
  const why = zone.inversionRisk
    ? `Cool surface temperatures (${zone.temperatureC}°C) and light winds (${zone.windSpeedKmh} km/h) limit vertical mixing until afternoon warming rises.`
    : 'Midday atmospheric mixing generally disperses stagnant morning exhaust from residential streets.';
  return {
    id: 'rec-routine',
    category: 'daily-routine',
    title: `Shift ${target} toward the midday solar mixing window (${windowLabel})`,
    whatToChange: `Move discretionary outdoor ${target} out of early morning calm winds (6:00-10:00) into ${windowLabel}, and wear a well-fitted N95/FFP2 respirator if AQI remains above 150.`,
    whyItMatters: why,
    environmentalBenefit: 'Reduces cold-start congestion idling and shifts activity away from peak rush-hour emissions.',
    exposureNote: 'Modelled dose decreases noticeably when avoiding high-concentration morning traffic peaks (exact reduction varies with exertion and mask fit).',
    effort: 'Low',
    isEstimate: true,
  };
}

function buildIndoorRec(zone: UrbanZone, hh: HouseholdProfile): PriorityRecommendation {
  const purifierStep = hh.indoorPurifier === 'none'
    ? 'Use wet mopping for dust, seal exterior door gaps with damp towels or foam weatherstripping, and consider assembling a DIY MERV-13 box-fan filter.'
    : 'Run your existing filtration continuously during evening hours, inspect filter seals, and pair with damp-cloth dusting rather than dry sweeping.';
  return {
    id: 'rec-iaq',
    category: 'indoor-air',
    title: 'Inversion-aware window closure & low-dust indoor filtration',
    whatToChange: `Keep windows latched during morning and evening AQI peaks (currently AQI ${zone.aqi}); flush stale indoor air for 15 minutes only during clear afternoon wind periods. ${purifierStep}`,
    whyItMatters: 'Opening windows during stagnant high-PM2.5 hours lets fine particles infiltrate sleeping spaces rapidly.',
    environmentalBenefit: 'Reduces overheating/cooling energy waste by flushing rooms intentionally rather than leaking conditioned air continuously.',
    exposureNote: 'Targeted filtration sized for 4+ Air Changes per Hour substantially lowers indoor fine particle concentration over several air-exchange cycles.',
    effort: hh.indoorPurifier === 'none' ? 'Medium' : 'Low',
    isEstimate: true,
  };
}

function buildTransitRec(zone: UrbanZone, hh: HouseholdProfile): PriorityRecommendation {
  const highSmog = zone.aqi > 150;
  const activeMode = hh.commuteMode === 'walk-bike';
  const what = activeMode && highSmog
    ? 'Temporarily pause open-air cycling/jogging commutes; switch to enclosed underground metro or electric transit until AQI drops below 150.'
    : hh.commuteMode === 'car'
      ? 'Replace solo fuel-car trips with electric public transit or coordinated family/school carpooling.'
      : 'Continue prioritizing clean public transit routes via subterranean or low-traffic greenways, avoiding diesel street bottlenecks.';
  const savedKg = estimateDailyCo2SavingsKg(hh.commuteMode === 'car' ? 'metro' : hh.commuteMode);
  return {
    id: 'rec-transit',
    category: 'sustainable-transit',
    title: activeMode && highSmog ? 'Shift from high-breathing active transit to shielded metro' : 'Adopt low-emission shared or rail commute corridors',
    whatToChange: what,
    whyItMatters: 'Vigorous outdoor exercise elevates breathing ventilation rates, multiplying inhaled PM2.5 mass on polluted roadways.',
    environmentalBenefit: `Estimated ~${savedKg} kg CO2/day reduction vs. a 10 km solo gasoline car round trip (EPA/DEFRA-style average emission factors; illustrative estimate).`,
    exposureNote: 'Subterranean metro cabins and HEPA-filtered electric transit help shield riders from concentrated curbside NO2 and tailpipe PM2.5.',
    effort: 'Medium',
    isEstimate: true,
  };
}

export function buildPriorityRecommendations(
  zone: UrbanZone,
  safeStart: number,
  safeEnd: number,
  household?: HouseholdProfile
): PriorityRecommendation[] {
  const hh = resolveHousehold(household);
  return [
    buildRoutineRec(zone, safeStart, safeEnd, hh),
    buildIndoorRec(zone, hh),
    buildTransitRec(zone, hh),
  ];
}

export function buildIndoorChecklist(zone: UrbanZone, household?: HouseholdProfile): string[] {
  const hh = resolveHousehold(household);
  const items = [
    `Keep windows closed during calm stagnation hours (especially when zone AQI exceeds 150; currently ${zone.aqi}).`,
    'Clean hard floors with damp mops or HEPA vacuums instead of dry brooms to avoid resuspending settled PM10 dust.',
    'Turn on kitchen exhaust fans or open a utility window briefly while cooking on gas/high heat to clear indoor NO2 and ultrafines.',
  ];
  if (hh.indoorPurifier === 'none') {
    items.push('Low-cost upgrade: Build a Corsi-Rosenthal box (20-inch box fan + MERV-13 filters) or seal door thresholds with draft blockers.');
  } else {
    items.push('Keep bedroom/nursery purifier fan running continuously at medium-high speed so clean air cycles at 4+ ACH.');
  }
  return items;
}

export function buildCommuteSuggestion(zone: UrbanZone, household?: HouseholdProfile): string {
  const hh = resolveHousehold(household);
  if (zone.aqi > 200 && hh.commuteMode === 'walk-bike') {
    return `AQI is ${zone.aqi} (${zone.category}). High breathing rates on open streets sharply elevate PM2.5 intake; take the Underground Metro or enclosed electric bus today.`;
  }
  if (hh.commuteMode === 'car') {
    return `Shifting your commute in ${zone.zoneName} from solo car travel to electric bus, rail, or neighborhood carpooling cuts roadside NO2 and saves ~1.5-1.9 kg CO2 per 10 km round trip (estimate).`;
  }
  return `For ${zone.zoneName} at AQI ${zone.aqi}, use clean-corridor green links or rail interchanges when travelling, reserving outdoor walking/cycling for AQI below 100.`;
}

export function buildHouseholdGuidance(persona: PersonaProfile, zone: UrbanZone, household?: HouseholdProfile): string {
  const hh = resolveHousehold(household);
  const notes: string[] = [];
  if (hh.hasChildren) notes.push('Keep children indoors for vigorous play when AQI exceeds 150 and prioritize nursery filtration.');
  if (hh.hasElderly) notes.push('Monitor older adults for shortness of breath or chest discomfort and schedule quiet indoor recovery.');
  if (hh.sensitivities.trim()) notes.push(`Noted sensitivity ("${hh.sensitivities.trim()}"): keep rescue medication accessible and wear a fitted N95 outdoors.`);
  if (notes.length === 0) notes.push(`Tailored for ${persona.name} in ${zone.zoneName} using standard EPA particulate thresholds.`);
  return notes.join(' ');
}
