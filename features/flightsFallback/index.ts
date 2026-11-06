import "server-only";

/**
 * Milestone 49 — flights with fallbacks (replaces the White Label live box):
 *   1. Travelpayouts saved fares (free)          — always first
 *   2. Saved live answer (Supabase, 6 h)          — free
 *   3. SerpApi Google Flights (capped, ~3 s)      — only if 1–2 found nothing
 *   4. Skyscanner Flights, RapidAPI (capped, ~25 s) — only if 3 found nothing
 * A visitor (hashed IP) can trigger at most VISITOR_LIMIT paid lookups a day.
 */

import { createHash } from "node:crypto";
// options.debug is only ever true on Vercel Preview (see app/api/flights/data/route.ts).
import { dataFlightsConfigured, searchDataFlights } from "@/features/flightsData/client";
import type { DataFlightsSearch } from "@/features/flightsData/map";
import { searchGoogle, searchSkyscanner } from "@/features/flightsFallback/providers";
import { claimVisitor, readCache, storeConfigured, writeCache } from "@/features/flightsFallback/store";
import type { Flight } from "@/types/models";

const LIVE_TTL_MS = 6 * 60 * 60_000;
const EMPTY_TTL_MS = 60 * 60_000;
export const VISITOR_LIMIT = 3;

export type FlightsSource = "travelpayouts" | "skyscanner" | "google" | "none";
export type FallbackResult = { flights: Flight[]; source: FlightsSource; raw?: unknown; why?: string; trace?: string[] };

/** Hashed visitor id from request headers (never store raw IPs). */
export function visitorId(headers: Headers): string {
  const ip = (headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || headers.get("x-real-ip") || "";
  if (!ip) return "";
  return createHash("sha256").update(`glooconn:${ip}`).digest("hex").slice(0, 32);
}

const liveKey = (s: DataFlightsSearch) =>
  `flights:v2:${s.origin}:${s.destination}:${s.departureDate}:${s.returnDate ?? "ow"}:${s.adults}-${s.children}-${s.infants}:${s.currency}`;

export async function searchFlightsWithFallback(
  search: DataFlightsSearch,
  options: { visitor: string; destinationId?: string; debug?: boolean; only?: string },
): Promise<FallbackResult> {
  const destinationId = options.destinationId ?? "";
  if (dataFlightsConfigured() && !(options.debug && options.only)) {
    const saved = await searchDataFlights(search, destinationId)
      .then((r) => r.flights)
      .catch(() => [] as Flight[]);
    if (saved.length > 0) return { flights: saved.map((f) => ({ ...f, source: "travelpayouts" as const })), source: "travelpayouts" };
  }
  if (!storeConfigured()) return { flights: [], source: "none", why: "no SUPABASE_SERVICE_ROLE_KEY" };

  const key = liveKey(search);
  // Preview debug skips the saved answer so a fix can be tested at once.
  const cached = options.debug ? null : await readCache<FallbackResult>(key);
  if (cached) return { flights: cached.flights ?? [], source: cached.source ?? "none" };
  // Preview debug (my own tests) skips the per-visitor limit; provider caps still apply.
  if (!options.debug && !(await claimVisitor(options.visitor, VISITOR_LIMIT))) {
    return { flights: [], source: "none", why: options.visitor ? "visitor limit or store error" : "no visitor id" };
  }

  const trace: string[] = [];
  for (const [source, run] of [
    // Google answers in ~3 s; Skyscanner takes ~25 s, so it goes second.
    ["google", searchGoogle],
    ["skyscanner", searchSkyscanner],
  ] as const) {
    if (options.debug && options.only && options.only !== source) continue;
    const found = await run(search, destinationId, trace).catch((e: unknown) => {
      trace.push(`${source} failed: ${(e as Error)?.message ?? e}`);
      return { flights: [] as Flight[], raw: null as unknown };
    });
    if (found.flights.length > 0) {
      const result: FallbackResult = { flights: found.flights.slice(0, 30), source };
      await writeCache(key, result, LIVE_TTL_MS);
      return options.debug ? { ...result, raw: found.raw, trace } : result;
    }
  }
  const none: FallbackResult = { flights: [], source: "none" };
  await writeCache(key, none, EMPTY_TTL_MS);
  return options.debug ? { ...none, why: "providers found nothing", trace } : none;
}
