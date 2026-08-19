/**
 * Security regression tests — F-01: rate limiting (lib/api/rateLimit.ts)
 */

import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  _resetRateLimitForIp,
  _resetRateLimitCache,
  checkRateLimit,
  getClientIp,
} from "@/lib/api/rateLimit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(headers: Record<string, string> = {}): Request {
  const h = new Headers();
  for (const [k, v] of Object.entries(headers)) h.set(k, v);
  return new Request("https://example.com/api/search", {
    method: "POST",
    headers: h,
  });
}

// ---------------------------------------------------------------------------
// getClientIp
// ---------------------------------------------------------------------------

describe("getClientIp", () => {
  it("returns the first IP from x-forwarded-for", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    assert.equal(getClientIp(req), "1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const req = makeRequest({ "x-real-ip": "10.0.0.1" });
    assert.equal(getClientIp(req), "10.0.0.1");
  });

  it("returns 'unknown' when no IP header is present", () => {
    const req = makeRequest();
    assert.equal(getClientIp(req), "unknown");
  });

  it("lowercases and trims the IP", () => {
    const req = makeRequest({ "x-forwarded-for": "  ::FFFF:1.2.3.4 " });
    assert.equal(getClientIp(req), "::ffff:1.2.3.4");
  });
});

// ---------------------------------------------------------------------------
// checkRateLimit — normal usage
// ---------------------------------------------------------------------------

describe("checkRateLimit — normal usage", () => {
  beforeEach(() => _resetRateLimitCache());

  it("allows the first request from a new IP", () => {
    const result = checkRateLimit("192.0.2.1");
    assert.equal(result.allowed, true);
  });

  it("allows up to 10 requests per minute from the same IP", () => {
    const ip = "192.0.2.2";
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(ip);
      assert.equal(result.allowed, true, `request ${i + 1} should be allowed`);
    }
  });

  it("allows requests from different IPs independently", () => {
    const ip1 = "10.0.0.1";
    const ip2 = "10.0.0.2";
    for (let i = 0; i < 10; i++) {
      assert.equal(checkRateLimit(ip1).allowed, true);
      assert.equal(checkRateLimit(ip2).allowed, true);
    }
  });
});

// ---------------------------------------------------------------------------
// checkRateLimit — per-minute limit enforcement
// ---------------------------------------------------------------------------

describe("checkRateLimit — per-minute limit", () => {
  beforeEach(() => _resetRateLimitCache());

  it("blocks the 11th request within the same minute window", () => {
    const ip = "203.0.113.1";
    for (let i = 0; i < 10; i++) checkRateLimit(ip);

    const result = checkRateLimit(ip);
    assert.equal(result.allowed, false);
    assert.ok(
      !result.allowed && result.reason === "rate_limit_minute",
      `expected reason 'rate_limit_minute', got ${!result.allowed ? result.reason : "allowed"}`,
    );
  });

  it("returns retryAfterMs of 60 000 ms when the minute limit is exceeded", () => {
    const ip = "203.0.113.2";
    for (let i = 0; i < 10; i++) checkRateLimit(ip);
    const result = checkRateLimit(ip);
    assert.ok(!result.allowed);
    if (!result.allowed) {
      assert.equal(result.retryAfterMs, 60_000);
    }
  });

  it("does not print or expose the client IP in rate-limit results", () => {
    const ip = "secret-ip-123";
    for (let i = 0; i < 10; i++) checkRateLimit(ip);
    const result = checkRateLimit(ip);
    assert.ok(!result.allowed);
    if (!result.allowed) {
      const serialised = JSON.stringify(result);
      assert.ok(
        !serialised.includes(ip),
        "rate-limit result must not contain the client IP",
      );
    }
  });
});

// ---------------------------------------------------------------------------
// checkRateLimit — isolated IP resets
// ---------------------------------------------------------------------------

describe("checkRateLimit — IP isolation", () => {
  beforeEach(() => _resetRateLimitCache());

  it("resetting one IP does not affect another", () => {
    const ip1 = "198.51.100.1";
    const ip2 = "198.51.100.2";

    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip1);
      checkRateLimit(ip2);
    }

    // ip1 should be blocked.
    assert.equal(checkRateLimit(ip1).allowed, false);

    // Reset ip1 only.
    _resetRateLimitForIp(ip1);

    // ip1 is now allowed again.
    assert.equal(checkRateLimit(ip1).allowed, true);

    // ip2 is still blocked.
    assert.equal(checkRateLimit(ip2).allowed, false);
  });
});

// ---------------------------------------------------------------------------
// getClientIp — IPv6 support
// ---------------------------------------------------------------------------

