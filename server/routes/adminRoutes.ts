// ============================================================
// server/routes/adminRoutes.ts
// Protected administrative router with authentication & telemetry
// ============================================================

import { Router, type Request, type Response } from 'express';
import { adminAuthMiddleware, verifySecret, hashSecret } from '../auth';
import { adminRateLimiter } from '../middleware';
import { insightCache } from '../cache';
import { logger } from '../logger';

export const adminRouter = Router();

const DEFAULT_SALT = 'e5a1b3c4d5f6e7a8b9c0d1e2f3a4b5c6';
const DEFAULT_HASH = hashSecret('Vayora@Admin2026!', DEFAULT_SALT).hash;

adminRouter.post('/login', adminRateLimiter, (req: Request, res: Response) => {
  const { username, password } = (req.body as Record<string, unknown>) ?? {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Username and password required.' });
    return;
  }

  const isValid = username === 'admin' && verifySecret(password, DEFAULT_HASH, DEFAULT_SALT);
  if (!isValid) {
    logger.error(`[SECURITY] Failed admin login attempt for user: ${username}`);
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  const token = process.env.ADMIN_SECRET_KEY || 'vayora-default-admin-key-2026';
  logger.info(`[SECURITY] Successful admin login for user: ${username}`);
  res.json({ token, role: 'administrator', message: 'Authentication successful.' });
});

adminRouter.get('/system-status', adminRateLimiter, adminAuthMiddleware, (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    environment: process.env.NODE_ENV || 'production',
    cacheEntries: insightCache.size,
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  });
});

adminRouter.post('/purge-cache', adminRateLimiter, adminAuthMiddleware, (_req: Request, res: Response) => {
  insightCache.clear();
  logger.info('[SECURITY] Administrative cache purge executed.');
  res.json({ success: true, message: 'In-memory cache purged.' });
});
