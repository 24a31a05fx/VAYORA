// ============================================================
// server/validators.ts
// Strict boundary type guards and input sanitization
// ============================================================

/**
 * Validates whether an unknown value is a finite number.
 */
function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/**
 * Escapes sensitive HTML characters to mitigate Cross-Site Scripting (XSS).
 */
export function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitizes an incoming string by stripping ASCII control characters and HTML tags.
 */
export function sanitizeText(text: unknown, maxLen = 2000): string {
  if (typeof text !== 'string') return '';
  const controlCharPattern = new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(31) + ']', 'g');
  const tagPattern = /<[^>]*>/g;
  return text.replace(controlCharPattern, '').replace(tagPattern, '').trim().slice(0, maxLen);
}

export interface ValidatedZone {
  zoneId: string;
  zoneName: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  temperatureC: number;
  windSpeedKmh: number;
  inversionRisk: boolean;
}

function validateZoneStrings(obj: Record<string, unknown>): boolean {
  if (typeof obj.zoneId !== 'string' || obj.zoneId.length === 0 || obj.zoneId.length > 50) return false;
  if (typeof obj.zoneName !== 'string' || obj.zoneName.length === 0 || obj.zoneName.length > 100) return false;
  return true;
}

function validatePMValues(obj: Record<string, unknown>): boolean {
  if (!isFiniteNumber(obj.pm25) || obj.pm25 < 0 || obj.pm25 > 2000) return false;
  if (!isFiniteNumber(obj.pm10) || obj.pm10 < 0 || obj.pm10 > 2000) return false;
  return true;
}

function validateOtherGases(obj: Record<string, unknown>): boolean {
  if (!isFiniteNumber(obj.aqi) || obj.aqi < 0 || obj.aqi > 2000) return false;
  if (!isFiniteNumber(obj.no2) || obj.no2 < 0 || obj.no2 > 1000) return false;
  return true;
}

function validateZoneAtmosphere(obj: Record<string, unknown>): boolean {
  if (!isFiniteNumber(obj.temperatureC) || obj.temperatureC < -50 || obj.temperatureC > 60) return false;
  if (!isFiniteNumber(obj.windSpeedKmh) || obj.windSpeedKmh < 0 || obj.windSpeedKmh > 250) return false;
  if (typeof obj.inversionRisk !== 'boolean') return false;
  return true;
}

/**
 * Validates that an untrusted object meets the structural contract of a ValidatedZone.
 */
export function validateZone(z: unknown): z is ValidatedZone {
  if (typeof z !== 'object' || z === null) return false;
  const obj = z as Record<string, unknown>;
  return validateZoneStrings(obj) && validatePMValues(obj) && validateOtherGases(obj) && validateZoneAtmosphere(obj);
}

export interface ValidatedPersona {
  id: string;
  name: string;
  subCategory: string;
  sensitivityLevel: string;
  preferredStartHour: number;
  preferredEndHour: number;
}

function validatePersonaStrings(obj: Record<string, unknown>): boolean {
  if (typeof obj.id !== 'string' || obj.id.length === 0 || obj.id.length > 50) return false;
  if (typeof obj.name !== 'string' || obj.name.length === 0 || obj.name.length > 100) return false;
  if (typeof obj.subCategory !== 'string' || obj.subCategory.length === 0) return false;
  return true;
}

function validatePersonaHours(obj: Record<string, unknown>): boolean {
  if (!isFiniteNumber(obj.preferredStartHour) || obj.preferredStartHour < 0 || obj.preferredStartHour > 23) return false;
  if (!isFiniteNumber(obj.preferredEndHour) || obj.preferredEndHour < 0 || obj.preferredEndHour > 23) return false;
  return true;
}

/**
 * Validates that an untrusted object meets the structural contract of a ValidatedPersona.
 */
export function validatePersona(p: unknown): p is ValidatedPersona {
  if (typeof p !== 'object' || p === null) return false;
  const obj = p as Record<string, unknown>;
  return validatePersonaStrings(obj) && validatePersonaHours(obj);
}

export interface ValidatedHousehold {
  householdComposition: string;
  hasChildren: boolean;
  hasElderly: boolean;
  sensitivities: string;
  commuteMode: 'metro' | 'bus' | 'car' | 'walk-bike' | 'remote';
  outdoorActivity: 'school-run' | 'exercise' | 'errands' | 'outdoor-work';
  indoorPurifier: 'hepa' | 'diy-box' | 'none';
}

const VALID_COMMUTES = new Set(['metro', 'bus', 'car', 'walk-bike', 'remote']);
const VALID_ACTIVITIES = new Set(['school-run', 'exercise', 'errands', 'outdoor-work']);
const VALID_PURIFIERS = new Set(['hepa', 'diy-box', 'none']);

function pickEnum<T extends string>(raw: unknown, allowed: Set<string>, fallback: T): T {
  return typeof raw === 'string' && allowed.has(raw) ? (raw as T) : fallback;
}

/**
 * Sanitizes optional household profile fields into bounded, safe values.
 */
export function sanitizeHousehold(raw: unknown): ValidatedHousehold | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const obj = raw as Record<string, unknown>;
  return {
    householdComposition: sanitizeText(obj.householdComposition, 120) || 'Urban household',
    hasChildren: Boolean(obj.hasChildren),
    hasElderly: Boolean(obj.hasElderly),
    sensitivities: sanitizeText(obj.sensitivities, 200),
    commuteMode: pickEnum(obj.commuteMode, VALID_COMMUTES, 'metro'),
    outdoorActivity: pickEnum(obj.outdoorActivity, VALID_ACTIVITIES, 'errands'),
    indoorPurifier: pickEnum(obj.indoorPurifier, VALID_PURIFIERS, 'none'),
  };
}
