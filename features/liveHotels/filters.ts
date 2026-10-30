import type { LiveHotel, LiveHotelsFilters } from "@/features/liveHotels/types";

/** Nights between two ISO dates (min 1). */
export function nightsBetween(checkin: string, checkout: string): number {
  const ms = Date.parse(`${checkout}T00:00:00Z`) - Date.parse(`${checkin}T00:00:00Z`);
  return Number.isFinite(ms) ? Math.max(1, Math.round(ms / 86_400_000)) : 1;
}

/** Milestone 30: the left-side filters + sort, applied in the browser (no extra API calls). */
export function filterHotels(hotels: LiveHotel[], filters: LiveHotelsFilters, nights: number): LiveHotel[] {
  const kept = hotels.filter((hotel) => {
    if (filters.maxPerNight !== null && hotel.totalPrice / nights > filters.maxPerNight) return false;
    if (filters.stars.length > 0 && !filters.stars.includes(hotel.stars)) return false;
    if (filters.minRating > 0 && (hotel.rating ?? 0) < filters.minRating) return false;
    if (filters.refundableOnly && !hotel.refundable) return false;
    return true;
  });
  if (filters.sort === "price") return [...kept].sort((a, b) => a.totalPrice - b.totalPrice);
  if (filters.sort === "rating") return [...kept].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  if (filters.sort === "stars") return [...kept].sort((a, b) => b.stars - a.stars || a.totalPrice - b.totalPrice);
  return kept; // LiteAPI's own "top picks" order
}

/** Booking.com-style word for a guest score. */
export function ratingLabel(score: number): string {
  if (score >= 9) return "Superb";
  if (score >= 8) return "Very good";
  if (score >= 7) return "Good";
  if (score >= 6) return "Pleasant";
  return "Review score";
}
