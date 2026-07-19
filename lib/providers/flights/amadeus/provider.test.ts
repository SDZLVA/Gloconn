import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import { clearCache } from "@/lib/api/cache";
import { getAppConfig, resetAppConfig } from "@/lib/config";
import {
  emptyResponse,
  minimalOffer,
  mixedResponse,
  responseWithCarriers,
  unsupportedCurrencyOffer,
} from "@/lib/providers/flights/amadeus/__fixtures__/flightOffers.sample";
import { amadeusFlightsProvider } from "@/lib/providers/flights/amadeus/provider";
import type { SearchRequest } from "@/types/models/search-request";

const TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
const OFFERS_PATH = "/v2/shopping/flight-offers";

type FetchCall = {
  url: string;
  method: string;
};

const originalFetch = globalThis.fetch;
const savedEnv = {
  AMADEUS_API_KEY: process.env.AMADEUS_API_KEY,
  AMADEUS_API_SECRET: process.env.AMADEUS_API_SECRET,
};

let fetchCalls: FetchCall[] = [];
let tokenStatus = 200;
let tokenBody: unknown = {
  access_token: "test-access-token",
  expires_in: 1799,
};
let offersStatus = 200;
let offersBody: unknown = responseWithCarriers;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function installFetchMock() {
  fetchCalls = [];
  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const method = (init?.method ?? "GET").toUpperCase();
    fetchCalls.push({ url, method });

    if (url.startsWith(TOKEN_URL)) {
      return jsonResponse(tokenStatus, tokenBody);
    }

    if (url.includes(OFFERS_PATH)) {
      return jsonResponse(offersStatus, offersBody);
    }

    throw new Error(`Unexpected fetch URL in test: ${url}`);
  }) as typeof fetch;
}

function baseRequest(
  overrides: Partial<SearchRequest> = {},
): SearchRequest {
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
    ...overrides,
  };
}

function countOffersFetches(): number {
  return fetchCalls.filter((call) => call.url.includes(OFFERS_PATH)).length;
}

function countTokenFetches(): number {
  return fetchCalls.filter((call) => call.url.startsWith(TOKEN_URL)).length;
}

beforeEach(() => {
  process.env.AMADEUS_API_KEY = "test-key";
  process.env.AMADEUS_API_SECRET = "test-secret";
  resetAppConfig();
  clearCache();
  assert.equal(getAppConfig().apiKeys.amadeus.isConfigured, true);

  tokenStatus = 200;
  tokenBody = { access_token: "test-access-token", expires_in: 1799 };
  offersStatus = 200;
  offersBody = responseWithCarriers;
  installFetchMock();
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

describe("AmadeusFlightsProvider.search — happy path", () => {
  it("returns mapped Flight[] for a valid SearchRequest", async () => {
    const flights = await amadeusFlightsProvider.search(baseRequest());

    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.id, "amadeus-1");
    assert.equal(flights[0]?.destinationId, "paris");
    assert.equal(flights[0]?.airline, "AIR FRANCE");
    assert.equal(flights[0]?.rating, 0);
    assert.equal(flights[0]?.currency, "EUR");
    assert.equal(flights[0]?.price, 145.5);
    assert.equal(countOffersFetches(), 1);
    assert.equal(countTokenFetches(), 1);
  });

  it("does not mutate the incoming SearchRequest", async () => {
    const request = baseRequest();
    const snapshot = structuredClone(request);

    await amadeusFlightsProvider.search(request);

    assert.deepEqual(request, snapshot);
  });

  it("calls Flight Offers HTTP exactly once per search", async () => {
    await amadeusFlightsProvider.search(baseRequest());
    assert.equal(countOffersFetches(), 1);

    await amadeusFlightsProvider.search(baseRequest());
    assert.equal(countOffersFetches(), 2);
  });

  it("reuses the OAuth token cache across searches", async () => {
    await amadeusFlightsProvider.search(baseRequest());
    await amadeusFlightsProvider.search(baseRequest());

    assert.equal(countTokenFetches(), 1);
    assert.equal(countOffersFetches(), 2);
  });
});

describe("AmadeusFlightsProvider.search — validation", () => {
  it("throws ProviderError when destinationId is missing before any HTTP", async () => {
    await assert.rejects(
      () =>
        amadeusFlightsProvider.search(
          baseRequest({ destinationId: undefined }),
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.match(error.message, /destinationId/);
        return true;
      },
    );

    assert.equal(fetchCalls.length, 0);
  });

  it("throws ProviderError when destinationId is blank before any HTTP", async () => {
    await assert.rejects(
      () => amadeusFlightsProvider.search(baseRequest({ destinationId: "  " })),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        return true;
      },
    );

    assert.equal(fetchCalls.length, 0);
  });
});

