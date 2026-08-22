/**
 * Short-lived server cache for mapped hotel property details (Sprint 17.3).
 *
 * TTL 15 minutes: details (address / links) are stable within a browse session
 * and SerpAPI property-details calls are billed — avoid refetch on every drawer open.
 * Max entries bound memory on long-lived Node processes.
 */

import "server-only";

import type { HotelPropertyDetails } from "@/types/models/hotel-property-details";

/** 15 minutes — balances freshness vs paid provider cost. */
export const HOTEL_PROPERTY_DETAILS_CACHE_TTL_MS = 15 * 60_000;

export const HOTEL_PROPERTY_DETAILS_CACHE_MAX_ENTRIES = 200;

type CacheEntry = {
  value: HotelPropertyDetails;
  expiresAtMs: number;
};

const store = new Map<string, CacheEntry>();

function evictExpired(nowMs: number): void {
  for (const [key, entry] of store) {
    if (nowMs >= entry.expiresAtMs) {
      store.delete(key);
    }
  }
}

function evictOldestIfNeeded(): void {
  while (store.size > HOTEL_PROPERTY_DETAILS_CACHE_MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) {
      break;
    }
    store.delete(oldest);
  }
}

export function getCachedHotelPropertyDetails(
  hotelId: string,
): HotelPropertyDetails | undefined {
  const key = hotelId.trim();
  if (!key) {
    return undefined;
  }
  const entry = store.get(key);
  if (!entry) {
    return undefined;
  }
  if (Date.now() >= entry.expiresAtMs) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function setCachedHotelPropertyDetails(
  hotelId: string,
  details: HotelPropertyDetails,
): void {
  const key = hotelId.trim();
  if (!key) {
    return;
  }
  const nowMs = Date.now();
  evictExpired(nowMs);
  if (store.has(key)) {
    store.delete(key);
  }
  store.set(key, {
    value: details,
    expiresAtMs: nowMs + HOTEL_PROPERTY_DETAILS_CACHE_TTL_MS,
  });
  evictOldestIfNeeded();
}

export function clearHotelPropertyDetailsCache(): void {
  store.clear();
}
