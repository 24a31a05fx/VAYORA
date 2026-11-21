// ============================================================
// src/context/providers/UIProvider.tsx
// Provider component for UI and navigation state
// ============================================================

import { useMemo, type ReactNode } from 'react';
import { UIContext, type UIContextValue } from '../contextInstances';
import { useTabState } from '../hooks/useTabState';
import { useLanguageState } from '../hooks/useLanguageState';

export function UIProvider({ children }: { children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabState();
  const { language, setLanguage, accessibilityMode, setAccessibilityMode } = useLanguageState();

  const value = useMemo<UIContextValue>(() => ({
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    accessibilityMode,
    setAccessibilityMode,
    globalBanner: null,
    setGlobalBanner: () => {},
  }), [activeTab, setActiveTab, language, setLanguage, accessibilityMode, setAccessibilityMode]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
