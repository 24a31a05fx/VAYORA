// ============================================================
// src/context/hooks/useProfileContext.ts
// Hook to consume ProfileContext
// ============================================================

import { useContext } from 'react';
import { ProfileContext, type ProfileContextValue } from '../contextInstances';

export function useProfileContext(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return ctx;
}
