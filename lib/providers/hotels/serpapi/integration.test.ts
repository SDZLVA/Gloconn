/**
 * Sprint 12.4 — SerpAPI Hotels end-to-end integration + hardening tests.
 *
 * Factory → SerpApiHotelsProvider → query builder → HTTP client (mocked) →
 * mapper → Hotel[]. No real HTTP.
 */

import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import { resetAppConfig } from "@/lib/config";
import { createHotelsProvider } from "@/lib/providers/core/factories";
import type { HotelsProvider } from "@/lib/providers/core/types";
import {
  emptyGoogleHotelsResponse,
  successfulGoogleHotelsResponse,
} from "@/lib/providers/hotels/serpapi/__fixtures__/googleHotels.sample";
import { SERPAPI_SEARCH_URL } from "@/lib/providers/flights/serpapi/client";
import type { SerpApiLogEvent } from "@/lib/providers/flights/serpapi/log";
import { serpApiHotelsProvider } from "@/lib/providers/hotels/serpapi";
import type { SearchRequest } from "@/types/models/search-request";

const API_KEY = "serp-hotels-integration-key-do-not-log";

const ENV_KEYS = [
  "USE_MOCK_PROVIDERS",
  "HOTELS_PROVIDER",
  "SERPAPI_API_KEY",
  "SERPAPI_DEEP_SEARCH",
] as const;

const savedEnv: Record<string, string | undefined> = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
);

const originalFetch = globalThis.fetch;
const originalInfo = console.info;
const originalWarn = console.warn;

type CapturedLog = {
  level: "info" | "warn";
  event: SerpApiLogEvent;
};

const capturedLogs: CapturedLog[] = [];
let lastRequestedUrl = "";
let fetchCallCount = 0;

function restoreEnv(): void {
  for (const key of ENV_KEYS) {
    const previous = savedEnv[key];
    if (previous === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = previous;
    }
  }
  resetAppConfig();
}

function setEnv(
  values: Partial<Record<(typeof ENV_KEYS)[number], string>>,
): void {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
  resetAppConfig();
}

function baseRequest(overrides: Partial<SearchRequest> = {}): SearchRequest {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    originIata: "MXP",
    destination: "Paris hotels",
    destinationId: "paris",
    destinationIata: "CDG",
    tripType: "round-trip",
    departureDate: "2026-09-15",
    returnDate: "2026-09-18",
    budget: { amount: 900, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels"],
    ...overrides,
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
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

function restoreGlobals(): void {
  globalThis.fetch = originalFetch;
  console.info = originalInfo;
  console.warn = originalWarn;
}

function assertLogsAreSafe(): void {
  const serialized = JSON.stringify(capturedLogs);
  assert.equal(serialized.includes(API_KEY), false);
  assert.equal(serialized.toLowerCase().includes("api_key"), false);
  assert.equal(serialized.includes(SERPAPI_SEARCH_URL), false);
  assert.equal(serialized.includes("serpapi.com"), false);
}

function mockFetchWithBody(body: unknown, status = 200): void {
  lastRequestedUrl = "";
  fetchCallCount = 0;

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    fetchCallCount += 1;
    lastRequestedUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    return jsonResponse(status, body);
  }) as typeof fetch;
}

function selectSerpApiHotelsProvider(): HotelsProvider {
  setEnv({
    USE_MOCK_PROVIDERS: "false",
    HOTELS_PROVIDER: "serpapi",
    SERPAPI_API_KEY: API_KEY,
  });

  const provider = createHotelsProvider();
  assert.equal(provider, serpApiHotelsProvider);
  assert.equal(provider.name, "serpapi");
  return provider;
}

beforeEach(() => {
  installLogCapture();
  lastRequestedUrl = "";
  fetchCallCount = 0;
});

afterEach(() => {
  restoreGlobals();
  restoreEnv();
});

describe("Sprint 12.4 — SerpAPI Hotels end-to-end integration", () => {
  it("factory → provider → query → HTTP → mapper → Hotel[]", async () => {
    const provider = selectSerpApiHotelsProvider();
    mockFetchWithBody(successfulGoogleHotelsResponse);

    const hotels = await provider.search(baseRequest());

    assert.equal(fetchCallCount, 1);
    assert.ok(lastRequestedUrl.startsWith(`${SERPAPI_SEARCH_URL}?`));
    assert.ok(lastRequestedUrl.includes("engine=google_hotels"));
    assert.ok(lastRequestedUrl.includes("q=Paris+hotels"));
    assert.ok(lastRequestedUrl.includes("check_in_date=2026-09-15"));
    assert.ok(lastRequestedUrl.includes("check_out_date=2026-09-18"));
    assert.ok(lastRequestedUrl.includes("currency=EUR"));
    assert.ok(lastRequestedUrl.includes("api_key="));

    assert.equal(hotels.length, 2);
    assert.ok(hotels.every((hotel) => hotel.id.startsWith("serpapi-hotel-")));
    assert.ok(hotels.every((hotel) => hotel.destinationId === "paris"));
    assert.ok(hotels.every((hotel) => hotel.currency === "EUR"));
    assert.ok(hotels.every((hotel) => hotel.nights === 2));

    assert.equal(capturedLogs.length, 1);
    assert.equal(capturedLogs[0]?.event.operation, "googleHotels");
    assert.equal(capturedLogs[0]?.event.httpStatus, 200);
    assertLogsAreSafe();
  });

  it("returns [] for empty properties without throwing", async () => {
    const provider = selectSerpApiHotelsProvider();
    mockFetchWithBody(emptyGoogleHotelsResponse);

    const hotels = await provider.search(baseRequest());

    assert.deepEqual(hotels, []);
    assert.equal(capturedLogs[0]?.event.operation, "googleHotels");
    assertLogsAreSafe();
  });

  it("fails fast when destinationId is missing", async () => {
    const provider = selectSerpApiHotelsProvider();
    mockFetchWithBody(successfulGoogleHotelsResponse);

    await assert.rejects(
      () => provider.search(baseRequest({ destinationId: undefined })),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /destinationId/i);
        return true;
      },
    );

    assert.equal(fetchCallCount, 0);
  });

  it("rejects one-way searches without returnDate before HTTP", async () => {
    const provider = selectSerpApiHotelsProvider();
    mockFetchWithBody(successfulGoogleHotelsResponse);

    await assert.rejects(
      () =>
        provider.search(
          baseRequest({ tripType: "one-way", returnDate: null }),
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /returnDate/i);
        return true;
      },
    );

    assert.equal(fetchCallCount, 0);
  });

  it("surfaces HTTP failures as ProviderError without leaking the API key", async () => {
    const provider = selectSerpApiHotelsProvider();
    mockFetchWithBody({ error: "Invalid API key." }, 401);

    await assert.rejects(
      () => provider.search(baseRequest()),
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

    assert.equal(capturedLogs[0]?.event.errorCode, "UNAUTHORIZED");
    assertLogsAreSafe();
  });
});
