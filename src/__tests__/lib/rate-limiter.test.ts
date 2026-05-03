// ============================================================
// VoteWise — Rate Limiter Test Suite
// ============================================================

import { RateLimiter, getClientId } from '@/lib/rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(3, 1000); // 3 requests per 1 second
  });

  describe('check', () => {
    it('should allow requests within limit', () => {
      expect(limiter.check('client1')).toBe(true);
      expect(limiter.check('client1')).toBe(true);
      expect(limiter.check('client1')).toBe(true);
    });

    it('should reject requests exceeding limit', () => {
      limiter.check('client1');
      limiter.check('client1');
      limiter.check('client1');
      expect(limiter.check('client1')).toBe(false);
    });

    it('should track clients independently', () => {
      limiter.check('client1');
      limiter.check('client1');
      limiter.check('client1');
      expect(limiter.check('client1')).toBe(false);
      expect(limiter.check('client2')).toBe(true);
    });

    it('should reset after window expires', () => {
      const shortLimiter = new RateLimiter(1, 50); // 1 req per 50ms
      shortLimiter.check('client1');
      expect(shortLimiter.check('client1')).toBe(false);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(shortLimiter.check('client1')).toBe(true);
          resolve();
        }, 100);
      });
    });
  });

  describe('remaining', () => {
    it('should return max for new clients', () => {
      expect(limiter.remaining('new-client')).toBe(3);
    });

    it('should decrease with each request', () => {
      limiter.check('client1');
      expect(limiter.remaining('client1')).toBe(2);
      limiter.check('client1');
      expect(limiter.remaining('client1')).toBe(1);
    });

    it('should return 0 when exhausted', () => {
      limiter.check('client1');
      limiter.check('client1');
      limiter.check('client1');
      expect(limiter.remaining('client1')).toBe(0);
    });
  });

  describe('reset', () => {
    it('should clear a specific client', () => {
      limiter.check('client1');
      limiter.check('client1');
      limiter.check('client1');
      expect(limiter.check('client1')).toBe(false);
      limiter.reset('client1');
      expect(limiter.check('client1')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all clients', () => {
      limiter.check('client1');
      limiter.check('client2');
      limiter.clear();
      expect(limiter.clientCount).toBe(0);
      expect(limiter.remaining('client1')).toBe(3);
    });
  });

  describe('clientCount', () => {
    it('should track unique clients', () => {
      expect(limiter.clientCount).toBe(0);
      limiter.check('client1');
      expect(limiter.clientCount).toBe(1);
      limiter.check('client2');
      expect(limiter.clientCount).toBe(2);
      limiter.check('client1'); // same client
      expect(limiter.clientCount).toBe(2);
    });
  });
});

describe('getClientId', () => {
  it('should extract x-forwarded-for header', () => {
    // Use a plain object to avoid jsdom's missing Request global
    const req = {
      headers: new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }),
    } as unknown as Request;
    expect(getClientId(req)).toBe('1.2.3.4');
  });

  it('should extract x-real-ip header', () => {
    const req = {
      headers: new Headers({ 'x-real-ip': '10.0.0.1' }),
    } as unknown as Request;
    expect(getClientId(req)).toBe('10.0.0.1');
  });

  it('should return unknown for no headers', () => {
    const req = {
      headers: new Headers(),
    } as unknown as Request;
    expect(getClientId(req)).toBe('unknown');
  });

  it('should prefer x-forwarded-for over x-real-ip', () => {
    const req = {
      headers: new Headers({ 'x-forwarded-for': '1.1.1.1', 'x-real-ip': '2.2.2.2' }),
    } as unknown as Request;
    expect(getClientId(req)).toBe('1.1.1.1');
  });
});
