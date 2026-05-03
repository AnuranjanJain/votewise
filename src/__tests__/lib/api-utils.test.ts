// ============================================================
// VoteWise — API Utilities Test Suite
// ============================================================

// Mock NextResponse since 'next/server' needs Request global (unavailable in jsdom)
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      status: init?.status ?? 200,
      headers: {
        get: (key: string) => (init?.headers as Record<string, string>)?.[key] ?? null,
      },
      json: async () => data,
    }),
  },
}));

import { SECURITY_HEADERS, successResponse, errorResponse, validationError, serviceInfoResponse } from '@/lib/api-utils';

describe('API Utilities', () => {
  describe('SECURITY_HEADERS', () => {
    it('should include X-Content-Type-Options', () => {
      expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should include X-Frame-Options', () => {
      expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    });

    it('should include Cache-Control', () => {
      expect(SECURITY_HEADERS['Cache-Control']).toContain('no-store');
    });

    it('should include Referrer-Policy', () => {
      expect(SECURITY_HEADERS['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    });

    it('should include X-DNS-Prefetch-Control', () => {
      expect(SECURITY_HEADERS['X-DNS-Prefetch-Control']).toBe('off');
    });

    it('should have at least 7 security headers', () => {
      expect(Object.keys(SECURITY_HEADERS).length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('successResponse', () => {
    it('should return 200 by default', async () => {
      const res = successResponse({ ok: true });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
    });

    it('should support custom status codes', () => {
      const res = successResponse({ created: true }, 201);
      expect(res.status).toBe(201);
    });

    it('should include security headers', () => {
      const res = successResponse({});
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('errorResponse', () => {
    it('should return 500 by default', async () => {
      const res = errorResponse('Something broke');
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('Something broke');
    });

    it('should support custom status codes', () => {
      const res = errorResponse('Not found', 404);
      expect(res.status).toBe(404);
    });

    it('should merge extra fields', async () => {
      const res = errorResponse('Failed', 500, { fallback: 'data' });
      const body = await res.json();
      expect(body.error).toBe('Failed');
      expect(body.fallback).toBe('data');
    });

    it('should include security headers', () => {
      const res = errorResponse('Error');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('validationError', () => {
    it('should return 400 status', async () => {
      const res = validationError({ valid: false, error: 'Bad input' });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('Bad input');
    });

    it('should handle missing error message', async () => {
      const res = validationError({ valid: false });
      const body = await res.json();
      expect(body.error).toBe('Validation failed');
    });
  });

  describe('serviceInfoResponse', () => {
    it('should include status and service name', async () => {
      const res = serviceInfoResponse('Test Service');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('ok');
      expect(body.service).toBe('Test Service');
    });

    it('should merge extra fields', async () => {
      const res = serviceInfoResponse('Svc', { version: '1.0' });
      const body = await res.json();
      expect(body.version).toBe('1.0');
    });
  });
});
