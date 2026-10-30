/**
 * Content Security Policy helpers (F-06 / Sprint CSP hydration fix).
 *
 * Next.js extracts the script nonce from the **request** Content-Security-Policy
 * header during SSR and stamps it onto framework <script> tags. The same CSP
 * must also be set on the response. See Next.js 16.3 guide:
 * content-security-policy (proxy + request headers).
 */

import { NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

/** Additional security response headers applied to all navigations. */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

/**
 * Generates a per-request CSP nonce (base64 UUID bytes).
 * Never reuse across requests.
 */
export function generateCspNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

/**
 * Builds the production CSP string for a given nonce.
 * Production script-src never includes 'unsafe-inline' or 'unsafe-eval'.
 * Development adds 'unsafe-eval' for React error-stack reconstruction.
 */
/**
 * Hosts used by the "All live flights" engine (features/liveFlights,
 * Travelpayouts White Label widget). Taken from its script on 2026-10-29.
 * Remove together with the engine. Its script itself needs no entry:
 * 'strict-dynamic' trusts scripts added by Glooconn's own nonce'd code.
 */
const LIVE_FLIGHTS_CSP = {
  // avsplow.com: the widget's click/booking tracking; img.avs.io: airline logos
  // (both seen blocked on the 2026-10-29 preview).
  connect: [
    "https://tpwgts.com",
    "https://*.apistp.com",
    "https://*.travelpayouts.com",
    "https://*.hotellook.com",
    "https://avsplow.com",
  ],
  img: ["https://tpwgts.com", "https://*.apistp.com", "https://*.travelpayouts.com", "https://*.hotellook.com", "https://img.avs.io"],
  style: ["https://fonts.googleapis.com"],
  font: ["https://fonts.gstatic.com"],
};

/**
 * Paths only Glooconn itself may frame (frame-ancestors 'self'); every
 * other page stays unframeable. Milestone 23: the live-flights widget page.
 */
export const SAME_ORIGIN_FRAME_PATHS: readonly string[] = ["/live-flights/frame"];

export function isSameOriginFramePath(pathname: string): boolean {
  return SAME_ORIGIN_FRAME_PATHS.includes(pathname);
}

export type CspOptions = { frameableBySelf?: boolean };

export function buildCsp(nonce: string, options: CspOptions = {}): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(" ");

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    // Next.js still injects critical CSS as inline <style> without nonces.
    // 'unsafe-inline' for styles is required; it is not allowed for scripts.
    `style-src 'self' 'unsafe-inline' ${LIVE_FLIGHTS_CSP.style.join(" ")}`,
    // Milestone 30: hotel photos come from LiteAPI's image CDNs (several hosts)
    // and the hotels map uses OpenStreetMap tiles — images only, so any https.
    `img-src 'self' data: https: https://lh3.googleusercontent.com https://pics.avs.io ${LIVE_FLIGHTS_CSP.img.join(" ")}`,
    `font-src 'self' ${LIVE_FLIGHTS_CSP.font.join(" ")}`,
    `connect-src 'self' https://*.supabase.co ${LIVE_FLIGHTS_CSP.connect.join(" ")}`,
    // Milestone 29: the Stay22 hotels map on the Hotels results page.
    "frame-src 'self' https://www.stay22.com",
    "form-action 'self'",
    options.frameableBySelf ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

/**
 * Attaches nonce + CSP to request headers so Next.js can stamp scripts,
 * and returns a Headers object suitable for NextResponse.next({ request }).
 */
export function createCspRequestHeaders(
  requestHeaders: Headers,
  nonce: string,
  csp: string = buildCsp(nonce),
): Headers {
  const headers = new Headers(requestHeaders);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  return headers;
}

/** Applies CSP + baseline security headers to a response. */
export function applySecurityHeaders(
  response: NextResponse,
  csp: string,
  options: CspOptions = {},
): NextResponse {
  response.headers.set("Content-Security-Policy", csp);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  if (options.frameableBySelf) {
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
  }
  return response;
}

/** Extracts a script-src nonce from a CSP header value, if present. */
export function extractNonceFromCsp(csp: string): string | null {
  const match = /'nonce-([^']+)'/.exec(csp);
  return match?.[1] ?? null;
}
