/**
 * Real-data replay fixture types (Sprint 17.6).
 *
 * Fixtures store vendor-neutral SearchResponse + HotelPropertyDetails.
 * Raw SerpAPI property tokens and API keys must never appear here.
 */

import type { Hotel } from "@/types/models/hotel";
import type { HotelPropertyDetails } from "@/types/models/hotel-property-details";
import type { SearchResponse } from "@/types/models/search-response";

/** Match keys used to select a captured scenario. */
export type ReplayFixtureMatch = {
  originId: string;
  destinationId: string;
  /** When set, departureDate must match exactly. */
  departureDate?: string;
  /** When set, returnDate must match exactly. */
  returnDate?: string;
};

export type ReplayFixtureMeta = {
  /** Stable fixture id, e.g. "milan-paris". */
  id: string;
  /** Human-readable label for testers. */
  label: string;
  /** Capture timestamp (ISO 8601). */
  capturedAt: string;
  match: ReplayFixtureMatch;
};

/**
 * On-disk search fixture — hotels omit sealed refs (sealed at serve time).
 * Packages embed the same hotel objects (also without sealed refs).
 */
export type ReplaySearchFixture = {
  meta: ReplayFixtureMeta;
  response: SearchResponse;
};

/** Catalog entry pointing at a fixture directory. */
export type ReplayCatalogEntry = {
  id: string;
  label: string;
  match: ReplayFixtureMatch;
  /** Relative directory under lib/test-fixtures/replay/ */
  dir: string;
};

export type ReplayCatalog = {
  version: 1;
  scenarios: ReplayCatalogEntry[];
};

/** Hotel id → safe property details (no provider tokens). */
export type ReplayDetailsMap = Record<string, HotelPropertyDetails>;

/** Strip browser-facing sealed refs before writing a fixture. */
export function stripHotelSealedRefs(hotel: Hotel): Hotel {
  const { providerPropertyRef: _ref, ...rest } = hotel;
  void _ref;
  return rest;
}
