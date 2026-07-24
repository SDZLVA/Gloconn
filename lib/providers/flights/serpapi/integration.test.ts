/**
 * Sprint 9.9 — SerpAPI end-to-end integration + hardening tests.
 *
 * Factory → SerpApiFlightsProvider → query builder → HTTP client (mocked) →
 * mapper → Flight[]. No real HTTP. No new product features.
 */

import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { isApiError } from "@/lib/api/errors";
import { resetAppConfig } from "@/lib/config";
import { createFlightsProvider } from "@/lib/providers/core/factories";
import type { FlightsProvider } from "@/lib/providers/core/types";
import { amadeusFlightsProvider } from "@/lib/providers/flights/amadeus";
import { mockFlightsProvider } from "@/lib/providers/flights/mock";
import {
  emptyGoogleFlightsResponse,
  missingTimesOption,
  nonstopOneWayOption,
  oneStopOption,
  roundTripGoogleFlightsResponse,
  successfulGoogleFlightsResponse,
  threeStopOption,
} from "@/lib/providers/flights/serpapi/__fixtures__/googleFlights.sample";
import {
  SERPAPI_SEARCH_URL,
} from "@/lib/providers/flights/serpapi/client";
import type { SerpApiLogEvent } from "@/lib/providers/flights/serpapi/log";
import { buildDeterministicFlightId } from "@/lib/providers/flights/serpapi/mappingHelpers";
import { serpApiFlightsProvider } from "@/lib/providers/flights/serpapi";
import type {
  SerpApiFlightOption,
  SerpApiGoogleFlightsResponse,
} from "@/lib/providers/flights/serpapi/types";
import type { Flight } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

const API_KEY = "serp-integration-secret-key-do-not-log";

