/**
 * Sprint 12.2 — SerpAPI Google Hotels HTTP client tests (mocked fetch).
 */

import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import { successfulGoogleHotelsResponse } from "@/lib/providers/hotels/serpapi/__fixtures__/googleHotels.sample";
import {
  searchGoogleHotels,
  SERPAPI_SEARCH_URL,
} from "@/lib/providers/hotels/serpapi/client";
import type { SerpApiLogEvent } from "@/lib/providers/flights/serpapi/log";

const originalFetch = globalThis.fetch;
const originalInfo = console.info;
const originalWarn = console.warn;

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.info = originalInfo;
  console.warn = originalWarn;
});

function isSerpApiHotelsLogEvent(value: unknown): value is SerpApiLogEvent {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    record.provider === "serpapi" &&
    record.operation === "googleHotels" &&
    typeof record.durationMs === "number"
  );
}

function captureLogs(): {
  info: Array<{ event: SerpApiLogEvent }>;
  warn: Array<{ event: SerpApiLogEvent }>;
} {
  const info: Array<{ event: SerpApiLogEvent }> = [];
  const warn: Array<{ event: SerpApiLogEvent }> = [];

  console.info = (...args: unknown[]) => {
    if (args[0] === "[serpapi]" && isSerpApiHotelsLogEvent(args[1])) {
      info.push({ event: args[1] });
    }
  };
  console.warn = (...args: unknown[]) => {
    if (args[0] === "[serpapi]" && isSerpApiHotelsLogEvent(args[1])) {
      warn.push({ event: args[1] });
    }
  };

  return { info, warn };
}

function assertNoSecrets(serialized: string, apiKey: string): void {
  assert.equal(serialized.includes(apiKey), false);
  assert.equal(serialized.includes(SERPAPI_SEARCH_URL), false);
  assert.equal(serialized.includes("api_key"), false);
}

describe("searchGoogleHotels", () => {
  it("GETs SerpAPI with api_key and returns parsed JSON", async () => {
    const logs = captureLogs();
    let requestedUrl = "";

    globalThis.fetch = async (input) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify(successfulGoogleHotelsResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const params = new URLSearchParams({
      engine: "google_hotels",
      q: "Bali Resorts",
    });

    const body = await searchGoogleHotels(params, { apiKey: "serp-secret-key" });

    assert.ok(requestedUrl.startsWith(`${SERPAPI_SEARCH_URL}?`));
    assert.ok(requestedUrl.includes("api_key=serp-secret-key"));
    assert.ok(requestedUrl.includes("engine=google_hotels"));
    assert.equal(body.search_parameters?.engine, "google_hotels");
    assert.equal(logs.info.length, 1);
    assert.equal(logs.info[0]!.event.operation, "googleHotels");
    assert.equal(logs.info[0]!.event.httpStatus, 200);
    assertNoSecrets(JSON.stringify(logs.info[0]!.event), "serp-secret-key");
  });

  it("throws on missing API key without calling fetch", async () => {
    let fetchCalled = false;
    globalThis.fetch = async () => {
      fetchCalled = true;
      return new Response("{}", { status: 200 });
    };

    await assert.rejects(
      () =>
        searchGoogleHotels(new URLSearchParams({ engine: "google_hotels" }), {
          apiKey: "  ",
        }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /SERPAPI_API_KEY/);
        return true;
      },
    );

    assert.equal(fetchCalled, false);
  });

  it("maps 401 and 429 to provider errors and logs safely", async () => {
    const logs = captureLogs();

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "Invalid API key." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(
      () =>
        searchGoogleHotels(new URLSearchParams({ engine: "google_hotels" }), {
          apiKey: "bad-key",
        }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /authentication failed/i);
        return true;
      },
    );

    assert.equal(logs.warn[0]!.event.errorCode, "UNAUTHORIZED");
    assertNoSecrets(JSON.stringify(logs.warn[0]!.event), "bad-key");

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "Rate limit." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(
      () =>
        searchGoogleHotels(new URLSearchParams({ engine: "google_hotels" }), {
          apiKey: "rate-key",
        }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /temporarily busy/i);
        return true;
      },
    );

    assert.equal(logs.warn[1]!.event.errorCode, "RATE_LIMITED");
  });

  it("maps HTTP 500 to a ProviderError", async () => {
    const logs = captureLogs();
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(
      () =>
        searchGoogleHotels(new URLSearchParams({ engine: "google_hotels" }), {
          apiKey: "serp-key",
        }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /Hotel search failed/);
        assert.match(error.message, /Internal server error/);
        return true;
      },
    );

    assert.equal(logs.warn[0]!.event.httpStatus, 500);
    assert.equal(logs.warn[0]!.event.errorCode, "PROVIDER_ERROR");
    assertNoSecrets(JSON.stringify(logs.warn[0]!.event), "serp-key");
  });

  it("maps invalid JSON to a ProviderError", async () => {
    const logs = captureLogs();
    globalThis.fetch = async () =>
      new Response("not-json{", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(
      () =>
        searchGoogleHotels(new URLSearchParams({ engine: "google_hotels" }), {
          apiKey: "serp-key",
        }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(
          error.message,
          "Hotel search returned an invalid response. Please try again.",
        );
        return true;
      },
    );

    assert.equal(logs.warn[0]!.event.errorCode, "PROVIDER_ERROR");
    assertNoSecrets(JSON.stringify(logs.warn[0]!.event), "serp-key");
  });

  it("maps network failures to a ProviderError", async () => {
    const logs = captureLogs();
    globalThis.fetch = async () => {
      throw new TypeError("fetch failed");
    };

    await assert.rejects(
      () =>
        searchGoogleHotels(new URLSearchParams({ engine: "google_hotels" }), {
          apiKey: "serp-key",
        }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(
          error.message,
          "Could not reach the SerpAPI hotel search service.",
        );
        return true;
      },
    );

    assert.equal(logs.warn[0]!.event.errorCode, "NETWORK_ERROR");
    assertNoSecrets(JSON.stringify(logs.warn[0]!.event), "serp-key");
  });
});
