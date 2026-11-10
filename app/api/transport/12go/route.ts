/**
 * GET /api/transport/12go?from=Bangkok, Thailand&to=Chiang Mai, Thailand&currency=EUR
 * Milestone 55: 12Go partner timetable for the Mixed Transport page.
 */

import { checkRateLimitCustom, getClientIp } from "@/lib/api/rateLimit";
import { placeFromLabel } from "@/features/liveHotels/liteapi/location";
import { getTwelveGoTimetable } from "@/features/twelveGo/client";

const NAME = /^[\p{L}\p{M}0-9 .'’()-]{2,60}$/u;

function json(body: unknown, status = 200, cacheable = false): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cacheable ? "public, s-maxage=21600, stale-while-revalidate=3600" : "no-store",
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = placeFromLabel(url.searchParams.get("from") ?? "");
  const to = placeFromLabel(url.searchParams.get("to") ?? "", from?.countryCode);
  const currency = /^[A-Z]{3}$/.test(url.searchParams.get("currency") ?? "") ? url.searchParams.get("currency")! : "EUR";
  if (!from || !to || !NAME.test(from.cityName) || !NAME.test(to.cityName)) {
    return json({ ok: false, routes: [] }, 400);
  }
  const rate = checkRateLimitCustom(`12go:${getClientIp(request)}`, 30, 60);
  if (!rate.allowed) return json({ ok: false, routes: [] }, 429);
  const routes = await getTwelveGoTimetable({ country: from.countryCode, from: from.cityName, to: to.cityName, currency });
  return json({ ok: true, routes }, 200, routes.length > 0);
}
