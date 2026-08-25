/**
 * Replay fixture seal helpers (Sprint 17.6).
 *
 * Uses a dedicated test-only seal secret so replay sessions do not depend on
 * PROPERTY_REF_SEAL_SECRET and cannot unseal production refs (different key).
 * Tokens sealed here are opaque `replay:<hotelId>` placeholders — never SerpAPI tokens.
 */

import "server-only";

import { sealHotelPropertyRef } from "@/lib/hotels/sealedPropertyRef";
import type { Hotel } from "@/types/models/hotel";
import type { TravelPackage } from "@/types/models/travel-package";
import type { SearchResponse } from "@/types/models/search-response";
import type { ReplayFixtureMatch } from "@/lib/replay/types";

/**
 * Fixed test-only seal material for replay fixtures.
 * Not a production secret — only used when GLOOCONN_REPLAY_MODE is enabled.
 */
export const REPLAY_SEAL_SECRET =
  "glooconn-replay-fixture-seal-secret-v1-not-for-production-use";

/** Prefix for sealed payload tokens — cannot be used against SerpAPI. */
export const REPLAY_PROPERTY_TOKEN_PREFIX = "replay:";

export function buildReplayPropertyToken(hotelId: string): string {
  return `${REPLAY_PROPERTY_TOKEN_PREFIX}${hotelId.trim()}`;
}

export function isReplayPropertyToken(token: string): boolean {
  return token.trim().startsWith(REPLAY_PROPERTY_TOKEN_PREFIX);
}

export function getReplaySealSecret(): string {
  return REPLAY_SEAL_SECRET;
}

function sealHotelForReplay(
  hotel: Hotel,
  match: ReplayFixtureMatch,
): Hotel {
  const hotelId = hotel.id.trim();
  if (!hotelId) {
    return hotel;
  }

  const providerPropertyRef = sealHotelPropertyRef(
    {
      hotelId,
      propertyToken: buildReplayPropertyToken(hotelId),
      query: match.destinationId,
      checkInDate: match.departureDate,
      checkOutDate: match.returnDate,
      currency: hotel.currency,
      adults: 2,
      // Long TTL so multi-hour tester sessions stay valid.
      ttlMs: 7 * 24 * 60 * 60_000,
    },
    REPLAY_SEAL_SECRET,
  );

  return { ...hotel, providerPropertyRef };
}

function sealPackageHotels(
  pkg: TravelPackage,
  match: ReplayFixtureMatch,
): TravelPackage {
  return {
    ...pkg,
    hotel: sealHotelForReplay(pkg.hotel, match),
  };
}

/**
 * Returns a SearchResponse with sealed gpref1 refs for hotels that have details.
 * Hotels without a details fixture remain unsealed (View hotel stays hidden).
 */
export function sealReplaySearchResponse(
  response: SearchResponse,
  match: ReplayFixtureMatch,
  hotelIdsWithDetails: ReadonlySet<string>,
): SearchResponse {
  const hotels = response.hotels.map((hotel) =>
    hotelIdsWithDetails.has(hotel.id)
      ? sealHotelForReplay(hotel, match)
      : hotel,
  );

  const packages = response.packages.map((pkg) =>
    hotelIdsWithDetails.has(pkg.hotel.id)
      ? sealPackageHotels(pkg, match)
      : pkg,
  );

  return {
    ...response,
    hotels,
    packages,
    searchedAt: new Date().toISOString(),
  };
}
