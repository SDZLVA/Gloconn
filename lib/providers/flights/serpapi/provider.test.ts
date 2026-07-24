/**
 * Sprint 9.7 — SerpAPI FlightsProvider orchestration tests.
 * Mocks query builder, HTTP client, and mapper (no real HTTP).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createProviderError, isApiError } from "@/lib/api/errors";
import type { SerpApiConfig } from "@/lib/config/types";
import { SerpApiFlightsProvider } from "@/lib/providers/flights/serpapi/provider";
import type { SerpApiGoogleFlightsResponse } from "@/lib/providers/flights/serpapi/types";
import type { Flight } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

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

function baseConfig(overrides: Partial<SerpApiConfig> = {}): SerpApiConfig {
  return {
    apiKey: "serp-test-key",
    deepSearch: false,
    deepSearchInvalid: false,
    isConfigured: true,
    ...overrides,
  };
}

function sampleFlight(): Flight {
  return {
    id: "serpapi-test",
    destinationId: "paris",
    price: 98,
    currency: "EUR",
    rating: 0,
    airline: "Air France",
    departureTime: "08:15",
    arrivalTime: "09:40",
    durationMinutes: 85,
    stops: 0,
    cabin: "Economy",
  };
}

describe("SerpApiFlightsProvider.search", () => {
  it("calls builder → client → mapper in order and returns Flight[]", async () => {
    const callOrder: string[] = [];
    const request = baseRequest();
    const config = baseConfig({ deepSearch: true });
    const builtParams = new URLSearchParams({ engine: "google_flights" });
    const rawResponse: SerpApiGoogleFlightsResponse = {
      search_parameters: { currency: "EUR" },
      best_flights: [],
    };
    const mapped = [sampleFlight()];

    let seenBuildRequest: SearchRequest | undefined;
    let seenBuildConfig: Pick<SerpApiConfig, "deepSearch"> | undefined;
    let seenSearchParams: URLSearchParams | undefined;
    let seenSearchConfig: Pick<SerpApiConfig, "apiKey"> | undefined;
    let seenMapRaw: SerpApiGoogleFlightsResponse | undefined;
    let seenMapContext: { destinationId: string } | undefined;

    const provider = new SerpApiFlightsProvider({
      getSerpApiConfig: () => config,
      buildParams: (req, cfg) => {
        callOrder.push("build");
        seenBuildRequest = req;
        seenBuildConfig = cfg;
        return builtParams;
      },
      searchHttp: async (params, cfg) => {
        callOrder.push("search");
        seenSearchParams = params;
        seenSearchConfig = cfg;
        return rawResponse;
      },
      mapResponse: (raw, context) => {
        callOrder.push("map");
        seenMapRaw = raw;
        seenMapContext = context;
        return mapped;
      },
    });

    const flights = await provider.search(request);

    assert.deepEqual(callOrder, ["build", "search", "map"]);
    assert.equal(flights, mapped);
    assert.equal(seenBuildRequest, request);
    assert.equal(seenBuildConfig?.deepSearch, true);
    assert.equal(seenSearchParams, builtParams);
    assert.equal(seenSearchConfig?.apiKey, "serp-test-key");
    assert.equal(seenMapRaw, rawResponse);
    assert.deepEqual(seenMapContext, {
      destinationId: "paris",
      requestCurrency: "EUR",
    });
  });

  it("fetches return legs via departure_token for round-trip searches", async () => {
    const request = baseRequest({
      tripType: "round-trip",
      returnDate: "2026-08-10",
    });
    const config = baseConfig();
    const tokensSeen: string[] = [];
    let outboundCalls = 0;

    const outboundOption = {
      flights: [
        {
          departure_airport: { id: "MXP", time: "2026-08-01 07:00" },
          arrival_airport: { id: "CDG", time: "2026-08-01 08:25" },
          duration: 85,
          airline: "Air France",
          travel_class: "Economy",
          flight_number: "AF 1",
        },
      ],
      total_duration: 85,
      price: 100,
      type: "Round trip",
      departure_token: "outbound-token-1",
    };

    const returnOption = {
      flights: [
        {
          departure_airport: { id: "CDG", time: "2026-08-10 18:00" },
          arrival_airport: { id: "MXP", time: "2026-08-10 19:25" },
          duration: 85,
          airline: "Air France",
          travel_class: "Economy",
          flight_number: "AF 2",
        },
      ],
      total_duration: 85,
      price: 410,
      type: "Round trip",
    };

    const provider = new SerpApiFlightsProvider({
      getSerpApiConfig: () => config,
      buildParams: () => new URLSearchParams({ engine: "google_flights" }),
      buildReturnParams: (token, cfg) => {
        tokensSeen.push(token);
        assert.equal(cfg.deepSearch, false);
        return new URLSearchParams({
          engine: "google_flights",
          departure_token: token,
        });
      },
      searchHttp: async (params) => {
        if (params.get("departure_token")) {
          return {
            search_parameters: { currency: "EUR" },
            best_flights: [returnOption],
          };
        }
        outboundCalls += 1;
        return {
          search_parameters: { currency: "EUR" },
          best_flights: [outboundOption],
        };
      },
      mapResponse: () => {
        throw new Error("one-way mapper should not run for round-trip with tokens");
      },
    });

    const flights = await provider.search(request);

    assert.equal(outboundCalls, 1);
    assert.deepEqual(tokensSeen, ["outbound-token-1"]);
    assert.equal(flights.length, 1);
    assert.match(flights[0]!.id, /^serpapi-rt-/);
    assert.equal(flights[0]!.price, 410);
    assert.equal(flights[0]!.departureTime, "2026-08-01 07:00");
    assert.equal(flights[0]!.durationMinutes, 170);
  });

  it("falls back to outbound-only mapping when return fetch fails", async () => {
    const request = baseRequest({
      tripType: "round-trip",
      returnDate: "2026-08-10",
    });

    const outboundOption = {
      flights: [
        {
          departure_airport: { id: "MXP", time: "2026-08-01 07:00" },
          arrival_airport: { id: "CDG", time: "2026-08-01 08:25" },
          duration: 85,
          airline: "easyJet",
          travel_class: "Economy",
          flight_number: "U2 1",
        },
      ],
      total_duration: 85,
      price: 99,
      departure_token: "token-fail",
    };

    const provider = new SerpApiFlightsProvider({
      getSerpApiConfig: () => baseConfig(),
      buildParams: () => new URLSearchParams(),
      buildReturnParams: (token) =>
        new URLSearchParams({ departure_token: token }),
      searchHttp: async (params) => {
        if (params.get("departure_token")) {
          throw createProviderError("Return search failed");
        }
        return {
          search_parameters: { currency: "EUR" },
          best_flights: [outboundOption],
        };
      },
    });

    const flights = await provider.search(request);
    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.airline, "easyJet");
    assert.equal(flights[0]?.price, 99);
    assert.match(flights[0]!.id, /^serpapi-/);
    assert.equal(flights[0]!.id.startsWith("serpapi-rt-"), false);
  });

  it("propagates ProviderError from the HTTP client", async () => {
    const provider = new SerpApiFlightsProvider({
      getSerpApiConfig: () => baseConfig(),
      buildParams: () => new URLSearchParams(),
      searchHttp: async () => {
        throw createProviderError(
          "SerpAPI flight search timed out. Please try again.",
        );
      },
      mapResponse: () => {
        throw new Error("mapper should not run");
      },
    });

    await assert.rejects(
      () => provider.search(baseRequest()),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /timed out/);
        return true;
      },
    );
  });

  it("propagates ProviderError from the mapper", async () => {
    const provider = new SerpApiFlightsProvider({
      getSerpApiConfig: () => baseConfig(),
      buildParams: () => new URLSearchParams(),
      searchHttp: async () => ({ best_flights: [] }),
      mapResponse: () => {
        throw createProviderError(
          'Flight offer currency "SEK" is not supported by Glooconn.',
        );
      },
    });

    await assert.rejects(
      () => provider.search(baseRequest()),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /SEK/);
        return true;
      },
    );
  });

  it("fails fast when destinationId is missing before any collaborator runs", async () => {
    let buildCalled = false;
    let searchCalled = false;
    let mapCalled = false;

    const provider = new SerpApiFlightsProvider({
      getSerpApiConfig: () => baseConfig(),
      buildParams: () => {
        buildCalled = true;
        return new URLSearchParams();
      },
      searchHttp: async () => {
        searchCalled = true;
        return {};
      },
      mapResponse: () => {
        mapCalled = true;
        return [];
      },
    });

    await assert.rejects(
      () => provider.search(baseRequest({ destinationId: undefined })),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /destinationId/);
        return true;
      },
    );

    assert.equal(buildCalled, false);
    assert.equal(searchCalled, false);
    assert.equal(mapCalled, false);
  });

  it("exposes the serpapi provider name", () => {
    assert.equal(new SerpApiFlightsProvider().name, "serpapi");
  });
});
