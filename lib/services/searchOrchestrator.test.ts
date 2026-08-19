/**
 * Sprint 10.2 — partial provider failure + SearchResponse contract.
 * Sprint 13.3 — PackageComposer integration (product-layer packages).
 */

import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createProviderError, isApiError } from "@/lib/api/errors";
import { formatDateISO } from "@/lib/calendar/dates";
import {
  PROVIDER_UNAVAILABLE_WARNING_MESSAGE,
  buildSearchResponse,
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
import type { Flight, Hotel } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";
import type { ServiceProviders } from "@/lib/services/types";

/** Returns an ISO date string N days from today (always in the future). */
function futureDateISO(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return formatDateISO(d);
}

function baseRequest(
  overrides: Partial<SearchRequest> = {},
): SearchRequest {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    destination: "Paris, France",
    destinationId: "paris",
    tripType: "round-trip",
    departureDate: futureDateISO(30),
    returnDate: futureDateISO(37),
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

function emptyFlightsProvider(): FlightsProvider {
  return {
    name: "empty-flights",
    async search() {
      return [];
    },
  };
}

function emptyHotelsProvider(): HotelsProvider {
  return {
    name: "empty-hotels",
    async search() {
      return [];
    },
  };
}

function staticFlightsProvider(flights: Flight[]): FlightsProvider {
  return {
    name: "static-flights",
    async search() {
      return flights;
    },
  };
}

function staticHotelsProvider(hotels: Hotel[]): HotelsProvider {
  return {
    name: "static-hotels",
    async search() {
      return hotels;
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
    assert.deepEqual(response.packages, []);
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
    assert.deepEqual(response.packages, []);
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
    assert.ok(response.packages.length > 0);
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

describe("orchestrateTripSearch — TravelPackage integration", () => {
  it("composes packages when flights and hotels both succeed with results", async () => {
    setServiceProviders(providersWith({}));

    const response = await orchestrateTripSearch(baseRequest());

    assert.ok(response.flights.length > 0);
    assert.ok(response.hotels.length > 0);
    assert.ok(response.packages.length > 0);
    assert.ok(Array.isArray(response.packages));

    const pkg = response.packages[0]!;
    assert.ok(pkg.id.startsWith("pkg-"));
    assert.equal(pkg.flightId, pkg.flight.id);
    assert.equal(pkg.hotelId, pkg.hotel.id);
    assert.equal(pkg.totalPrice, pkg.flight.price + pkg.hotel.price);
    assert.equal(pkg.currency, pkg.flight.currency);

    // Packages are derived — not double-counted in totalCount.
    assert.equal(
      response.totalCount,
      response.hotels.length +
        response.flights.length +
        response.buses.length +
        response.trains.length +
        response.restaurants.length +
        response.attractions.length,
    );
  });

  it("returns packages=[] for flights-only product types", async () => {
    setServiceProviders(providersWith({}));

    const response = await orchestrateTripSearch(
      baseRequest({ productTypes: ["flights"] }),
    );

    assert.ok(response.flights.length > 0);
    assert.equal(response.hotels.length, 0);
    assert.deepEqual(response.packages, []);
  });

  it("returns packages=[] for hotels-only product types", async () => {
    setServiceProviders(providersWith({}));

    const response = await orchestrateTripSearch(
      baseRequest({ productTypes: ["hotels"] }),
    );

    assert.ok(response.hotels.length > 0);
    assert.equal(response.flights.length, 0);
    assert.deepEqual(response.packages, []);
  });

  it("returns packages=[] when flights provider fails", async () => {
    setServiceProviders(
      providersWith({ flights: failingFlightsProvider() }),
    );

    const response = await orchestrateTripSearch(baseRequest());

    assert.ok(response.hotels.length > 0);
    assert.equal(response.flights.length, 0);
    assert.deepEqual(response.packages, []);
    assert.equal(response.warnings?.[0]?.domain, "flights");
  });

  it("returns packages=[] when hotels provider fails", async () => {
    setServiceProviders(providersWith({ hotels: failingHotelsProvider() }));

    const response = await orchestrateTripSearch(baseRequest());

    assert.ok(response.flights.length > 0);
    assert.equal(response.hotels.length, 0);
    assert.deepEqual(response.packages, []);
    assert.equal(response.warnings?.[0]?.domain, "hotels");
  });

  it("returns packages=[] when either domain returns an empty array", async () => {
    setServiceProviders(
      providersWith({ flights: emptyFlightsProvider() }),
    );
    const emptyFlights = await orchestrateTripSearch(baseRequest());
    assert.equal(emptyFlights.flights.length, 0);
    assert.ok(emptyFlights.hotels.length > 0);
    assert.deepEqual(emptyFlights.packages, []);

    setServiceProviders(providersWith({ hotels: emptyHotelsProvider() }));
    const emptyHotels = await orchestrateTripSearch(baseRequest());
    assert.equal(emptyHotels.hotels.length, 0);
    assert.ok(emptyHotels.flights.length > 0);
    assert.deepEqual(emptyHotels.packages, []);
  });

  it("produces deterministic packages for identical inputs", async () => {
    const flights: Flight[] = [
      {
        id: "f-a",
        destinationId: "paris",
        price: 150,
        currency: "EUR",
        rating: 4.2,
        airline: "Air France",
        departureTime: "08:00",
        arrivalTime: "10:00",
        durationMinutes: 120,
        stops: 0,
        cabin: "Economy",
      },
      {
        id: "f-b",
        destinationId: "paris",
        price: 220,
        currency: "EUR",
        rating: 3.8,
        airline: "EasyJet",
        departureTime: "14:00",
        arrivalTime: "16:30",
        durationMinutes: 150,
        stops: 1,
        cabin: "Economy",
      },
    ];
    const hotels: Hotel[] = [
      {
        id: "h-a",
        destinationId: "paris",
        price: 400,
        currency: "EUR",
        rating: 4.5,
        name: "Hotel A",
        stars: 4,
        amenities: ["Wi-Fi"],
        nights: 7,
        location: "Center",
      },
      {
        id: "h-b",
        destinationId: "paris",
        price: 550,
        currency: "EUR",
        rating: 4.0,
        name: "Hotel B",
        stars: 3,
        amenities: [],
        nights: 7,
        location: "East",
      },
    ];

    setServiceProviders(
      providersWith({
        flights: staticFlightsProvider(flights),
        hotels: staticHotelsProvider(hotels),
      }),
    );

    const first = await orchestrateTripSearch(baseRequest());
    const second = await orchestrateTripSearch(baseRequest());

    assert.equal(first.packages.length, 4);
    assert.deepEqual(
      first.packages.map((pkg) => ({
        id: pkg.id,
        score: pkg.score,
        totalPrice: pkg.totalPrice,
      })),
      second.packages.map((pkg) => ({
        id: pkg.id,
        score: pkg.score,
        totalPrice: pkg.totalPrice,
      })),
    );
  });

  it("does not call providers when composing packages", async () => {
    let flightCalls = 0;
    let hotelCalls = 0;

    setServiceProviders(
      providersWith({
        flights: {
          name: "counting-flights",
          async search(request) {
            flightCalls += 1;
            return mockFlightsProvider.search(request);
          },
        },
        hotels: {
          name: "counting-hotels",
          async search(request) {
            hotelCalls += 1;
            return mockHotelsProvider.search(request);
          },
        },
      }),
    );

    const response = await orchestrateTripSearch(baseRequest());

    assert.equal(flightCalls, 1);
    assert.equal(hotelCalls, 1);
    assert.ok(response.packages.length > 0);
  });
});

describe("buildSearchResponse — packages field", () => {
  it("defaults packages to an empty array", () => {
    const response = buildSearchResponse({
      hotels: [],
      flights: [],
    });

    assert.deepEqual(response.packages, []);
    assert.equal(response.totalCount, 0);
  });

  it("includes provided packages without affecting totalCount", () => {
    const response = buildSearchResponse({
      hotels: [
        {
          id: "h1",
          destinationId: "paris",
          price: 100,
          currency: "EUR",
          rating: 4,
          name: "H",
          stars: 3,
          amenities: [],
          nights: 2,
          location: "C",
        },
      ],
      flights: [
        {
          id: "f1",
          destinationId: "paris",
          price: 50,
          currency: "EUR",
          rating: 4,
          airline: "AF",
          departureTime: "08:00",
          arrivalTime: "10:00",
          durationMinutes: 120,
          stops: 0,
          cabin: "Economy",
        },
      ],
      packages: [
        {
          id: "pkg-f1-h1",
          flightId: "f1",
          hotelId: "h1",
          flight: {
            id: "f1",
            destinationId: "paris",
            price: 50,
            currency: "EUR",
            rating: 4,
            airline: "AF",
            departureTime: "08:00",
            arrivalTime: "10:00",
            durationMinutes: 120,
            stops: 0,
            cabin: "Economy",
          },
          hotel: {
            id: "h1",
            destinationId: "paris",
            price: 100,
            currency: "EUR",
            rating: 4,
            name: "H",
            stars: 3,
            amenities: [],
            nights: 2,
            location: "C",
          },
          totalPrice: 150,
          currency: "EUR",
          nights: 2,
          score: 80,
        },
      ],
    });

    assert.equal(response.packages.length, 1);
    assert.equal(response.totalCount, 2);
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
      assert.ok(Array.isArray(result.data.packages));
      assert.ok(typeof result.data.totalCount === "number");
      assert.ok(typeof result.data.searchedAt === "string");
    }
  });
});
