import {
  MOCK_DESTINATIONS,
  filterDestinations,
  formatDestinationLabel,
} from "@/lib/destinations";
import { MOCK_BUSES } from "@/lib/results/mockBuses";
import { MOCK_FLIGHTS } from "@/lib/results/mockFlights";
import { MOCK_HOTELS } from "@/lib/results/mockHotels";
import { MOCK_TRAINS } from "@/lib/results/mockTrains";
import type { TravelStyle } from "@/types/search";
import type { SearchResult } from "@/types/results";

const ALL_RESULTS: SearchResult[] = [
  ...MOCK_HOTELS,
  ...MOCK_FLIGHTS,
  ...MOCK_BUSES,
  ...MOCK_TRAINS,
];

/** Resolves a destination label (e.g. "Paris, France") to a destination id. */
export function resolveDestinationId(destination: string): string {
  const trimmed = destination.trim();
  if (!trimmed) {
    return "paris";
  }

  const exact = MOCK_DESTINATIONS.find(
    (item) => formatDestinationLabel(item).toLowerCase() === trimmed.toLowerCase(),
  );
  if (exact) {
    return exact.id;
  }

  const matches = filterDestinations(trimmed);
  return matches[0]?.id ?? "paris";
}

/** Adjusts prices based on travel style preference. */
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

/** Returns mock search results for a destination and travel style. */
export function getResultsForSearch(
  destination: string,
  travelStyle: TravelStyle = "standard",
): SearchResult[] {
  const destinationId = resolveDestinationId(destination);
  const matched = ALL_RESULTS.filter(
    (result) => result.destinationId === destinationId,
  );

  const pool = matched.length > 0 ? matched : ALL_RESULTS.slice(0, 8);
  return applyTravelStyleMultiplier(pool, travelStyle);
}

/** Returns the full mock results pool (used for price range defaults). */
export function getAllMockResults(): SearchResult[] {
  return ALL_RESULTS;
}
