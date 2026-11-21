// ============================================================
// src/context/hooks/usePledgeState.ts
// IAQ room configurations and community pledge participation state slice
// ============================================================

import { useState, useCallback } from 'react';
import type { IAQRoomConfig, CommunityPledge } from '@/types';
import { storageService } from '@/services/storageService';

function updatePledgeList(pledges: CommunityPledge[], pledgeId: string): CommunityPledge[] {
  return pledges.map((p) => {
    if (p.id !== pledgeId) return p;
    const userPledged = !p.userPledged;
    return {
      ...p,
      userPledged,
      currentParticipants: userPledged ? p.currentParticipants + 1 : Math.max(0, p.currentParticipants - 1),
    };
  });
}

export function usePledgeState() {
  const [rooms, setRooms] = useState<IAQRoomConfig[]>(() => storageService.getRooms());
  const [pledges, setPledges] = useState<CommunityPledge[]>(() => storageService.getPledges());

  const updateRoom = useCallback((roomId: string, updates: Partial<IAQRoomConfig>) => {
    setRooms((prev) => {
      const next = prev.map((r) => (r.roomId === roomId ? { ...r, ...updates } : r));
      storageService.saveRooms(next);
      return next;
    });
  }, []);

  const togglePledge = useCallback((pledgeId: string) => {
    setPledges((prev) => {
      const next = updatePledgeList(prev, pledgeId);
      storageService.savePledges(next);
      return next;
    });
  }, []);

  return { rooms, updateRoom, pledges, togglePledge };
}
