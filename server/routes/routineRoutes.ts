// ============================================================
// server/routes/routineRoutes.ts
// GenAI personalized daily exposure routine router
// ============================================================

import { Router, type Request, type Response } from 'express';
import { aiRateLimiter } from '../middleware';
import { validateZone, validatePersona } from '../validators';
import { getAiRoutineInsights } from '../aiService';
import { cacheOrCompute } from '../cacheOrCompute';

export interface RoutineRequestBody {
  persona?: unknown;
  zone?: unknown;
  language?: unknown;
}

export const routineRouter = Router();

routineRouter.post('/', aiRateLimiter, async (req: Request<unknown, unknown, RoutineRequestBody>, res: Response) => {
  const { persona, zone, language = 'en' } = req.body;
  if (!validateZone(zone)) {
    return res.status(400).json({ error: 'Invalid zone telemetry payload or out-of-range values.' });
  }
  if (!validatePersona(persona)) {
    return res.status(400).json({ error: 'Invalid persona profile payload.' });
  }

  const result = await cacheOrCompute({
    keyPayload: { personaId: persona.id, zoneId: zone.zoneId, aqi: zone.aqi },
    language,
    compute: (cleanLang) => getAiRoutineInsights(persona, zone, cleanLang),
  });

  return res.status(200).json(result);
});

export default routineRouter;
