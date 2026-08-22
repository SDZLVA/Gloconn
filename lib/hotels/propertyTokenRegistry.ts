/**
 * Sprint 17.5.1 note — in-process property-token registry.
 *
 * Production details flow uses sealed `providerPropertyRef` (AES-256-GCM).
 * This Map is retained only for unit tests / local experiments.
 * Do not register tokens here from the live SerpAPI mapper.
 */

import "server-only";

export type HotelPropertyLookup = {
  propertyToken: string;
  /** Original Google Hotels `q` (destination query) required by SerpAPI details. */
  query: string;
  checkInDate?: string;
  checkOutDate?: string;
  currency?: string;
  adults?: number;
};

type RegistryEntry = HotelPropertyLookup & {
  expiresAtMs: number;
};

/** 45 minutes — test/dev helper TTL only. */
export const PROPERTY_TOKEN_REGISTRY_TTL_MS = 45 * 60_000;

/** Soft cap — oldest entries evicted first when exceeded. */
export const PROPERTY_TOKEN_REGISTRY_MAX_ENTRIES = 500;

const PREFIX = "hotel-prop-token:";

const store = new Map<string, RegistryEntry>();

function registryKey(hotelId: string): string {
  return `${PREFIX}${hotelId}`;
}

function evictExpired(nowMs: number): void {
  for (const [key, entry] of store) {
    if (nowMs >= entry.expiresAtMs) {
      store.delete(key);
    }
  }
}

function evictOldestIfNeeded(): void {
  while (store.size > PROPERTY_TOKEN_REGISTRY_MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) {
      break;
    }
    store.delete(oldest);
  }
}

export type RegisterHotelPropertyLookupInput = {
  propertyToken: string;
  query: string;
  checkInDate?: string;
  checkOutDate?: string;
  currency?: string;
  adults?: number;
};

/**
 * Test/dev helper — not used by the production search mapper.
 */
export function registerHotelPropertyLookup(
  hotelId: string,
  input: RegisterHotelPropertyLookupInput,
): void {
  const id = hotelId.trim();
  const token = input.propertyToken.trim();
  const query = input.query.trim();
  if (!id || !token || !query) {
    return;
  }

  const nowMs = Date.now();
  evictExpired(nowMs);

  const key = registryKey(id);
  if (store.has(key)) {
    store.delete(key);
  }

  const entry: RegistryEntry = {
    propertyToken: token,
    query,
    expiresAtMs: nowMs + PROPERTY_TOKEN_REGISTRY_TTL_MS,
  };

  if (input.checkInDate?.trim()) {
    entry.checkInDate = input.checkInDate.trim();
  }
  if (input.checkOutDate?.trim()) {
    entry.checkOutDate = input.checkOutDate.trim();
  }
  if (input.currency?.trim()) {
    entry.currency = input.currency.trim();
  }
  if (
    typeof input.adults === "number" &&
    Number.isFinite(input.adults) &&
    input.adults >= 1
  ) {
    entry.adults = Math.floor(input.adults);
  }

  store.set(key, entry);
  evictOldestIfNeeded();
}

/**
 * @deprecated Use registerHotelPropertyLookup — kept for narrow call sites.
 */
export function registerHotelPropertyToken(
  hotelId: string,
  propertyToken: string,
  query = "hotel",
): void {
  registerHotelPropertyLookup(hotelId, { propertyToken, query });
}

/**
 * Test/dev helper — resolves a previously registered lookup.
 */
export function resolveHotelPropertyLookup(
  hotelId: string,
): HotelPropertyLookup | null {
  const id = hotelId.trim();
  if (!id) {
    return null;
  }

  const key = registryKey(id);
  const entry = store.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAtMs) {
    store.delete(key);
    return null;
  }

  return {
    propertyToken: entry.propertyToken,
    query: entry.query,
    checkInDate: entry.checkInDate,
    checkOutDate: entry.checkOutDate,
    currency: entry.currency,
    adults: entry.adults,
  };
}

/**
 * Resolves only the raw property token (tests / legacy).
 */
export function resolveHotelPropertyToken(hotelId: string): string | null {
  return resolveHotelPropertyLookup(hotelId)?.propertyToken ?? null;
}

/** Test helper — clears all registered tokens. */
export function clearHotelPropertyTokenRegistry(): void {
  store.clear();
}

/** Test helper — current registry size. */
export function getHotelPropertyTokenRegistrySizeForTests(): number {
  return store.size;
}