const ENV_KEYS = [
  "USE_MOCK_PROVIDERS",
  "FLIGHTS_PROVIDER",
  "SERPAPI_API_KEY",
  "SERPAPI_DEEP_SEARCH",
  "AMADEUS_API_KEY",
  "AMADEUS_API_SECRET",
  "AMADEUS_ENV",
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
    destination: "Paris, France",
    destinationId: "paris",
    destinationIata: "CDG",
    tripType: "one-way",
    departureDate: "2026-08-01",
    returnDate: null,
    budget: { amount: 500, currency: "EUR" },
    travelers: { adults: 1, children: 0, infants: 0, rooms: 1 },
    totalGuests: 1,
    travelStyle: "standard",
    productTypes: ["flights"],
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

function mockFetchWithBody(
  body: unknown,
  status = 200,
): void {
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

function selectSerpApiProvider(): FlightsProvider {
  setEnv({
    USE_MOCK_PROVIDERS: "false",
    FLIGHTS_PROVIDER: "serpapi",
    SERPAPI_API_KEY: API_KEY,
  });

  const provider = createFlightsProvider();
  assert.equal(provider, serpApiFlightsProvider);
  assert.equal(provider.name, "serpapi");
  return provider;
}

function assertSameProviderError(
  actual: unknown,
  expectedMessage: string,
): void {
  assert.ok(isApiError(actual));
  assert.equal(actual.code, "PROVIDER_ERROR");
  assert.equal(actual.message, expectedMessage);
  assert.equal(actual.message.includes(API_KEY), false);
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

describe("Sprint 9.9 — SerpAPI end-to-end integration", () => {
  it("factory → provider → query → HTTP → mapper → Flight[]", async () => {
    const provider = selectSerpApiProvider();
    mockFetchWithBody(successfulGoogleFlightsResponse);

    const flights = await provider.search(baseRequest());

    assert.equal(fetchCallCount, 1);
    assert.ok(lastRequestedUrl.startsWith(`${SERPAPI_SEARCH_URL}?`));
    assert.ok(lastRequestedUrl.includes("engine=google_flights"));
    assert.ok(lastRequestedUrl.includes("departure_id=MXP"));
    assert.ok(lastRequestedUrl.includes("arrival_id=CDG"));
    assert.ok(lastRequestedUrl.includes("outbound_date=2026-08-01"));
    assert.ok(lastRequestedUrl.includes("type=2"));
    assert.ok(lastRequestedUrl.includes(`api_key=${API_KEY}`));

    assert.equal(flights.length, 3);
    assert.ok(flights.every((flight) => flight.destinationId === "paris"));
    assert.ok(flights.every((flight) => flight.currency === "EUR"));
    assert.ok(flights.every((flight) => flight.rating === 0));
    assert.ok(flights.every((flight) => flight.id.startsWith("serpapi-")));
    assert.equal(flights[0]?.airline, "Air France");
    assert.equal(flights[1]?.stops, 1);
    assert.equal(flights[2]?.airline, "easyJet");

    assert.equal(capturedLogs.length, 1);
    assert.equal(capturedLogs[0]?.level, "info");
    assert.equal(capturedLogs[0]?.event.operation, "googleFlights");
    assert.equal(capturedLogs[0]?.event.httpStatus, 200);
    assertLogsAreSafe();
  });
});

describe("Sprint 9.9 — error propagation", () => {
  it("falls back to mock when SerpAPI is selected without a configured API key", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "serpapi",
    });

    const provider = createFlightsProvider();
    assert.equal(provider, mockFlightsProvider);
    assert.equal(provider.name, "mock");
  });

  it("propagates missing API key from the live client path without wrapping", async () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "serpapi",
      SERPAPI_API_KEY: API_KEY,
    });
    const provider = createFlightsProvider();
    assert.equal(provider.name, "serpapi");

    // Clear key after selection so getAppConfig() inside search sees no credential.
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "serpapi",
    });

    let fetchCalled = false;
    globalThis.fetch = (async () => {
      fetchCalled = true;
      return jsonResponse(200, successfulGoogleFlightsResponse);
    }) as typeof fetch;

    await assert.rejects(
      () => provider.search(baseRequest()),
      (error: unknown) => {
        assertSameProviderError(
          error,
          "SerpAPI credentials are not configured. Set SERPAPI_API_KEY.",
        );
        return true;
      },
    );

    assert.equal(fetchCalled, false);
    assert.equal(capturedLogs.length, 0);
  });

  it("propagates invalid provider selection as ProviderError", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "skyscanner",
      SERPAPI_API_KEY: API_KEY,
    });

    assert.throws(
      () => createFlightsProvider(),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.match(error.message, /skyscanner/);
        return true;
      },
    );
  });

  it("propagates network failure from client through provider", async () => {
    const provider = selectSerpApiProvider();
    globalThis.fetch = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;

    await assert.rejects(
      () => provider.search(baseRequest()),
      (error: unknown) => {
        assertSameProviderError(
          error,
          "Could not reach the SerpAPI flight search service.",
        );
        return true;
      },
    );

    assert.equal(capturedLogs.length, 1);
    assert.equal(capturedLogs[0]?.level, "warn");
    assert.equal(capturedLogs[0]?.event.errorCode, "NETWORK_ERROR");
    assertLogsAreSafe();
  });

  it("propagates timeout from client through provider", async () => {
    const provider = selectSerpApiProvider();
    globalThis.fetch = (async () => {
      throw new DOMException(
        "The operation was aborted due to timeout",
        "TimeoutError",
      );
    }) as typeof fetch;

    await assert.rejects(
      () => provider.search(baseRequest()),
      (error: unknown) => {
        assertSameProviderError(
          error,
          "SerpAPI flight search timed out. Please try again.",
        );
        return true;
      },
    );

    assert.equal(capturedLogs.length, 1);
    assert.equal(capturedLogs[0]?.event.errorCode, "TIMEOUT");
    assertLogsAreSafe();
  });

  it("propagates invalid JSON from client through provider", async () => {
    const provider = selectSerpApiProvider();
    globalThis.fetch = (async () =>
      new Response("not-json{", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    await assert.rejects(
      () => provider.search(baseRequest()),
      (error: unknown) => {
        assertSameProviderError(
          error,
          "Flight search returned an invalid response. Please try again.",
        );
        return true;
      },
    );

    assert.equal(capturedLogs.length, 1);
    assert.equal(capturedLogs[0]?.event.errorCode, "PROVIDER_ERROR");
    assertLogsAreSafe();
  });

  it("propagates invalid provider response (null JSON body)", async () => {
    const provider = selectSerpApiProvider();
    mockFetchWithBody(null);

    await assert.rejects(
      () => provider.search(baseRequest()),
      (error: unknown) => {
        assertSameProviderError(
          error,
          "Flight search returned an invalid response. Please try again.",
        );
        return true;
      },
    );

    assert.equal(capturedLogs.length, 1);
    assert.equal(capturedLogs[0]?.level, "info");
    assertLogsAreSafe();
  });

  it("propagates currency validation failure from mapper through provider", async () => {
    const provider = selectSerpApiProvider();
    const response: SerpApiGoogleFlightsResponse = {
      search_parameters: { currency: "SEK" },
      best_flights: [nonstopOneWayOption],
    };
    mockFetchWithBody(response);

    await assert.rejects(
      () => provider.search(baseRequest()),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.match(error.message, /SEK/);
        return true;
      },
    );

    // Client logged success once; mapper threw afterward (no second client log).
    assert.equal(capturedLogs.length, 1);
    assert.equal(capturedLogs[0]?.level, "info");
    assertLogsAreSafe();
  });
});

