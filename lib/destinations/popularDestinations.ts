/**
 * Popular destinations — mock-data helpers (no API).
 * Reads from static MOCK_DESTINATIONS flagged with `popular: true`.
 */

import { getPopularDestinationsList } from "@/lib/providers/destinations/mock/helpers";
import type { Destination } from "@/types/destination";

export const POPULAR_DESTINATIONS_HEADING = "Popular destinations";

/** Returns curated popular destinations from mock data, optionally excluding ids. */
export function getPopularDestinations(
  excludeIds?: ReadonlySet<string>,
): Destination[] {
  return getPopularDestinationsList().filter(
    (destination) => !excludeIds?.has(destination.id),
  );
}
