/**
 * Hotel property details service — server-only orchestration (Sprint 17.3 / 17.5.1).
 *
 * Production path: sealed `ref` → unseal → (cache) → SerpAPI details → map → cache
 * Never accepts a raw provider token from the client.
 */

import "server-only";

import {
  createNotFoundError,
  createValidationError,
} from "@/lib/api/errors";
import { getAppConfig } from "@/lib/config";
import type { SerpApiConfig } from "@/lib/config/types";
import {
  getCachedHotelPropertyDetails,
  setCachedHotelPropertyDetails,
} from "@/lib/hotels/propertyDetailsCache";
import type { HotelPropertyLookup } from "@/lib/hotels/propertyTokenRegistry";
import {
  SealedPropertyRefError,
  isSealedPropertyRef,
  unsealHotelPropertyRef,
} from "@/lib/hotels/sealedPropertyRef";
import {
  getReplaySealSecret,
  isReplayPropertyToken,
  requireReplayHotelPropertyDetails,
} from "@/lib/replay";
import {
  fetchGoogleHotelPropertyDetails,
  type FetchPropertyDetailsOptions,
} from "@/lib/providers/hotels/serpapi/propertyDetailsClient";
import { mapPropertyDetailsResponse } from "@/lib/providers/hotels/serpapi/propertyDetailsMapper";
import type { SerpApiHotelPropertyDetailsResponse } from "@/lib/providers/hotels/serpapi/propertyDetailsTypes";
import type { HotelPropertyDetails } from "@/types/models/hotel-property-details";

const HOTEL_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;

export type GetHotelPropertyDetailsInput = {
  /** Preferred: sealed property reference from search (`providerPropertyRef`). */
  ref?: string;
  /** Optional Glooconn hotel id (cache key + binding check). */
  hotelId?: string;
};

export type GetHotelPropertyDetailsOptions = {
  /** Skip details cache (tests / forced refresh). */
  bypassCache?: boolean;
  checkInDate?: string;
  checkOutDate?: string;
  currency?: string;
  adults?: number;
};

export type HotelPropertyDetailsServiceDeps = {
  unsealRef?: (
    sealedRef: string,
    secret: string,
    options?: { expectedHotelId?: string },
  ) => {
    lookup: HotelPropertyLookup;
    hotelId: string;
  };
  getSealSecret?: () => string;
  fetchDetails?: (
    propertyToken: string,
    config: Pick<SerpApiConfig, "apiKey">,
    options: FetchPropertyDetailsOptions,
  ) => Promise<SerpApiHotelPropertyDetailsResponse>;
  getSerpApiConfig?: () => Pick<SerpApiConfig, "apiKey">;
  getCached?: (hotelId: string) => HotelPropertyDetails | undefined;
  setCached?: (hotelId: string, details: HotelPropertyDetails) => void;
};

export type GetHotelPropertyDetailsResult = {
  details: HotelPropertyDetails;
  /** True when served from the short-lived server cache. */
  cached: boolean;
};

function mapSealError(error: unknown): never {
  if (error instanceof SealedPropertyRefError) {
    if (error.code === "EXPIRED") {
      throw createNotFoundError(
        "This hotel reference has expired. Try searching again.",
      );
    }
    if (error.code === "MISSING_SECRET") {
      throw createNotFoundError(
        "Hotel details are unavailable right now.",
      );
    }
    throw createNotFoundError(
      "Hotel details are unavailable for this result. Try searching again.",
    );
  }
  throw error;
}

function assertSafeHotelId(hotelId: string): void {
  if (!hotelId || !HOTEL_ID_PATTERN.test(hotelId)) {
    throw createValidationError("A valid hotel id is required.");
  }

  if (
    /^(Ch[a-zA-Z0-9_-]{8,}|Cgo[a-zA-Z0-9_-]{8,}|Cgs[a-zA-Z0-9_-]{8,})/.test(
      hotelId,
    )
  ) {
    throw createValidationError("A valid hotel id is required.");
  }
}

/**
 * Loads safe hotel property details from a sealed reference (and optional hotel id).
 */
export async function getHotelPropertyDetails(
  input: GetHotelPropertyDetailsInput | string,
  options: GetHotelPropertyDetailsOptions = {},
  deps: HotelPropertyDetailsServiceDeps = {},
): Promise<GetHotelPropertyDetailsResult> {
  const normalized: GetHotelPropertyDetailsInput =
    typeof input === "string" ? { hotelId: input } : input;

  const sealedRef = normalized.ref?.trim() ?? "";
  const requestedHotelId = normalized.hotelId?.trim() ?? "";

  if (!sealedRef) {
    // hotelId-only is no longer a production path (no shared registry).
    if (requestedHotelId) {
      assertSafeHotelId(requestedHotelId);
    }
    throw createNotFoundError(
      "Hotel details are unavailable for this result. Try searching again.",
    );
  }

  if (!isSealedPropertyRef(sealedRef)) {
    throw createNotFoundError(
      "Hotel details are unavailable for this result. Try searching again.",
    );
  }

  if (requestedHotelId) {
    assertSafeHotelId(requestedHotelId);
  }

  const getCached = deps.getCached ?? getCachedHotelPropertyDetails;
  const setCached = deps.setCached ?? setCachedHotelPropertyDetails;
  const getSealSecret =
    deps.getSealSecret ??
    (() =>
      getAppConfig().replay.enabled
        ? getReplaySealSecret()
        : getAppConfig().propertyRefSeal.secret);
  const unsealRef = deps.unsealRef ?? unsealHotelPropertyRef;
  const fetchDetails = deps.fetchDetails ?? fetchGoogleHotelPropertyDetails;
  const getSerpApiConfig =
    deps.getSerpApiConfig ?? (() => getAppConfig().serpapi);

  let lookup: HotelPropertyLookup;
  let hotelId: string;
  try {
    const unsealed = unsealRef(sealedRef, getSealSecret(), {
      expectedHotelId: requestedHotelId || undefined,
    });
    lookup = unsealed.lookup;
    hotelId = unsealed.hotelId;
  } catch (error) {
    mapSealError(error);
  }

  assertSafeHotelId(hotelId);

  if (!options.bypassCache) {
    const cached = getCached(hotelId);
    if (cached) {
      return { details: cached, cached: true };
    }
  }

  // Sprint 17.6 — replay mode: fixture details only, never SerpAPI.
  if (getAppConfig().replay.enabled) {
    const details = requireReplayHotelPropertyDetails(hotelId);
    setCached(hotelId, details);
    return { details, cached: false };
  }

  // Defence-in-depth: replay tokens must never hit SerpAPI even if flag is off.
  if (isReplayPropertyToken(lookup.propertyToken)) {
    throw createNotFoundError(
      "Hotel details are unavailable for this result. Try searching again.",
    );
  }

  const config = getSerpApiConfig();
  const raw = await fetchDetails(lookup.propertyToken, config, {
    query: lookup.query,
    checkInDate: options.checkInDate ?? lookup.checkInDate,
    checkOutDate: options.checkOutDate ?? lookup.checkOutDate,
    currency: options.currency ?? lookup.currency,
    adults: options.adults ?? lookup.adults,
  });

  if (raw.error?.trim()) {
    throw createNotFoundError(
      "Some hotel details are unavailable right now.",
    );
  }

  const details = mapPropertyDetailsResponse(hotelId, raw);
  setCached(hotelId, details);
  return { details, cached: false };
}
