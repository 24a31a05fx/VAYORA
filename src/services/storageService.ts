// ============================================================
// src/services/storageService.ts
// Offline-first resilient browser persistence with safeParse<T>()
// Per CODING_CONVENTIONS.md §5 & ARCHITECTURE_PATTERNS.md §4.2
// ============================================================

import {
  type UrbanZone,
  type PersonaProfile,
  type DailyRoutinePlan,
  type IAQRoomConfig,
  type CommunityPledge,
  Language,
  AccessibilityMode,
} from '@/types';
import {
  DEFAULT_ZONES,
  DEFAULT_PERSONAS,
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

export const storageService = {
  getZones(): UrbanZone[] {
    const storage = getStorage();
    if (!storage) return DEFAULT_ZONES;
    return safeParse<UrbanZone[]>(storage.getItem(STORAGE_KEYS.ZONES), DEFAULT_ZONES);
  },

  saveZones(zones: UrbanZone[]): void {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
    } catch {
      // Storage quota or sandboxed iframe
    }
  },

  getSelectedZoneId(): string {
    const storage = getStorage();
    if (!storage) return DEFAULT_ZONES[0].zoneId;
    return safeParse<string>(storage.getItem(STORAGE_KEYS.SELECTED_ZONE), DEFAULT_ZONES[0].zoneId);
  },

  saveSelectedZoneId(zoneId: string): void {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.SELECTED_ZONE, JSON.stringify(zoneId));
    } catch {
      // Ignored
    }
  },

  getActivePersona(): PersonaProfile {
    const storage = getStorage();
    if (!storage) return DEFAULT_PERSONAS[0];
    return safeParse<PersonaProfile>(storage.getItem(STORAGE_KEYS.PERSONA), DEFAULT_PERSONAS[0]);
  },

  saveActivePersona(persona: PersonaProfile): void {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.PERSONA, JSON.stringify(persona));
    } catch {
      // Ignored
    }
  },

  getRoutinePlan(): DailyRoutinePlan | null {
    const storage = getStorage();
    if (!storage) return null;
    return safeParse<DailyRoutinePlan | null>(storage.getItem(STORAGE_KEYS.ROUTINE), null);
  },

  saveRoutinePlan(plan: DailyRoutinePlan): void {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.ROUTINE, JSON.stringify(plan));
    } catch {
      // Ignored
    }
  },

  getRooms(): IAQRoomConfig[] {
    const storage = getStorage();
    if (!storage) return DEFAULT_ROOMS;
    return safeParse<IAQRoomConfig[]>(storage.getItem(STORAGE_KEYS.ROOMS), DEFAULT_ROOMS);
  },

  saveRooms(rooms: IAQRoomConfig[]): void {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    } catch {
      // Ignored
    }
  },

  getPledges(): CommunityPledge[] {
    const storage = getStorage();
    if (!storage) return DEFAULT_PLEDGES;
    return safeParse<CommunityPledge[]>(storage.getItem(STORAGE_KEYS.PLEDGES), DEFAULT_PLEDGES);
  },

  savePledges(pledges: CommunityPledge[]): void {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.PLEDGES, JSON.stringify(pledges));
    } catch {
      // Ignored
    }
  },

  getLanguage(): Language {
    const storage = getStorage();
    if (!storage) return Language.English;
    return safeParse<Language>(storage.getItem(STORAGE_KEYS.LANGUAGE), Language.English);
  },

  saveLanguage(language: Language): void {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.LANGUAGE, JSON.stringify(language));
    } catch {
      // Ignored
    }
  },

  getAccessibilityMode(): AccessibilityMode {
    const storage = getStorage();
    if (!storage) return AccessibilityMode.Standard;
    return safeParse<AccessibilityMode>(storage.getItem(STORAGE_KEYS.ACCESSIBILITY_MODE), AccessibilityMode.Standard);
  },

  saveAccessibilityMode(mode: AccessibilityMode): void {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.ACCESSIBILITY_MODE, JSON.stringify(mode));
    } catch {
      // Ignored
    }
  },
};
