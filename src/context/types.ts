// ============================================================
// src/context/types.ts
// Context state types and action signatures
// ============================================================

import {
  TabId,
  Language,
  AccessibilityMode,
  type UrbanZone,
  type TelemetryDataSource,
  type PersonaProfile,
  type HouseholdProfile,
  type DailyRoutinePlan,
  type IAQRoomConfig,
  type CommunityPledge,
  type CommunityAlert,
} from '@/types';

export interface AppContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
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
  personas: PersonaProfile[];
  activePersona: PersonaProfile;
  setActivePersona: (persona: PersonaProfile) => void;
  householdProfile: HouseholdProfile;
  setHouseholdProfile: (profile: HouseholdProfile) => void;
  updateHouseholdField: <K extends keyof HouseholdProfile>(key: K, val: HouseholdProfile[K]) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  accessibilityMode: AccessibilityMode;
  setAccessibilityMode: (mode: AccessibilityMode) => void;
  routinePlan: DailyRoutinePlan | null;
  setRoutinePlan: (plan: DailyRoutinePlan | null) => void;
  rooms: IAQRoomConfig[];
  updateRoom: (roomId: string, updates: Partial<IAQRoomConfig>) => void;
  pledges: CommunityPledge[];
  togglePledge: (pledgeId: string) => void;
  alerts: CommunityAlert[];
  dismissAlert: (id: string) => void;
  globalBanner: string | null;
  setGlobalBanner: (msg: string | null) => void;
}
