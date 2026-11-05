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
const DIRECT_BASE = "https://api.travelpayouts.com";
const TIMEOUT_MS = 6_000;
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

  const query = params.toString();
  // 1) RapidAPI proxy. 2) If RapidAPI answers with an error (its listing has
  // returned 404 for this path), the same Travelpayouts data API directly,
  // with the same token — same provider, same cached prices.
  const attempts: Array<{ url: string; headers: Record<string, string> }> = [
    {
      url: `https://${host}/v1/prices/cheap?${query}`,
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": host, "X-Access-Token": token, accept: "application/json" },
    },
    {
      url: `${DIRECT_BASE}/v1/prices/cheap?${query}`,
      headers: { "X-Access-Token": token, accept: "application/json" },
    },
  ];
  const details: string[] = [];
  let lastStatus = 502;
  for (const attempt of attempts) {
    const result = await fetchJson(attempt.url, attempt.headers);
    if (result.ok) {
      const flights = mapDataFlights(result.raw, search, destinationId);
      cache.set(cacheKey, { at: Date.now(), flights });
      if (cache.size > 300) cache.delete(cache.keys().next().value!);
      return { flights, raw: result.raw };
    }
    lastStatus = result.status;
    details.push(`${new URL(attempt.url).host} ${result.status} ${result.text.slice(0, 200)}`);
  }
  throw new DataFlightsError(`Flight data ${lastStatus}`, lastStatus, details.join(" | "));
}

async function fetchJson(
  url: string,
  headers: Record<string, string>,
): Promise<{ ok: boolean; status: number; raw: unknown; text: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers, signal: controller.signal, cache: "no-store" });
    const text = await response.text().catch(() => "");
    let raw: unknown = null;
    try {
      raw = JSON.parse(text);
    } catch {
      raw = null;
    }
    const ok = response.ok && raw !== null && typeof raw === "object" && (raw as { success?: boolean }).success !== false;
    return { ok, status: response.status, raw, text };
  } catch (error) {
    return { ok: false, status: 504, raw: null, text: error instanceof Error ? error.name : "fetch failed" };
  } finally {
    clearTimeout(timer);
  }
}
