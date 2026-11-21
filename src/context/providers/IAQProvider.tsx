// ============================================================
// src/context/providers/IAQProvider.tsx
// Provider component for indoor air room parameters
// ============================================================

import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { IAQContext, type IAQContextValue } from '../contextInstances';
import type { IAQRoomConfig } from '@/types';
import { storageService } from '@/services/storageService';

export function IAQProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<IAQRoomConfig[]>(() => storageService.getRooms());

  const updateRoom = useCallback((roomId: string, updates: Partial<IAQRoomConfig>) => {
    setRooms((prev) => {
      const next = prev.map((r) => (r.roomId === roomId ? { ...r, ...updates } : r));
      storageService.saveRooms(next);
      return next;
    });
  }, []);

  const value = useMemo<IAQContextValue>(() => ({
    rooms,
    updateRoom,
  }), [rooms, updateRoom]);

  return <IAQContext.Provider value={value}>{children}</IAQContext.Provider>;
}
