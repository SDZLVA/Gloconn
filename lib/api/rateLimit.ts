/**
 * In-process IP-keyed sliding-window rate limiter for API and auth routes.
 *
 * Uses the existing TTL cache as the backing store. No external service or
 * additional package required. Suitable for a single-process Next.js dev
 * server or a serverless function instance — each instance has its own
 * counter, which is acceptable for MVP abuse protection. A shared store
 * (Redis/Upstash) can replace this when multi-instance protection is needed.
 *
 * Default limits (POST /api/search):
 *  - 10 requests per minute  (burst protection)
 *  - 100 requests per hour   (sustained abuse protection)
 *
 * Auth endpoint limits (see AUTH_RATE_LIMITS):
 *  - /auth/callback GET: 5 / min, 20 / hr  (OAuth codes are single-use)
 *  - /auth/signout  POST: 20 / min, 60 / hr (low-credential, signout-loop guard)
 *
 * Inherent limitation: limits are per-process. An attacker rotating the
 * x-forwarded-for header (when no proxy enforces real-IP) can bypass
 * per-IP limits. See F-12 for distributed mitigation path.
 */

import { clearCache, deleteCached, getCached, setCached } from "@/lib/api/cache";

/** Milliseconds per window. */
const WINDOW_MINUTE_MS = 60_000;
const WINDOW_HOUR_MS = 3_600_000;

/** Maximum requests allowed within each window (default: POST /api/search). */
const LIMIT_PER_MINUTE = 10;
const LIMIT_PER_HOUR = 100;

/** Cache key prefixes — separate namespace from OAuth tokens. */
const PREFIX_MINUTE = "rl:m:";
const PREFIX_HOUR = "rl:h:";

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number; reason: string };

/**
 * Per-endpoint auth rate-limit configuration (F-07).
 *
 * Endpoint          | Limit/min | Limit/hr | Rationale
 * ------------------|-----------|----------|------------------------------------
 * GET /auth/callback|     5     |    20    | OAuth code is single-use per login;
 *                   |           |          | > 5 requests/min = likely abuse
 * POST /auth/signout|    20     |    60    | Credential-free; guards signout loops
 *
 * /login and /signup pages are static Next.js pages. The actual credential
 * submission (signInWithPassword, signUp) goes directly from the browser to
 * Supabase's own API — it does not pass through any route handler we control.
 * Page-level rate limiting would only slow down page loads, not credential
 * stuffing. Supabase has its own built-in brute-force protection on those SDK
 * calls. Rate limiting is therefore not applied to the page routes.
 */
export const AUTH_RATE_LIMITS = {
  "/auth/callback": { perMinute: 5, perHour: 20 },
  "/auth/signout": { perMinute: 20, perHour: 60 },
} as const;

export type AuthRateLimitedPath = keyof typeof AUTH_RATE_LIMITS;

/**
 * Checks and records one request from the given IP address against the
 * default limits (10/min, 100/hr) — used by POST /api/search.
 *
 * Returns `{ allowed: true }` when the request is within limits.
 * Returns `{ allowed: false, retryAfterMs, reason }` when exceeded.
 *
 * @param ip - Client IP address string. Must be non-empty.
 */
export function checkRateLimit(ip: string): RateLimitResult {
  return checkRateLimitCustom(ip, LIMIT_PER_MINUTE, LIMIT_PER_HOUR);
}

/**
 * Checks and records one request with caller-supplied per-minute and per-hour
 * limits. Used for auth endpoints that require different thresholds (F-07).
 *
 * The cache key namespace includes the limits so that a single IP can have
 * independent counters for different endpoints (e.g. /api/search vs /auth/callback).
 *
 * @param ip           - Client IP address string. Must be non-empty.
 * @param limitPerMin  - Maximum requests allowed per 60-second window.
 * @param limitPerHour - Maximum requests allowed per 3600-second window.
 */
export function checkRateLimitCustom(
  ip: string,
  limitPerMin: number,
  limitPerHour: number,
): RateLimitResult {
  // Include limits in the cache key so different endpoints get independent buckets.
  const ns = `${limitPerMin}:${limitPerHour}`;

  const minuteKey = `${PREFIX_MINUTE}${ns}:${ip}`;
  const minuteCount = (getCached<number>(minuteKey) ?? 0) + 1;

  if (minuteCount > limitPerMin) {
    return { allowed: false, retryAfterMs: WINDOW_MINUTE_MS, reason: "rate_limit_minute" };
  }

  const hourKey = `${PREFIX_HOUR}${ns}:${ip}`;
  const hourCount = (getCached<number>(hourKey) ?? 0) + 1;

  if (hourCount > limitPerHour) {
    return { allowed: false, retryAfterMs: WINDOW_HOUR_MS, reason: "rate_limit_hour" };
  }

  setCached(minuteKey, minuteCount, WINDOW_MINUTE_MS);
  setCached(hourKey, hourCount, WINDOW_HOUR_MS);

  return { allowed: true };
}

/**
 * Extracts the best available client IP from a Next.js Route Handler Request.
 *
 * Checks (in order):
 *  1. x-forwarded-for  (reverse proxy / CDN — first IP in the list)
 *  2. x-real-ip        (some proxies)
 *  3. Falls back to "unknown" — treated as one shared bucket, not blocked.
 *
 * Never throws. Returns a trimmed, lowercase string.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0];
    if (first) return first.trim().toLowerCase();
  }

  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim().toLowerCase();

  return "unknown";
}

/**
 * Exposed for tests only — resets all rate-limit counters.
 * Do not call in production code.
 */
export function _resetRateLimitCache(): void {
  clearCache();
}

/**
 * Exposed for tests only — resets default rate-limit counters for one IP
 * (i.e. the counters used by checkRateLimit with the default 10/min, 100/hr limits).
 */
export function _resetRateLimitForIp(ip: string): void {
  const ns = `${LIMIT_PER_MINUTE}:${LIMIT_PER_HOUR}`;
  deleteCached(`${PREFIX_MINUTE}${ns}:${ip}`);
  deleteCached(`${PREFIX_HOUR}${ns}:${ip}`);
}
