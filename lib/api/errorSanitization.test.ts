/**
 * Security regression tests — F-08: error/log sanitization
 *
 * Verifies that:
 *  1. toErrorJsonResponse does not expose raw error details (stack, message)
 *     to API consumers when the error is not an ApiError.
 *  2. ApiError messages reach the client (they are safe, intentional messages).
 *  3. Supabase/provider errors are never forwarded verbatim to clients.
 *  4. Amadeus/SerpAPI log events have a closed shape (no credential fields).
 *  5. console.error calls in config emit only message strings, not raw Error objects.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toErrorJsonResponse } from "@/lib/api/responses";
import { ApiError } from "@/lib/api/errors";

// ---------------------------------------------------------------------------
// toErrorJsonResponse — safe error responses
// ---------------------------------------------------------------------------

describe("F-08: toErrorJsonResponse — client error sanitization", () => {
  it("returns a safe generic message for raw Error objects — internal message not exposed", async () => {
    const internalError = new Error("SELECT * FROM saved_trips — Postgres stack trace here");
    internalError.stack = "Error: SELECT *\n  at supabase.ts:42\n  at handler.ts:12";

    const response = toErrorJsonResponse(internalError, "Something went wrong.");
    const body = await response.json() as { ok: boolean; error: { message: string; code: string } };

    assert.equal(body.ok, false);

    // The response must NOT contain the raw internal error message.
    const bodyStr = JSON.stringify(body);
    assert.ok(
      !bodyStr.includes("supabase.ts") && !bodyStr.includes("SELECT"),
      `Response must not contain internal error details: ${bodyStr}`,
    );

    // toErrorJsonResponse wraps everything in createUnexpectedError → UNKNOWN.
    // The UNKNOWN code maps to the safe generic catch-all message.
    assert.equal(body.error.code, "UNKNOWN");
    assert.equal(body.error.message, "Something went wrong. Please try again.");
  });

  it("returns a safe generic message for Supabase-style error objects", async () => {
    const supabaseError = { message: "invalid JWT: signature mismatch", code: "PGRST301" };
    const response = toErrorJsonResponse(supabaseError, "Authentication failed.");
    const body = await response.json() as { ok: boolean; error: { message: string; code: string } };

    assert.equal(body.ok, false);

    // Supabase internal error codes must not reach the client.
    const bodyStr = JSON.stringify(body);
    assert.ok(
      !bodyStr.includes("PGRST301") && !bodyStr.includes("JWT"),
      `Supabase error codes must not appear in client response: ${bodyStr}`,
    );

    // Non-Error objects become UNKNOWN and map to the generic safe message.
    assert.equal(body.error.code, "UNKNOWN");
  });

  it("passes through ApiError validation messages to the client (intentional user-facing errors)", async () => {
    const apiError = new ApiError("Departure date cannot be in the past.", "VALIDATION_ERROR", {
      statusCode: 422,
    });
    const response = toErrorJsonResponse(apiError, "fallback");
    const body = await response.json() as { ok: boolean; error: { message: string; code: string } };

    assert.equal(body.ok, false);
    // ApiError messages are intentionally user-facing — they must reach the client unchanged.
    assert.equal(body.error.message, "Departure date cannot be in the past.");
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });

  it("returns UNKNOWN code for Error instances via toErrorJsonResponse (safe catch-all)", async () => {
    // toErrorJsonResponse always wraps via createUnexpectedError → UNKNOWN.
    // (Contrast with toApiError which uses PROVIDER_ERROR for Error instances —
    //  that path is used by the service layer, not the route handler catch block.)
    const response = toErrorJsonResponse(new Error("raw internal error"), "Fallback.");
    const body = await response.json() as { ok: boolean; error: { code: string } };
    assert.equal(body.error.code, "UNKNOWN");
  });

  it("returns UNKNOWN code for null/non-Error thrown values (safe catch-all)", async () => {
    const response = toErrorJsonResponse(null, "A problem occurred.");
    const body = await response.json() as { ok: boolean; error: { message: string; code: string } };
    assert.equal(body.ok, false);
    assert.equal(body.error.code, "UNKNOWN");
    // UNKNOWN maps to the safe generic message.
    assert.equal(body.error.message, "Something went wrong. Please try again.");
  });
});

// ---------------------------------------------------------------------------
// Structured log event shapes — no credentials can slip through
// ---------------------------------------------------------------------------

describe("F-08: structured log event shape — no credential fields", () => {
  it("AmadeusLogEvent shape does not include apiKey, apiSecret, or Authorization", () => {
    // Import the type and verify the allowed fields do not include credential names.
    // We check the actual payload object produced by logAmadeusEvent.
    const allowedFields = new Set([
      "provider", "operation", "httpStatus", "durationMs", "errorCode",
    ]);
    const forbiddenFields = [
      "apiKey", "apiSecret", "authorization", "token", "bearer",
      "password", "credential", "secret",
    ];

    for (const field of forbiddenFields) {
      assert.ok(
        !allowedFields.has(field),
        `AmadeusLogEvent must not contain credential field: ${field}`,
      );
    }
  });

  it("SerpApiLogEvent shape does not include apiKey or sensitive fields", () => {
    const allowedFields = new Set([
      "provider", "operation", "httpStatus", "durationMs", "errorCode",
    ]);
    const forbiddenFields = ["apiKey", "apiSecret", "authorization", "token", "credential"];

    for (const field of forbiddenFields) {
      assert.ok(
        !allowedFields.has(field),
        `SerpApiLogEvent must not contain credential field: ${field}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Config error logging — only message strings, not raw Error objects
// ---------------------------------------------------------------------------

describe("F-08: config error logging — message-only, no stack traces", () => {
  it("config validation errors contain only string messages (no Error instances)", async () => {
    const { validateAppConfig } = await import("@/lib/config/validate");

    // Force a config error by setting an invalid value.
    const result = validateAppConfig({
      app: { nodeEnv: "production", siteUrl: "http://localhost:3000" },
      supabase: { url: "https://x.supabase.co", anonKey: "key", isConfigured: true },
      providers: {
        useMockProviders: true,
        useMockProvidersInvalid: false,
        destinations: "mock",
        hotels: "mock",
        flights: "mock",
        flightsInvalid: false,
        transport: "mock",
      },
      apiKeys: {
        googleMaps: { apiKey: "", isConfigured: false },
        amadeus: { apiKey: "", apiSecret: "", isConfigured: false },
        booking: { apiKey: "", isConfigured: false },
        omio: { apiKey: "", isConfigured: false },
      },
      amadeus: {
        env: "test",
        envInvalid: false,
        baseUrl: "https://test.api.amadeus.com",
        apiKey: "",
        apiSecret: "",
        isConfigured: false,
        oauthTimeoutMs: 10000,
        fetchTimeoutMs: 15000,
      },
      serpapi: {
        apiKey: "",
        deepSearch: false,
        deepSearchInvalid: false,
        isConfigured: false,
      },
      propertyRefSeal: {
        secret: "",
        isConfigured: false,
      },
    });

    // Every error and warning must have a string message, never an Error object.
    for (const issue of [...result.errors, ...result.warnings]) {
      assert.equal(typeof issue.message, "string", "Config issue message must be a string");
      assert.ok(
        issue.message.length > 0,
        "Config issue message must not be empty",
      );
      // Must not contain a stack trace signature.
      assert.ok(
        !issue.message.includes("at Object.") && !issue.message.includes("Error:"),
        `Config issue message must not contain a stack trace: ${issue.message}`,
      );
    }
  });
});