describe("AmadeusFlightsProvider.search — HTTP failures", () => {
  for (const status of [400, 500] as const) {
    it(`propagates ProviderError for Flight Offers HTTP ${status}`, async () => {
      offersStatus = status;
      offersBody = {
        errors: [
          {
            status,
            title: `Error ${status}`,
            detail: `Simulated ${status} failure`,
          },
        ],
      };

      await assert.rejects(
        () => amadeusFlightsProvider.search(baseRequest()),
        (error: unknown) => {
          assert.ok(isApiError(error));
          assert.equal(error.code, "PROVIDER_ERROR");
          assert.match(error.message, /Flight search failed/);
          return true;
        },
      );

      assert.equal(countOffersFetches(), 1);
    });
  }

  it("returns a clear ProviderError for HTTP 429 without retrying", async () => {
    offersStatus = 429;
    offersBody = {
      errors: [{ status: 429, title: "Rate limit", detail: "Too many requests" }],
    };

    // Custom fetch so we can attach Retry-After and count offers calls.
    let offersCalls = 0;
    const warnMessages: unknown[] = [];
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      warnMessages.push(args);
    };

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      const method = (init?.method ?? "GET").toUpperCase();
      fetchCalls.push({ url, method });

      if (url.startsWith(TOKEN_URL)) {
        return jsonResponse(200, tokenBody);
      }

      if (url.includes(OFFERS_PATH)) {
        offersCalls += 1;
        return new Response(JSON.stringify(offersBody), {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "30",
          },
        });
      }

      throw new Error(`Unexpected fetch URL in test: ${url}`);
    }) as typeof fetch;

    try {
      await assert.rejects(
        () => amadeusFlightsProvider.search(baseRequest()),
        (error: unknown) => {
          assert.ok(isApiError(error));
          assert.equal(error.code, "PROVIDER_ERROR");
          assert.equal(
            error.message,
            "Flight search is temporarily busy. Please try again shortly.",
          );
          assert.equal(error.message.includes("Retry-After"), false);
          assert.equal(error.message.includes("30"), false);
          return true;
        },
      );

      assert.equal(offersCalls, 1);
      assert.ok(
        warnMessages.some((entry) => {
          const serialized = JSON.stringify(entry);
          return (
            serialized.includes("RATE_LIMITED") &&
            serialized.includes("flightOffers") &&
            serialized.includes('"httpStatus":429')
          );
        }),
      );
      assert.equal(
        warnMessages.some((entry) => JSON.stringify(entry).includes("30")),
        false,
      );
    } finally {
      console.warn = originalWarn;
    }
  });
});

describe("AmadeusFlightsProvider.search — response failures", () => {
  it("propagates ProviderError for unsupported currency", async () => {
    offersBody = { data: [unsupportedCurrencyOffer] };

    await assert.rejects(
      () => amadeusFlightsProvider.search(baseRequest()),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.match(error.message, /SEK/);
        return true;
      },
    );
  });

  it("returns an empty array for an empty Flight Offers response", async () => {
    offersBody = emptyResponse;
    const flights = await amadeusFlightsProvider.search(baseRequest());
    assert.deepEqual(flights, []);
    assert.equal(countOffersFetches(), 1);
  });

  it("filters mixed valid/invalid offers to valid Flight[] only", async () => {
    offersBody = mixedResponse;
    const flights = await amadeusFlightsProvider.search(baseRequest());

    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.id, "amadeus-1");
    assert.equal(flights[0]?.airline, "AIR FRANCE");
  });

  it("maps a single minimal offer without carriers dictionary", async () => {
    offersBody = { data: [minimalOffer] };
    const flights = await amadeusFlightsProvider.search(baseRequest());

    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.airline, "AF");
  });
});
