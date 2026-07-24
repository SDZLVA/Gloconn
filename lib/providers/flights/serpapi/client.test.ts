/**
 * Sprint 9.5 — SerpAPI HTTP client tests (mocked fetch only).
 */

import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import { successfulGoogleFlightsResponse } from "@/lib/providers/flights/serpapi/__fixtures__/googleFlights.sample";
import {
  searchGoogleFlights,
  SERPAPI_SEARCH_URL,
} from "@/lib/providers/flights/serpapi/client";
import type { SerpApiLogEvent } from "@/lib/providers/flights/serpapi/log";

const API_KEY = "serp-test-secret-key-do-not-log";

const originalFetch = globalThis.fetch;
const originalInfo = console.info;
const originalWarn = console.warn;

type CapturedLog = {
  level: "info" | "warn";
  event: SerpApiLogEvent;
};

const capturedLogs: CapturedLog[] = [];

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function baseParams(): URLSearchParams {
  return new URLSearchParams({
    engine: "google_flights",
    departure_id: "MXP",
    arrival_id: "CDG",
    outbound_date: "2026-08-01",
    type: "2",
    adults: "1",
    travel_class: "1",
    deep_search: "false",
  });
}

function isSerpApiLogEvent(value: unknown): value is SerpApiLogEvent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    record.provider === "serpapi" &&
    typeof record.operation === "string" &&
    typeof record.durationMs === "number"
  );
}

function installLogCapture(): void {
  capturedLogs.length = 0;

  console.info = (...args: unknown[]) => {
    if (args[0] === "[serpapi]" && isSerpApiLogEvent(args[1])) {
      capturedLogs.push({ level: "info", event: args[1] });
    }
  };

  console.warn = (...args: unknown[]) => {
    if (args[0] === "[serpapi]" && isSerpApiLogEvent(args[1])) {
      capturedLogs.push({ level: "warn", event: args[1] });
    }
  };
}

function restoreLogCapture(): void {
  console.info = originalInfo;
  console.warn = originalWarn;
}

function assertLogsAreSafe(): void {
  const serialized = JSON.stringify(capturedLogs);
  assert.equal(serialized.includes(API_KEY), false);
  assert.equal(serialized.toLowerCase().includes("api_key"), false);
  assert.equal(serialized.includes(SERPAPI_SEARCH_URL), false);
}

beforeEach(() => {
  installLogCapture();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  restoreLogCapture();
});

describe("searchGoogleFlights", () => {
  it("returns raw JSON on a successful response", async () => {
    let requestedUrl = "";

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      requestedUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      return jsonResponse(200, successfulGoogleFlightsResponse);
    }) as typeof fetch;

    const body = await searchGoogleFlights(baseParams(), { apiKey: API_KEY });

    assert.equal(body.search_metadata?.status, "Success");
    assert.ok(Array.isArray(body.best_flights));
    assert.ok(requestedUrl.startsWith(`${SERPAPI_SEARCH_URL}?`));
    assert.ok(requestedUrl.includes(`api_key=${API_KEY}`));
    assert.ok(requestedUrl.includes("engine=google_flights"));
    assert.ok(requestedUrl.includes("departure_id=MXP"));

    assert.equal(capturedLogs.length, 1);
    assert.equal(capturedLogs[0]?.level, "info");
    assert.equal(capturedLogs[0]?.event.provider, "serpapi");
    assert.equal(capturedLogs[0]?.event.operation, "googleFlights");
    assert.equal(capturedLogs[0]?.event.httpStatus, 200);
    assert.equal(typeof capturedLogs[0]?.event.durationMs, "number");
    assertLogsAreSafe();
  });

  it("maps TimeoutError to a clear ProviderError", async () => {
    globalThis.fetch = (async () => {
      throw new DOMException(
        "The operation was aborted due to timeout",
        "TimeoutError",
      );
    }) as typeof fetch;

    await assert.rejects(
      () => searchGoogleFlights(baseParams(), { apiKey: API_KEY }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.equal(
          error.message,
          "SerpAPI flight search timed out. Please try again.",
        );
        return true;
      },
    );

    assert.equal(capturedLogs[0]?.event.errorCode, "TIMEOUT");
    assertLogsAreSafe();
  });

  it("maps HTTP 401 to an authentication ProviderError", async () => {
    globalThis.fetch = (async () =>
      jsonResponse(401, { error: "Invalid API key." })) as typeof fetch;

    await assert.rejects(
      () => searchGoogleFlights(baseParams(), { apiKey: API_KEY }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(
          error.message,
          "SerpAPI authentication failed. Check SERPAPI_API_KEY.",
        );
        assert.equal(error.message.includes(API_KEY), false);
        return true;
      },
    );

    assert.equal(capturedLogs[0]?.event.httpStatus, 401);
    assert.equal(capturedLogs[0]?.event.errorCode, "UNAUTHORIZED");
    assertLogsAreSafe();
  });

  it("maps HTTP 429 to a busy ProviderError without Retry-After details", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: "Rate limit" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "30",
        },
      })) as typeof fetch;

    await assert.rejects(
      () => searchGoogleFlights(baseParams(), { apiKey: API_KEY }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(
          error.message,
          "Flight search is temporarily busy. Please try again shortly.",
        );
        assert.equal(error.message.includes("30"), false);
        return true;
      },
    );

    assert.equal(capturedLogs[0]?.event.httpStatus, 429);
    assert.equal(capturedLogs[0]?.event.errorCode, "RATE_LIMITED");
    assert.equal(JSON.stringify(capturedLogs).includes("30"), false);
    assertLogsAreSafe();
  });

  it("maps HTTP 500 to a ProviderError", async () => {
    globalThis.fetch = (async () =>
      jsonResponse(500, { error: "Internal server error" })) as typeof fetch;

    await assert.rejects(
      () => searchGoogleFlights(baseParams(), { apiKey: API_KEY }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /Flight search failed/);
        assert.match(error.message, /Internal server error/);
        return true;
      },
    );

    assert.equal(capturedLogs[0]?.event.httpStatus, 500);
    assert.equal(capturedLogs[0]?.event.errorCode, "PROVIDER_ERROR");
    assertLogsAreSafe();
  });

  it("maps invalid JSON to a ProviderError", async () => {
    globalThis.fetch = (async () =>
      new Response("not-json{", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    await assert.rejects(
      () => searchGoogleFlights(baseParams(), { apiKey: API_KEY }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(
          error.message,
          "Flight search returned an invalid response. Please try again.",
        );
        return true;
      },
    );

    assert.equal(capturedLogs[0]?.event.errorCode, "PROVIDER_ERROR");
    assertLogsAreSafe();
  });

  it("maps network failures to a ProviderError", async () => {
    globalThis.fetch = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;

    await assert.rejects(
      () => searchGoogleFlights(baseParams(), { apiKey: API_KEY }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(
          error.message,
          "Could not reach the SerpAPI flight search service.",
        );
        return true;
      },
    );

    assert.equal(capturedLogs[0]?.event.errorCode, "NETWORK_ERROR");
    assertLogsAreSafe();
  });

  it("fails fast when the API key is missing", async () => {
    let fetchCalled = false;
    globalThis.fetch = (async () => {
      fetchCalled = true;
      return jsonResponse(200, successfulGoogleFlightsResponse);
    }) as typeof fetch;

    await assert.rejects(
      () => searchGoogleFlights(baseParams(), { apiKey: "" }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /SERPAPI_API_KEY/);
        return true;
      },
    );

    assert.equal(fetchCalled, false);
  });
});
