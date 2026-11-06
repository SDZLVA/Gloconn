import "server-only";

/**
 * Milestone 49 — flights with fallbacks (replaces the White Label live box):
 *   1. Travelpayouts saved fares (free)          — always first
 *   2. Saved live answer (Supabase, 6 h)          — free
 *   3. Sky Scrapper / Skyscanner (capped)         — only if 1–2 found nothing
 *   4. SerpApi Google Flights (capped)            — only if 3 found nothing
 * A visitor (hashed IP) can trigger at most VISITOR_LIMIT paid lookups a day.
 */

import { createHash } from "node:crypto";
import { dataFlightsConfigured, searchDataFlights } from "@/features/flightsData/client";
import type { DataFlightsSearch } from "@/features/flightsData/map";
import { searchGoogle, searchSkyscanner } from "@/features/flightsFallback/providers";
import { claimVisitor, readCache, storeConfigured, writeCache } from "@/features/flightsFallback/store";
import type { Flight } from "@/types/models";

const LIVE_TTL_MS = 6 * 60 * 60_000;
const EMPTY_TTL_MS = 60 * 60_000;
export const VISITOR_LIMIT = 3;

export type FlightsSource = "travelpayouts" | "skyscanner" | "google" | "none";
export type FallbackResult = { flights: Flight[]; source: FlightsSource; raw?: unknown; why?: string };

/** Hashed visitor id from request headers (never store raw IPs). */
export function visitorId(headers: Headers): string {
  const ip = (headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || headers.get("x-real-ip") || "";
  if (!ip) return "";
  return createHash("sha256").update(`glooconn:${ip}`).digest("hex").slice(0, 32);
}

const liveKey = (s: DataFlightsSearch) =>
  `flights:${s.origin}:${s.destination}:${s.departureDate}:${s.returnDate ?? "ow"}:${s.adults}-${s.children}-${s.infants}:${s.currency}`;

export async function searchFlightsWithFallback(
  search: DataFlightsSearch,
  options: { visitor: string; destinationId?: string; debug?: boolean },
): Promise<FallbackResult> {
  const destinationId = options.destinationId ?? "";
  if (dataFlightsConfigured()) {
    const saved = await searchDataFlights(search, destinationId)
      .then((r) => r.flights)
      .catch(() => [] as Flight[]);
    if (saved.length > 0) return { flights: saved.map((f) => ({ ...f, source: "travelpayouts" as const })), source: "travelpayouts" };
  }
  if (!storeConfigured()) return { flights: [], source: "none", why: "no SUPABASE_SERVICE_ROLE_KEY" };

  const key = liveKey(search);
  const cached = await readCache<FallbackResult>(key);
  if (cached) return { flights: cached.flights ?? [], source: cached.source ?? "none" };
  if (!(await claimVisitor(options.visitor, VISITOR_LIMIT))) {
    return { flights: [], source: "none", why: options.visitor ? "visitor limit or store error" : "no visitor id" };
  }

  for (const [source, run] of [
    ["skyscanner", searchSkyscanner],
    ["google", searchGoogle],
  ] as const) {
    const found = await run(search, destinationId).catch(() => ({ flights: [] as Flight[], raw: null as unknown }));
    if (found.flights.length > 0) {
      const result: FallbackResult = { flights: found.flights.slice(0, 30), source };
      await writeCache(key, result, LIVE_TTL_MS);
      return options.debug ? { ...result, raw: found.raw } : result;
    }
  }
  const none: FallbackResult = { flights: [], source: "none", ...(options.debug ? { why: "providers found nothing" } : {}) };
  await writeCache(key, none, EMPTY_TTL_MS);
  return none;
}
