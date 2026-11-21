// ============================================================
// src/lib/compute/aqiPollutantsCompute.ts
// Pure calculations for pollutant status breakdowns and simulation deltas
// ============================================================

import { PollutantType, type PollutantReading, type UrbanZone } from '@/types';
import { evaluateInversionRisk, type InversionRiskResult } from './meteorology';

function buildPM25Reading(pm25: number, history: number[]): PollutantReading {
  return {
    type: PollutantType.PM25,
    current: pm25,
    unit: 'µg/m³',
    aqiContribution: Math.round((pm25 / 150) * 100),
    history: history.map((v) => Math.round(v * 0.7)),
    threshold: 35.4,
    status: pm25 > 55 ? 'Hazardous' : pm25 > 35 ? 'Moderate' : 'Good',
  };
}

function buildPM10Reading(pm10: number, history: number[]): PollutantReading {
  return {
    type: PollutantType.PM10,
    current: pm10,
    unit: 'µg/m³',
    aqiContribution: Math.round((pm10 / 250) * 100),
    history: history.map((v) => Math.round(v * 0.9)),
    threshold: 154,
    status: pm10 > 154 ? 'Unhealthy' : 'Moderate',
  };
}

function buildNO2Reading(no2: number): PollutantReading {
  return {
    type: PollutantType.NO2,
    current: no2,
    unit: 'ppb',
    aqiContribution: Math.round((no2 / 100) * 100),
    history: [55, 68, 74, 82, 88, 92, no2],
    threshold: 53,
    status: no2 > 53 ? 'Unhealthy' : 'Acceptable',
  };
}

function buildCOReading(co: number): PollutantReading {
  return {
    type: PollutantType.CO,
    current: co,
    unit: 'ppm',
    aqiContribution: Math.round((co / 9) * 100),
    history: [1.2, 1.8, 2.4, 3.1, 3.8, 4.0, co],
    threshold: 9.0,
    status: co > 9.0 ? 'Critical' : 'Safe',
  };
}

function buildO3Reading(o3: number): PollutantReading {
  return {
    type: PollutantType.O3,
    current: o3,
    unit: 'ppb',
    aqiContribution: Math.round((o3 / 70) * 100),
    history: [25, 28, 30, 32, 35, 34, o3],
    threshold: 70,
    status: o3 > 70 ? 'High' : 'Normal',
  };
}

/**
 * Computes individual pollutant breakdown metrics and historical trends for a given zone.
 */
export function computePollutantBreakdown(zone: UrbanZone): PollutantReading[] {
  return [
    buildPM25Reading(zone.pm25, zone.history),
    buildPM10Reading(zone.pm10, zone.history),
    buildNO2Reading(zone.no2),
    buildCOReading(zone.co),
    buildO3Reading(zone.o3),
  ];
}

/**
 * Evaluates boundary layer lapse rates and thermal inversion status for an urban zone.
 */
export function computeInversionStatus(zone: UrbanZone): InversionRiskResult {
  const upperTemp = zone.inversionRisk ? zone.temperatureC + 3.2 : zone.temperatureC - 2.5;
  return evaluateInversionRisk(zone.temperatureC, upperTemp, zone.windSpeedKmh);
}

/**
 * Computes updated zone parameters for interactive smog spike or clean dispersion simulations.
 */
export function computeZoneSimulation(zone: UrbanZone, type: 'spike' | 'clean'): Partial<UrbanZone> {
  if (type === 'spike') {
    const newAqi = Math.min(500, zone.aqi + 45);
    return {
      aqi: newAqi,
      pm25: Math.round((zone.pm25 + 35) * 10) / 10,
      inversionRisk: true,
      history: [...zone.history.slice(1), newAqi],
    };
  }
  const cleanAqi = Math.max(35, zone.aqi - 50);
  return {
    aqi: cleanAqi,
    pm25: Math.max(10, Math.round((zone.pm25 - 40) * 10) / 10),
    inversionRisk: false,
    history: [...zone.history.slice(1), cleanAqi],
  };
}
