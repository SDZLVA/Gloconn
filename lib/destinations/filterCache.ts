/**
 * Short-lived client cache around destination ranking.
 * Uses Sprint 10.5 client ranker — does not call provider helpers.
 */

import { createClientTtlCache } from "@/lib/api/clientTtlCache";
import {
  rankDestinations,
  type RankDestinationsOptions,
  type RankedDestination,
} from "@/lib/destinations/rank";
import { normalizeDestinationQuery } from "@/lib/destinations/normalize";
import type { Destination } from "@/types/destination";

/** 8s — covers backspace/retype of the same query during one autocomplete session. */
const FILTER_CACHE_TTL_MS = 8_000;

const rankedCache = createClientTtlCache<RankedDestination[]>({
  ttlMs: FILTER_CACHE_TTL_MS,
  maxEntries: 48,
});

function cacheKey(query: string, recentIds: string[]): string {
  const recentPart = [...recentIds].sort().join(",");
  return `${normalizeDestinationQuery(query)}|${recentPart}`;
}

/** Cached ranked destinations (includes matchKind for grouping). */
export function rankDestinationsCached(
  query: string,
  options: RankDestinationsOptions = {},
): RankedDestination[] {
  const recentIds = options.recentIds
    ? Array.from(options.recentIds)
    : [];
  const key = cacheKey(query, recentIds);
  const cached = rankedCache.get(key);
  if (cached) {
    return cached;
  }

  const ranked = rankDestinations(query, { ...options, recentIds });
  rankedCache.set(key, ranked);
  return ranked;
}

/** Cached destination list only (same order as ranked). */
export function filterDestinationsCached(
  query: string,
  options: RankDestinationsOptions = {},
): Destination[] {
  return rankDestinationsCached(query, options).map(
    (entry) => entry.destination,
  );
}

/** Test helper. */
export function clearDestinationFilterCache(): void {
  rankedCache.clear();
}
