// ============================================================
// api/index.ts
// Vercel Serverless Function bridge wrapping the Express 5 application
// Routes /api/* calls securely without starting a standalone TCP listener
// ============================================================

import { app } from '../server';

export default app;
