/**
 * GET /api/hotels/live?destination=&checkin=&checkout=&adults=&children=&rooms=&currency=
 *
 * Milestone 30: live hotels (LiteAPI) for the Hotels tab. Results are kept
 * for 10 minutes (memory + CDN) so repeated searches don't call LiteAPI
 * again — LiteAPI's search is free only at a reasonable look-to-book ratio.
 */

import { checkRateLimitCustom, getClientIp } from "@/lib/api/rateLimit";
import { nightsBetween } from "@/features/liveHotels/filters";
import { LiteApiError, liteApiKey, searchLiteApiHotels } from "@/features/liveHotels/liteapi/client";
import { placeFromLabel } from "@/features/liveHotels/liteapi/location";
import type { LiveHotelsResponse, LiveHotelsSearch } from "@/features/liveHotels/types";

const CACHE_MS = 10 * 60_000;
const cache = new Map<string, { at: number; body: LiveHotelsResponse }>();

function json(body: LiveHotelsResponse, status = 200, cacheable = false): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cacheable ? "public, s-maxage=600, stale-while-revalidate=300" : "no-store",
    },
  });
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const int = (value: string | null, fallback: number, min: number, max: number) => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search: LiveHotelsSearch = {
    destination: (url.searchParams.get("destination") ?? "").trim().slice(0, 120),
    checkin: url.searchParams.get("checkin") ?? "",
    checkout: url.searchParams.get("checkout") ?? "",
    adults: int(url.searchParams.get("adults"), 2, 1, 16),
    children: int(url.searchParams.get("children"), 0, 0, 10),
    rooms: int(url.searchParams.get("rooms"), 1, 1, 8),
    currency: /^[A-Z]{3}$/.test(url.searchParams.get("currency") ?? "") ? url.searchParams.get("currency")! : "EUR",
  };
  if (!search.destination || !ISO_DATE.test(search.checkin) || !ISO_DATE.test(search.checkout) || search.checkout <= search.checkin) {
    return json({ ok: false, code: "BAD_REQUEST", message: "Choose a destination and check-in / check-out dates." }, 400);
  }
  if (!liteApiKey()) {
    return json({ ok: false, code: "NOT_CONFIGURED", message: "Live hotel prices are not switched on yet." }, 503);
  }
  const place = placeFromLabel(search.destination);
  if (!place) {
    return json({ ok: false, code: "UNKNOWN_PLACE", message: "Pick the destination from the suggestions (city and country)." }, 400);
  }

  // Preview deployments only: show one raw LiteAPI item to check the field mapping.
  const debug = process.env.VERCEL_ENV === "preview" && url.searchParams.get("debug") === "1";

  const key = JSON.stringify(search);
  const hit = debug ? undefined : cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return json(hit.body, 200, true);

  const ip = getClientIp(request);
  const rate = checkRateLimitCustom(`hotels:${ip}`, 10, 60);
  if (!rate.allowed) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many searches. Please wait a minute." }, 429);
  }

  // Prices can depend on the guest's country; Vercel tells us the visitor's.
  const nationality = /^[A-Z]{2}$/.test(request.headers.get("x-vercel-ip-country") ?? "")
    ? request.headers.get("x-vercel-ip-country")!
    : "US";

  try {
    const { hotels, raw } = await searchLiteApiHotels(search, place, nationality);
    if (debug) {
      const r = (raw ?? {}) as { data?: unknown[]; hotels?: unknown[] };
      return new Response(
        JSON.stringify({ sampleData: r.data?.[0] ?? null, sampleHotel: r.hotels?.[0] ?? null, count: r.data?.length ?? 0, mapped: hotels.slice(0, 2) }),
        { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
      );
    }
    const body: LiveHotelsResponse = {
      ok: true,
      hotels,
      nights: nightsBetween(search.checkin, search.checkout),
      currency: search.currency,
      location: `${place.cityName}, ${place.countryCode}`,
    };
    cache.set(key, { at: Date.now(), body });
    if (cache.size > 200) cache.delete(cache.keys().next().value!);
    return json(body, 200, true);
  } catch (error) {
    const status = error instanceof LiteApiError ? error.status : 0;
    console.error("[liteapi] search failed", status || (error as Error)?.name);
    return json({ ok: false, code: "PROVIDER_ERROR", message: "Live hotel prices are unavailable right now. Please try again." }, 502);
  }
}
