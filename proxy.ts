import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/auth/middleware";
import {
  AUTH_RATE_LIMITS,
  checkRateLimitCustom,
  getClientIp,
  type AuthRateLimitedPath,
} from "@/lib/api/rateLimit";
import {
  applySecurityHeaders,
  buildCsp,
  createCspRequestHeaders,
  generateCspNonce,
} from "@/lib/security/csp";

// ---------------------------------------------------------------------------
// F-07: Auth endpoint rate limiting
//
// Endpoint            | Limit/min | Limit/hr | Rationale
// --------------------|-----------|----------|-------------------------------
// GET /auth/callback  |     5     |    20    | OAuth code is single-use
// POST /auth/signout  |    20     |    60    | Guards sign-out loop attacks
//
// /login and /signup are static pages; credential submission goes directly
// to Supabase's own API from the browser and is not interceptable here.
// Page-level rate limiting would not reduce credential stuffing. Supabase
// applies its own brute-force protection on auth.signInWithPassword / signUp.
//
// Limitation: limits are per-process (in-memory). See F-12.
// ---------------------------------------------------------------------------

function applyAuthRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  const limits = AUTH_RATE_LIMITS[pathname as AuthRateLimitedPath];
  if (!limits) return null;

  const ip = getClientIp(request);
  const result = checkRateLimitCustom(ip, limits.perMinute, limits.perHour);

  if (!result.allowed) {
    const retryAfterSec = Math.ceil(result.retryAfterMs / 1000);
    return new NextResponse(
      JSON.stringify({ error: "Too Many Requests", retryAfterSec }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfterSec),
        },
      },
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// F-06: Content Security Policy (nonce-based)
//
// Next.js 16.3 applies script nonces during SSR by reading the
// Content-Security-Policy header from the **incoming request** (forwarded via
// NextResponse.next({ request: { headers } })). Setting CSP only on the
// response is insufficient — scripts would lack matching nonces and hydration
// would fail under a strict script-src.
//
// Resource inventory — what this application actually loads:
//
//   scripts       'self' + per-request nonce + 'strict-dynamic'
//   styles        'self' + 'unsafe-inline' (Next.js critical CSS; no style nonce)
//   fonts         'self' — Geist/Geist Mono self-hosted by next/font
//   images        'self' + lh3.googleusercontent.com + data:
//   connect       'self' + *.supabase.co
//   frames        ancestors 'none'
//   form-action   'self'
//   base-uri      'self'
//   object-src    'none'
//
// Why NOT script-src 'unsafe-inline':
//   Defeats CSP XSS protection. Nonce + strict-dynamic is the supported path.
// ---------------------------------------------------------------------------

/**
 * Proxy entry point — rate limit, session refresh, CSP nonce propagation.
 */
export async function proxy(request: NextRequest) {
  const rateLimitResponse = applyAuthRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const nonce = generateCspNonce();
  const csp = buildCsp(nonce);

  // Rebuild headers after any cookie mutations so Cookie + CSP stay in sync.
  const buildRequestHeaders = (): Headers =>
    createCspRequestHeaders(request.headers, nonce, csp);

  const sessionResponse = await updateSession(request, {
    createNextResponse: () =>
      NextResponse.next({
        request: {
          headers: buildRequestHeaders(),
        },
      }),
  });

  return applySecurityHeaders(sessionResponse, csp);
}

export const config = {
  matcher: [
    /*
     * Match page navigations; skip static assets.
     * Prefetch skips reduce unnecessary nonce churn (Next.js CSP guide).
     */
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
