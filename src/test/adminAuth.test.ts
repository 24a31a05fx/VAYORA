// ============================================================
// src/test/adminAuth.test.ts
// Security, password hashing, and admin authorization verification
// ============================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'http';
import { app } from '../../server';
import { hashSecret, verifySecret } from '../../server/auth';
import { sanitizeHtml, sanitizeText } from '../../server/validators';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        baseUrl = `http://localhost:${address.port}`;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Cryptographic Authentication & Password Hashing', () => {
  it('correctly hashes and verifies secrets using PBKDF2', () => {
    const password = 'SuperSecretPassword2026!';
    const { hash, salt } = hashSecret(password);
    expect(verifySecret(password, hash, salt)).toBe(true);
    expect(verifySecret('WrongPassword', hash, salt)).toBe(false);
  });

  it('rejects verification if salt or hash lengths differ', () => {
    const { hash, salt } = hashSecret('test');
    expect(verifySecret('test', hash.slice(0, 10), salt)).toBe(false);
  });
});

describe('Input Sanitization & XSS Mitigation', () => {
  it('escapes dangerous HTML characters in sanitizeHtml', () => {
    const raw = '<script>alert("XSS") & \'test\'</script>';
    const sanitized = sanitizeHtml(raw);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
    expect(sanitized).toContain('&amp;');
    expect(sanitized).toContain('&#x27;');
  });

  it('strips HTML tags and control characters in sanitizeText', () => {
    const raw = 'Hello <script>alert(1)</script> World\x00\x1F';
    const sanitized = sanitizeText(raw);
    expect(sanitized).toBe('Hello alert(1) World');
  });
});

describe('Admin Route Protection & Access Control', () => {
  const validKey = 'vayora-default-admin-key-2026';

  it('rejects unauthenticated requests to /api/admin/system-status with 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/system-status`);
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('Unauthorized');
  });

  it('rejects unauthorized requests with wrong key with 403', async () => {
    const res = await fetch(`${baseUrl}/api/admin/system-status`, {
      headers: { Authorization: 'Bearer invalid-token-1234' },
    });
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('Forbidden');
  });

  it('allows authorized requests with valid bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/admin/system-status`, {
      headers: { Authorization: `Bearer ${validKey}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; cacheEntries: number; uptimeSeconds: number };
    expect(body.status).toBe('healthy');
    expect(body).toHaveProperty('cacheEntries');
    expect(body).toHaveProperty('uptimeSeconds');
  });

  it('authenticates admin login with correct password', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Vayora@Admin2026!' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { token: string; role: string };
    expect(body).toHaveProperty('token');
    expect(body.role).toBe('administrator');
  });

  it('rejects admin login with incorrect password', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'BadPassword' }),
    });
    expect(res.status).toBe(401);
  });

  it('allows cache purge when authenticated', async () => {
    const res = await fetch(`${baseUrl}/api/admin/purge-cache`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${validKey}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean };
    expect(body.success).toBe(true);
  });
});
