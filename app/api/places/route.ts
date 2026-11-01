/**
 * GET /api/places?q=par&kind=cities|all — Milestone 34: worldwide search-box
 * suggestions (cities with an airport; plus airports when kind=all).
 */

import { checkRateLimitCustom, getClientIp } from "@/lib/api/rateLimit";
import { getWorldIndex, searchWorld } from "@/lib/places/world";

export type PlaceSuggestion = { id: string; label: string; description: string; kind: "city" | "airport"; name: string; country: string; iata: string; cityIata: string };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, 60);
  const kinds = url.searchParams.get("kind") === "all" ? (["city", "airport"] as const) : (["city"] as const);
  const rate = checkRateLimitCustom(`places:${getClientIp(request)}`, 120, 2000);
  if (!rate.allowed) return Response.json({ places: [] }, { status: 429 });
  try {
    const idx = await getWorldIndex();
    const places: PlaceSuggestion[] = searchWorld(idx, q, [...kinds], 8).map((p) => ({
      id: p.id,
      label: p.kind === "city" ? p.label : p.label,
      description: p.kind === "city" ? `City · ${p.iata}` : `Airport · ${p.cityName}`,
      kind: p.kind,
      name: p.kind === "city" ? p.cityName : p.name,
      country: p.country,
      iata: p.iata,
      cityIata: p.cityIata,
    }));
    return Response.json({ places }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400" } });
  } catch {
    return Response.json({ places: [] }, { status: 503 });
  }
}
