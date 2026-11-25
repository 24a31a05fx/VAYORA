// ============================================================
// server/aiService.ts
// Server-side Gemini Flash gateway with validated JSON normalization & heuristic fallback
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ValidatedHousehold, ValidatedPersona, ValidatedZone } from './validators';
import {
  resolveServerHousehold,
  estimateServerCo2Kg,
  buildServerRecommendations,
  buildServerHouseholdText,
  normalizeAiRoutineResponse,
  type ServerRoutinePlan,
} from './routineSchema';
import { logger } from './logger';

const geminiApiKey = process.env.NODE_ENV === 'test' ? '' : (process.env.GEMINI_API_KEY || '');
const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const aiClient = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

type RecommendationType = 'safe-outdoor' | 'moderate-caution' | 'indoor-only' | 'mask-required';

function pickDaytimeSlot(zone: ValidatedZone, isHighRisk: boolean, isMidday: boolean) {
  if (isMidday && zone.aqi < 200) {
    return {
      recommendation: (isHighRisk ? 'moderate-caution' : 'safe-outdoor') as RecommendationType,
      activity: isHighRisk ? 'Brief outdoor walk with fitted N95' : 'Recommended outdoor errands window',
      healthNote: 'Midday thermal warming improves local vertical air dispersion.',
    };
  }
  return {
    recommendation: 'moderate-caution' as RecommendationType,
    activity: 'Indoor work or shaded errands',
    healthNote: 'Run interior HEPA filtration and minimize draft infiltration.',
  };
}

function getSlotDetails(h: number, zone: ValidatedZone, isHighRisk: boolean, isMorning: boolean, isMidday: boolean) {
  if (isMorning) {
    return {
      recommendation: 'indoor-only' as RecommendationType,
      activity: 'Indoor routine with filtration active',
      healthNote: `Morning stagnant boundary (AQI ${zone.aqi}). Keep windows latched.`,
    };
  }
  if (h >= 17) {
    return {
      recommendation: (isHighRisk ? 'indoor-only' : 'mask-required') as RecommendationType,
      activity: 'Evening indoor recovery & dinner preparation',
      healthNote: 'Commuter rush and evening cooling slow ground particulate mixing.',
    };
  }
  return pickDaytimeSlot(zone, isHighRisk, isMidday);
}

function createHourlySlot(h: number, zone: ValidatedZone, isHighRisk: boolean, safeStart: number, safeEnd: number) {
  const isMorning = h >= 7 && h <= 10 && zone.inversionRisk;
  const isMidday = h >= safeStart && h <= safeEnd;
  const details = getSlotDetails(h, zone, isHighRisk, isMorning, isMidday);
  return {
    hour: h,
    timeLabel: `${h.toString().padStart(2, '0')}:00`,
    activity: details.activity,
    recommendation: details.recommendation,
    predictedAQI: Math.max(30, Math.round(isMorning ? zone.aqi * 1.15 : isMidday ? zone.aqi * 0.75 : zone.aqi)),
    smogDispersionFactor: isMidday ? 0.85 : 0.35,
    inversionLikelihood: isMorning ? 'high' : isMidday ? 'low' : 'moderate',
    healthImpactNotes: details.healthNote,
    environmentalOffsetNotes: 'Shifting solo car errands toward transit or grouped trips lowers roadside emissions.',
  };
}

const SERVER_GENERAL_ADVICE = [
  'Equip bedrooms with HEPA or DIY MERV-13 filtration aimed at 4+ ACH.',
  'Avoid ventilating rooms during calm morning inversion hours (6:00-10:00).',
  'Wear fitted N95/FFP2 respirators outdoors when AQI rises above 150.',
  'Check on elderly neighbors and sensitive family members during severe smog days.',
];

function assembleServerFields(persona: ValidatedPersona, zone: ValidatedZone, hh: ValidatedHousehold) {
  const isHighRisk = persona.sensitivityLevel === 'high' || hh.hasChildren || hh.hasElderly || zone.aqi > 150;
  const safeStart = zone.inversionRisk ? 13 : 11;
  const safeEnd = zone.inversionRisk ? 16 : 17;
  return {
    optimalOutdoorWindow: {
      startHour: safeStart,
      endHour: safeEnd,
      rationale: `Afternoon solar convection between ${safeStart}:00 and ${safeEnd}:00 improves vertical dispersion relative to early morning hours.`,
    },
    hourlySchedule: [7, 8, 9, 12, 14, 17, 19, 21].map((h) => createHourlySlot(h, zone, isHighRisk, safeStart, safeEnd)),
    totalExposureScore: Math.round(zone.pm25 * (isHighRisk ? 2.1 : 4.5)),
    carbonOffsetKg: estimateServerCo2Kg(hh.commuteMode),
    priorityRecommendations: buildServerRecommendations(zone, safeStart, safeEnd, hh),
  };
}

