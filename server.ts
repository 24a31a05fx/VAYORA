// ============================================================
// server.ts
// Standalone Express 5 Server Entrypoint for VAYORA
// ============================================================

import { app, insightCache, hashPayload, aiRateLimiter } from './server/app';
import { logger } from './server/logger';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`Backend listening on port ${PORT}`);
  });
}

export { app, insightCache, hashPayload, aiRateLimiter };
