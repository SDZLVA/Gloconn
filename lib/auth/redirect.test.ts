/**
 * Security regression tests — F-02: open redirect prevention (lib/auth/redirect.ts)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "@/lib/auth/redirect";

const FALLBACK = "/my-trips";

// ---------------------------------------------------------------------------
// Safe inputs — must be returned unchanged
// ---------------------------------------------------------------------------

describe("safeRedirectPath — safe inputs (returned unchanged)", () => {
  it("accepts a plain root path", () => {
    assert.equal(safeRedirectPath("/", FALLBACK), "/");
  });

  it("accepts a simple page path", () => {
    assert.equal(safeRedirectPath("/my-trips", FALLBACK), "/my-trips");
  });

  it("accepts a nested path", () => {
    assert.equal(safeRedirectPath("/trips/abc-123", FALLBACK), "/trips/abc-123");
  });

  it("accepts a path with a query string", () => {
    assert.equal(
      safeRedirectPath("/search?origin=NYC&destination=PAR", FALLBACK),
      "/search?origin=NYC&destination=PAR",
    );
  });

  it("accepts a path with a hash fragment", () => {
    assert.equal(safeRedirectPath("/my-trips#saved", FALLBACK), "/my-trips#saved");
  });
});

// ---------------------------------------------------------------------------
// Open redirect attacks — must fall back
// ---------------------------------------------------------------------------

describe("safeRedirectPath — open redirect attacks (must return fallback)", () => {
  it("rejects a fully qualified http URL", () => {
    assert.equal(safeRedirectPath("http://evil.com", FALLBACK), FALLBACK);
  });

  it("rejects a fully qualified https URL", () => {
    assert.equal(safeRedirectPath("https://evil.com/steal", FALLBACK), FALLBACK);
  });

  it("rejects a protocol-relative URL (//evil.com)", () => {
    assert.equal(safeRedirectPath("//evil.com", FALLBACK), FALLBACK);
  });

  it("rejects a protocol-relative URL with a path (//evil.com/path)", () => {
    assert.equal(safeRedirectPath("//evil.com/phishing", FALLBACK), FALLBACK);
  });

  it("rejects javascript: scheme", () => {
    assert.equal(safeRedirectPath("javascript:alert(1)", FALLBACK), FALLBACK);
  });

  it("rejects javascript: scheme with mixed case", () => {
    assert.equal(safeRedirectPath("JaVaScRiPt:alert(1)", FALLBACK), FALLBACK);
  });

  it("rejects data: URI", () => {
    assert.equal(
      safeRedirectPath("data:text/html,<script>alert(1)</script>", FALLBACK),
      FALLBACK,
    );
  });

  it("rejects vbscript: scheme", () => {
    assert.equal(safeRedirectPath("vbscript:MsgBox(1)", FALLBACK), FALLBACK);
  });
});

// ---------------------------------------------------------------------------
// Null / empty / undefined inputs — must fall back
// ---------------------------------------------------------------------------

describe("safeRedirectPath — null / empty / undefined inputs (must return fallback)", () => {
  it("returns fallback for null", () => {
    assert.equal(safeRedirectPath(null, FALLBACK), FALLBACK);
  });

  it("returns fallback for undefined", () => {
    assert.equal(safeRedirectPath(undefined, FALLBACK), FALLBACK);
  });

  it("returns fallback for empty string", () => {
    assert.equal(safeRedirectPath("", FALLBACK), FALLBACK);
  });
});

// ---------------------------------------------------------------------------
// Paths that don't start with "/" — must fall back
// ---------------------------------------------------------------------------

describe("safeRedirectPath — relative paths without leading slash (must return fallback)", () => {
  it("rejects a relative path without a leading slash", () => {
    assert.equal(safeRedirectPath("my-trips", FALLBACK), FALLBACK);
  });

  it("rejects a bare domain without a scheme", () => {
    assert.equal(safeRedirectPath("evil.com/steal", FALLBACK), FALLBACK);
  });
});

// ---------------------------------------------------------------------------
// Fallback is used correctly
// ---------------------------------------------------------------------------

describe("safeRedirectPath — fallback value", () => {
  it("uses the exact fallback string provided", () => {
    assert.equal(safeRedirectPath(null, "/login"), "/login");
  });

  it("uses the exact fallback for a rejected path", () => {
    assert.equal(safeRedirectPath("//evil.com", "/home"), "/home");
  });
});
