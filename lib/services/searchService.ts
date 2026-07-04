/**
 * Search service — UI and pages call this, not providers directly.
 */

import { toApiError } from "@/lib/api/errors";
import {
  serviceFailure,
  serviceSuccess,
  type ServiceResult,
} from "@/lib/api/types";
import { validateSearchRequest } from "@/lib/api/validation";
import {
  getAllOrchestratedResults,
  orchestrateSearch,
} from "@/lib/services/searchOrchestrator";
import type { SearchResult } from "@/types/results";
import type { SearchData, TravelStyle } from "@/types/search";

/** Runs a full validated search and returns hotels, flights, buses, and trains. */
export async function searchTrips(
  search: Partial<SearchData>,
): Promise<ServiceResult<SearchResult[]>> {
  const validation = validateSearchRequest(search);
  if (!validation.success) {
    return validation;
  }

  try {
    const data = await orchestrateSearch(validation.data);
    return serviceSuccess(data);
  } catch (error) {
    return serviceFailure(toApiError(error, "Could not load search results."));
  }
}

/**
 * Convenience wrapper used when only destination and travel style are known.
 * Keeps backward compatibility with the previous `getResultsForSearch` helper.
 */
export async function searchByDestination(
  destination: string,
  travelStyle: TravelStyle = "standard",
): Promise<ServiceResult<SearchResult[]>> {
  return searchTrips({
    destination,
    travelStyle,
    tripType: "round-trip",
    departureDate: new Date().toISOString().slice(0, 10),
    returnDate: null,
    budget: null,
    budgetCurrency: null,
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
  });
}

/** Returns the full mock results pool (used for price range defaults). */
export async function getAllSearchResults(): Promise<ServiceResult<SearchResult[]>> {
  try {
    const data = await getAllOrchestratedResults();
    return serviceSuccess(data);
  } catch (error) {
    return serviceFailure(toApiError(error, "Could not load results."));
  }
}
