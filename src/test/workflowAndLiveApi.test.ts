// ============================================================
// src/test/workflowAndLiveApi.test.ts
// Verifies live Open-Meteo telemetry service, fallback labeling,
// full household AI validation, and incomplete Gemini response repair
// ============================================================

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import type { Server } from 'http';
import { app } from '../../server';
import { fetchOpenMeteoTelemetry } from '../../server/airQualityService';
import { normalizeAiRoutineResponse } from '../../server/routineSchema';
import { generateHeuristicRoutine } from '../../server/aiService';
import { DEFAULT_PERSONAS, DEFAULT_ZONES, DEFAULT_HOUSEHOLD_PROFILE } from '@/lib/constants';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') baseUrl = `http://localhost:${addr.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Open-Meteo Live Air Quality Integration & Fallback', () => {
  it('maps live Open-Meteo AQ and weather responses cleanly', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      const body = url.includes('air-quality')
        ? { current: { pm2_5: 55.2, pm10: 88.4, nitrogen_dioxide: 37.6, carbon_monoxide: 1145, ozone: 98, us_aqi: 149 } }
        : { current: { temperature_2m: 14.5, relative_humidity_2m: 62, wind_speed_10m: 5.0 } };
      return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
    }) as unknown as typeof fetch;

    const res = await fetchOpenMeteoTelemetry('Z-CENTRAL', 28.6139, 77.209, mockFetch);
    expect(res.source).toBe('open-meteo-live');
    expect(res.aqi).toBe(149);
    expect(res.pm25).toBe(55.2);
    expect(res.temperatureC).toBe(14.5);
    expect(res.inversionRisk).toBe(true);
  });

  it('degrades to clearly labelled demonstration-baseline when network fails', async () => {
    const failingFetch = vi.fn().mockRejectedValue(new Error('Network offline')) as unknown as typeof fetch;
    const res = await fetchOpenMeteoTelemetry('Z-CENTRAL', 28.6139, 77.209, failingFetch);
    expect(res.source).toBe('demonstration-baseline');
    expect(res.aqi).toBeGreaterThan(0);
  });

  it('GET /api/air-quality returns structured telemetry payload', async () => {
    const res = await fetch(`${baseUrl}/api/air-quality?zoneId=Z-CENTRAL&lat=28.61&lng=77.21`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { source: string; aqi: number; pm25: number };
    expect(['open-meteo-live', 'demonstration-baseline']).toContain(json.source);
    expect(typeof json.aqi).toBe('number');
    expect(typeof json.pm25).toBe('number');
  });
});

describe('Household Routine API & Incomplete AI Response Repair', () => {
  it('POST /api/routine-insights produces A/B/C/D recommendations tailored to household', async () => {
    const payload = {
      persona: DEFAULT_PERSONAS[0],
      zone: DEFAULT_ZONES[0],
      household: { ...DEFAULT_HOUSEHOLD_PROFILE, commuteMode: 'car', indoorPurifier: 'none', sensitivities: 'Seasonal asthma' },
      language: 'en',
    };
    const res = await fetch(`${baseUrl}/api/routine-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.priorityRecommendations.length).toBe(3);
    expect(data.indoorChecklist.some((item: string) => item.includes('Corsi-Rosenthal'))).toBe(true);
    expect(data.householdGuidance).toContain('Seasonal asthma');
  });

  it('safely normalizes incomplete Gemini JSON objects using deterministic fallback', () => {
    const fallback = generateHeuristicRoutine(DEFAULT_PERSONAS[0], DEFAULT_ZONES[0], 'en');
    const partialAiJson = { totalExposureScore: 199, commuteSuggestion: 'Take underground rail line A.' };
    const repaired = normalizeAiRoutineResponse(partialAiJson, fallback);
    expect(repaired.source).toBe('gemini-ai');
    expect(repaired.totalExposureScore).toBe(199);
    expect(repaired.commuteSuggestion).toBe('Take underground rail line A.');
    expect(repaired.hourlySchedule.length).toBe(fallback.hourlySchedule.length);
    expect(repaired.priorityRecommendations.length).toBe(3);
  });
});
