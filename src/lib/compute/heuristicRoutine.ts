// ============================================================
// src/lib/compute/heuristicRoutine.ts
// Client-side deterministic heuristic routine generation engine
// Provides offline resilience when backend AI gateway is unreachable
// ============================================================

import type { PersonaProfile, UrbanZone, DailyRoutinePlan, RoutineHour } from '@/types';

function buildHourlySlots(persona: PersonaProfile, zone: UrbanZone): RoutineHour[] {
  const isHighRisk = persona.sensitivityLevel === 'high' || zone.aqi > 150;
  const safeStart = zone.inversionRisk ? 13 : 11;
  const safeEnd = zone.inversionRisk ? 16 : 17;

  return [7, 8, 9, 12, 14, 17, 19, 21].map((h) => {
    const isMorningInversion = h >= 7 && h <= 10 && zone.inversionRisk;
    const isMiddaySafe = h >= safeStart && h <= safeEnd;

    let recommendation: 'safe-outdoor' | 'moderate-caution' | 'indoor-only' | 'mask-required' = 'moderate-caution';
    let activity = 'Indoor productive work / rest';
    let healthNote = 'Maintain HEPA filtration and seal drafts.';

    if (isMorningInversion) {
      recommendation = 'indoor-only';
      activity = 'High-efficiency indoor routine (HEPA active)';
      healthNote = `Severe morning inversion: AQI ${zone.aqi}. Alveolar lung irritation risk. Avoid door openings.`;
    } else if (isMiddaySafe && zone.aqi < 200) {
      recommendation = isHighRisk ? 'moderate-caution' : 'safe-outdoor';
      activity = isHighRisk ? 'Gentle outdoor walk with N95' : 'Safe outdoor errands / travel window';
      healthNote = 'Solar radiation has broken thermal boundary layer. Optimum daily air dispersion.';
    } else if (h >= 17) {
      recommendation = isHighRisk ? 'indoor-only' : 'mask-required';
      activity = 'Evening indoor recreation & meal preparation';
      healthNote = 'Evening traffic peak and settling cold air elevate surface PM2.5.';
    }

    return {
      hour: h,
      timeLabel: `${h.toString().padStart(2, '0')}:00`,
      activity,
      recommendation,
      predictedAQI: Math.max(30, Math.round(isMorningInversion ? zone.aqi * 1.15 : isMiddaySafe ? zone.aqi * 0.7 : zone.aqi)),
      smogDispersionFactor: isMiddaySafe ? 0.85 : 0.35,
      inversionLikelihood: isMorningInversion ? 'high' : isMiddaySafe ? 'low' : 'moderate',
      healthImpactNotes: healthNote,
      environmentalOffsetNotes: 'Shifted travel to public electric transit, avoiding 1.8 kg CO2.',
    };
  });
}

export function generateHeuristicRoutine(
  persona: PersonaProfile,
  zone: UrbanZone,
  _language = 'en'
): DailyRoutinePlan {
  const isHighRisk = persona.sensitivityLevel === 'high' || zone.aqi > 150;
  const safeStart = zone.inversionRisk ? 13 : 11;
  const safeEnd = zone.inversionRisk ? 16 : 17;

  return {
    generatedAt: Date.now(),
    persona: persona.name,
    optimalOutdoorWindow: {
      startHour: safeStart,
      endHour: safeEnd,
      rationale: `Thermal solar convection breaks the smog blanket between ${safeStart}:00 and ${safeEnd}:00. Ground PM2.5 drops by up to 35%.`,
    },
    hourlySchedule: buildHourlySlots(persona, zone),
    totalExposureScore: Math.round(zone.pm25 * (isHighRisk ? 2.1 : 4.5)),
    carbonOffsetKg: 3.4,
    generalAdvice: [
      'Equip nursery and bedrooms with CADR-rated HEPA purification (minimum 4 ACH).',
      'Never ventilate rooms during early morning calm winds (6:00 AM - 10:00 AM).',
      'Use N95 / FFP2 respirators if stepping outdoors; simple cloth masks fail against PM2.5.',
      'Check in on elderly neighbors and asthmatic family members when AQI exceeds 150.',
    ],
  };
}
