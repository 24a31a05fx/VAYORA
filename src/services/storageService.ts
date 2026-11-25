// ============================================================
// src/services/storageService.ts
// Offline-first resilient browser persistence with safeParse<T>()
// Per CODING_CONVENTIONS.md §5 & ARCHITECTURE_PATTERNS.md §4.2
// ============================================================

import {
  type UrbanZone,
  type PersonaProfile,
  type HouseholdProfile,
  type DailyRoutinePlan,
  type IAQRoomConfig,
  type CommunityPledge,
  Language,
  AccessibilityMode,
} from '@/types';
import {
  DEFAULT_ZONES,
  DEFAULT_PERSONAS,
  DEFAULT_HOUSEHOLD_PROFILE,
  DEFAULT_ROOMS,
  DEFAULT_PLEDGES,
} from '@/lib/constants';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const STORAGE_KEYS = {
  ZONES: 'vayora_zones_v1',
  SELECTED_ZONE: 'vayora_selected_zone_id_v1',
  PERSONA: 'vayora_active_persona_v1',
  HOUSEHOLD: 'vayora_household_profile_v1',
  ROUTINE: 'vayora_routine_plan_v1',
  ROOMS: 'vayora_iaq_rooms_v1',
  PLEDGES: 'vayora_community_pledges_v1',
  LANGUAGE: 'vayora_language_v1',
  ACCESSIBILITY_MODE: 'vayora_accessibility_mode_v1',
} as const;

const memoryStore = new Map<string, string>();
const fallbackStorage: Storage = {
  getItem: (k: string) => memoryStore.get(k) ?? null,
  setItem: (k: string, v: string) => { memoryStore.set(k, String(v)); },
  removeItem: (k: string) => { memoryStore.delete(k); },
  clear: () => { memoryStore.clear(); },
  key: (i: number) => Array.from(memoryStore.keys())[i] ?? null,
  get length() { return memoryStore.size; },
};

function getStorage(): Storage {
  if (typeof window !== 'undefined') {
    try {
      if (window.localStorage) return window.localStorage;
    } catch {
      // Storage quota or sandboxed iframe
    }
  }
  return fallbackStorage;
}

function getItem<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) return fallback;
  return safeParse<T>(storage.getItem(key), fallback);
}

function setItem<T>(key: string, value: T): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota or sandboxed iframe
  }
}

export const storageService = {
  getZones: (): UrbanZone[] => getItem(STORAGE_KEYS.ZONES, DEFAULT_ZONES),
  saveZones: (zones: UrbanZone[]): void => setItem(STORAGE_KEYS.ZONES, zones),

  getSelectedZoneId: (): string => getItem(STORAGE_KEYS.SELECTED_ZONE, DEFAULT_ZONES[0].zoneId),
  saveSelectedZoneId: (zoneId: string): void => setItem(STORAGE_KEYS.SELECTED_ZONE, zoneId),

  getActivePersona: (): PersonaProfile => getItem(STORAGE_KEYS.PERSONA, DEFAULT_PERSONAS[0]),
  saveActivePersona: (persona: PersonaProfile): void => setItem(STORAGE_KEYS.PERSONA, persona),

  getHouseholdProfile: (): HouseholdProfile => getItem(STORAGE_KEYS.HOUSEHOLD, DEFAULT_HOUSEHOLD_PROFILE),
  saveHouseholdProfile: (profile: HouseholdProfile): void => setItem(STORAGE_KEYS.HOUSEHOLD, profile),

  getRoutinePlan: (): DailyRoutinePlan | null => getItem<DailyRoutinePlan | null>(STORAGE_KEYS.ROUTINE, null),
  saveRoutinePlan: (plan: DailyRoutinePlan): void => setItem(STORAGE_KEYS.ROUTINE, plan),

  getRooms: (): IAQRoomConfig[] => getItem(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS),
  saveRooms: (rooms: IAQRoomConfig[]): void => setItem(STORAGE_KEYS.ROOMS, rooms),

  getPledges: (): CommunityPledge[] => getItem(STORAGE_KEYS.PLEDGES, DEFAULT_PLEDGES),
  savePledges: (pledges: CommunityPledge[]): void => setItem(STORAGE_KEYS.PLEDGES, pledges),

  getLanguage: (): Language => getItem(STORAGE_KEYS.LANGUAGE, Language.English),
  saveLanguage: (language: Language): void => setItem(STORAGE_KEYS.LANGUAGE, language),

  getAccessibilityMode: (): AccessibilityMode => getItem(STORAGE_KEYS.ACCESSIBILITY_MODE, AccessibilityMode.Standard),
  saveAccessibilityMode: (mode: AccessibilityMode): void => setItem(STORAGE_KEYS.ACCESSIBILITY_MODE, mode),
};
