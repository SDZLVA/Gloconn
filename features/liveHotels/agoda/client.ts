import "server-only";

/**
 * Milestone 56 — Agoda hotels through RapidAPI ("Agoda com", host
 * agoda-com.p.rapidapi.com). Unofficial: Agoda does not run this API.
 * Key: RAPIDAPI_KEY (same Vercel Secret as Booking.com / Skyscanner).
 * Plan: 500 requests / month, hard limit. Every HTTP call first takes one
 * unit of quota (claimCall), and answers are kept in Supabase (api_cache):
 * the city id for 30 days, a search for 12 hours. Over the cap or no
 * store → no call, and the page simply shows Booking.com only.
 */

import { mapAgodaProperties, pickAgodaPlace } from "@/features/liveHotels/agoda/map";
import { nightsBetween } from "@/features/liveHotels/filters";
import { rapidApiKey } from "@/features/liveHotels/bookingcom/client";
import type { LiveHotel, LiveHotelsSearch } from "@/features/liveHotels/types";
import { claimCall, readCache, storeConfigured, writeCache } from "@/features/flightsFallback/store";
import { convertAmount } from "@/features/fx/ecb";
import { eurRates } from "@/features/fx/rates";

const HOST = "agoda-com.p.rapidapi.com";
const TIMEOUT_MS = 12_000;
/** Below the plan (500 / month, hard limit). */
export const AGODA_CAP = { daily: 14, monthly: 450 } as const;
const PLACE_TTL_MS = 30 * 24 * 60 * 60_000;
const SEARCH_TTL_MS = 12 * 60 * 60_000;
const EMPTY_TTL_MS = 2 * 60 * 60_000;
const LIMIT = 30;

export type AgodaTrace = string[];

export function agodaConfigured(): boolean {
  return Boolean(rapidApiKey()) && storeConfigured() && process.env.AGODA_HOTELS !== "off";
}

async function call(path: string, params: Record<string, string>, trace?: AgodaTrace): Promise<unknown | null> {
  const key = rapidApiKey();
  if (!key) return null;
  if (!(await claimCall("agoda", AGODA_CAP.daily, AGODA_CAP.monthly))) {
    trace?.push(`${path}: over the cap (or no store) — skipped`);
    return null;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`https://${HOST}${path}?${new URLSearchParams(params).toString()}`, {
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": HOST, accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      trace?.push(`${path}: HTTP ${response.status} ${body.slice(0, 160)}`);
      throw new Error(`Agoda RapidAPI ${response.status}`);
    }
    return (await response.json().catch(() => null)) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

async function placeId(label: string, trace?: AgodaTrace): Promise<string | null> {
  const cacheKey = `agoda:place:v1:${label.toLowerCase()}`;
  const hit = await readCache<{ id: string | null }>(cacheKey);
  if (hit) {
    trace?.push(`place: cache ${hit.id}`);
    return hit.id;
  }
  const city = label.split(",")[0]?.trim() || label;
  const raw = await call("/hotels/auto-complete", { query: city, language: "en-us" }, trace);
  if (raw === null) return null;
  const id = pickAgodaPlace(raw, label);
  trace?.push(`place: live ${id}`);
  await writeCache(cacheKey, { id }, PLACE_TTL_MS);
  return id;
}

/**
 * Agoda hotels for the search, in the search currency. Never throws:
 * any problem → an empty list (Booking.com results still show).
 */
export async function searchAgodaHotels(
  search: LiveHotelsSearch,
  options: { trace?: AgodaTrace; fresh?: boolean } = {},
): Promise<{ hotels: LiveHotel[]; raw: unknown }> {
  const { trace } = options;
  if (!agodaConfigured()) {
    trace?.push("agoda: not configured");
    return { hotels: [], raw: null };
  }
  try {
    const id = await placeId(search.destination, trace);
    if (!id) return { hotels: [], raw: null };
    const cacheKey = `agoda:v1:${id}:${search.checkin}:${search.checkout}:${search.adults}:${search.children}:${search.rooms}:${search.currency}`;
    if (!options.fresh) {
      const hit = await readCache<{ hotels: LiveHotel[] }>(cacheKey);
      if (hit) {
        trace?.push(`search: cache ${hit.hotels.length}`);
        return { hotels: hit.hotels, raw: null };
      }
    }
    const params: Record<string, string> = {
      id,
      checkinDate: search.checkin,
      checkoutDate: search.checkout,
      limit: String(LIMIT),
      page: "1",
      language: "en-us",
      currency: search.currency,
      room: String(Math.max(1, search.rooms)),
      adult: String(Math.max(1, search.adults)),
      sort: "Ranking,Desc",
    };
    if (search.children > 0) params.childAges = Array.from({ length: search.children }, () => "8").join(",");
    const raw = await call("/hotels/search-overnight", params, trace);
    if (raw === null) return { hotels: [], raw: null };
    const nights = nightsBetween(search.checkin, search.checkout);
    const hotels = await inSearchCurrency(mapAgodaProperties(raw, search, nights), search.currency);
    trace?.push(`search: live ${hotels.length}`);
    await writeCache(cacheKey, { hotels }, hotels.length > 0 ? SEARCH_TTL_MS : EMPTY_TTL_MS);
    return { hotels, raw };
  } catch (error) {
    trace?.push(`agoda: failed ${(error as Error)?.name ?? ""} ${(error as Error)?.message ?? ""}`.trim());
    console.error("[agoda] search failed", (error as Error)?.name, (error as Error)?.message);
    return { hotels: [], raw: null };
  }
}

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