describe("Sprint 9.9 — edge cases via full provider path", () => {
  it("returns empty Flight[] for empty results", async () => {
    const provider = selectSerpApiProvider();
    mockFetchWithBody(emptyGoogleFlightsResponse);

    const flights = await provider.search(baseRequest());
    assert.deepEqual(flights, []);
  });

  it("maps only other_flights when best_flights is empty", async () => {
    const provider = selectSerpApiProvider();
    const response: SerpApiGoogleFlightsResponse = {
      search_parameters: { currency: "EUR" },
      best_flights: [],
      other_flights: [nonstopOneWayOption, oneStopOption],
    };
    mockFetchWithBody(response);

    const flights = await provider.search(baseRequest());
    assert.equal(flights.length, 2);
    assert.equal(flights[0]?.airline, "Air France");
    assert.equal(flights[1]?.stops, 1);
  });

  it("handles missing optional arrays and filters missing times", async () => {
    const provider = selectSerpApiProvider();
    const response: SerpApiGoogleFlightsResponse = {
      search_parameters: { currency: "EUR" },
      best_flights: [missingTimesOption, nonstopOneWayOption],
    };
    mockFetchWithBody(response);

    const flights = await provider.search(baseRequest());
    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.airline, "Air France");
  });

  it("maps multi-stop itineraries", async () => {
    const provider = selectSerpApiProvider();
    const response: SerpApiGoogleFlightsResponse = {
      search_parameters: { currency: "EUR" },
      best_flights: [threeStopOption],
    };
    mockFetchWithBody(response);

    const flights = await provider.search(baseRequest());
    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.stops, 2);
    assert.equal(flights[0]?.airline, "Lufthansa");
  });

  it("maps the round-trip fixture with departure_token return lookup", async () => {
    const provider = selectSerpApiProvider();
    const requestedUrls: string[] = [];
    const returnLeg = {
      flights: [
        {
          departure_airport: {
            id: "CDG",
            time: "2026-08-10 18:00",
          },
          arrival_airport: {
            id: "MXP",
            time: "2026-08-10 19:25",
          },
          duration: 85,
          airline: "Air France",
          travel_class: "Business",
          flight_number: "AF 1732",
        },
      ],
      total_duration: 85,
      price: 425,
      type: "Round trip",
    };

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      fetchCallCount += 1;
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      requestedUrls.push(url);
      lastRequestedUrl = url;

      if (url.includes("departure_token=")) {
        return jsonResponse(200, {
          search_parameters: { currency: "EUR" },
          best_flights: [returnLeg],
        });
      }

      return jsonResponse(200, roundTripGoogleFlightsResponse);
    }) as typeof fetch;

    const flights = await provider.search(
      baseRequest({
        tripType: "round-trip",
        returnDate: "2026-08-10",
      }),
    );

    assert.equal(fetchCallCount, 2);
    assert.ok(requestedUrls[0]?.includes("type=1"));
    assert.ok(requestedUrls[0]?.includes("return_date=2026-08-10"));
    assert.ok(requestedUrls[1]?.includes("departure_token="));
    assert.equal(flights.length, 1);
    assert.match(flights[0]!.id, /^serpapi-rt-/);
    assert.equal(flights[0]?.cabin, "Business");
    assert.equal(flights[0]?.price, 425);
    assert.equal(flights[0]?.departureTime, "2026-08-01 07:00");
  });

  it("keeps stable IDs for duplicate itineraries", async () => {
    const provider = selectSerpApiProvider();
    const response: SerpApiGoogleFlightsResponse = {
      search_parameters: { currency: "EUR" },
      best_flights: [nonstopOneWayOption],
      other_flights: [nonstopOneWayOption],
    };
    mockFetchWithBody(response);

    const flights = await provider.search(baseRequest());
    assert.equal(flights.length, 2);

    const expectedId = buildDeterministicFlightId(nonstopOneWayOption);
    assert.equal(flights[0]?.id, expectedId);
    assert.equal(flights[1]?.id, expectedId);
  });

  it("maps a large result set within a sane time budget", async () => {
    const provider = selectSerpApiProvider();
    const options: SerpApiFlightOption[] = Array.from(
      { length: 200 },
      (_, index) => ({
        ...nonstopOneWayOption,
        price: 98 + index,
        flights: [
          {
            ...nonstopOneWayOption.flights![0]!,
            flight_number: `AF ${1000 + index}`,
            departure_airport: {
              ...nonstopOneWayOption.flights![0]!.departure_airport!,
              time: `2026-08-01 ${String(6 + (index % 10)).padStart(2, "0")}:15`,
            },
          },
        ],
      }),
    );

    const response: SerpApiGoogleFlightsResponse = {
      search_parameters: { currency: "EUR" },
      best_flights: options.slice(0, 100),
      other_flights: options.slice(100),
    };
    mockFetchWithBody(response);

    const started = performance.now();
    const flights = await provider.search(baseRequest());
    const elapsedMs = performance.now() - started;

    assert.equal(flights.length, 200);
    assert.ok(new Set(flights.map((flight) => flight.id)).size === 200);
    assert.ok(
      elapsedMs < 1000,
      `expected large mapping under 1000ms, got ${elapsedMs.toFixed(1)}ms`,
    );
  });
});

