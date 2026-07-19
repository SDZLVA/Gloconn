import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import { clearCache, setCached } from "@/lib/api/cache";
import { getAppConfig, resetAppConfig } from "@/lib/config";
import { responseWithCarriers } from "@/lib/providers/flights/amadeus/__fixtures__/flightOffers.sample";
import { amadeusFetch } from "@/lib/providers/flights/amadeus/client";
import { searchFlightOffers } from "@/lib/providers/flights/amadeus/flightOffers";
import type { SearchRequest } from "@/types/models/search-request";

const TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
const OFFERS_PATH = "/v2/shopping/flight-offers";
const ACCESS_TOKEN_CACHE_KEY = "amadeus:access_token";

const originalFetch = globalThis.fetch;
const savedEnv = {
  AMADEUS_API_KEY: process.env.AMADEUS_API_KEY,
  AMADEUS_API_SECRET: process.env.AMADEUS_API_SECRET,
};

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

beforeEach(() => {
  process.env.AMADEUS_API_KEY = "test-key";
  process.env.AMADEUS_API_SECRET = "test-secret";
  resetAppConfig();
  clearCache();
  assert.equal(getAppConfig().apiKeys.amadeus.isConfigured, true);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
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

describe("amadeusFetch — HTTP 401 token refresh", () => {
  it("clears the cached token, refreshes, and retries exactly once on success", async () => {
    setCached(ACCESS_TOKEN_CACHE_KEY, "expired-token", 60_000);

    let tokenCalls = 0;
    let offersCalls = 0;
    const authHeaders: string[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.startsWith(TOKEN_URL)) {
        tokenCalls += 1;
        return jsonResponse(200, {
          access_token: `fresh-token-${tokenCalls}`,
          expires_in: 1799,
        });
      }

      if (url.includes(OFFERS_PATH)) {
        offersCalls += 1;
        const authorization = new Headers(init?.headers).get("Authorization");
        authHeaders.push(authorization ?? "");

        if (offersCalls === 1) {
          assert.equal(authorization, "Bearer expired-token");
          return jsonResponse(401, {
            errors: [{ title: "Unauthorized", detail: "Token expired" }],
          });
        }

        assert.equal(authorization, "Bearer fresh-token-1");
        return jsonResponse(200, responseWithCarriers);
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    }) as typeof fetch;

    const response = await amadeusFetch("/v2/shopping/flight-offers?adults=1");
    assert.equal(response.status, 200);
    assert.equal(offersCalls, 2);
    assert.equal(tokenCalls, 1);
    assert.deepEqual(authHeaders, [
      "Bearer expired-token",
      "Bearer fresh-token-1",
    ]);
  });

  it("retries exactly once and returns the second 401 without looping", async () => {
    setCached(ACCESS_TOKEN_CACHE_KEY, "bad-token", 60_000);

    let offersCalls = 0;
    let tokenCalls = 0;

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.startsWith(TOKEN_URL)) {
        tokenCalls += 1;
        return jsonResponse(200, {
          access_token: `still-bad-${tokenCalls}`,
          expires_in: 1799,
        });
      }

      if (url.includes(OFFERS_PATH)) {
        offersCalls += 1;
        return jsonResponse(401, {
          errors: [{ title: "Unauthorized", detail: "Invalid client" }],
        });
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    }) as typeof fetch;

    const response = await amadeusFetch("/v2/shopping/flight-offers?adults=1");
    assert.equal(response.status, 401);
    assert.equal(offersCalls, 2);
    assert.equal(tokenCalls, 1);
  });
});

describe("searchFlightOffers — HTTP 401 after exhausted retry", () => {
  it("surfaces ProviderError when the retried request is still 401", async () => {
    setCached(ACCESS_TOKEN_CACHE_KEY, "bad-token", 60_000);

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
          access_token: "still-bad",
          expires_in: 1799,
        });
      }

      if (url.includes(OFFERS_PATH)) {
        offersCalls += 1;
        return jsonResponse(401, {
          errors: [{ title: "Unauthorized", detail: "Invalid client" }],
        });
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    }) as typeof fetch;

    await assert.rejects(
      () => searchFlightOffers(baseRequest()),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.match(error.message, /Flight search failed/);
        return true;
      },
    );

    assert.equal(offersCalls, 2);
  });
});

describe("searchFlightOffers — HTTP 429", () => {
  it("does not retry and keeps Retry-After out of the user message", async () => {
    const warnArgs: unknown[] = [];
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      warnArgs.push(args);
    };

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
          access_token: "token",
          expires_in: 1799,
        });
      }

      if (url.includes(OFFERS_PATH)) {
        offersCalls += 1;
        return jsonResponse(
          429,
          { errors: [{ title: "Rate limit" }] },
          { "Retry-After": "45" },
        );
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    }) as typeof fetch;

    try {
      await assert.rejects(
        () => searchFlightOffers(baseRequest()),
        (error: unknown) => {
          assert.ok(isApiError(error));
          assert.equal(
            error.message,
            "Flight search is temporarily busy. Please try again shortly.",
          );
          assert.equal(error.message.includes("45"), false);
          assert.equal(error.message.toLowerCase().includes("retry"), false);
          return true;
        },
      );

      assert.equal(offersCalls, 1);

      const serialized = JSON.stringify(warnArgs);
      assert.equal(serialized.includes("45"), false);
      assert.ok(serialized.includes("RATE_LIMITED"));
      assert.ok(serialized.includes("flightOffers"));
      assert.ok(serialized.includes('"httpStatus":429'));
    } finally {
      console.warn = originalWarn;
    }
  });
});
