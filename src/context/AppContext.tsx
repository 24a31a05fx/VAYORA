// ============================================================
// src/context/AppContext.tsx
// Composable Root Context Provider wrapping focused state slices
// ============================================================

import type { ReactNode } from 'react';
import { UIProvider } from './providers/UIProvider';
import { ZoneProvider } from './providers/ZoneProvider';
import { ProfileProvider } from './providers/ProfileProvider';
import { IAQProvider } from './providers/IAQProvider';
import { CommunityProvider } from './providers/CommunityProvider';

export function AppContextProvider({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <ZoneProvider>
        <ProfileProvider>
          <IAQProvider>
            <CommunityProvider>
              {children}
            </CommunityProvider>
          </IAQProvider>
        </ProfileProvider>
      </ZoneProvider>
    </UIProvider>
  );
}

export default AppContextProvider;