export function generateHeuristicRoutine(
  persona: ValidatedPersona,
  zone: ValidatedZone,
  language: string,
  household?: ValidatedHousehold
): ServerRoutinePlan {
  const hh = resolveServerHousehold(household);
  const texts = buildServerHouseholdText(persona, zone, hh);
  return {
    generatedAt: Date.now(),
    persona: persona.name,
    language,
    source: 'server-heuristic',
    dataModeLabel: 'Server Deterministic Model (Non-AI Fallback)',
    ...assembleServerFields(persona, zone, hh),
    generalAdvice: SERVER_GENERAL_ADVICE,
    indoorChecklist: texts.checklist,
    commuteSuggestion: texts.commute,
    householdGuidance: texts.guidance,
    methodologyNote: 'Estimates derive from EPA AQI breakpoints, ASHRAE CADR decay math, and average mode CO2 factors rather than clinical measurements.',
  };
}

function buildRoutinePrompt(persona: ValidatedPersona, zone: ValidatedZone, cleanLang: string, hh: ValidatedHousehold): string {
  return `You are VAYORA, a factual urban environmental intelligence assistant.
Create a personalized smog resilience action plan in language "${cleanLang}".
Do NOT invent unverified CO2 percentages, medical cures, or fabricated clinical numbers. Mark estimates qualitatively where approximate.
Household: composition="${hh.householdComposition}", hasChildren=${hh.hasChildren}, hasElderly=${hh.hasElderly}, sensitivities="${hh.sensitivities || 'none stated'}", commute="${hh.commuteMode}", primaryOutdoor="${hh.outdoorActivity}", purifier="${hh.indoorPurifier}".
Persona: ${persona.name} (Sensitivity: ${persona.sensitivityLevel}). Zone: ${zone.zoneName}, AQI=${zone.aqi}, PM2.5=${zone.pm25}, Wind=${zone.windSpeedKmh}km/h, InversionRisk=${zone.inversionRisk}.
Return STRICT valid JSON only matching keys: optimalOutdoorWindow {startHour,endHour,rationale}, hourlySchedule (8 slots with hour,timeLabel,activity,recommendation,predictedAQI,smogDispersionFactor,inversionLikelihood,healthImpactNotes,environmentalOffsetNotes), priorityRecommendations (3 objects covering daily-routine, indoor-air, sustainable-transit with id,category,title,whatToChange,whyItMatters,environmentalBenefit,exposureNote,effort,isEstimate:true), indoorChecklist (string[]), commuteSuggestion (string), householdGuidance (string), generalAdvice (string[]).`;
}

export async function getAiRoutineInsights(
  persona: ValidatedPersona,
  zone: ValidatedZone,
  cleanLang: string,
  household?: ValidatedHousehold
): Promise<ServerRoutinePlan> {
  const hh = resolveServerHousehold(household);
  const fallback = generateHeuristicRoutine(persona, zone, cleanLang, hh);
  if (aiClient) {
    try {
      const model = aiClient.getGenerativeModel({ model: geminiModel });
      const aiResponse = await model.generateContent(buildRoutinePrompt(persona, zone, cleanLang, hh));
      const jsonMatch = aiResponse.response.text().match(/\{[\s\S]*\}/);
      if (jsonMatch) return normalizeAiRoutineResponse(JSON.parse(jsonMatch[0]), fallback);
    } catch (err) {
      logger.error('[AI GATEWAY LOG] Routine generation fallback triggered:', err);
    }
  }
  return fallback;
}

export async function getEmergencyAdvisoryText(zone: ValidatedZone, cleanLang: string): Promise<string> {
  if (aiClient) {
    try {
      const model = aiClient.getGenerativeModel({ model: geminiModel });
      const prompt = `You are VAYORA public safety broadcaster. Generate a factual 2-sentence public air-quality advisory in language "${cleanLang}" for ${zone.zoneName} reporting AQI ${zone.aqi} (PM2.5: ${zone.pm25} ug/m3, inversionRisk: ${zone.inversionRisk}). Focus on N95 masking, indoor sealing, and vulnerable resident care. Return ONLY plain advisory text.`;
      const aiResponse = await model.generateContent(prompt);
      const text = aiResponse.response.text().trim();
      if (text) return text;
    } catch (err) {
      logger.error('[AI ADVISORY LOG] Falling back to default advisory:', err);
    }
  }
  return `EMERGENCY SMOG ADVISORY: ${zone.zoneName} is reporting AQI ${zone.aqi} (PM2.5: ${zone.pm25} µg/m³). ${zone.inversionRisk ? 'Atmospheric inversion detected.' : 'Elevated particulate levels detected.'} High-risk residents should keep windows sealed, run filtration indoors, wear fitted N95 masks outdoors, and choose shielded transit.`;
}
