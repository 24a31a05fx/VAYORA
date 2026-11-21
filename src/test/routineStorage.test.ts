// ============================================================
// src/test/routineStorage.test.ts
// Unit tests for client heuristic routine fallback and storage persistence
// ============================================================

import { describe, it, expect } from 'vitest';
import { generateHeuristicRoutine } from '@/lib/aqiCompute';
import { storageService } from '@/services/storageService';
import { DEFAULT_PERSONAS, DEFAULT_ZONES } from '@/lib/constants';
import { Language, AccessibilityMode } from '@/types';

describe('generateHeuristicRoutine', () => {
  it('generates a valid routine plan with optimal window and hourly slots', () => {
    const persona = DEFAULT_PERSONAS[0];
    const zone = DEFAULT_ZONES[0];
    const plan = generateHeuristicRoutine(persona, zone, 'en');

    expect(plan.persona).toBe(persona.name);
    expect(plan.optimalOutdoorWindow).toBeDefined();
    expect(plan.optimalOutdoorWindow.startHour).toBeGreaterThanOrEqual(11);
    expect(plan.optimalOutdoorWindow.endHour).toBeLessThanOrEqual(17);
    expect(plan.hourlySchedule.length).toBe(8);
    expect(plan.totalExposureScore).toBeGreaterThan(0);
    expect(plan.generalAdvice.length).toBeGreaterThan(0);
  });

  it('adjusts safe window when inversion risk is present', () => {
    const persona = DEFAULT_PERSONAS[0];
    const zoneWithInversion = { ...DEFAULT_ZONES[0], inversionRisk: true };
    const plan = generateHeuristicRoutine(persona, zoneWithInversion, 'en');

    expect(plan.optimalOutdoorWindow.startHour).toBe(13);
    expect(plan.optimalOutdoorWindow.endHour).toBe(16);
  });
});

describe('storageService Language and Accessibility persistence', () => {
  it('saves and retrieves language', () => {
    storageService.saveLanguage(Language.Hindi);
    expect(storageService.getLanguage()).toBe(Language.Hindi);

    storageService.saveLanguage(Language.Arabic);
    expect(storageService.getLanguage()).toBe(Language.Arabic);

    // Reset back to English
    storageService.saveLanguage(Language.English);
    expect(storageService.getLanguage()).toBe(Language.English);
  });

  it('saves and retrieves accessibility mode', () => {
    storageService.saveAccessibilityMode(AccessibilityMode.HighContrast);
    expect(storageService.getAccessibilityMode()).toBe(AccessibilityMode.HighContrast);

    storageService.saveAccessibilityMode(AccessibilityMode.ReducedMotion);
    expect(storageService.getAccessibilityMode()).toBe(AccessibilityMode.ReducedMotion);

    // Reset back to Standard
    storageService.saveAccessibilityMode(AccessibilityMode.Standard);
    expect(storageService.getAccessibilityMode()).toBe(AccessibilityMode.Standard);
  });
});
