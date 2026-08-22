/**
 * CSP / security header unit tests (F-06 hydration fix).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextResponse } from "next/server";
import {
  SECURITY_HEADERS,
  applySecurityHeaders,
  buildCsp,
  createCspRequestHeaders,
  extractNonceFromCsp,
  generateCspNonce,
} from "@/lib/security/csp";

describe("CSP nonce helpers", () => {
  it("generates unique per-request nonces", () => {
    const a = generateCspNonce();
    const b = generateCspNonce();
    assert.ok(a.length > 8);
    assert.ok(b.length > 8);
    assert.notEqual(a, b);
  });

  it("includes nonce and strict-dynamic in script-src", () => {
    const nonce = "testNonceValue123";
    const csp = buildCsp(nonce);
    assert.match(csp, /script-src /);
    assert.match(csp, new RegExp(`'nonce-${nonce}'`));
    assert.match(csp, /'strict-dynamic'/);
    assert.match(csp, /'self'/);
  });

  it("production CSP never contains script-src unsafe-inline", () => {
    // buildCsp uses NODE_ENV at module load for unsafe-eval only;
    // unsafe-inline must never appear next to script-src regardless.
    const csp = buildCsp("abc");
    const scriptSrc = csp
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("script-src"));
    assert.ok(scriptSrc);
    assert.doesNotMatch(scriptSrc!, /unsafe-inline/);
  });

  it("attaches matching nonce to request headers for Next.js SSR", () => {
    const nonce = generateCspNonce();
    const csp = buildCsp(nonce);
    const headers = createCspRequestHeaders(new Headers(), nonce, csp);

    assert.equal(headers.get("x-nonce"), nonce);
    assert.equal(headers.get("Content-Security-Policy"), csp);
    assert.equal(extractNonceFromCsp(csp), nonce);
  });

  it("applies CSP and baseline security headers on the response", () => {
    const nonce = generateCspNonce();
    const csp = buildCsp(nonce);
    const response = applySecurityHeaders(NextResponse.next(), csp);

    assert.equal(response.headers.get("Content-Security-Policy"), csp);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      assert.equal(response.headers.get(key), value);
    }
  });

  it("keeps form-action and frame-ancestors restrictions", () => {
    const csp = buildCsp("n");
    assert.match(csp, /form-action 'self'/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.match(csp, /object-src 'none'/);
    assert.match(csp, /base-uri 'self'/);
  });
});
