// ============================================================
// server/logger.ts
// Standardized logging utility for backend operations
// ============================================================

/**
 * Structured logger utility for server-side diagnostic events.
 */
export const logger = {
  /**
   * Logs an informational message with the standard VAYORA INFO prefix.
   */
  info: (message: string, ...args: unknown[]): void => {
    console.log(`[VAYORA INFO] ${message}`, ...args);
  },
  /**
   * Logs an error message with the standard VAYORA ERROR prefix.
   */
  error: (message: string, ...args: unknown[]): void => {
    console.error(`[VAYORA ERROR] ${message}`, ...args);
  },
};
