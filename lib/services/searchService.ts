/**
 * Search service — server-only entry point for trip search.
 * Client UI must call `postSearchTrips()` → POST /api/search instead.
 */

import "server-only";

import { runService, type ServiceResult } from "@/lib/api/types";
import { validateSearchRequest } from "@/lib/api/validation";
import { getAppConfig } from "@/lib/config";
import { getReplaySearchResponse } from "@/lib/replay/searchReplay";
import {
  getAllTripSearchResults,
  orchestrateTripSearch,
} from "@/lib/services/searchOrchestrator";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResponse } from "@/types/models/search-response";
import type { SearchData, TravelStyle } from "@/types/search";
import { INITIAL_PASSENGERS } from "@/types/search-form";

/** Runs a full validated search and returns a SearchResponse (with optional warnings). */
export async function searchTrips(
  search: Partial<SearchData> | Partial<SearchRequest>,
): Promise<ServiceResult<SearchResponse>> {
  const validation = validateSearchRequest(search);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  // Sprint 17.6 — real-data replay: never call live providers.
  if (getAppConfig().replay.enabled) {
    return runService(
      async () => getReplaySearchResponse(validation.data),
      "Could not load search results.",
    );
  }

  return runService(
    () => orchestrateTripSearch(validation.data),
    "Could not load search results.",
  );
}

/**
 * Convenience wrapper used when only destination and travel style are known.
 * Keeps backward compatibility with the previous `getResultsForSearch` helper.
 */
export async function searchByDestination(
  destination: string,
  travelStyle: TravelStyle = "standard",
): Promise<ServiceResult<SearchResponse>> {
  return searchTrips({
    destination,
    travelStyle,
    tripType: "round-trip",
    departureDate: new Date().toISOString().slice(0, 10),
    returnDate: null,
    budget: null,
    budgetCurrency: null,
    travelers: { ...INITIAL_PASSENGERS },
    totalGuests: INITIAL_PASSENGERS.adults,
  });
}

/** Returns the full results catalog via active providers (price-range defaults). */
export async function getAllSearchResults(): Promise<
  ServiceResult<SearchResponse>
> {
  return runService(
    () => getAllTripSearchResults(),
    "Could not load results.",
  );
}
