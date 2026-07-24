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
    assert.deepEqual(seenMapContext, { destinationId: "paris" });
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
