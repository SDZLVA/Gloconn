import "server-only";

/**
 * Milestone 44 — Booking.com hotels through RapidAPI ("Booking" by Api
 * Dojo, host apidojo-booking-v1.p.rapidapi.com). Unofficial: Booking.com
 * does not run this API, so it can change or stop without notice.
 * Key: RAPIDAPI_KEY (Vercel Secret). Each search costs 1–2 requests from
 * the RapidAPI plan (the city lookup is cached for a day).
 */

import { mapBookingProperties, pickDestination } from "@/features/liveHotels/bookingcom/map";
import type { LiveHotel, LiveHotelsSearch } from "@/features/liveHotels/types";
import { convertAmount } from "@/features/fx/ecb";
import { eurRates } from "@/features/fx/rates";
import { readCache, writeCache } from "@/features/flightsFallback/store";

const HOST = "apidojo-booking-v1.p.rapidapi.com";
const TIMEOUT_MS = 10_000;
const DEST_CACHE_MS = 24 * 60 * 60_000;
const destCache = new Map<string, { at: number; dest: { destId: string; destType: string } | null }>();

export function rapidApiKey(): string | null {
  const key = process.env.RAPIDAPI_KEY?.trim();
  return key ? key : null;
}

export class BookingApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function call(path: string, params: Record<string, string>): Promise<unknown> {
  const key = rapidApiKey();
  if (!key) throw new BookingApiError("RapidAPI is not configured", 503);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`https://${HOST}${path}?${new URLSearchParams(params).toString()}`, {
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": HOST, accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new BookingApiError(`Booking RapidAPI ${response.status}`, response.status);
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function destination(cityLabel: string): Promise<{ destId: string; destType: string } | null> {
  const key = cityLabel.toLowerCase();
  const hit = destCache.get(key);
  if (hit && Date.now() - hit.at < DEST_CACHE_MS) return hit.dest;
  const raw = await call("/locations/auto-complete", { text: cityLabel, languagecode: "en-us" });
  const dest = pickDestination(raw);
  destCache.set(key, { at: Date.now(), dest });
  if (destCache.size > 500) destCache.delete(destCache.keys().next().value!);
  return dest;
}

/**
 * Milestone 57: a search is kept 15 minutes in Supabase (api_cache), so the
 * quick + full package searches and the Hotels tab share one Booking.com call.
 */
const SEARCH_TTL_MS = 15 * 60_000;
const searchKey = (s: LiveHotelsSearch) =>
  `booking:v2:${s.destination.toLowerCase()}:${s.checkin}:${s.checkout}:${s.adults}-${s.children}-${s.rooms}:${s.currency}`;

export async function searchBookingHotels(
  search: Omit<LiveHotelsSearch, "destination"> & { destination: string },
  options: { fresh?: boolean } = {},
): Promise<{ hotels: LiveHotel[]; raw: unknown }> {
  const key = searchKey(search);
  if (!options.fresh) {
    const hit = await readCache<{ hotels: LiveHotel[] }>(key);
    if (hit && Array.isArray(hit.hotels) && hit.hotels.length > 0) return { hotels: hit.hotels, raw: null };
  }
  const found = await searchBookingHotelsLive(search);
  if (found.hotels.length > 0) await writeCache(key, { hotels: found.hotels }, SEARCH_TTL_MS);
  return found;
}

async function searchBookingHotelsLive(
  search: Omit<LiveHotelsSearch, "destination"> & { destination: string },
): Promise<{ hotels: LiveHotel[]; raw: unknown }> {
  const dest = await destination(search.destination);
  if (!dest) return { hotels: [], raw: null };
  const raw = await call("/properties/list", {
    offset: "0",
    arrival_date: search.checkin,
    departure_date: search.checkout,
    guest_qty: String(Math.max(1, search.adults)),
    children_qty: String(Math.max(0, search.children)),
    children_age: Array.from({ length: Math.max(0, search.children) }, () => "8").join(","),
    room_qty: String(Math.max(1, search.rooms)),
    dest_ids: dest.destId,
    search_type: dest.destType,
    price_filter_currencycode: search.currency,
    order_by: "popularity",
    languagecode: "en-us",
    travel_purpose: "leisure",
    search_id: "none",
  });
  return { hotels: await inSearchCurrency(mapBookingProperties(raw, search.currency), search.currency), raw };
}

/**
 * Booking.com answers in the hotel's local currency (London → GBP). Convert to
 * the search currency (ECB rates) so prices match the flights and the rest of
 * the page. If rates can't be loaded, prices stay in the local currency.
 */
async function inSearchCurrency(hotels: LiveHotel[], currency: string): Promise<LiveHotel[]> {
  const target = currency.toUpperCase();
  if (hotels.every((h) => h.currency.toUpperCase() === target)) return hotels;
  const rates = await eurRates();
  if (!rates) return hotels;
  return hotels.map((hotel) => {
    const amount = convertAmount(hotel.totalPrice, hotel.currency, target, rates);
    return amount === null ? hotel : { ...hotel, totalPrice: amount, currency: target };
  });
}