describe("Sprint 9.9 — logging validation (full path)", () => {
  it("emits one success log without secrets or credentialed URLs", async () => {
    const provider = selectSerpApiProvider();
    mockFetchWithBody(successfulGoogleFlightsResponse);

    await provider.search(baseRequest());

    assert.equal(capturedLogs.length, 1);
    assert.equal(capturedLogs[0]?.level, "info");
    assert.equal(capturedLogs[0]?.event.provider, "serpapi");
    assert.equal(capturedLogs[0]?.event.errorCode, undefined);
    assertLogsAreSafe();
  });

  it("emits one failure log without secrets or credentialed URLs", async () => {
    const provider = selectSerpApiProvider();
    globalThis.fetch = (async () =>
      jsonResponse(500, { error: "boom" })) as typeof fetch;

    await assert.rejects(() => provider.search(baseRequest()));

    assert.equal(capturedLogs.length, 1);
    assert.equal(capturedLogs[0]?.level, "warn");
    assert.equal(capturedLogs[0]?.event.errorCode, "PROVIDER_ERROR");
    assertLogsAreSafe();
  });
});

describe("Sprint 9.9 — regression", () => {
  it("keeps mock selection when USE_MOCK_PROVIDERS=true", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
      FLIGHTS_PROVIDER: "serpapi",
      SERPAPI_API_KEY: API_KEY,
    });

    const provider = createFlightsProvider();
    assert.equal(provider, mockFlightsProvider);
    assert.equal(provider.name, "mock");
  });

  it("keeps Amadeus selection when explicitly configured", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "amadeus",
      AMADEUS_API_KEY: "amadeus-key",
      AMADEUS_API_SECRET: "amadeus-secret",
    });

    const provider = createFlightsProvider();
    assert.equal(provider, amadeusFlightsProvider);
    assert.equal(provider.name, "amadeus");
  });

  it("does not mutate Flight shape fields on mapped SerpAPI results", async () => {
    const provider = selectSerpApiProvider();
    mockFetchWithBody(successfulGoogleFlightsResponse);

    const flights = await provider.search(baseRequest());
    const flight = flights[0] as Flight;

    assert.deepEqual(Object.keys(flight).sort(), [
      "airline",
      "arrivalTime",
      "cabin",
      "currency",
      "departureTime",
      "destinationId",
      "durationMinutes",
      "id",
      "price",
      "rating",
      "stops",
    ]);
  });
});
