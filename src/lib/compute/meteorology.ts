// ============================================================
// src/lib/compute/meteorology.ts
// Meteorological inversion risk modeling and community emission offset
// ============================================================

import { assertFiniteNumber } from './asserts';

export interface InversionRiskResult {
  isInversion: boolean;
  severity: 'none' | 'moderate' | 'severe';
  rationale: string;
}

function getActiveInversionRisk(lapseRate: number, windSpeedKmh: number): InversionRiskResult | null {
  if (lapseRate > 2.0 && windSpeedKmh < 6) {
    return {
      isInversion: true,
      severity: 'severe',
      rationale: `Strong thermal cap (+${lapseRate.toFixed(1)}°C aloft) and stagnant winds (${windSpeedKmh} km/h) prevent vertical pollutant dispersion. Smog is trapped in ground breathing zone.`,
    };
  }
  if (lapseRate > 0 && windSpeedKmh < 12) {
    return {
      isInversion: true,
      severity: 'moderate',
      rationale: `Mild thermal inversion (+${lapseRate.toFixed(1)}°C aloft) with calm winds (${windSpeedKmh} km/h). Expect elevated morning particulate concentrations.`,
    };
  }
  return null;
}

/**
 * Analyzes meteorological conditions for winter temperature inversion risk.
 */
export function evaluateInversionRisk(
  tempGroundC: number,
  tempUpperC: number,
  windSpeedKmh: number
): InversionRiskResult {
  assertFiniteNumber(tempGroundC, 'tempGroundC');
  assertFiniteNumber(tempUpperC, 'tempUpperC');
  assertFiniteNumber(windSpeedKmh, 'windSpeedKmh');

  const lapseRate = tempUpperC - tempGroundC;
  const active = getActiveInversionRisk(lapseRate, windSpeedKmh);
  if (active) return active;

  return {
    isInversion: false,
    severity: 'none',
    rationale: `Normal vertical adiabatic lapse rate with active air mixing (${windSpeedKmh} km/h winds). Favorable atmospheric dispersion.`,
  };
}

const OFFSET_WEIGHTS: Record<string, { co2Kg: number; pm25Grams: number }> = {
  carpool: { co2Kg: 4.8, pm25Grams: 22 },
  'clean-heating': { co2Kg: 12.0, pm25Grams: 140 },
  'dust-control': { co2Kg: 1.5, pm25Grams: 85 },
  'waste-management': { co2Kg: 6.2, pm25Grams: 110 },
  'vulnerable-care': { co2Kg: 0.5, pm25Grams: 5 },
};

function accumulateOffset(key: string, count: number, total: { co2: number; pm: number }) {
  const weight = OFFSET_WEIGHTS[key];
  if (typeof count === 'number' && count > 0 && weight) {
    total.co2 += count * weight.co2Kg;
    total.pm += count * weight.pm25Grams;
  }
}

/**
 * Computes collective community carbon and particulate emission offset.
 */
export function calculateCommunityOffset(pledgeCounts: Record<string, number>): {
  totalCo2Kg: number;
  totalPm25Grams: number;
} {
  const total = { co2: 0, pm: 0 };
  for (const [key, count] of Object.entries(pledgeCounts)) {
    accumulateOffset(key, count, total);
  }
  return {
    totalCo2Kg: Math.round(total.co2 * 10) / 10,
    totalPm25Grams: Math.round(total.pm * 10) / 10,
  };
}
