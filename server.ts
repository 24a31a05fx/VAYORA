// ============================================================
// server.ts
// Express 5 Backend Gateway for VAYORA
// Enforces OWASP Top 10, CWE-209 safe error handling,
// SHA-256 LRU cache (100-entries), rate limiting, and server-side AI
// ============================================================

import express, { type Request, type Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { insightCache, hashPayload } from './server/cache';
import { helmetMiddleware, corsMiddleware, aiRateLimiter, safeErrorHandler } from './server/middleware';
import { healthRouter } from './server/routes/healthRoutes';
import { routineRouter } from './server/routes/routineRoutes';
import { advisoryRouter } from './server/routes/advisoryRoutes';
import { logger } from './server/logger';

dotenv.config();

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// 1. Defensive Middleware Chain
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '15kb' }));

// 2. Mount API Routers
app.use('/api/health', healthRouter);
app.use('/api/routine-insights', routineRouter);
app.use('/api/emergency-advisory', advisoryRouter);

// 3. Static Assets & Express 5 Named Splat Fallback
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*splat', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('VAYORA Backend Running. Build frontend with `npm run build` to serve SPA.');
    }
  });
});

// 4. Safe Error Handler
app.use(safeErrorHandler);

// 5. Server Listener
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Backend listening on port ${PORT}`);
  });
}

export { insightCache, hashPayload, aiRateLimiter };
