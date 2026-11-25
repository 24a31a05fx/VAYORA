// ============================================================
// server/routes/airQualityRoutes.ts
// Live air quality & meteorological ingestion endpoint (Open-Meteo)
// ============================================================

import { Router, type Request, type Response } from 'express';
import { aiRateLimiter } from '../middleware';
import { cacheOrCompute } from '../cacheOrCompute';
import { fetchOpenMeteoTelemetry } from '../airQualityService';
import { sanitizeText } from '../validators';

export const airQualityRouter = Router();

function parseCoordinate(raw: unknown, min: number, max: number, fallback: number): number {
  const num = typeof raw === 'string' ? Number(raw) : NaN;
  if (!Number.isFinite(num) || num < min || num > max) return fallback;
  return Math.round(num * 10000) / 10000;
}

airQualityRouter.get('/', aiRateLimiter, async (req: Request, res: Response) => {
  const zoneId = sanitizeText(req.query.zoneId, 50) || 'Z-CENTRAL';
  const lat = parseCoordinate(req.query.lat, -90, 90, 28.6139);
  const lng = parseCoordinate(req.query.lng, -180, 180, 77.209);
  const bucket15m = Math.floor(Date.now() / 900_000);

  const data = await cacheOrCompute({
    keyPayload: { type: 'air-quality', zoneId, lat, lng, bucket15m },
    language: 'en',
    compute: () => fetchOpenMeteoTelemetry(zoneId, lat, lng),
  });

  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json(data);
});

export default airQualityRouter;
