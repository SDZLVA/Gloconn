/**
 * Sprint 12.2 — SerpAPI HotelsProvider orchestration tests.
 * Mocks query builder, HTTP client, and mapper (no real HTTP).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createProviderError, isApiError } from "@/lib/api/errors";
import type { SerpApiConfig } from "@/lib/config/types";
import { SerpApiHotelsProvider } from "@/lib/providers/hotels/serpapi/provider";
import type { SerpApiGoogleHotelsResponse } from "@/lib/providers/hotels/serpapi/types";
import type { Hotel } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

function baseRequest(overrides: Partial<SearchRequest> = {}): SearchRequest {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    destination: "Bali Resorts",
    destinationId: "bali",
    tripType: "round-trip",
    departureDate: "2026-04-08",
    returnDate: "2026-04-10",
    budget: { amount: 800, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels"],
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

function sampleHotel(): Hotel {
  return {
    id: "serpapi-hotel-test",
    destinationId: "bali",
    price: 332,
    currency: "EUR",
    rating: 4.6,
    name: "The Ritz-Carlton, Bali",
    stars: 5,
    amenities: ["Pool"],
    nights: 2,
    location: "Nusa Dua",
  };
}

describe("SerpApiHotelsProvider.search", () => {
  it("calls builder → client → mapper in order and returns Hotel[]", async () => {
    const callOrder: string[] = [];
    const request = baseRequest();
    const config = baseConfig();
    const builtParams = new URLSearchParams({ engine: "google_hotels" });
    const rawResponse: SerpApiGoogleHotelsResponse = {
      search_parameters: { currency: "EUR" },
      properties: [],
    };
    const mapped = [sampleHotel()];

    let seenBuildRequest: SearchRequest | undefined;
    let seenSearchParams: URLSearchParams | undefined;
    let seenSearchConfig: Pick<SerpApiConfig, "apiKey"> | undefined;
    let seenMapRaw: SerpApiGoogleHotelsResponse | undefined;
    let seenMapContext:
      | {
          destinationId: string;
          requestCurrency?: string;
          locationFallback: string;
          checkInDate: string;
          checkOutDate: string;
        }
      | undefined;

    const provider = new SerpApiHotelsProvider({
      getSerpApiConfig: () => config,
      buildParams: (req) => {
        callOrder.push("build");
        seenBuildRequest = req;
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

    const hotels = await provider.search(request);

    assert.deepEqual(callOrder, ["build", "search", "map"]);
    assert.equal(hotels, mapped);
    assert.equal(seenBuildRequest, request);
    assert.equal(seenSearchParams, builtParams);
    assert.equal(seenSearchConfig?.apiKey, "serp-test-key");
    assert.equal(seenMapRaw, rawResponse);
    assert.deepEqual(seenMapContext, {
      destinationId: "bali",
      requestCurrency: "EUR",
      locationFallback: "Bali Resorts",
      checkInDate: "2026-04-08",
      checkOutDate: "2026-04-10",
      adults: 2,
    });
  });

  it("requires destinationId before searching", async () => {
    const provider = new SerpApiHotelsProvider({
      getSerpApiConfig: () => baseConfig(),
      buildParams: () => {
        throw new Error("should not build");
      },
    });

    await assert.rejects(
      () => provider.search(baseRequest({ destinationId: undefined })),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /destinationId/i);
        return true;
      },
    );
  });

  it("requires returnDate and does not invent checkout", async () => {
    const provider = new SerpApiHotelsProvider({
      getSerpApiConfig: () => baseConfig(),
      buildParams: () => {
        throw new Error("should not build");
      },
    });

    await assert.rejects(
      () =>
        provider.search(
          baseRequest({ tripType: "one-way", returnDate: null }),
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /returnDate/i);
        assert.match(error.message, /not supported/i);
        return true;
      },
    );
  });

  it("propagates builder and HTTP errors", async () => {
    const builderError = createProviderError("builder failed");
    const httpError = createProviderError("http failed");

    const failingBuilder = new SerpApiHotelsProvider({
      getSerpApiConfig: () => baseConfig(),
      buildParams: () => {
        throw builderError;
      },
    });

    await assert.rejects(() => failingBuilder.search(baseRequest()), (error) => {
      assert.equal(error, builderError);
      return true;
    });

    const failingHttp = new SerpApiHotelsProvider({
      getSerpApiConfig: () => baseConfig(),
      buildParams: () => new URLSearchParams(),
      searchHttp: async () => {
        throw httpError;
      },
    });

    await assert.rejects(() => failingHttp.search(baseRequest()), (error) => {
      assert.equal(error, httpError);
      return true;
    });
  });

  it("exposes the serpapi provider name", () => {
    assert.equal(new SerpApiHotelsProvider().name, "serpapi");
  });
});
