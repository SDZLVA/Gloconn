import { visitorId } from "@/features/flightsFallback";
/**
 * POST /api/search — runs a validated trip search via the service layer.
 * Body: partial or full SearchRequest JSON.
 * Success data: SearchResponse (domain arrays + optional warnings).
 *
 * Security (F-01):
 *  - IP-keyed sliding-window rate limit (10/min, 100/hr) — rejects with 429.
 *  - Body size guard — rejects payloads > 64 KB with 400.
 *  - Anonymous searching is intentionally allowed (MVP product requirement).
 */

import { toErrorJsonResponse, toJsonResponse } from "@/lib/api/responses";
import { checkRateLimit, getClientIp } from "@/lib/api/rateLimit";
import { searchTrips } from "@/lib/services/searchService";
import type { SearchRequest } from "@/types/models/search-request";

/** Maximum accepted request body size in bytes (64 KB). */
const MAX_BODY_BYTES = 64 * 1024;

export async function POST(request: Request) {
  // --- F-01: rate limiting ---
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(ip);

  if (!rateCheck.allowed) {
    const retryAfterSec = Math.ceil(rateCheck.retryAfterMs / 1000);
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please wait before searching again.",
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

  // --- F-01: body size guard ---
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Request body too large." },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const body = (await request.json()) as Partial<SearchRequest>;
    // Milestone 40: hotel prices can depend on the visitor's country.
    const country = request.headers.get("x-vercel-ip-country") ?? "";
    const bot = /bot|crawl|spider|slurp|preview|headless/i.test(request.headers.get("user-agent") ?? "");
    const visitor = bot ? "" : visitorId(request.headers);
    const result = await searchTrips(body, { ...(/^[A-Z]{2}$/.test(country) ? { guestNationality: country } : {}), visitor });
    return toJsonResponse(result);
  } catch {
    return toErrorJsonResponse(null, "Invalid search request body.");
  }
}
