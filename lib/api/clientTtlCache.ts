/**
 * Browser-only short-lived TTL cache (Map-backed).
 *
 * Separate from server `lib/api/cache.ts` (Amadeus OAuth) — do not import that
 * module from client components.
 *
 * Used to reuse recent search / autocomplete work without extra network or CPU.
 */

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export type ClientTtlCacheOptions = {
  /** Time-to-live in milliseconds. */
  ttlMs: number;
  /** Soft cap on entries; oldest insertion order is evicted first. */
  maxEntries?: number;
};

/** Tiny in-memory TTL cache for client modules. */
export function createClientTtlCache<T>(options: ClientTtlCacheOptions) {
  const { ttlMs, maxEntries = 32 } = options;
  const store = new Map<string, CacheEntry<T>>();

  function get(key: string): T | undefined {
    const entry = store.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  function set(key: string, value: T): void {
    // Refresh insertion order for eviction.
    if (store.has(key)) {
      store.delete(key);
    }

    store.set(key, { value, expiresAt: Date.now() + ttlMs });

    while (store.size > maxEntries) {
      const oldestKey = store.keys().next().value;
      if (oldestKey === undefined) {
        break;
      }
      store.delete(oldestKey);
    }
  }

  function deleteKey(key: string): void {
    store.delete(key);
  }

  function clear(): void {
    store.clear();
  }

  return { get, set, delete: deleteKey, clear };
}
