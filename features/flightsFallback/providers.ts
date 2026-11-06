import "server-only";

/**
 * Milestone 49 — the two paid live-price providers. Every HTTP call first
 * takes one unit of quota (claimCall); over the cap → no call.
 *   Sky Scrapper (RapidAPI "Air Scraper" by apiheya, host sky-scrapper.p.rapidapi.com), RAPIDAPI_KEY
 *   SerpApi Google Flights, SERPAPI_API_KEY
 */

import { mapGoogleFlights, mapSkyItineraries, pickSkyPlace, skyscannerUrl } from "@/features/flightsFallback/map";
import { claimCall, readCache, writeCache } from "@/features/flightsFallback/store";
import type { DataFlightsSearch } from "@/features/flightsData/map";
import type { Flight } from "@/types/models";

const SKY_HOST = "sky-scrapper.p.rapidapi.com";

/** Preview debugging: short notes about each provider call (no keys). */
export type Trace = string[];
const TIMEOUT_MS = 12_000;
const PLACE_TTL_MS = 60 * 24 * 60 * 60_000;

/** Caps below the plans (Sky Scrapper 200/month, SerpApi 250/month). */
export const CAPS = {
  skyscanner: { daily: 8, monthly: 180 },
  google: { daily: 8, monthly: 225 },
} as const;

/** Whether the provider's price is for all travellers together (checked in M49 testing). */
const GROUP_PRICE = { skyscanner: false, google: false } as const;

async function getJson(url: string, headers: Record<string, string>): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers: { accept: "application/json", ...headers }, signal: controller.signal, cache: "no-store" });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status} ${body.slice(0, 200)}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function sky(path: string, params: Record<string, string>, trace?: Trace): Promise<unknown | null> {
  const key = process.env.RAPIDAPI_KEY?.trim();
  if (!key) return null;
  if (!(await claimCall("skyscanner", CAPS.skyscanner.daily, CAPS.skyscanner.monthly))) {
    trace?.push(`sky ${path}: over cap`);
    return null;
  }
  try {
    const raw = await getJson(`https://${SKY_HOST}${path}?${new URLSearchParams(params).toString()}`, {
      "x-rapidapi-key": key,
      "x-rapidapi-host": SKY_HOST,
    });
    trace?.push(`sky ${path}: ${JSON.stringify(raw).slice(0, 400)}`);
    return raw;
  } catch (error) {
    trace?.push(`sky ${path}: ${(error as Error).message}`);
    return null;
  }
}

async function skyPlace(iata: string, trace?: Trace): Promise<{ skyId: string; entityId: string } | null> {
  const cacheKey = `sky-place:${iata.toUpperCase()}`;
  const cached = await readCache<{ skyId: string; entityId: string }>(cacheKey);
  if (cached) return cached;
  const raw = await sky("/api/v1/flights/searchAirport", { query: iata, locale: "en-US" }, trace);
  const place = raw ? pickSkyPlace(raw, iata) : null;
  if (place) await writeCache(cacheKey, place, PLACE_TTL_MS);
  return place;
}

export async function searchSkyscanner(search: DataFlightsSearch, destinationId = "", trace?: Trace): Promise<{ flights: Flight[]; raw: unknown }> {
  if (!process.env.RAPIDAPI_KEY?.trim()) return { flights: [], raw: null };
  const [from, to] = await Promise.all([skyPlace(search.origin, trace), skyPlace(search.destination, trace)]);
  if (!from || !to) return { flights: [], raw: null };
  const params: Record<string, string> = {
    originSkyId: from.skyId,
    destinationSkyId: to.skyId,
    originEntityId: from.entityId,
    destinationEntityId: to.entityId,
    date: search.departureDate,
    cabinClass: "economy",
    adults: String(Math.max(1, search.adults)),
    childrens: String(Math.max(0, search.children)),
    infants: String(Math.max(0, search.infants)),
    sortBy: "price_high",
    limit: "30",
    currency: search.currency,
    market: "en-GB",
    countryCode: "GB",
  };
  if (search.returnDate) params.returnDate = search.returnDate;
  let raw = await sky("/api/v2/flights/searchFlights", params, trace);
  // The first answer can be "incomplete"; one follow-up call finishes it.
  const ctx = (raw as { data?: { context?: { status?: string; sessionId?: string } } } | null)?.data?.context;
  if (raw && ctx?.status === "incomplete" && ctx.sessionId) {
    const more = await sky("/api/v2/flights/searchIncomplete", {
      sessionId: ctx.sessionId,
      currency: search.currency,
      market: "en-GB",
      countryCode: "GB",
    }, trace).catch(() => null);
    if (more) raw = more;
  }
  if (!raw) return { flights: [], raw: null };
  const sourceUrl = skyscannerUrl(from.skyId, to.skyId, search);
  return { flights: mapSkyItineraries(raw, search, { groupPrice: GROUP_PRICE.skyscanner, sourceUrl, destinationId }), raw };
}

export async function searchGoogle(search: DataFlightsSearch, destinationId = "", trace?: Trace): Promise<{ flights: Flight[]; raw: unknown }> {
  const key = process.env.SERPAPI_API_KEY?.trim();
  if (!key) return { flights: [], raw: null };
  if (!(await claimCall("google", CAPS.google.daily, CAPS.google.monthly))) return { flights: [], raw: null };
  const params = new URLSearchParams({
    engine: "google_flights",
    departure_id: search.origin,
    arrival_id: search.destination,
    outbound_date: search.departureDate,
    type: search.returnDate ? "1" : "2",
    currency: search.currency,
    hl: "en",
    adults: String(Math.max(1, search.adults)),
    children: String(Math.max(0, search.children)),
    infants_on_lap: String(Math.max(0, search.infants)),
    api_key: key,
  });
  if (search.returnDate) params.set("return_date", search.returnDate);
  let raw: unknown;
  try {
    raw = await getJson(`https://serpapi.com/search?${params.toString()}`, {});
    trace?.push(`google: ${JSON.stringify(raw).slice(0, 400)}`);
  } catch (error) {
    trace?.push(`google: ${(error as Error).message.replace(key, "[key]")}`);
    return { flights: [], raw: null };
  }
  return { flights: mapGoogleFlights(raw, search, { groupPrice: GROUP_PRICE.google, destinationId }), raw };
}
