// ============================================================
// server/cacheOrCompute.ts
// Shared cache-lookup, validation, AI generation, and cache-population helper
// ============================================================

import { insightCache, hashPayload, pruneCache } from './cache';
import { sanitizeText } from './validators';

export interface CacheOrComputeOptions<T> {
  keyPayload: Record<string, unknown>;
  language?: unknown;
  compute: (cleanLang: string) => Promise<T>;
}

/**
 * Retrieves a cached result by SHA-256 hash or computes, prunes, and caches a new result.
 */
export async function cacheOrCompute<T>(options: CacheOrComputeOptions<T>): Promise<T> {
  const cleanLang = sanitizeText(options.language, 10) || 'en';
  const cacheKey = hashPayload({ ...options.keyPayload, cleanLang });

  const existing = insightCache.get(cacheKey);
  if (existing) {
    return existing.data as T;
  }

  const result = await options.compute(cleanLang);
  pruneCache();
  insightCache.set(cacheKey, { data: result, cachedAt: Date.now() });
  return result;
}
