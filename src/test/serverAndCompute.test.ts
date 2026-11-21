// ============================================================
// src/test/serverAndCompute.test.ts
// Unit tests for cacheOrCompute, logger, and newly modularized compute utilities
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheOrCompute } from '../../server/cacheOrCompute';
import { insightCache } from '../../server/cache';
import { logger } from '../../server/logger';
import {
  computePollutantBreakdown,
  computeInversionStatus,
  computeZoneSimulation,
} from '@/lib/compute/aqiPollutantsCompute';
import { DEFAULT_ZONES } from '@/lib/constants';

describe('server/cacheOrCompute', () => {
  beforeEach(() => {
    insightCache.clear();
  });

  it('computes and caches result on cache miss', async () => {
    const computeFn = vi.fn().mockResolvedValue({ message: 'fresh computation' });
    const result = await cacheOrCompute({
      keyPayload: { testId: 'abc-123' },
      language: 'en',
      compute: computeFn,
    });

    expect(result).toEqual({ message: 'fresh computation' });
    expect(computeFn).toHaveBeenCalledTimes(1);
    expect(insightCache.size).toBe(1);
  });

  it('returns cached result on subsequent calls without recomputing', async () => {
    const computeFn = vi.fn().mockResolvedValue({ message: 'cached value' });
    const first = await cacheOrCompute({
      keyPayload: { query: 'same-query' },
      language: 'en',
      compute: computeFn,
    });
    const second = await cacheOrCompute({
      keyPayload: { query: 'same-query' },
      language: 'en',
      compute: computeFn,
    });

    expect(first).toEqual(second);
    expect(computeFn).toHaveBeenCalledTimes(1);
  });
});

describe('server/logger', () => {
  it('outputs formatted message with info prefix', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('System operational', 123);
    expect(spy).toHaveBeenCalledWith('[VAYORA INFO] System operational', 123);
    spy.mockRestore();
  });

  it('outputs formatted message with error prefix', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('Database connection failed', { code: 500 });
    expect(spy).toHaveBeenCalledWith('[VAYORA ERROR] Database connection failed', { code: 500 });
    spy.mockRestore();
  });
});

describe('aqiPollutantsCompute modules', () => {
  const sampleZone = DEFAULT_ZONES[0];

  it('computePollutantBreakdown generates readings for all 5 core pollutants', () => {
    const readings = computePollutantBreakdown(sampleZone);
    expect(readings.length).toBe(5);
    const types = readings.map((r) => r.type);
    expect(types).toContain('PM2.5');
    expect(types).toContain('PM10');
    expect(types).toContain('NO2');
    expect(types).toContain('CO');
    expect(types).toContain('O3');
  });

  it('computeInversionStatus evaluates thermal lapse and wind conditions', () => {
    const status = computeInversionStatus(sampleZone);
    expect(status).toHaveProperty('isInversion');
    expect(status).toHaveProperty('severity');
    expect(status).toHaveProperty('rationale');
    expect(typeof status.isInversion).toBe('boolean');
  });

  it('computeZoneSimulation correctly models spike and clean scenarios', () => {
    const spiked = computeZoneSimulation(sampleZone, 'spike');
    expect(spiked.aqi).toBeGreaterThan(sampleZone.aqi);
    expect(spiked.inversionRisk).toBe(true);

    const cleaned = computeZoneSimulation(sampleZone, 'clean');
    expect(cleaned.aqi).toBeLessThan(sampleZone.aqi);
    expect(cleaned.inversionRisk).toBe(false);
  });
});
