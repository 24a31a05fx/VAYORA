// ============================================================
// src/context/useAppContext.ts
// Custom hook for consuming AppContext
// ============================================================

import { useContext } from 'react';
import { AppContext } from './appContextInstance';
import type { AppContextValue } from './types';

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}

export const useApp = useAppContext;
