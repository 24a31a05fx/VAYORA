// ============================================================
// src/context/hooks/useLanguageState.ts
// Language, RTL directionality, and accessibility mode state slice
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { Language, AccessibilityMode } from '@/types';
import { storageService } from '@/services/storageService';

function loadArabicFontIfNeeded(lang: Language): void {
  if (typeof document !== 'undefined' && lang === Language.Arabic) {
    const id = 'noto-sans-arabic-font';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap';
      document.head.appendChild(link);
    }
  }
}

function updateDocumentLocale(lang: Language): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', lang === Language.Arabic ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    loadArabicFontIfNeeded(lang);
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
