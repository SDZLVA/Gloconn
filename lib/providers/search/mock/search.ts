/**
 * Core mock search logic — shared by the mock provider and legacy sync helpers.
 */

import { resolveDestinationIdFromLabel } from "@/lib/providers/destinations/mock/helpers";
import { MOCK_BUSES } from "@/lib/results/mockBuses";
import { MOCK_FLIGHTS } from "@/lib/results/mockFlights";
import { MOCK_HOTELS } from "@/lib/results/mockHotels";
import { MOCK_TRAINS } from "@/lib/results/mockTrains";
import type { SearchResult } from "@/types/results";
import type { TravelStyle } from "@/types/search";

export const ALL_MOCK_RESULTS: SearchResult[] = [
  ...MOCK_HOTELS,
  ...MOCK_FLIGHTS,
  ...MOCK_BUSES,
  ...MOCK_TRAINS,
];

function applyTravelStyleMultiplier(
  results: SearchResult[],
  travelStyle: TravelStyle,
): SearchResult[] {
  const multiplier =
    travelStyle === "budget" ? 0.85 : travelStyle === "luxury" ? 1.25 : 1;

  if (multiplier === 1) {
    return results;
  }

  return results.map((result) => ({
    ...result,
    price: Math.round(result.price * multiplier),
  }));
}

/** Returns mock search results for a destination and travel style (synchronous). */
export function searchMockResults(
  destination: string,
  travelStyle: TravelStyle = "standard",
): SearchResult[] {
  const destinationId = resolveDestinationIdFromLabel(destination);
  const matched = ALL_MOCK_RESULTS.filter(
    (result) => result.destinationId === destinationId,
  );

  const pool = matched.length > 0 ? matched : ALL_MOCK_RESULTS.slice(0, 8);
  return applyTravelStyleMultiplier(pool, travelStyle);
}
