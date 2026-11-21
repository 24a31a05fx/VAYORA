// ============================================================
// server/routes/healthRoutes.ts
// Health check and runtime diagnostics router
// ============================================================

import { Router, type Request, type Response } from 'express';
import { insightCache } from '../cache';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: Date.now(),
    cacheEntries: insightCache.size,
  });
});

export default healthRouter;
