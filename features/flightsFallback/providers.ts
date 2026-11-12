import "server-only";

/**
 * Milestone 49 — the two paid live-price providers. Every HTTP call first
 * takes one unit of quota (claimCall); over the cap → no call.
 *   Skyscanner Flights (RapidAPI, Crawlio, host skyscanner-flights4.p.rapidapi.com,
 *     200/month, slow: ~25 s), RAPIDAPI_KEY
 *   SerpApi Google Flights, SERPAPI_API_KEY
 */

import { mapGoogleFlights, mapSkyItineraries } from "@/features/flightsFallback/map";
import { claimCall } from "@/features/flightsFallback/store";
import type { DataFlightsSearch } from "@/features/flightsData/map";
import type { Flight } from "@/types/models";
import { getWorldIndex } from "@/lib/places/world";

/**
 * Google Flights wants airport codes; Glooconn often searches city codes
 * (ROM, LON). A city becomes its airports, comma-separated (max 7), biggest first.
 */
async function googleIds(code: string): Promise<string> {
  try {
    const idx = await getWorldIndex();
    const airports = idx.places
      .filter((p) => p.kind === "airport" && p.cityIata === code && p.iata !== code)
      .sort((a, b) => b.weight - a.weight)
      .map((p) => p.iata);
    return airports.length > 0 ? [...new Set(airports)].slice(0, 7).join(",") : code;
  } catch {
    return code;
  }
}

const SKY_HOST = "skyscanner-flights4.p.rapidapi.com";

/** Preview debugging: short notes about each provider call (no keys). */
export type Trace = string[];
const TIMEOUT_MS = 15_000;
const SKY_TIMEOUT_MS = 35_000;

/** Caps below the plans (Sky Scrapper 200/month, SerpApi 250/month). */
export const CAPS = {
  skyscanner: { daily: 8, monthly: 180 }, // plan: 200 / month
  google: { daily: 8, monthly: 225 },
} as const;

/** Whether the provider's price is for all travellers together (checked in M49 testing). */
// Tested on 2026-11-06: both give the whole group's price
// (Google €224 / Skyscanner €216 for 2 adults on a €112 / €109 fare).
const GROUP_PRICE = { skyscanner: true, google: true } as const;

async function getJson(url: string, headers: Record<string, string>, timeoutMs = TIMEOUT_MS): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
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

/** The caller has already taken one unit of quota (claimCall). */
async function sky(path: string, params: Record<string, string>, trace?: Trace): Promise<unknown | null> {
  const key = process.env.RAPIDAPI_KEY?.trim();
  if (!key) return null;
  try {
    const raw = await getJson(
      `https://${SKY_HOST}${path}?${new URLSearchParams(params).toString()}`,
      { "x-rapidapi-key": key, "x-rapidapi-host": SKY_HOST },
      SKY_TIMEOUT_MS,
    );
    trace?.push(`sky ${path}: ${JSON.stringify(raw).slice(0, 400)}`);
    return raw;
  } catch (error) {
    trace?.push(`sky ${path}: ${(error as Error).message}`);
    return null;
  }
}

/** capped (Milestone 59): the daily/monthly allowance was used up, so nothing was asked. */
export type ProviderAnswer = { flights: Flight[]; raw: unknown; capped?: boolean };

export async function searchSkyscanner(search: DataFlightsSearch, destinationId = "", trace?: Trace): Promise<ProviderAnswer> {
  if (!process.env.RAPIDAPI_KEY?.trim()) return { flights: [], raw: null };
  if (!(await claimCall("skyscanner", CAPS.skyscanner.daily, CAPS.skyscanner.monthly))) {
    trace?.push("skyscanner: over cap");
    return { flights: [], raw: null, capped: true };
  }
  // City codes work directly (ROM → "Rome (Any)"): one call per search.
  const params: Record<string, string> = {
    origin: search.origin,
    destination: search.destination,
    date: search.departureDate,
    adults: String(Math.max(1, search.adults + search.children)),
    limit: "30",
    offset: "0",
    cabin: "economy",
    market: "IT",
    locale: "en-US",
    currency: search.currency,
  };
  if (search.returnDate) params.return_date = search.returnDate;
  const raw = await sky(search.returnDate ? "/api/v1/roundtrip" : "/api/v1/search", params, trace);
  if (!raw) return { flights: [], raw: null };
  return { flights: mapSkyItineraries(raw, search, { groupPrice: GROUP_PRICE.skyscanner, destinationId }), raw };
}

export async function searchGoogle(search: DataFlightsSearch, destinationId = "", trace?: Trace): Promise<ProviderAnswer> {
  const key = process.env.SERPAPI_API_KEY?.trim();
  if (!key) return { flights: [], raw: null };
  if (!(await claimCall("google", CAPS.google.daily, CAPS.google.monthly))) {
    trace?.push("google: over cap");
    return { flights: [], raw: null, capped: true };
  }
  const params = new URLSearchParams({
    engine: "google_flights",
    departure_id: await googleIds(search.origin),
    arrival_id: await googleIds(search.destination),
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
    const r = raw as { error?: string; best_flights?: unknown[]; other_flights?: unknown[]; search_parameters?: unknown };
    trace?.push(
      `google: error=${r.error ?? "-"} best=${r.best_flights?.length ?? 0} other=${r.other_flights?.length ?? 0} ids=${params.get("departure_id")}>${params.get("arrival_id")} first=${JSON.stringify(r.best_flights?.[0] ?? r.other_flights?.[0] ?? null).slice(0, 300)}`,
    );
  } catch (error) {
    trace?.push(`google: ${(error as Error).message.replace(key, "[key]")}`);
    return { flights: [], raw: null };
  }
  return { flights: mapGoogleFlights(raw, search, { groupPrice: GROUP_PRICE.google, destinationId }), raw };
}
