// ============================================================
// src/services/apiService.ts
// Frontend API client communicating with backend Express routes
// Supports AbortSignal for request cancellation on component unmount
// ============================================================

import type {
  UrbanZone,
  PersonaProfile,
  HouseholdProfile,
  DailyRoutinePlan,
  LiveTelemetryPayload,
  Language,
} from '@/types';

interface RoutineRequestPayload {
  persona: PersonaProfile;
  zone: UrbanZone;
  household?: HouseholdProfile;
  language: Language;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';

export const apiService = {
  async fetchHealth(signal?: AbortSignal): Promise<{ status: string; uptime: number }> {
    const res = await fetch(`${API_BASE}/api/health`, { signal });
    if (!res.ok) {
      throw new Error(`Health check failed with status ${res.status}`);
    }
    return (await res.json()) as { status: string; uptime: number };
  },

  async fetchLiveAirQuality(
    zoneId: string,
    lat: number,
    lng: number,
    signal?: AbortSignal
  ): Promise<LiveTelemetryPayload> {
    const query = `zoneId=${encodeURIComponent(zoneId)}&lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`;
    const res = await fetch(`${API_BASE}/api/air-quality?${query}`, { signal });
    if (!res.ok) {
      throw new Error(`Live telemetry request failed with status ${res.status}`);
    }
    return (await res.json()) as LiveTelemetryPayload;
  },

  async generateDailyRoutine(payload: RoutineRequestPayload, signal?: AbortSignal): Promise<DailyRoutinePlan> {
    const res = await fetch(`${API_BASE}/api/routine-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${res.status} failed to generate routine`);
    }

    return (await res.json()) as DailyRoutinePlan;
  },

  async generateEmergencyAdvisory(zone: UrbanZone, language: Language, signal?: AbortSignal): Promise<string> {
    const res = await fetch(`${API_BASE}/api/emergency-advisory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zone, language }),
      signal,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${res.status} failed to generate advisory`);
    }

    const data = (await res.json()) as { advisory?: string };
    return data.advisory || '';
  },
};
