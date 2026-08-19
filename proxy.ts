import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/auth/middleware";
import {
  AUTH_RATE_LIMITS,
  checkRateLimitCustom,
  getClientIp,
  type AuthRateLimitedPath,
} from "@/lib/api/rateLimit";

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
// Resource inventory — what this application actually loads:
//
//   scripts       'self' only — all JS is bundled by Next.js, no CDN scripts
//   styles        'self' only — Tailwind CSS bundled, no external stylesheets
//   fonts         'self' only — Geist/Geist Mono are self-hosted by next/font
//                 (downloaded at build time into /_next/static; no runtime
//                  request to fonts.googleapis.com or fonts.gstatic.com)
//   images        'self' + lh3.googleusercontent.com (Google OAuth avatars)
//                 + data: (base64 inline images, if any)
//   connect       'self' + *.supabase.co (Supabase JS SDK XHR/fetch for auth,
//                 database, storage)
//   frames        'none' — no iframes used
//   form-action   'self' — sign-out uses <form action="/auth/signout">
//   base-uri      'self' — prevent base-tag hijacking
//   object-src    'none' — no Flash/PDF plugins
//
// Script nonce approach:
//   A per-request nonce is generated and included in the CSP.
//   Next.js App Router extracts the nonce from the CSP header and applies it
//   to all framework-injected <script> and <style> tags automatically.
//   'strict-dynamic' allows scripts loaded by nonced scripts without listing
//   each bundle hash. 'unsafe-eval' is only set in development (React uses
//   eval() to reconstruct server-side error stacks in the browser).
//
// Why NOT unsafe-inline:
//   'unsafe-inline' in script-src defeats CSP's XSS protection entirely.
//   The nonce approach provides real protection at negligible overhead.
//
// Supabase domains:
//   The Supabase project URL is instance-specific (e.g. abc123.supabase.co).
//   Using the wildcard *.supabase.co is the minimal allowlist that covers all
//   valid project URLs while excluding unrelated domains.
//
// Limitations:
//   - CSP does not protect against server-side vulnerabilities.
//   - The connect-src wildcard *.supabase.co covers all Supabase projects;
//     a more restrictive policy would pin the specific project URL from the
//     NEXT_PUBLIC_SUPABASE_URL env variable, but that requires reading env at
//     middleware runtime. This is an acceptable trade-off for MVP.
// ---------------------------------------------------------------------------

const isDev = process.env.NODE_ENV === "development";

function buildCsp(nonce: string): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(" ");

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://lh3.googleusercontent.com",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

// Note on style-src 'unsafe-inline':
// Next.js injects critical CSS inline (<style> tags) for the initial paint of
// CSS Modules and Tailwind, even when a nonce is present. As of Next.js 16,
// there is no nonce support for injected <style> blocks — only <script> blocks
// receive the nonce automatically. 'unsafe-inline' for styles is significantly
// less dangerous than for scripts: it enables CSS injection attacks but not
// JavaScript execution. Removing it would break Next.js CSS-in-JS rendering.
// This is a known framework constraint. The mitigation is to ensure no user
// content reaches a CSS context (currently true — no dynamic CSS generation).

/** Additional security response headers applied to all navigations. */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

function applySecurityHeaders(
  response: NextResponse,
  nonce: string,
): NextResponse {
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

// ---------------------------------------------------------------------------
// Proxy entry point
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  // F-07: reject abusive auth endpoint callers before any further processing.
  const rateLimitResponse = applyAuthRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // F-06: generate a per-request nonce and pass it to Next.js via a request
  // header so Server Components can read it with headers().get('x-nonce').
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Attach the nonce to the mutable request headers so updateSession and any
  // Server Component can read it via headers().get('x-nonce').
  request.headers.set("x-nonce", nonce);

  const sessionResponse = await updateSession(request);

  // Apply CSP and security headers to the final response.
  return applySecurityHeaders(sessionResponse, nonce);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
