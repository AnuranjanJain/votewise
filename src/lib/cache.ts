/**
 * @module lib/cache
 * @description Generic LRU (Least Recently Used) cache with TTL support.
 * High-performance in-memory cache used to deduplicate API responses
 * across Gemini, Maps, YouTube, TTS, and Chat integrations.
 */

/**
 * Represents a single cached entry with value, timestamp, and TTL.
 * @template T The type of the cached value
 */
interface CacheEntry<T> {
  value: T;
  createdAt: number;
  ttl: number;
}

/**
 * A generic Least-Recently-Used (LRU) cache with Time-To-Live (TTL) support.
 * Automatically evicts stale entries and limits memory usage via max capacity.
 *
 * @template T The type of values stored in the cache
 *
 * @example
 * ```ts
 * const cache = new LRUCache<string>(50, 5 * 60 * 1000); // 50 items, 5 min TTL
 * cache.set('key', 'value');
 * const result = cache.get('key'); // 'value' or null if expired
 * ```
 */
export class LRUCache<T> {
  private readonly cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
  private readonly defaultTTL: number;

  /**
   * Creates a new LRU cache instance.
   * @param maxSize Maximum number of entries to store (defaults to 100)
   * @param defaultTTL Default time-to-live in milliseconds (defaults to 5 minutes)
   */
  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Retrieves a cached value by key. Returns null if the entry
   * does not exist or has expired. Refreshes LRU order on hit.
   * @param key The cache key to look up
   * @returns The cached value, or null if missing/expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL expiration
    if (Date.now() - entry.createdAt > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order: delete and re-insert to move to end
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  /**
   * Stores a value in the cache. If the cache is at capacity,
   * the least-recently-used entry is evicted first.
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Optional TTL override in milliseconds
   */
  set(key: string, value: T, ttl?: number): void {
    // Delete existing entry to refresh position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    });
  }

  /**
   * Checks whether a non-expired entry exists for the given key.
   * @param key The cache key to check
   * @returns True if the key exists and has not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Removes a specific entry from the cache.
   * @param key The cache key to delete
   * @returns True if the entry existed and was deleted
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /** Removes all entries from the cache. */
  clear(): void {
    this.cache.clear();
  }

  /** Returns the current number of entries in the cache. */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Removes all expired entries from the cache.
   * Useful for periodic cleanup to free memory.
   * @returns The number of entries that were purged
   */
  purgeExpired(): number {
    const now = Date.now();
    let purged = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.createdAt > entry.ttl) {
        this.cache.delete(key);
        purged++;
      }
    }
    return purged;
  }
}

/**
 * Wraps an async function with LRU caching. Subsequent calls with the
 * same key will return the cached result instead of re-executing.
 *
 * @template T The return type of the wrapped function
 * @param cache The LRU cache instance to use
 * @param keyFn A function that generates a cache key from the arguments
 * @param fn The async function to wrap
 * @returns A cached version of the original function
 *
 * @example
 * ```ts
 * const cache = new LRUCache<string>(50);
 * const cachedFetch = withCache(cache, (url) => url, async (url) => {
 *   const res = await fetch(url);
 *   return res.text();
 * });
 * ```
 */
export function withCache<T, Args extends unknown[]>(
  cache: LRUCache<T>,
  keyFn: (...args: Args) => string,
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args);
    const cached = cache.get(key);
    if (cached !== null) return cached;

    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}
