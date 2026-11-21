// ============================================================
// src/context/hooks/useTabState.ts
// Navigation tab state slice
// ============================================================

import { useState, useCallback } from 'react';
import { TabId } from '@/types';

export function useTabState() {
  const [activeTab, setActiveTabState] = useState<TabId>(TabId.Dashboard);

  const setActiveTab = useCallback((tab: TabId) => {
    setActiveTabState(tab);
  }, []);

  return { activeTab, setActiveTab };
}
