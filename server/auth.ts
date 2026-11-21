// ============================================================
// server/auth.ts
// Cryptographic password hashing, timing-safe comparison, and authentication
// ============================================================

import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

/**
 * Derives a cryptographically secure hash from a plain-text secret.
 */
export function hashSecret(secret: string, saltHex?: string): { hash: string; salt: string } {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : randomBytes(16);
  const derived = pbkdf2Sync(secret, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST);
  return { hash: derived.toString('hex'), salt: salt.toString('hex') };
}

/**
 * Compares two secrets in constant time to eliminate side-channel timing attacks.
 */
export function verifySecret(candidate: string, expectedHash: string, saltHex: string): boolean {
  try {
    const candidateDerived = pbkdf2Sync(candidate, Buffer.from(saltHex, 'hex'), PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST);
    const expectedBuf = Buffer.from(expectedHash, 'hex');
    if (candidateDerived.length !== expectedBuf.length) return false;
    return timingSafeEqual(candidateDerived, expectedBuf);
  } catch {
    return false;
  }
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const customHeader = req.headers['x-admin-key'];
  return typeof customHeader === 'string' ? customHeader.trim() : null;
}

/**
 * Defensive middleware protecting administrative endpoints.
 */
export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  const expectedKey = process.env.ADMIN_SECRET_KEY || 'vayora-default-admin-key-2026';

  if (!token) {
    logger.error(`[SECURITY] Unauthorized admin access attempt from IP: ${req.ip}`);
    res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    return;
  }

  const tokenBuf = Buffer.from(token);
  const keyBuf = Buffer.from(expectedKey);

  if (tokenBuf.length !== keyBuf.length || !timingSafeEqual(tokenBuf, keyBuf)) {
    logger.error(`[SECURITY] Forbidden admin access attempt with invalid token from IP: ${req.ip}`);
    res.status(403).json({ error: 'Forbidden: Insufficient privileges.' });
    return;
  }

  next();
}
