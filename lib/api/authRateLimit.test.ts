/**
 * Security regression tests — F-07: auth endpoint rate limiting
 *
 * Verifies:
 *  1. AUTH_RATE_LIMITS defines limits for the correct endpoints.
 *  2. checkRateLimitCustom enforces independent buckets per limit config.
 *  3. /auth/callback limit (5/min) is correctly enforced.
 *  4. /auth/signout limit (20/min) is correctly enforced.
 *  5. Buckets for /auth/callback and /auth/signout are independent from
 *     the default /api/search bucket (different limit namespace).
 *  6. Buckets for different auth endpoints are independent from each other.
 */

import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AUTH_RATE_LIMITS,
  _resetRateLimitCache,
  checkRateLimitCustom,
  checkRateLimit,
} from "@/lib/api/rateLimit";

// ---------------------------------------------------------------------------
// AUTH_RATE_LIMITS — configuration contract
// ---------------------------------------------------------------------------

describe("AUTH_RATE_LIMITS — configuration contract", () => {
  it("defines a limit for /auth/callback", () => {
    assert.ok("/auth/callback" in AUTH_RATE_LIMITS);
    const l = AUTH_RATE_LIMITS["/auth/callback"];
    assert.ok(typeof l.perMinute === "number" && l.perMinute > 0);
    assert.ok(typeof l.perHour === "number" && l.perHour > 0);
  });

  it("defines a limit for /auth/signout", () => {
    assert.ok("/auth/signout" in AUTH_RATE_LIMITS);
    const l = AUTH_RATE_LIMITS["/auth/signout"];
    assert.ok(typeof l.perMinute === "number" && l.perMinute > 0);
    assert.ok(typeof l.perHour === "number" && l.perHour > 0);
  });

  it("/auth/callback has a stricter per-minute limit than /auth/signout", () => {
    assert.ok(
      AUTH_RATE_LIMITS["/auth/callback"].perMinute <
        AUTH_RATE_LIMITS["/auth/signout"].perMinute,
      "/auth/callback should be more restrictive — it processes OAuth codes",
    );
  });

  it("does not define a limit for /login or /signup (client-side only)", () => {
    assert.ok(!("/login" in AUTH_RATE_LIMITS));
    assert.ok(!("/signup" in AUTH_RATE_LIMITS));
  });
});

// ---------------------------------------------------------------------------
// /auth/callback limit: 5 per minute
// ---------------------------------------------------------------------------

describe("checkRateLimitCustom — /auth/callback limit (5/min)", () => {
  const { perMinute, perHour } = AUTH_RATE_LIMITS["/auth/callback"];
  const ip = "203.0.113.10";

  beforeEach(() => _resetRateLimitCache());

  it(`allows the first ${perMinute} requests`, () => {
    for (let i = 0; i < perMinute; i++) {
      const result = checkRateLimitCustom(ip, perMinute, perHour);
      assert.equal(result.allowed, true, `request ${i + 1} should be allowed`);
    }
  });

  it(`blocks request ${perMinute + 1} within the same minute window`, () => {
    for (let i = 0; i < perMinute; i++) checkRateLimitCustom(ip, perMinute, perHour);
    const result = checkRateLimitCustom(ip, perMinute, perHour);
    assert.equal(result.allowed, false);
    assert.ok(!result.allowed && result.reason === "rate_limit_minute");
  });

  it("returns Retry-After of 60 seconds when minute limit is exceeded", () => {
    for (let i = 0; i < perMinute; i++) checkRateLimitCustom(ip, perMinute, perHour);
    const result = checkRateLimitCustom(ip, perMinute, perHour);
    assert.ok(!result.allowed);
    if (!result.allowed) assert.equal(result.retryAfterMs, 60_000);
  });
});

// ---------------------------------------------------------------------------
// /auth/signout limit: 20 per minute
// ---------------------------------------------------------------------------

describe("checkRateLimitCustom — /auth/signout limit (20/min)", () => {
  const { perMinute, perHour } = AUTH_RATE_LIMITS["/auth/signout"];
  const ip = "203.0.113.20";

  beforeEach(() => _resetRateLimitCache());

  it(`allows the first ${perMinute} requests`, () => {
    for (let i = 0; i < perMinute; i++) {
      const result = checkRateLimitCustom(ip, perMinute, perHour);
      assert.equal(result.allowed, true, `request ${i + 1} should be allowed`);
    }
  });

  it(`blocks request ${perMinute + 1} within the same minute window`, () => {
    for (let i = 0; i < perMinute; i++) checkRateLimitCustom(ip, perMinute, perHour);
    const result = checkRateLimitCustom(ip, perMinute, perHour);
    assert.equal(result.allowed, false);
  });
});

// ---------------------------------------------------------------------------
// Bucket isolation: auth limits are independent from search limits
// ---------------------------------------------------------------------------

describe("checkRateLimitCustom — bucket isolation (auth vs search)", () => {
  const ip = "198.51.100.5";

  beforeEach(() => _resetRateLimitCache());

  it("exhausting /auth/callback limit does not affect /api/search limit", () => {
    const { perMinute: cbMin, perHour: cbHr } = AUTH_RATE_LIMITS["/auth/callback"];

    // Exhaust /auth/callback bucket.
    for (let i = 0; i < cbMin; i++) checkRateLimitCustom(ip, cbMin, cbHr);
    const callbackBlocked = checkRateLimitCustom(ip, cbMin, cbHr);
    assert.equal(callbackBlocked.allowed, false, "callback should be blocked");

    // /api/search bucket (10/min, 100/hr) should be completely independent.
    const searchResult = checkRateLimit(ip);
    assert.equal(searchResult.allowed, true, "search should be unaffected");
  });

  it("exhausting /auth/signout limit does not affect /auth/callback limit", () => {
    const { perMinute: soMin, perHour: soHr } = AUTH_RATE_LIMITS["/auth/signout"];
    const { perMinute: cbMin, perHour: cbHr } = AUTH_RATE_LIMITS["/auth/callback"];

    // Exhaust /auth/signout bucket.
    for (let i = 0; i < soMin; i++) checkRateLimitCustom(ip, soMin, soHr);
    assert.equal(checkRateLimitCustom(ip, soMin, soHr).allowed, false);

    // /auth/callback bucket should still be fresh (different limit namespace).
    assert.equal(checkRateLimitCustom(ip, cbMin, cbHr).allowed, true);
  });
});
