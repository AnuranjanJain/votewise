/**
 * @module lib/rate-limiter
 * @description In-memory sliding-window rate limiter for API route protection.
 * Enforces per-IP request limits across all VoteWise API endpoints
 * to prevent abuse and ensure fair usage.
 */

/**
 * A record of request timestamps for a single client.
 */
interface ClientRecord {
  timestamps: number[];
}

/**
 * An in-memory sliding-window rate limiter.
 * Tracks request timestamps per client key (typically IP address)
 * and rejects requests that exceed the configured limit within
 * the time window.
 *
 * @example
 * ```ts
 * const limiter = new RateLimiter(10, 60_000); // 10 req per minute
 * if (!limiter.check('client-ip')) {
 *   return errorResponse('Too many requests', 429);
 * }
 * ```
 */
export class RateLimiter {
  private readonly clients: Map<string, ClientRecord>;
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private lastCleanup: number;
  private readonly cleanupInterval: number;

  /**
   * Creates a new rate limiter instance.
   * @param maxRequests Maximum allowed requests per window
   * @param windowMs Time window in milliseconds (defaults to 60 seconds)
   */
  constructor(maxRequests: number, windowMs: number = 60_000) {
    this.clients = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.lastCleanup = Date.now();
    this.cleanupInterval = windowMs * 2;
  }

  /**
   * Checks whether a client is within their rate limit.
   * Records the current timestamp if allowed.
   *
   * @param clientKey Unique identifier for the client (e.g., IP address)
   * @returns True if the request is allowed, false if rate-limited
   */
  check(clientKey: string): boolean {
    const now = Date.now();
    this.maybeCleanup(now);

    const record = this.clients.get(clientKey);
    if (!record) {
      this.clients.set(clientKey, { timestamps: [now] });
      return true;
    }

    // Filter out timestamps outside the current window
    record.timestamps = record.timestamps.filter(
      (ts) => now - ts < this.windowMs
    );

    if (record.timestamps.length >= this.maxRequests) {
      return false;
    }

    record.timestamps.push(now);
    return true;
  }

  /**
   * Returns the number of remaining requests for a client
   * within the current window.
   *
   * @param clientKey Unique identifier for the client
   * @returns Number of remaining allowed requests
   */
  remaining(clientKey: string): number {
    const now = Date.now();
    const record = this.clients.get(clientKey);
    if (!record) return this.maxRequests;

    const validTimestamps = record.timestamps.filter(
      (ts) => now - ts < this.windowMs
    );
    return Math.max(0, this.maxRequests - validTimestamps.length);
  }

  /**
   * Resets the rate limit record for a specific client.
   * @param clientKey Unique identifier for the client
   */
  reset(clientKey: string): void {
    this.clients.delete(clientKey);
  }

  /** Clears all client records. */
  clear(): void {
    this.clients.clear();
  }

  /** Returns the current number of tracked clients. */
  get clientCount(): number {
    return this.clients.size;
  }

  /**
   * Periodically purges stale client records to prevent memory leaks.
   * Runs automatically at twice the window interval.
   */
  private maybeCleanup(now: number): void {
    if (now - this.lastCleanup < this.cleanupInterval) return;
    this.lastCleanup = now;

    for (const [key, record] of this.clients.entries()) {
      record.timestamps = record.timestamps.filter(
        (ts) => now - ts < this.windowMs
      );
      if (record.timestamps.length === 0) {
        this.clients.delete(key);
      }
    }
  }
}

/**
 * Extracts a client identifier from a Request for rate limiting.
 * Falls back to 'unknown' if no identifiers are available.
 *
 * @param request The incoming request
 * @returns A string identifier for the client
 */
export function getClientId(request: Request): string {
  const headers = new Headers(request.headers);
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  );
}

// ---- Pre-configured rate limiters for each API endpoint ----

/** Chat API: 10 requests per minute */
export const chatLimiter = new RateLimiter(10, 60_000);

/** Quiz API: 20 requests per minute */
export const quizLimiter = new RateLimiter(20, 60_000);

/** TTS API: 5 requests per minute */
export const ttsLimiter = new RateLimiter(5, 60_000);

/** Geocode API: 15 requests per minute */
export const geocodeLimiter = new RateLimiter(15, 60_000);

/** Places API: 15 requests per minute */
export const placesLimiter = new RateLimiter(15, 60_000);

/** YouTube API: 10 requests per minute */
export const youtubeLimiter = new RateLimiter(10, 60_000);

/** Analytics API: 30 requests per minute */
export const analyticsLimiter = new RateLimiter(30, 60_000);
