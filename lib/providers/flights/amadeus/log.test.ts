/**
 * Step 8.4 — Amadeus structured logging.
 */

import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { clearCache, setCached } from "@/lib/api/cache";
import { getAppConfig, resetAppConfig } from "@/lib/config";
import { responseWithCarriers } from "@/lib/providers/flights/amadeus/__fixtures__/flightOffers.sample";
import { getAmadeusAccessToken } from "@/lib/providers/flights/amadeus/auth";
import { amadeusFetch } from "@/lib/providers/flights/amadeus/client";
import { searchFlightOffers } from "@/lib/providers/flights/amadeus/flightOffers";
import type {
  AmadeusLogErrorCode,
  AmadeusLogEvent,
  AmadeusLogOperation,
} from "@/lib/providers/flights/amadeus/log";
import type { SearchRequest } from "@/types/models/search-request";

const TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
const OFFERS_PATH = "/v2/shopping/flight-offers";
const ACCESS_TOKEN_CACHE_KEY = "amadeus:access_token";

const API_KEY = "amadeus-client-id-secret-value";
const API_SECRET = "amadeus-client-secret-value";
const ACCESS_TOKEN = "super-secret-access-token-xyz";

const originalFetch = globalThis.fetch;
const originalInfo = console.info;
const originalWarn = console.warn;

const savedEnv = {
  AMADEUS_API_KEY: process.env.AMADEUS_API_KEY,
  AMADEUS_API_SECRET: process.env.AMADEUS_API_SECRET,
};

type CapturedLog = {
  level: "info" | "warn";
  event: AmadeusLogEvent;
};

const capturedLogs: CapturedLog[] = [];

function jsonResponse(
  status: number,
  body: unknown,
  headers?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function baseRequest(): SearchRequest {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    originIata: "MXP",
    destination: "Paris, France",
    destinationId: "paris",
    destinationIata: "CDG",
    tripType: "one-way",
    departureDate: "2026-08-01",
    returnDate: null,
    budget: null,
    travelers: { adults: 1, children: 0, infants: 0, rooms: 1 },
    totalGuests: 1,
    travelStyle: "standard",
    productTypes: ["flights"],
  };
}

function isAmadeusLogEvent(value: unknown): value is AmadeusLogEvent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    record.provider === "amadeus" &&
    typeof record.operation === "string" &&
    typeof record.durationMs === "number"
  );
}

function installLogCapture(): void {
  capturedLogs.length = 0;

  console.info = (...args: unknown[]) => {
    if (args[0] === "[amadeus]" && isAmadeusLogEvent(args[1])) {
      capturedLogs.push({ level: "info", event: args[1] });
    }
  };

  console.warn = (...args: unknown[]) => {
    if (args[0] === "[amadeus]" && isAmadeusLogEvent(args[1])) {
      capturedLogs.push({ level: "warn", event: args[1] });
    }
  };
}

function restoreLogCapture(): void {
  console.info = originalInfo;
  console.warn = originalWarn;
}

function eventsFor(operation: AmadeusLogOperation): AmadeusLogEvent[] {
  return capturedLogs
    .filter((entry) => entry.event.operation === operation)
    .map((entry) => entry.event);
}

function assertNoSensitiveValues(serialized: string): void {
  const lower = serialized.toLowerCase();
  assert.equal(serialized.includes(API_KEY), false);
  assert.equal(serialized.includes(API_SECRET), false);
  assert.equal(serialized.includes(ACCESS_TOKEN), false);
  assert.equal(lower.includes("authorization"), false);
  assert.equal(lower.includes("bearer "), false);
  assert.equal(lower.includes("client_id"), false);
  assert.equal(lower.includes("client_secret"), false);
  assert.equal(lower.includes("access_token"), false);
}

