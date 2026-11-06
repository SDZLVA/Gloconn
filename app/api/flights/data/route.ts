/**
 * GET /api/flights/data?origin=&destination=&departureDate=&returnDate=&adults=&children=&infants=&currency=
 *
 * Milestone 45: flights from the Travelpayouts "Flight Data" API (RapidAPI)
 * for the Flights tab. Milestone 49: when it has no fares, live prices from
 * Sky Scrapper (Skyscanner) or SerpApi (Google Flights), capped and cached —
 * see features/flightsFallback. Preview only: &debug=1 returns the raw answer.
 */

import { checkRateLimitCustom, getClientIp } from "@/lib/api/rateLimit";
import { DataFlightsError, dataFlightsConfigured } from "@/features/flightsData/client";
import { searchFlightsWithFallback, visitorId, type FlightsSource } from "@/features/flightsFallback";
import type { Flight } from "@/types/models";

type Body = { ok: true; flights: Flight[]; source: FlightsSource } | { ok: false; code: string; message: string };

function json(body: Body | Record<string, unknown>, status = 200, cacheable = false): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cacheable ? "public, s-maxage=600, stale-while-revalidate=300" : "no-store",
    },
  });
}

const IATA = /^[A-Z]{3}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const int = (value: string | null, fallback: number, min: number, max: number) => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = (url.searchParams.get("origin") ?? "").toUpperCase();
  const destination = (url.searchParams.get("destination") ?? "").toUpperCase();
  const departureDate = url.searchParams.get("departureDate") ?? "";
  const returnDate = url.searchParams.get("returnDate") || null;
  if (!IATA.test(origin) || !IATA.test(destination) || !ISO_DATE.test(departureDate) || (returnDate && !ISO_DATE.test(returnDate))) {
    return json({ ok: false, code: "BAD_REQUEST", message: "Choose departure and destination from the suggestions, and dates." }, 400);
  }
  if (!dataFlightsConfigured()) {
    return json({ ok: false, code: "NOT_CONFIGURED", message: "Flight prices are not switched on yet." }, 503);
  }
  const rate = checkRateLimitCustom(`flights-data:${getClientIp(request)}`, 20, 60);
  if (!rate.allowed) return json({ ok: false, code: "RATE_LIMITED", message: "Too many searches. Please wait a minute." }, 429);

  const search = {
    origin,
    destination,
    departureDate,
    returnDate,
    adults: int(url.searchParams.get("adults"), 1, 1, 9),
    children: int(url.searchParams.get("children"), 0, 0, 8),
    infants: int(url.searchParams.get("infants"), 0, 0, 8),
    currency: /^[A-Z]{3}$/.test(url.searchParams.get("currency") ?? "") ? url.searchParams.get("currency")! : "EUR",
  };
  const debug = process.env.VERCEL_ENV === "preview" && url.searchParams.get("debug") === "1";
  // Crawlers never spend paid quota.
  const bot = /bot|crawl|spider|slurp|preview|headless/i.test(request.headers.get("user-agent") ?? "");
  try {
    const result = await searchFlightsWithFallback(search, { visitor: bot ? "" : visitorId(request.headers), debug });
    if (debug) return json({ source: result.source, why: result.why ?? null, trace: result.trace ?? [], raw: result.raw ?? null, mapped: result.flights.slice(0, 3) });
    return json({ ok: true, flights: result.flights, source: result.source }, 200, true);
  } catch (error) {
    const status = error instanceof DataFlightsError ? error.status : 0;
    console.error("[flights-data] search failed", status || (error as Error)?.name);
    if (debug) {
      return json({ error: true, status, name: (error as Error)?.name, message: (error as Error)?.message, detail: error instanceof DataFlightsError ? error.detail : "" }, 502);
    }
    return json({ ok: false, code: "PROVIDER_ERROR", message: "Flight prices are unavailable right now." }, 502);
  }
}
