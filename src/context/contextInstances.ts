// ============================================================
// src/context/contextInstances.ts
// React Context instances for split focused state slices
// ============================================================

import { createContext } from 'react';
import type {
  TabId,
  Language,
  AccessibilityMode,
  UrbanZone,
  TelemetryDataSource,
  PersonaProfile,
  HouseholdProfile,
  DailyRoutinePlan,
  IAQRoomConfig,
  CommunityPledge,
  CommunityAlert,
} from '@/types';

export interface UIContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  accessibilityMode: AccessibilityMode;
  setAccessibilityMode: (mode: AccessibilityMode) => void;
  globalBanner: string | null;
  setGlobalBanner: (msg: string | null) => void;
}

export interface ZoneContextValue {
  zones: UrbanZone[];
  selectedZoneId: string;
  selectedZone: UrbanZone;
  setSelectedZoneId: (id: string) => void;
  updateZone: (zoneId: string, updates: Partial<UrbanZone>, nextSource?: TelemetryDataSource) => void;
  dataSource: TelemetryDataSource;
  lastSyncedAt: number | null;
  isSyncingLive: boolean;
  syncError: string | null;
  refreshLiveTelemetry: () => Promise<void>;
}

export interface ProfileContextValue {
  personas: PersonaProfile[];
  activePersona: PersonaProfile;
  setActivePersona: (persona: PersonaProfile) => void;
  householdProfile: HouseholdProfile;
  setHouseholdProfile: (profile: HouseholdProfile) => void;
  updateHouseholdField: <K extends keyof HouseholdProfile>(key: K, val: HouseholdProfile[K]) => void;
  routinePlan: DailyRoutinePlan | null;
  setRoutinePlan: (plan: DailyRoutinePlan | null) => void;
}

export interface IAQContextValue {
  rooms: IAQRoomConfig[];
  updateRoom: (roomId: string, updates: Partial<IAQRoomConfig>) => void;
}

export interface CommunityContextValue {
  pledges: CommunityPledge[];
  togglePledge: (pledgeId: string) => void;
  alerts: CommunityAlert[];
  dismissAlert: (id: string) => void;
}

export { AppContext } from './appContextInstance';
export const UIContext = createContext<UIContextValue | null>(null);
export const ZoneContext = createContext<ZoneContextValue | null>(null);
export const ProfileContext = createContext<ProfileContextValue | null>(null);
export const IAQContext = createContext<IAQContextValue | null>(null);
export const CommunityContext = createContext<CommunityContextValue | null>(null);
