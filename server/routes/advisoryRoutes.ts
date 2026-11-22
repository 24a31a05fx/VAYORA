// ============================================================
// server/routes/advisoryRoutes.ts
// Emergency smog health broadcast advisory router
// ============================================================

import { Router, type Request, type Response } from 'express';
import { aiRateLimiter } from '../middleware';
import { validateZone } from '../validators';
import { getEmergencyAdvisoryText } from '../aiService';
import { cacheOrCompute } from '../cacheOrCompute';

interface AdvisoryRequestBody {
  zone?: unknown;
  language?: unknown;
}

export const advisoryRouter = Router();

advisoryRouter.post('/', aiRateLimiter, async (req: Request<unknown, unknown, AdvisoryRequestBody>, res: Response) => {
  const { zone, language = 'en' } = req.body;
  if (!validateZone(zone)) {
    return res.status(400).json({ error: 'Invalid zone telemetry payload.' });
  }

  const advisory = await cacheOrCompute({
    keyPayload: { type: 'advisory', zoneId: zone.zoneId, aqi: zone.aqi },
    language,
    compute: (cleanLang) => getEmergencyAdvisoryText(zone, cleanLang),
  });

  return res.status(200).json({ advisory });
});

export default advisoryRouter;
