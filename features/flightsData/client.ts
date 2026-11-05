import "server-only";

/**
 * Milestone 45 — Travelpayouts "Flight Data" API through RapidAPI.
 * Needs RAPIDAPI_KEY and the Travelpayouts token (TRAVELPAYOUTS_API_TOKEN,
 * sent as X-Access-Token). Host: RAPIDAPI_TRAVELPAYOUTS_HOST.
 * Cached prices from the last ~48 h of Aviasales searches — not live.
 */

import { getAppConfig } from "@/lib/config";
import { mapDataFlights, type DataFlightsSearch } from "@/features/flightsData/map";
import type { Flight } from "@/types/models";

const DEFAULT_HOST = "travelpayouts-travelpayouts-flight-data-v1.p.rapidapi.com";
const TIMEOUT_MS = 12_000;
const CACHE_MS = 10 * 60_000;
const cache = new Map<string, { at: number; flights: Flight[] }>();

export function dataFlightsConfigured(): boolean {
  return Boolean(process.env.RAPIDAPI_KEY?.trim() && getAppConfig().aviasales.apiToken?.trim());
}

export class DataFlightsError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Short provider answer, for preview debugging only. */
    readonly detail: string = "",
  ) {
    super(message);
  }
}

export async function searchDataFlights(
  search: DataFlightsSearch,
  destinationId = "",
): Promise<{ flights: Flight[]; raw: unknown }> {
  const key = process.env.RAPIDAPI_KEY?.trim();
  const token = getAppConfig().aviasales.apiToken?.trim();
  if (!key || !token) throw new DataFlightsError("Flight data API is not configured", 503);
  const cacheKey = JSON.stringify(search);
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_MS) return { flights: hit.flights, raw: null };

  const host = process.env.RAPIDAPI_TRAVELPAYOUTS_HOST?.trim() || DEFAULT_HOST;
  const params = new URLSearchParams({
    origin: search.origin,
    destination: search.destination,
    depart_date: search.departureDate,
    currency: search.currency.toLowerCase(),
    page: "1",
  });
  if (search.returnDate) params.set("return_date", search.returnDate);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`https://${host}/v1/prices/cheap?${params.toString()}`, {
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": host, "X-Access-Token": token, accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    const raw: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw new DataFlightsError(`Flight data ${response.status}`, response.status, `${host} ${JSON.stringify(raw)?.slice(0, 300)}`);
    }
    const flights = mapDataFlights(raw, search, destinationId);
    cache.set(cacheKey, { at: Date.now(), flights });
    if (cache.size > 300) cache.delete(cache.keys().next().value!);
    return { flights, raw };
  } finally {
    clearTimeout(timer);
  }
}