describe("getClientIp — IPv6", () => {
  it("accepts a full IPv6 address from x-forwarded-for", () => {
    const req = makeRequest({
      "x-forwarded-for": "2001:db8::1, 10.0.0.1",
    });
    assert.equal(getClientIp(req), "2001:db8::1");
  });

  it("accepts a loopback IPv6 address", () => {
    const req = makeRequest({ "x-forwarded-for": "::1" });
    assert.equal(getClientIp(req), "::1");
  });

  it("accepts IPv4-mapped IPv6 address", () => {
    const req = makeRequest({ "x-real-ip": "::ffff:192.0.2.1" });
    assert.equal(getClientIp(req), "::ffff:192.0.2.1");
  });

  it("rate-limits IPv6 addresses independently from IPv4", () => {
    _resetRateLimitCache();
    const ip4 = "1.2.3.4";
    const ip6 = "2001:db8::1";

    for (let i = 0; i < 10; i++) {
      assert.equal(checkRateLimit(ip4).allowed, true);
      assert.equal(checkRateLimit(ip6).allowed, true);
    }

    // Each should now be independently blocked.
    assert.equal(checkRateLimit(ip4).allowed, false);
    assert.equal(checkRateLimit(ip6).allowed, false);
  });
});

// ---------------------------------------------------------------------------
// getClientIp — missing / ambiguous headers
// ---------------------------------------------------------------------------

describe("getClientIp — missing/ambiguous headers", () => {
  it("returns 'unknown' when both x-forwarded-for and x-real-ip are absent", () => {
    const req = makeRequest({});
    assert.equal(getClientIp(req), "unknown");
  });

  it("returns 'unknown' when x-forwarded-for contains only whitespace", () => {
    const req = makeRequest({ "x-forwarded-for": "   " });
    // After trim the first split segment is empty string — falls back to x-real-ip,
    // which is absent, so returns 'unknown'.
    const ip = getClientIp(req);
    // The whitespace-only XFF value: split gives ["   "], first.trim() = "".
    // Empty string is falsy — falls through to x-real-ip check → "unknown".
    assert.equal(ip, "unknown");
  });

  it("uses only the first IP in a comma-separated XFF chain", () => {
    // Verifies we always read the leftmost (client) address, not the rightmost (proxy).
    const req = makeRequest({
      "x-forwarded-for": "5.5.5.5, 10.0.0.1, 172.16.0.1",
    });
    assert.equal(getClientIp(req), "5.5.5.5");
  });

  it("all headerless requests share the 'unknown' bucket and are rate-limited together", () => {
    _resetRateLimitCache();
    // First 10 "unknown" requests are allowed (shared bucket).
    for (let i = 0; i < 10; i++) {
      assert.equal(checkRateLimit("unknown").allowed, true);
    }
    // 11th is blocked.
    assert.equal(checkRateLimit("unknown").allowed, false);
  });
});

// ---------------------------------------------------------------------------
// getClientIp — header spoofability documentation test
//
// x-forwarded-for is a client-controlled header when there is no reverse
// proxy. This test documents the known limitation: the rate limiter trusts
// whatever IP appears in the header, so an attacker with direct access
// (no intervening proxy) can rotate IPs by changing XFF.
//
// This is an ACCEPTED LIMITATION for MVP (documented in rateLimit.ts).
// Mitigation: deploy behind a reverse proxy that strips/overwrites XFF,
// or upgrade to a shared store (F-12) which can enforce real-connection-IP
// limits using infrastructure-level controls.
// ---------------------------------------------------------------------------

describe("getClientIp — spoofability (documented known limitation)", () => {
  it("reads the first value from x-forwarded-for without origin validation", () => {
    // An attacker at the network edge could set x-forwarded-for to any value.
    // The rate limiter will use that value as the key.
    const attackerRequest = makeRequest({
      "x-forwarded-for": "attacker-chosen-value",
    });
    const ip = getClientIp(attackerRequest);
    assert.equal(
      ip,
      "attacker-chosen-value",
      "getClientIp trusts the XFF header — limitation is documented and accepted for MVP",
    );
  });

  it("each unique spoofed IP gets its own independent rate-limit bucket", () => {
    _resetRateLimitCache();
    // By rotating IPs an attacker with direct access can bypass per-IP limits.
    // This confirms the documented limitation exists — it is not hidden.
    for (let ip = 1; ip <= 20; ip++) {
      const result = checkRateLimit(`spoofed-${ip}`);
      assert.equal(
        result.allowed,
        true,
        `spoofed IP #${ip} should get its own fresh bucket`,
      );
    }
  });
});
