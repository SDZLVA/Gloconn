/**
 * POST /api/search/date-options — scout explore for flexible date pairs.
 *
 * Body: SearchRequest JSON with flexDays 1–3.
 * Success data: SearchDateOptionsResult (per-pair cheapest totals).
 *
 * Security / cost:
 *  - Separate IP rate limit (3/min, 20/hr) — one HTTP tick per explore click.
 *  - Body size guard (64 KB).
 *  - EXPLORE_DATES_ENABLED kill switch (503 EXPLORE_DISABLED).
 *  - Server TTL cache (~15 min) via lib/api/cache (per instance only).
 */

import { getAppConfig } from "@/lib/config";
import { toErrorJsonResponse, toJsonResponse } from "@/lib/api/responses";
import {
  checkExploreDatesRateLimit,
  getClientIp,
} from "@/lib/api/rateLimit";
import { exploreDateOptions } from "@/lib/services/dateOptionsExploreService";
import type { SearchRequest } from "@/types/models/search-request";

/**
 * Max execution time (seconds) for this slow scout route.
 * Must exceed DATE_OPTIONS_TIME_BUDGET_MS (25s) plus enrichment overhead.
 * Platforms (e.g. Vercel) may still cap lower on Hobby plans.
 * @see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/maxDuration.md
 */
export const maxDuration = 30;

/** Maximum accepted request body size in bytes (64 KB) — same as /api/search. */
const MAX_BODY_BYTES = 64 * 1024;

export async function POST(request: Request) {
  // --- Kill switch (protect SerpAPI monthly quota) ---
  if (!getAppConfig().features.exploreDatesEnabled) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: "EXPLORE_DISABLED",
          message:
            "Flexible date explore is temporarily turned off. Please try again later.",
        },
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Rate limit (separate bucket from POST /api/search) ---
  const ip = getClientIp(request);
  const rateCheck = checkExploreDatesRateLimit(ip);

  if (!rateCheck.allowed) {
    const retryAfterSec = Math.ceil(rateCheck.retryAfterMs / 1000);
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message:
            "Too many flexible-date explores. Please wait before trying again.",
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

  // --- Body size guard ---
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
    const result = await exploreDateOptions(body);
    return toJsonResponse(result);
  } catch {
    // Never leak provider / SerpAPI details to the client.
    return toErrorJsonResponse(null, "Invalid explore request body.");
  }
}
