/**
 * Generic in-memory TTL cache for server-side use.
 *
 * Not vendor-specific — callers choose keys and values.
 * Suitable for OAuth tokens and short-lived server data.
 * Not distributed (per process only).
 */

type CacheEntry<T> = {
  value: T;
  /** Absolute expiry time in milliseconds since epoch. */
  expiresAtMs: number;
};

const store = new Map<string, CacheEntry<unknown>>();

function isExpired(entry: CacheEntry<unknown>, nowMs: number): boolean {
  return nowMs >= entry.expiresAtMs;
}

/**
 * Returns a cached value when present and not expired; otherwise undefined.
 * Expired entries are removed on read.
 */
export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) {
    return undefined;
  }

  const nowMs = Date.now();
  if (isExpired(entry, nowMs)) {
    store.delete(key);
    return undefined;
  }

  return entry.value as T;
}

/**
 * Stores a value until `ttlMs` milliseconds have elapsed.
 * A TTL of 0 or less deletes any existing entry for the key.
 */
export function setCached<T>(key: string, value: T, ttlMs: number): void {
  if (ttlMs <= 0) {
    store.delete(key);
    return;
  }

  store.set(key, {
    value,
    expiresAtMs: Date.now() + ttlMs,
  });
}

/** Removes a cached entry when present. */
export function deleteCached(key: string): void {
  store.delete(key);
}

/** Clears the entire cache (useful in tests). */
export function clearCache(): void {
  store.clear();
}