function assertSafeEventShape(event: AmadeusLogEvent): void {
  assert.equal(event.provider, "amadeus");
  assert.equal(typeof event.operation, "string");
  assert.equal(typeof event.durationMs, "number");
  assert.ok(event.durationMs >= 0);

  const keys = Object.keys(event).sort();
  for (const key of keys) {
    assert.ok(
      ["provider", "operation", "httpStatus", "durationMs", "errorCode"].includes(
        key,
      ),
      `unexpected log field: ${key}`,
    );
  }

  assertNoSensitiveValues(JSON.stringify(event));
}

beforeEach(() => {
  process.env.AMADEUS_API_KEY = API_KEY;
  process.env.AMADEUS_API_SECRET = API_SECRET;
  resetAppConfig();
  clearCache();
  installLogCapture();
  assert.equal(getAppConfig().apiKeys.amadeus.isConfigured, true);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  restoreLogCapture();
  clearCache();

  if (savedEnv.AMADEUS_API_KEY === undefined) {
    delete process.env.AMADEUS_API_KEY;
  } else {
    process.env.AMADEUS_API_KEY = savedEnv.AMADEUS_API_KEY;
  }

  if (savedEnv.AMADEUS_API_SECRET === undefined) {
    delete process.env.AMADEUS_API_SECRET;
  } else {
    process.env.AMADEUS_API_SECRET = savedEnv.AMADEUS_API_SECRET;
  }

  resetAppConfig();
});

describe("Amadeus structured logging — OAuth", () => {
  it("logs oauth success without sensitive values", async () => {
    globalThis.fetch = (async () =>
      jsonResponse(200, {
        access_token: ACCESS_TOKEN,
        expires_in: 1799,
      })) as typeof fetch;

    const token = await getAmadeusAccessToken();
    assert.equal(token, ACCESS_TOKEN);

    const oauthLogs = eventsFor("oauth");
    assert.equal(oauthLogs.length, 1);
    assert.equal(oauthLogs[0]?.httpStatus, 200);
    assert.equal(oauthLogs[0]?.errorCode, undefined);
    assertSafeEventShape(oauthLogs[0]!);
    assert.equal(capturedLogs[0]?.level, "info");
  });

  it("logs oauth failure with AUTH_FAILED", async () => {
    globalThis.fetch = (async () =>
      jsonResponse(401, {
        error: "invalid_client",
        error_description: "Client authentication failed",
      })) as typeof fetch;

    await assert.rejects(() => getAmadeusAccessToken());

    const oauthLogs = eventsFor("oauth");
    assert.equal(oauthLogs.length, 1);
    assert.equal(oauthLogs[0]?.httpStatus, 401);
    assert.equal(oauthLogs[0]?.errorCode, "AUTH_FAILED" satisfies AmadeusLogErrorCode);
    assertSafeEventShape(oauthLogs[0]!);
    assert.equal(capturedLogs[0]?.level, "warn");
  });

  it("logs oauth timeout", async () => {
    globalThis.fetch = (async () => {
      throw new DOMException(
        "The operation was aborted due to timeout",
        "TimeoutError",
      );
    }) as typeof fetch;

    await assert.rejects(() => getAmadeusAccessToken());

    const oauthLogs = eventsFor("oauth");
    assert.equal(oauthLogs.length, 1);
    assert.equal(oauthLogs[0]?.errorCode, "TIMEOUT");
    assert.equal(oauthLogs[0]?.httpStatus, undefined);
    assertSafeEventShape(oauthLogs[0]!);
  });

  it("logs oauth 429 as RATE_LIMITED", async () => {
    globalThis.fetch = (async () =>
      jsonResponse(429, { title: "Rate limit" }, { "Retry-After": "30" })) as typeof fetch;

    await assert.rejects(() => getAmadeusAccessToken());

    const oauthLogs = eventsFor("oauth");
    assert.equal(oauthLogs.length, 1);
    assert.equal(oauthLogs[0]?.httpStatus, 429);
    assert.equal(oauthLogs[0]?.errorCode, "RATE_LIMITED");
    assertSafeEventShape(oauthLogs[0]!);
    assert.equal(JSON.stringify(oauthLogs[0]).includes("30"), false);
  });
});

