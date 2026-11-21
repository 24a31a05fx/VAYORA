// ============================================================
// src/context/appContextInstance.ts
// React Context object definition for VAYORA global state
// ============================================================

import { createContext } from 'react';
import type { AppContextValue } from './types';

export const AppContext = createContext<AppContextValue | null>(null);
