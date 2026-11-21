// ============================================================
// src/test/setup.ts
// Global test setup for Vitest + Testing Library
// ============================================================
import '@testing-library/jest-dom';

// Ensure localStorage in Node 22 / JSDOM environment
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      value: window.localStorage,
      configurable: true,
      writable: true,
    });
  } catch {
    // ignore
  }
}

