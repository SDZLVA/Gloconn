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
import { mergeFlights, type DataFlightsSearch } from "@/features/flightsData/map";
import { searchGoogle, searchSkyscanner } from "@/features/flightsFallback/providers";
import { claimVisitor, readCache, storeConfigured, writeCache } from "@/features/flightsFallback/store";
import type { Flight } from "@/types/models";

const LIVE_TTL_MS = 6 * 60 * 60_000;
const EMPTY_TTL_MS = 60 * 60_000;
// One search can ask twice (Packages + Flights tab); 6 ≈ 3–6 searches a day.
export const VISITOR_LIMIT = 6;

export type FlightsSource = "travelpayouts" | "skyscanner" | "google" | "none";
export type FallbackResult = {
  flights: Flight[];
  source: FlightsSource;
  raw?: unknown;
  why?: string;
  trace?: string[];
  /** Milestone 57 (quick mode): a full search could still add live prices. */
  more?: boolean;
  /**
   * Milestone 59: no live prices because a limit was reached (this visitor's
   * daily lookups, or the providers' daily/monthly allowance) — not because
   * no flights exist. The page says so instead of "no flights found".
   */
  limited?: boolean;
};

/** Hashed visitor id from request headers (never store raw IPs). */
export function visitorId(headers: Headers): string {
  const ip = (headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || headers.get("x-real-ip") || "";
  if (!ip) return "";
  return createHash("sha256").update(`glooconn:${ip}`).digest("hex").slice(0, 32);
}

const liveKey = (s: DataFlightsSearch) =>
  `flights:v3:${s.origin}:${s.destination}:${s.departureDate}:${s.returnDate ?? "ow"}:${s.adults}-${s.children}-${s.infants}:${s.currency}`;

/** Fewer saved fares than this → also ask the live sources (Milestone 52). */
export const ENOUGH_SAVED_FARES = 5;

export async function searchFlightsWithFallback(
  search: DataFlightsSearch,
  /**
   * quick (Milestone 57): free sources only — saved fares and the saved live
   * answer, never Google/Skyscanner. `more` says whether a full search could
   * add live prices, so the page can show these first and then ask again.
   */
  options: { visitor: string; destinationId?: string; debug?: boolean; only?: string; quick?: boolean },
): Promise<FallbackResult> {
  const destinationId = options.destinationId ?? "";
  let saved: Flight[] = [];
  if (dataFlightsConfigured() && !(options.debug && options.only)) {
    saved = await searchDataFlights(search, destinationId)
      .then((r) => r.flights.map((f) => ({ ...f, source: "travelpayouts" as const })))
      .catch(() => [] as Flight[]);
    if (saved.length >= ENOUGH_SAVED_FARES) return { flights: saved, source: "travelpayouts" };
  }
  // Live answers are added to the saved fares (same flight kept once).
  const withSaved = (result: FallbackResult): FallbackResult => {
    if (saved.length === 0) return result;
    if (result.flights.length === 0) return { ...result, flights: saved, source: "travelpayouts" };
    return { ...result, flights: mergeFlights(saved, result.flights) };
  };
  if (!storeConfigured()) return withSaved({ flights: [], source: "none", why: "no SUPABASE_SERVICE_ROLE_KEY" });

  const key = liveKey(search);
  // Preview debug skips the saved answer so a fix can be tested at once.
  const cached = options.debug ? null : await readCache<FallbackResult>(key);
  if (cached) return withSaved({ flights: cached.flights ?? [], source: cached.source ?? "none" });
  if (options.quick) return { ...withSaved({ flights: [], source: "none" }), more: true };
  // Preview (only used for testing) skips the per-visitor limit; provider caps still apply.
  const preview = process.env.VERCEL_ENV === "preview";
  if (!options.debug && !preview && !(await claimVisitor(options.visitor, VISITOR_LIMIT))) {
    return withSaved({ flights: [], source: "none", why: options.visitor ? "visitor limit or store error" : "no visitor id", limited: true });
  }

  const trace: string[] = [];
  let capped = false;
  for (const [source, run] of [
    // Google answers in ~3 s; Skyscanner takes ~25 s, so it goes second.
    ["google", searchGoogle],
    ["skyscanner", searchSkyscanner],
  ] as const) {
    if (options.debug && options.only && options.only !== source) continue;
    const found = await run(search, destinationId, trace).catch((e: unknown) => {
      trace.push(`${source} failed: ${(e as Error)?.message ?? e}`);
      return { flights: [] as Flight[], raw: null as unknown, capped: false };
    });
    if (found.capped) capped = true;
    if (found.flights.length > 0) {
      const result: FallbackResult = { flights: found.flights.slice(0, 30), source };
      await writeCache(key, result, LIVE_TTL_MS);
      return withSaved(options.debug ? { ...result, raw: found.raw, trace } : result);
    }
  }
  // A provider over its allowance didn't really search: say so, and don't keep the empty answer.
  const none: FallbackResult = { flights: [], source: "none", ...(capped ? { limited: true } : {}) };
  if (!capped) await writeCache(key, none, EMPTY_TTL_MS);
  return withSaved(options.debug ? { ...none, why: capped ? "provider allowance used up" : "providers found nothing", trace } : none);
}
