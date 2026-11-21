// ============================================================
// src/context/hooks/useLanguageState.ts
// Language, RTL directionality, and accessibility mode state slice
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { Language, AccessibilityMode } from '@/types';
import { storageService } from '@/services/storageService';

function updateDocumentLocale(lang: Language): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', lang === Language.Arabic ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }
}

export function useLanguageState() {
  const [language, setLanguageState] = useState<Language>(() => storageService.getLanguage());
  const [accessibilityMode, setAccessibilityModeState] = useState<AccessibilityMode>(() => storageService.getAccessibilityMode());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    storageService.saveLanguage(lang);
    updateDocumentLocale(lang);
  }, []);

  const setAccessibilityMode = useCallback((mode: AccessibilityMode) => {
    setAccessibilityModeState(mode);
    storageService.saveAccessibilityMode(mode);
  }, []);

  useEffect(() => {
    updateDocumentLocale(language);
  }, [language]);

  return { language, setLanguage, accessibilityMode, setAccessibilityMode };
}
