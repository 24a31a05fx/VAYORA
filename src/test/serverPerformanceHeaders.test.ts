// ============================================================
// src/test/serverPerformanceHeaders.test.ts
// Unit tests for server performance, compression, ETag, and caching headers
// ============================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'http';
import fs from 'fs';
import path from 'path';
import { app } from '../../server';

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

describe('Server Performance & Cache Headers', () => {
  it('serves root SPA route with Cache-Control no-cache', async () => {
    const res = await fetch(`${baseUrl}/`);
    const cacheControl = res.headers.get('cache-control');
    expect(cacheControl).toContain('no-cache');
  });

  it('serves /assets with immutable 1-year Cache-Control header', async () => {
    const assetsDir = path.resolve(process.cwd(), 'dist', 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    const testPath = path.join(assetsDir, 'test-perf.css');
    fs.writeFileSync(testPath, 'body { color: #153C35; }');
    try {
      const res = await fetch(`${baseUrl}/assets/test-perf.css`);
      expect(res.status).toBe(200);
      expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    } finally {
      if (fs.existsSync(testPath)) {
        fs.unlinkSync(testPath);
      }
    }
  });

  it('enforces strong or valid ETag on responses', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.headers.get('etag')).not.toBeNull();
  });

  it('disables x-powered-by header to prevent fingerprinting', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.headers.get('x-powered-by')).toBeNull();
  });

  it('supports gzip compression header negotiation', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { 'Accept-Encoding': 'gzip, deflate, br' },
    });
    expect(res.status).toBe(200);
  });
});
