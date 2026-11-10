import "server-only";

/**
 * Milestone 56 — hotels from Booking.com and Agoda together (both via
 * RapidAPI). Booking.com is the main list; Agoda adds hotels Booking.com
 * does not return and replaces a price when Agoda is cheaper for the same
 * hotel. Agoda problems never break the search.
 */

import { searchAgodaHotels, type AgodaTrace } from "@/features/liveHotels/agoda/client";
import { mergeHotels } from "@/features/liveHotels/agoda/map";
import { searchBookingHotels } from "@/features/liveHotels/bookingcom/client";
import type { LiveHotel, LiveHotelsSearch } from "@/features/liveHotels/types";

export async function searchHotelsCombined(
  search: LiveHotelsSearch,
  options: { trace?: AgodaTrace; fresh?: boolean } = {},
): Promise<{ hotels: LiveHotel[]; raw: unknown; agodaRaw: unknown; booking: LiveHotel[]; agoda: LiveHotel[] }> {
  const [bookingSettled, agodaResult] = await Promise.all([
    searchBookingHotels(search).then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error }),
    ),
    searchAgodaHotels(search, options),
  ]);
  // Booking.com failed and Agoda has nothing → report the Booking.com error as before.
  if (!bookingSettled.ok && agodaResult.hotels.length === 0) throw bookingSettled.error;
  const booking = bookingSettled.ok ? bookingSettled.value.hotels : [];
  return {
    hotels: mergeHotels(booking, agodaResult.hotels),
    raw: bookingSettled.ok ? bookingSettled.value.raw : null,
    agodaRaw: agodaResult.raw,
    booking,
    agoda: agodaResult.hotels,
  };
}
