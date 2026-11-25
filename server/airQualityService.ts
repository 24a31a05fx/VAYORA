// ============================================================
// server/airQualityService.ts
// Real-time Open-Meteo Air Quality & Weather ingestion service
// Falls back cleanly to clearly labelled Demonstration Baseline if offline
// ============================================================

export interface LiveZoneReading {
  zoneId: string;
  aqi: number;
  category: string;
  dominantPollutant: 'PM2.5' | 'PM10' | 'NO2' | 'CO' | 'O3';
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  o3: number;
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  inversionRisk: boolean;
  source: 'open-meteo-live' | 'demonstration-baseline';
  fetchedAt: number;
}

interface OpenMeteoAqJson {
  current?: {
    pm2_5?: number;
    pm10?: number;
    nitrogen_dioxide?: number;
    carbon_monoxide?: number;
    ozone?: number;
    us_aqi?: number;
  };
}

interface OpenMeteoWeatherJson {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
  };
}

function classifyAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function pickDominantPollutant(pm25: number, pm10: number, no2Ppb: number, o3Ppb: number): 'PM2.5' | 'PM10' | 'NO2' | 'O3' {
  const ratios = [
    { type: 'PM2.5' as const, r: pm25 / 35.4 },
    { type: 'PM10' as const, r: pm10 / 154 },
    { type: 'NO2' as const, r: no2Ppb / 53 },
    { type: 'O3' as const, r: o3Ppb / 70 },
  ];
  ratios.sort((a, b) => b.r - a.r);
  return ratios[0]?.type ?? 'PM2.5';
}

function buildLiveUrls(lat: number, lng: number): [string, string] {
  const safeLat = Math.max(-90, Math.min(90, lat)).toFixed(4);
  const safeLng = Math.max(-180, Math.min(180, lng)).toFixed(4);
  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${safeLat}&longitude=${safeLng}&current=pm2_5,pm10,nitrogen_dioxide,carbon_monoxide,ozone,us_aqi`;
  const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${safeLat}&longitude=${safeLng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
  return [aqUrl, wxUrl];
}

function extractPollutants(curAq: NonNullable<OpenMeteoAqJson['current']>) {
  const pm25 = Math.round((curAq.pm2_5 ?? 0) * 10) / 10;
  const pm10 = Math.round((curAq.pm10 ?? pm25 * 1.4) * 10) / 10;
  const no2 = Math.round(((curAq.nitrogen_dioxide ?? 40) / 1.88) * 10) / 10;
  const co = Math.round(((curAq.carbon_monoxide ?? 600) / 1145) * 100) / 100;
  const o3 = Math.round(((curAq.ozone ?? 50) / 1.96) * 10) / 10;
  const aqi = Math.max(0, Math.round(curAq.us_aqi ?? 0));
  return { aqi, pm25, pm10, no2, co, o3, dominantPollutant: pickDominantPollutant(pm25, pm10, no2, o3) };
}

function extractAtmosphere(curWx: OpenMeteoWeatherJson['current'], aqi: number) {
  const temperatureC = Math.round((curWx?.temperature_2m ?? 18) * 10) / 10;
  const humidityPercent = Math.round(curWx?.relative_humidity_2m ?? 60);
  const windSpeedKmh = Math.round((curWx?.wind_speed_10m ?? 8) * 10) / 10;
  const inversionRisk = windSpeedKmh < 6.5 && (aqi > 110 || temperatureC < 16);
  return { temperatureC, humidityPercent, windSpeedKmh, inversionRisk };
}

function mapOpenMeteoReading(zoneId: string, aq: OpenMeteoAqJson, wx: OpenMeteoWeatherJson): LiveZoneReading | null {
  const curAq = aq.current;
  if (!curAq || typeof curAq.pm2_5 !== 'number' || typeof curAq.us_aqi !== 'number') return null;
  const pollutants = extractPollutants(curAq);
  const atmosphere = extractAtmosphere(wx.current, pollutants.aqi);
  return {
    zoneId,
    ...pollutants,
    category: classifyAqiCategory(pollutants.aqi),
    ...atmosphere,
    source: 'open-meteo-live',
    fetchedAt: Date.now(),
  };
}

export function buildDemoFallbackReading(zoneId: string): LiveZoneReading {
  return {
    zoneId,
    aqi: 218,
    category: 'Very Unhealthy',
    dominantPollutant: 'PM2.5',
    pm25: 168.4,
    pm10: 240.2,
    no2: 82.5,
    co: 4.2,
    o3: 31.0,
    temperatureC: 11.5,
    humidityPercent: 78,
    windSpeedKmh: 4.2,
    inversionRisk: true,
    source: 'demonstration-baseline',
    fetchedAt: Date.now(),
  };
}

export async function fetchOpenMeteoTelemetry(
  zoneId: string,
  lat: number,
  lng: number,
  fetchFn: typeof fetch = fetch
): Promise<LiveZoneReading> {
  const [aqUrl, wxUrl] = buildLiveUrls(lat, lng);
  try {
    const signal = AbortSignal.timeout(4000);
    const [aqRes, wxRes] = await Promise.all([fetchFn(aqUrl, { signal }), fetchFn(wxUrl, { signal })]);
    if (!aqRes.ok) return buildDemoFallbackReading(zoneId);
    const aqJson = (await aqRes.json()) as OpenMeteoAqJson;
    const wxJson = wxRes.ok ? ((await wxRes.json()) as OpenMeteoWeatherJson) : {};
    return mapOpenMeteoReading(zoneId, aqJson, wxJson) ?? buildDemoFallbackReading(zoneId);
  } catch {
    return buildDemoFallbackReading(zoneId);
  }
}
