import type { SearchRequest } from "@/types/models/search-request";

/**
 * Milestone 28: a plain Booking.com search for the same stay (destination,
 * check-in, check-out, guests, rooms). Not an affiliate link — Glooconn's
 * Booking.com program is still locked in Travelpayouts. Null when the
 * search has no destination or dates.
 */
export function buildBookingSearchUrl(search: Partial<SearchRequest>): string | null {
  const destination = search.destination?.trim();
  if (!destination || !search.departureDate || !search.returnDate) return null;
  const params = new URLSearchParams({
    ss: destination,
    checkin: search.departureDate,
    checkout: search.returnDate,
    group_adults: String(Math.max(1, search.travelers?.adults ?? 1)),
    group_children: String(Math.max(0, search.travelers?.children ?? 0)),
    no_rooms: String(Math.max(1, search.travelers?.rooms ?? 1)),
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}
