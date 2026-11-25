// ============================================================
// server/app.ts
// Express 5 application instance shared across standalone server & Vercel /api
// ============================================================

import express, { type Request, type Response } from 'express';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';
import { insightCache, hashPayload } from './cache';
import { helmetMiddleware, corsMiddleware, aiRateLimiter, safeErrorHandler } from './middleware';
import { healthRouter } from './routes/healthRoutes';
import { routineRouter } from './routes/routineRoutes';
import { advisoryRouter } from './routes/advisoryRoutes';
import { adminRouter } from './routes/adminRoutes';
import { airQualityRouter } from './routes/airQualityRoutes';

dotenv.config();

export const app = express();
app.disable('x-powered-by');
app.set('etag', 'strong');

app.use(compression());
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '15kb' }));

app.use('/api/health', healthRouter);
app.use('/api/air-quality', airQualityRouter);
app.use('/api/routine-insights', routineRouter);
app.use('/api/emergency-advisory', advisoryRouter);
app.use('/api/admin', adminRouter);

const distPath = path.resolve(process.cwd(), 'dist');

app.use('/assets', express.static(path.join(distPath, 'assets'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
}));

app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

app.get('*splat', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('VAYORA Backend Running. Build frontend with `npm run build` to serve SPA.');
    }
  });
});

app.use(safeErrorHandler);

export { insightCache, hashPayload, aiRateLimiter };