describe("Amadeus structured logging — Flight Offers", () => {
  it("logs flightOffers success", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.startsWith(TOKEN_URL)) {
        return jsonResponse(200, {
          access_token: ACCESS_TOKEN,
          expires_in: 1799,
        });
      }

      if (url.includes(OFFERS_PATH)) {
        return jsonResponse(200, responseWithCarriers);
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    }) as typeof fetch;

    await searchFlightOffers(baseRequest());

    const oauthLogs = eventsFor("oauth");
    const offersLogs = eventsFor("flightOffers");

    assert.equal(oauthLogs.length, 1);
    assert.equal(offersLogs.length, 1);
    assert.equal(offersLogs[0]?.httpStatus, 200);
    assert.equal(offersLogs[0]?.errorCode, undefined);
    assertSafeEventShape(oauthLogs[0]!);
    assertSafeEventShape(offersLogs[0]!);
  });

  it("logs flightOffers failure without Retry-After or secrets", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.startsWith(TOKEN_URL)) {
        return jsonResponse(200, {
          access_token: ACCESS_TOKEN,
          expires_in: 1799,
        });
      }

      if (url.includes(OFFERS_PATH)) {
        return jsonResponse(
          429,
          { errors: [{ title: "Rate limit" }] },
          { "Retry-After": "45" },
        );
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    }) as typeof fetch;

    await assert.rejects(() => searchFlightOffers(baseRequest()));

    const offersLogs = eventsFor("flightOffers");
    assert.equal(offersLogs.length, 1);
    assert.equal(offersLogs[0]?.httpStatus, 429);
    assert.equal(offersLogs[0]?.errorCode, "RATE_LIMITED");
    assertSafeEventShape(offersLogs[0]!);
    assert.equal(JSON.stringify(capturedLogs).includes("45"), false);
  });

  it("logs flightOffers timeout from amadeusFetch", async () => {
    setCached(ACCESS_TOKEN_CACHE_KEY, ACCESS_TOKEN, 60_000);

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.includes(OFFERS_PATH)) {
        throw new DOMException(
          "The operation was aborted due to timeout",
          "TimeoutError",
        );
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    }) as typeof fetch;

    await assert.rejects(() => searchFlightOffers(baseRequest()));

    const offersLogs = eventsFor("flightOffers");
    assert.equal(offersLogs.length, 1);
    assert.equal(offersLogs[0]?.errorCode, "TIMEOUT");
    assertSafeEventShape(offersLogs[0]!);
  });
});

describe("Amadeus structured logging — 401 retry", () => {
  it("logs unauthorizedRetry then successful flightOffers", async () => {
    setCached(ACCESS_TOKEN_CACHE_KEY, "expired-token", 60_000);

    let offersCalls = 0;

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.startsWith(TOKEN_URL)) {
        return jsonResponse(200, {
          access_token: ACCESS_TOKEN,
          expires_in: 1799,
        });
      }

      if (url.includes(OFFERS_PATH)) {
        offersCalls += 1;
        if (offersCalls === 1) {
          return jsonResponse(401, {
            errors: [{ title: "Unauthorized" }],
          });
        }
        return jsonResponse(200, responseWithCarriers);
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    }) as typeof fetch;

    const response = await amadeusFetch("/v2/shopping/flight-offers?adults=1");
    assert.equal(response.status, 200);

    const retryLogs = eventsFor("unauthorizedRetry");
    assert.equal(retryLogs.length, 1);
    assert.equal(retryLogs[0]?.httpStatus, 401);
    assert.equal(retryLogs[0]?.errorCode, "UNAUTHORIZED");
    assertSafeEventShape(retryLogs[0]!);

    const oauthLogs = eventsFor("oauth");
    assert.equal(oauthLogs.length, 1);
    assertSafeEventShape(oauthLogs[0]!);
  });
});
