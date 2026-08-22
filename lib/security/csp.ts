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
export function buildCsp(nonce: string): string {
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
): NextResponse {
  response.headers.set("Content-Security-Policy", csp);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

/** Extracts a script-src nonce from a CSP header value, if present. */
export function extractNonceFromCsp(csp: string): string | null {
  const match = /'nonce-([^']+)'/.exec(csp);
  return match?.[1] ?? null;
}
