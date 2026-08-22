/**
 * GET /api/hotels/details?ref=...&hotelId=...
 *
 * On-demand hotel property details (Sprint 17.3 / 17.5.1).
 * Browser sends a sealed `ref` (+ optional hotelId) — never a provider token.
 */

import { toJsonResponse } from "@/lib/api/responses";
import { checkRateLimitCustom, getClientIp } from "@/lib/api/rateLimit";
import { runService } from "@/lib/api/types";
import { getHotelPropertyDetails } from "@/lib/services/hotelPropertyDetailsService";

/** Hotel details: slightly higher than search — users reopen drawers. */
const DETAILS_LIMIT_PER_MINUTE = 20;
const DETAILS_LIMIT_PER_HOUR = 120;

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateCheck = checkRateLimitCustom(
    ip,
    DETAILS_LIMIT_PER_MINUTE,
    DETAILS_LIMIT_PER_HOUR,
  );

  if (!rateCheck.allowed) {
    const retryAfterSec = Math.ceil(rateCheck.retryAfterMs / 1000);
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please wait before trying again.",
        },
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfterSec),
        },
      },
    );
  }

  const url = new URL(request.url);
  const ref = url.searchParams.get("ref") ?? "";
  const hotelId = url.searchParams.get("hotelId") ?? "";

  const result = await runService(
    () => getHotelPropertyDetails({ ref, hotelId }),
    "Some hotel details are unavailable right now.",
  );

  return toJsonResponse(result);
}
