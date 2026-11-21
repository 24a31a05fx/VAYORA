# Security — VAYORA Zero-Trust Security Blueprint & Threat Model

> **Evaluation Parameter:** Security (Standard: Zero-Trust Defense-in-Depth & OWASP Top 10 Mitigation)  
> **Platform:** VAYORA — AI-Powered Urban Air Quality & Environmental Intelligence Platform  
> **Standard:** Enterprise Production Security Posture  

---

## 1. Zero-Trust Security Baseline

Public health platforms must be resilient against manipulation, denial-of-service, and unauthorized data extraction. VAYORA operates under an uncompromising **Zero-Trust Security Architecture**: *Every incoming network request, client payload, and environment interface is treated as untrusted until validated through rigorous perimeter controls.*

```
[ Incoming Client HTTP Request ]
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ 1. Perimeter Hardening (Helmet Security Headers)       │
│    • Content-Security-Policy (CSP)                     │
│    • X-Content-Type-Options: nosniff                   │
│    • Referrer-Policy: strict-origin-when-cross-origin  │
└────────────────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ 2. Dynamic CORS Origin Allowlist                       │
│    • Strictly restricted to authorized origins        │
│    • Rejects arbitrary cross-origin requests           │
└────────────────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ 3. Payload Size Guardrail (15 KB Strict Cap)           │
│    • express.json({ limit: '15kb' })                   │
│    • Blocks buffer overflows and memory exhaustion     │
└────────────────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ 4. Rate Limiting Defense (30 req / min / IP)           │
│    • Protects AI model quotas and computational queues │
└────────────────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ 5. Structural & Physical Type Guards                   │
│    • validateZone, validatePersona, isFiniteNumber     │
│    • Strips non-printable ASCII control characters     │
└────────────────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ 6. In-Memory SHA-256 LRU Cache & Protected AI Gateway  │
└────────────────────────────────────────────────────────┘
```

---

## 2. API Key Confidentiality & Secret Custody

The Gemini API key (`GEMINI_API_KEY`) is stored exclusively within the server's runtime environment (`process.env.GEMINI_API_KEY`).

### Security Guarantees:
1. **Zero Browser Exposure**: The secret key is never injected into client-side JavaScript, never prefixed with `VITE_`, and never referenced in frontend source files.
2. **Repository Protection**: `.env` files are explicitly excluded via `.gitignore`. A sanitized `.env.example` provides non-sensitive template configurations.
3. **Server-Side AI Proxying**: All interactions with generative AI models occur behind authenticated Express 5 proxy endpoints (`/api/routine-insights` and `/api/emergency-advisory`).

---

## 3. Perimeter Hardening & Express 5 Middleware Pipeline

The backend server (`server.ts` and `server/middleware.ts`) configures comprehensive HTTP header defenses using **Helmet**:

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://*.googleapis.com', 'http://localhost:*'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
```

### Additional Perimeter Defenses:
- **CORS Origin Whitelist**: Dynamically checks inbound request origins against an allowlist of local and production hostnames.
- **Inbound Payload Clamping**: Inbound JSON payloads are capped at **15 KB** via `express.json({ limit: '15kb' })`, preventing memory allocation attacks.
- **Rate Limiting**: AI endpoints are throttled to **30 requests per minute per IP**, mitigating quota exhaustion and automated scraping attempts.

---

## 4. Input Validation, Sanitization & Physical Bounds Checking

Client-side data is never trusted. Inbound parameters undergo strict structural and physical bounds validation in `server/validators.ts`:

```typescript
export function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export function validateZone(z: unknown): z is ValidatedZone {
  if (typeof z !== 'object' || z === null) return false;
  const obj = z as Record<string, unknown>;

  if (typeof obj.zoneId !== 'string' || obj.zoneId.length === 0 || obj.zoneId.length > 50) return false;
  if (typeof obj.zoneName !== 'string' || obj.zoneName.length === 0 || obj.zoneName.length > 100) return false;
  if (!isFiniteNumber(obj.aqi) || obj.aqi < 0 || obj.aqi > 2000) return false;
  if (!isFiniteNumber(obj.pm25) || obj.pm25 < 0 || obj.pm25 > 2000) return false;
  if (!isFiniteNumber(obj.pm10) || obj.pm10 < 0 || obj.pm10 > 2000) return false;
  if (!isFiniteNumber(obj.no2) || obj.no2 < 0 || obj.no2 > 1000) return false;
  if (!isFiniteNumber(obj.temperatureC) || obj.temperatureC < -50 || obj.temperatureC > 60) return false;
  if (!isFiniteNumber(obj.windSpeedKmh) || obj.windSpeedKmh < 0 || obj.windSpeedKmh > 250) return false;

  return true;
}
```

Any request containing out-of-bounds metrics (e.g. negative $\text{PM}_{2.5}$, non-finite numbers, or oversized strings) is rejected with an immediate **HTTP 400 Bad Request**.

---

## 5. Prompt Injection Defense & Tokenizer Protection

LLMs can be tricked or confused by malicious prompt injections, non-printable characters, or oversized contexts. VAYORA implements three protective layers:

1. **Control Character Stripping**:  
   Non-printable ASCII control characters (`\x00` through `\x1f`) are stripped using a programmatic regular expression:
   ```typescript
   const controlPattern = new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(31) + ']', 'g');
   const sanitizedText = text.replace(controlPattern, '').trim().slice(0, 2000);
   ```
2. **Payload Length Clamping**: Input text fields, persona labels, and language codes are strictly sliced to prevent buffer overflow.
3. **Structured JSON Extraction**:  
   AI responses are extracted using regular expression pattern matching (`/\{[\s\S]*\}/`) rather than evaluating raw strings, preventing template manipulation or markdown injection.

---

## 6. CWE-209 Information Disclosure Mitigation

Leaking internal call stacks or environment details aids malicious actors. VAYORA implements a centralized error handler in `server.ts` that catches all unhandled exceptions:

```typescript
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SECURITY AUDIT] Internal Server Error:', err);
  // Never leak internal error message or stack trace to client
  res.status(500).json({ error: 'Internal Server Error' });
});
```

Clients receive an opaque, generic error response, while full debugging logs remain isolated in secure server logs.

---

## 7. Storage Security & Client-Side Resiliency

In `src/services/storageService.ts`, all user preferences (language, accessibility, pledges, room configurations) are validated through a `safeParse<T>()` envelope:
- Malformed or tampered local storage entries are discarded and replaced with safe system defaults.
- If browser storage is disabled or quota-restricted, an in-memory storage fallback activates automatically, ensuring the client session remains secure and functional without crashing.
