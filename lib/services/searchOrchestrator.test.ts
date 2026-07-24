/**
 * Sprint 10.2 — partial provider failure + SearchResponse contract.
 */

import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createProviderError, isApiError } from "@/lib/api/errors";
import {
  PROVIDER_UNAVAILABLE_WARNING_MESSAGE,
  searchResponseToResults,
} from "@/lib/api/searchMappers";
import { mockCurrencyProvider } from "@/lib/providers/currencies/mock";
import { mockDestinationProvider } from "@/lib/providers/destinations/mock";
import { mockFlightsProvider } from "@/lib/providers/flights/mock";
import { mockTransportProvider } from "@/lib/providers/ground/mock";
import { mockHotelsProvider } from "@/lib/providers/hotels/mock";
import type {
  FlightsProvider,
  HotelsProvider,
  TransportProvider,
} from "@/lib/providers/core/types";
import {
  resetServiceProviders,
  setServiceProviders,
} from "@/lib/services/context";
import { orchestrateTripSearch } from "@/lib/services/searchOrchestrator";
import { searchTrips } from "@/lib/services/searchService";
import type { SearchRequest } from "@/types/models/search-request";
import type { ServiceProviders } from "@/lib/services/types";

function baseRequest(
  overrides: Partial<SearchRequest> = {},
): SearchRequest {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    destination: "Paris, France",
    destinationId: "paris",
    tripType: "round-trip",
    departureDate: "2026-08-10",
    returnDate: "2026-08-17",
    budget: { amount: 2500, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels", "flights", "transport"],
    ...overrides,
  };
}

function failingHotelsProvider(): HotelsProvider {
  return {
    name: "failing-hotels",
    async search() {
      throw createProviderError("Hotels unavailable (test).");
    },
  };
}

function failingFlightsProvider(): FlightsProvider {
  return {
    name: "failing-flights",
    async search() {
      throw createProviderError("Flights unavailable (test).");
    },
  };
}

function failingTransportProvider(): TransportProvider {
  return {
    name: "failing-transport",
    async search() {
      throw createProviderError("Transport unavailable (test).");
    },
  };
}

function providersWith(
  overrides: Partial<ServiceProviders>,
): ServiceProviders {
  return {
    currencies: mockCurrencyProvider,
    destinations: mockDestinationProvider,
    hotels: mockHotelsProvider,
    flights: mockFlightsProvider,
    transport: mockTransportProvider,
    ...overrides,
  };
}

afterEach(() => {
  resetServiceProviders();
});

describe("orchestrateTripSearch — partial provider failure", () => {
  it("returns hotels + transport with a flights warning when flights fail", async () => {
    setServiceProviders(
      providersWith({ flights: failingFlightsProvider() }),
    );

    const response = await orchestrateTripSearch(baseRequest());

    assert.ok(response.hotels.length > 0);
    assert.equal(response.flights.length, 0);
    assert.ok(response.buses.length + response.trains.length > 0);
    assert.ok(response.warnings);
    assert.equal(response.warnings?.length, 1);
    assert.equal(response.warnings?.[0]?.domain, "flights");
    assert.equal(
      response.warnings?.[0]?.code,
      "PROVIDER_UNAVAILABLE",
    );
    assert.equal(
      response.warnings?.[0]?.message,
      PROVIDER_UNAVAILABLE_WARNING_MESSAGE,
    );
    assert.match(
      response.warnings?.[0]?.message ?? "",
      /temporarily unavailable/i,
    );
    assert.doesNotMatch(
      response.warnings?.[0]?.message ?? "",
      /serpapi|amadeus|mock/i,
    );

    const results = searchResponseToResults(response);
    assert.ok(results.some((item) => item.type === "hotel"));
    assert.ok(!results.some((item) => item.type === "flight"));
  });

  it("returns flights + transport with a hotels warning when hotels fail", async () => {
    setServiceProviders(providersWith({ hotels: failingHotelsProvider() }));

    const response = await orchestrateTripSearch(baseRequest());

    assert.equal(response.hotels.length, 0);
    assert.ok(response.flights.length > 0);
    assert.ok(response.buses.length + response.trains.length > 0);
    assert.equal(response.warnings?.length, 1);
    assert.equal(response.warnings?.[0]?.domain, "hotels");
  });

  it("returns hotels + flights with a transport warning when transport fails", async () => {
    setServiceProviders(
      providersWith({ transport: failingTransportProvider() }),
    );

    const response = await orchestrateTripSearch(baseRequest());

    assert.ok(response.hotels.length > 0);
    assert.ok(response.flights.length > 0);
    assert.equal(response.buses.length, 0);
    assert.equal(response.trains.length, 0);
    assert.equal(response.warnings?.[0]?.domain, "transport");
  });

  it("throws a provider error when every requested domain fails", async () => {
    setServiceProviders(
      providersWith({
        hotels: failingHotelsProvider(),
        flights: failingFlightsProvider(),
        transport: failingTransportProvider(),
      }),
    );

    await assert.rejects(
      () => orchestrateTripSearch(baseRequest()),
      (error: unknown) => {
        assert.equal(isApiError(error), true);
        if (isApiError(error)) {
          assert.equal(error.code, "PROVIDER_ERROR");
        }
        return true;
      },
    );
  });

  it("does not warn when all requested domains succeed", async () => {
    setServiceProviders(providersWith({}));

    const response = await orchestrateTripSearch(baseRequest());

    assert.ok(response.totalCount > 0);
    assert.equal(response.warnings, undefined);
  });
});

describe("searchTrips — validation remains blocking", () => {
  it("returns a validation failure for an incomplete request", async () => {
    const result = await searchTrips({
      destination: "Paris, France",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.code, "VALIDATION_ERROR");
    }
  });

  it("returns a validation failure when flights lack resolvable airports", async () => {
    const noAirportDestinations = {
      name: "no-airports",
      async searchDestinations() {
        return [];
      },
      async getPopularDestinations() {
        return [];
      },
      async getDestinationById() {
        return null;
      },
      async resolveDestinationId() {
        return "";
      },
    };

    setServiceProviders(
      providersWith({ destinations: noAirportDestinations }),
    );

    const result = await searchTrips(
      baseRequest({
        origin: "Unknownville",
        originId: undefined,
        destination: "Nowhere Land",
        destinationId: undefined,
        productTypes: ["flights"],
      }),
    );

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.code, "VALIDATION_ERROR");
    }
  });

  it("returns SearchResponse on success", async () => {
    setServiceProviders(providersWith({}));

    const result = await searchTrips(baseRequest());

    assert.equal(result.success, true);
    if (result.success) {
      assert.ok(Array.isArray(result.data.hotels));
      assert.ok(Array.isArray(result.data.flights));
      assert.ok(typeof result.data.totalCount === "number");
      assert.ok(typeof result.data.searchedAt === "string");
    }
  });
});
