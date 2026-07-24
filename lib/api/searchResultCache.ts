/**
 * Client-side TTL cache for trip search HTTP responses.
 * Prevents duplicate POSTs for the same criteria within a short window.
 */

import { createClientTtlCache } from "@/lib/api/clientTtlCache";
import type { ServiceResult } from "@/lib/api/types";
import { buildSearchCacheKey } from "@/lib/search/cacheKey";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResponse } from "@/types/models/search-response";

/** 45s — long enough to cover remount / Strict Mode / back-navigation; short enough to stay fresh. */
export const SEARCH_RESULT_CACHE_TTL_MS = 45_000;

const searchResultCache = createClientTtlCache<ServiceResult<SearchResponse>>({
  ttlMs: SEARCH_RESULT_CACHE_TTL_MS,
  maxEntries: 24,
});

/** In-flight promise dedupe so concurrent identical searches share one fetch. */
const inflight = new Map<string, Promise<ServiceResult<SearchResponse>>>();

export function getCachedSearchResult(
  search: Partial<SearchRequest>,
): ServiceResult<SearchResponse> | undefined {
  return searchResultCache.get(buildSearchCacheKey(search));
}

export function setCachedSearchResult(
  search: Partial<SearchRequest>,
  result: ServiceResult<SearchResponse>,
): void {
  // Only cache successful payloads — failures should be retried freely.
  if (!result.success) {
    return;
  }
  searchResultCache.set(buildSearchCacheKey(search), result);
}

export function clearCachedSearchResult(search: Partial<SearchRequest>): void {
  searchResultCache.delete(buildSearchCacheKey(search));
}

/** Test / manual reset helper. */
export function clearSearchResultCache(): void {
  searchResultCache.clear();
  inflight.clear();
}

/**
 * Runs `fetcher` once per key while in flight; caches successful results.
 * Pass `bypassCache: true` for explicit retries ("Try again").
 */
export async function withSearchResultCache(
  search: Partial<SearchRequest>,
  fetcher: () => Promise<ServiceResult<SearchResponse>>,
  options: { bypassCache?: boolean } = {},
): Promise<ServiceResult<SearchResponse>> {
  const key = buildSearchCacheKey(search);

  if (!options.bypassCache) {
    const cached = searchResultCache.get(key);
    if (cached) {
      return cached;
    }

    const pending = inflight.get(key);
    if (pending) {
      return pending;
    }
  } else {
    searchResultCache.delete(key);
  }

  const promise = fetcher()
    .then((result) => {
      if (result.success) {
        searchResultCache.set(key, result);
      }
      return result;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}
