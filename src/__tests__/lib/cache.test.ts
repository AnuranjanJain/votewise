// ============================================================
// VoteWise — LRU Cache Test Suite
// ============================================================

import { LRUCache, withCache } from '@/lib/cache';

describe('LRUCache', () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    cache = new LRUCache<string>(3, 1000); // max 3 items, 1s TTL
  });

  describe('basic operations', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('missing')).toBeNull();
    });

    it('should track size correctly', () => {
      expect(cache.size).toBe(0);
      cache.set('a', '1');
      expect(cache.size).toBe(1);
      cache.set('b', '2');
      expect(cache.size).toBe(2);
    });

    it('should overwrite existing keys', () => {
      cache.set('key', 'old');
      cache.set('key', 'new');
      expect(cache.get('key')).toBe('new');
      expect(cache.size).toBe(1);
    });

    it('should delete specific entries', () => {
      cache.set('key', 'val');
      expect(cache.delete('key')).toBe(true);
      expect(cache.get('key')).toBeNull();
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('should clear all entries', () => {
      cache.set('a', '1');
      cache.set('b', '2');
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get('a')).toBeNull();
    });

    it('should check existence with has()', () => {
      cache.set('key', 'val');
      expect(cache.has('key')).toBe(true);
      expect(cache.has('missing')).toBe(false);
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entry when at capacity', () => {
      cache.set('a', '1');
      cache.set('b', '2');
      cache.set('c', '3');
      cache.set('d', '4'); // should evict 'a'
      expect(cache.get('a')).toBeNull();
      expect(cache.get('d')).toBe('4');
      expect(cache.size).toBe(3);
    });

    it('should refresh LRU order on get', () => {
      cache.set('a', '1');
      cache.set('b', '2');
      cache.set('c', '3');
      cache.get('a'); // refresh 'a' — now 'b' is oldest
      cache.set('d', '4'); // should evict 'b'
      expect(cache.get('a')).toBe('1');
      expect(cache.get('b')).toBeNull();
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', () => {
      const shortCache = new LRUCache<string>(10, 50); // 50ms TTL
      shortCache.set('key', 'value');
      expect(shortCache.get('key')).toBe('value');

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(shortCache.get('key')).toBeNull();
          resolve();
        }, 100);
      });
    });

    it('should support per-entry TTL override', () => {
      cache.set('short', 'val', 50); // 50ms TTL
      cache.set('long', 'val', 5000); // 5s TTL
      expect(cache.get('short')).toBe('val');

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(cache.get('short')).toBeNull();
          expect(cache.get('long')).toBe('val');
          resolve();
        }, 100);
      });
    });
  });

  describe('purgeExpired', () => {
    it('should remove expired entries', () => {
      const shortCache = new LRUCache<string>(10, 50);
      shortCache.set('a', '1');
      shortCache.set('b', '2');

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const purged = shortCache.purgeExpired();
          expect(purged).toBe(2);
          expect(shortCache.size).toBe(0);
          resolve();
        }, 100);
      });
    });

    it('should keep non-expired entries', () => {
      cache.set('keep', 'me'); // 1s TTL
      const purged = cache.purgeExpired();
      expect(purged).toBe(0);
      expect(cache.size).toBe(1);
    });
  });
});

describe('withCache', () => {
  it('should cache async function results', async () => {
    const cache = new LRUCache<number>(10, 5000);
    let callCount = 0;
    const fn = async (x: number): Promise<number> => { callCount++; return x * 2; };
    const cachedFn = withCache(cache, (x: number) => `key-${x}`, fn);

    const r1 = await cachedFn(5);
    const r2 = await cachedFn(5);
    expect(r1).toBe(10);
    expect(r2).toBe(10);
    expect(callCount).toBe(1); // Only called once
  });

  it('should call function again for different keys', async () => {
    const cache = new LRUCache<number>(10, 5000);
    let callCount = 0;
    const fn = async (x: number): Promise<number> => { callCount++; return x * 2; };
    const cachedFn = withCache(cache, (x: number) => `key-${x}`, fn);

    await cachedFn(5);
    await cachedFn(10);
    expect(callCount).toBe(2);
  });
});
