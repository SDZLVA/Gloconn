/**
 * Amenity display helpers — keep search cards compact (Sprint 17.2 / 17.4).
 */

/** Max amenities on browse hotel cards. */
export const HOTEL_CARD_AMENITY_LIMIT = 3;

/** Max amenities inside the hotel details drawer. */
export const HOTEL_DRAWER_AMENITY_LIMIT = 6;

/**
 * Returns a concise amenity subset for cards/drawers.
 * Empty input → empty array. Does not invent amenities.
 */
export function selectHotelAmenitiesForDisplay(
  amenities: readonly string[] | null | undefined,
  limit: number = HOTEL_CARD_AMENITY_LIMIT,
): string[] {
  if (!Array.isArray(amenities) || amenities.length === 0) {
    return [];
  }

  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : HOTEL_CARD_AMENITY_LIMIT;

  const result: string[] = [];
  for (const item of amenities) {
    if (typeof item !== "string") {
      continue;
    }
    const trimmed = item.trim();
    if (!trimmed) {
      continue;
    }
    result.push(trimmed);
    if (result.length >= safeLimit) {
      break;
    }
  }
  return result;
}

/**
 * Single-line amenity summary for browse cards (Sprint 17.4).
 * Example: "Free Wi-Fi · Breakfast · Spa"
 */
export function formatHotelAmenitiesSummary(
  amenities: readonly string[] | null | undefined,
  limit: number = HOTEL_CARD_AMENITY_LIMIT,
): string | null {
  const selected = selectHotelAmenitiesForDisplay(amenities, limit);
  if (selected.length === 0) {
    return null;
  }
  return selected.join(" · ");
}
