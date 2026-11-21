// ============================================================
// src/lib/tabPreload.ts
// Preload chunk triggers for lazy-loaded navigation modules
// ============================================================

import { TabId } from '@/types';

export function preloadTab(tabId: TabId): void {
  switch (tabId) {
    case TabId.Routine:
      void import('@/components/Routine/DailyRoutineOptimizer');
      break;
    case TabId.Transit:
      void import('@/components/Transit/TransitPlanner');
      break;
    case TabId.IAQ:
      void import('@/components/IAQ/IAQCenter');
      break;
    case TabId.Community:
      void import('@/components/Community/CommunityHub');
      break;
    default:
      break;
  }
}
