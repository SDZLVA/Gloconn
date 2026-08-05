/**
 * Pure origin ↔ destination swap for the search form (Sprint 14.3).
 */

export type SwappablePlaces = {
  origin: string;
  originId: string;
  destination: string;
  destinationId: string;
};

/** Returns place fields with origin and destination swapped (labels + ids). */
export function swapOriginDestinationFields(
  places: SwappablePlaces,
): SwappablePlaces {
  return {
    origin: places.destination,
    originId: places.destinationId,
    destination: places.origin,
    destinationId: places.originId,
  };
}
