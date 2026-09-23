/**
 * Milestone 18.4a — scout date-options service tests (mock providers only).
 */

import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatDateISO } from "@/lib/calendar/dates";
import { createProviderError } from "@/lib/api/errors";
import { mockCurrencyProvider } from "@/lib/providers/currencies/mock";
import { mockDestinationProvider } from "@/lib/providers/destinations/mock";
import { mockFlightsProvider } from "@/lib/providers/flights/mock";
import { mockTransportProvider } from "@/lib/providers/ground/mock";
import { mockHotelsProvider } from "@/lib/providers/hotels/mock";
import type {
  FlightSearchOptions,
  FlightsProvider,
  HotelsProvider,
} from "@/lib/providers/core/types";
import {
  resetServiceProviders,
  setServiceProviders,
} from "@/lib/services/context";
import {
  DATE_OPTIONS_CONCURRENCY,
  findCheapestPackage,
  mapWithConcurrency,
  packageTotalFitsBudget,
  searchDateOptions,
} from "@/lib/services/dateOptionsService";
import { orchestrateTripSearch } from "@/lib/services/searchOrchestrator";
import type { ServiceProviders } from "@/lib/services/types";
import type { Flight, Hotel, TravelPackage } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

function futureDateISO(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return formatDateISO(d);
}

function baseRequest(overrides: Partial<SearchRequest> = {}): SearchRequest {
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
    productTypes: ["hotels", "flights"],
    flexDays: 2,
    ...overrides,
  };
}

function mockProviders(
  overrides: Partial<ServiceProviders> = {},
): ServiceProviders {
  return {
    destinations: mockDestinationProvider,
    currencies: mockCurrencyProvider,
    hotels: mockHotelsProvider,
    flights: mockFlightsProvider,
    transport: mockTransportProvider,
    ...overrides,
  };
}

afterEach(() => {
  resetServiceProviders();
});

describe("packageTotalFitsBudget", () => {
  it("requires matching currency and total <= budget", () => {
    assert.equal(
      packageTotalFitsBudget(500, "EUR", { amount: 600, currency: "EUR" }),
      true,
    );
    assert.equal(
      packageTotalFitsBudget(600, "EUR", { amount: 600, currency: "EUR" }),
      true,
    );
    assert.equal(
      packageTotalFitsBudget(601, "EUR", { amount: 600, currency: "EUR" }),
      false,
    );
    assert.equal(
      packageTotalFitsBudget(100, "USD", { amount: 600, currency: "EUR" }),
      false,
    );
    assert.equal(packageTotalFitsBudget(100, "EUR", null), false);
  });
});

describe("findCheapestPackage", () => {
  it("returns the lowest totalPrice package", () => {
    const packages = [
      { totalPrice: 900, currency: "EUR" },
      { totalPrice: 500, currency: "EUR" },
      { totalPrice: 700, currency: "EUR" },
    ] as TravelPackage[];
    assert.equal(findCheapestPackage(packages)?.totalPrice, 500);
  });
});

describe("mapWithConcurrency", () => {
  it("never runs more than the limit at once", async () => {
    let current = 0;
    let maxConcurrent = 0;
    const items = [1, 2, 3, 4, 5, 6];

    await mapWithConcurrency(items, 3, async (n) => {
      current += 1;
      maxConcurrent = Math.max(maxConcurrent, current);
      await new Promise((r) => setTimeout(r, 30));
      current -= 1;
      return n * 2;
    });

    assert.ok(maxConcurrent <= 3);
    assert.equal(DATE_OPTIONS_CONCURRENCY, 3);
  });

  it("preserves order", async () => {
    const out = await mapWithConcurrency([1, 2, 3], 2, async (n) => {
      await new Promise((r) => setTimeout(r, 5 * (4 - n)));
      return n;
    });
    assert.deepEqual(out, [1, 2, 3]);
  });
});

describe("searchDateOptions", () => {
  it("returns 2 / 4 / 6 pairs for flexDays ±1 / ±2 / ±3", async () => {
    setServiceProviders(mockProviders());
    const request = baseRequest();

    const one = await searchDateOptions({
      request,
      flexDays: 1,
      today: futureDateISO(0),
    });
    assert.equal(one.options.length, 2);

    const two = await searchDateOptions({
      request,
      flexDays: 2,
      today: futureDateISO(0),
    });
    assert.equal(two.options.length, 4);

    const three = await searchDateOptions({
      request,
      flexDays: 3,
      today: futureDateISO(0),
    });
    assert.equal(three.options.length, 6);
  });

  it("returns empty list when flexDays is 0", async () => {
    const result = await searchDateOptions({
      request: baseRequest({ flexDays: 0 }),
      flexDays: 0,
      today: futureDateISO(0),
      providers: mockProviders(),
    });
    assert.deepEqual(result.options, []);
  });

  it("uses ~1 flight + 1 hotel call per pair in scout mode (not transport)", async () => {
    let flightCalls = 0;
    let hotelCalls = 0;
    let transportCalls = 0;
    const scoutFlags: Array<boolean | undefined> = [];

    const flights: FlightsProvider = {
      name: "counting-flights",
      async search(request, options?: FlightSearchOptions) {
        flightCalls += 1;
        scoutFlags.push(options?.scout);
        return mockFlightsProvider.search(request, options);
      },
    };
    const hotels: HotelsProvider = {
      name: "counting-hotels",
      async search(request) {
        hotelCalls += 1;
        return mockHotelsProvider.search(request);
      },
    };

    const providers = mockProviders({
      flights,
      hotels,
      transport: {
        name: "counting-transport",
        async search() {
          transportCalls += 1;
          return { buses: [], trains: [] };
        },
      },
    });

    const result = await searchDateOptions({
      request: baseRequest({ flexDays: 1 }),
      flexDays: 1,
      today: futureDateISO(0),
      providers,
    });

    assert.equal(result.options.length, 2);
    // Scout forces hotels+flights only → 2 pairs × 1 flight + 1 hotel.
    assert.equal(flightCalls, 2);
    assert.equal(hotelCalls, 2);
    assert.equal(transportCalls, 0);
    assert.ok(scoutFlags.every((flag) => flag === true));
    assert.ok(result.options.every((o) => o.status === "ok"));
  });

  it("keeps normal orchestrateTripSearch without scout (unchanged path)", async () => {
    let seenOptions: FlightSearchOptions | undefined | "missing" = "missing";
    const flights: FlightsProvider = {
      name: "spy-flights",
      async search(request, options?: FlightSearchOptions) {
        seenOptions = options;
        return mockFlightsProvider.search(request, options);
      },
    };

    const providers = mockProviders({ flights });
    await orchestrateTripSearch(baseRequest(), providers);
    assert.equal(seenOptions, undefined);
  });

  it("isolates one failing pair without killing the others", async () => {
    const request = baseRequest({ flexDays: 1 });
    const today = futureDateISO(0);

    const result = await searchDateOptions({
      request,
      flexDays: 1,
      today,
      providers: mockProviders(),
      scoutPair: async (pairRequest) => {
        if (pairRequest.departureDate === request.departureDate) {
          // Should not happen — offset 0 is excluded.
        }
        // Fail the earlier (−1) offset only.
        const dep = new Date(`${pairRequest.departureDate}T00:00:00`);
        const base = new Date(`${request.departureDate}T00:00:00`);
        if (dep.getTime() < base.getTime()) {
          throw createProviderError("Simulated scout failure.");
        }
        return {
          packages: [
            {
              id: "pkg-ok",
              totalPrice: 400,
              currency: "EUR",
            } as TravelPackage,
          ],
        };
      },
    });

    assert.equal(result.options.length, 2);
    const failed = result.options.find((o) => o.offsetDays === -1);
    const ok = result.options.find((o) => o.offsetDays === 1);
    assert.equal(failed?.status, "error");
    assert.equal(ok?.status, "ok");
    assert.equal(ok?.cheapestTotal, 400);
  });

  it("sets fitsBudget false on currency mismatch even when total is low", async () => {
    const result = await searchDateOptions({
      request: baseRequest({
        flexDays: 1,
        budget: { amount: 5000, currency: "EUR" },
      }),
      flexDays: 1,
      today: futureDateISO(0),
      providers: mockProviders(),
      scoutPair: async () => ({
        packages: [
          {
            id: "pkg-usd",
            totalPrice: 100,
            currency: "USD",
          } as TravelPackage,
        ],
      }),
    });

    assert.equal(result.options.length, 2);
    assert.ok(result.options.every((o) => o.status === "ok"));
    assert.ok(result.options.every((o) => o.fitsBudget === false));
    assert.ok(result.options.every((o) => o.currency === "USD"));
  });

  it("sets fitsBudget true when cheapest total is within matching budget", async () => {
    const result = await searchDateOptions({
      request: baseRequest({
        flexDays: 1,
        budget: { amount: 500, currency: "EUR" },
      }),
      flexDays: 1,
      today: futureDateISO(0),
      providers: mockProviders(),
      scoutPair: async () => ({
        packages: [
          { id: "a", totalPrice: 400, currency: "EUR" } as TravelPackage,
          { id: "b", totalPrice: 900, currency: "EUR" } as TravelPackage,
        ],
      }),
    });

    assert.ok(result.options.every((o) => o.fitsBudget === true));
    assert.ok(result.options.every((o) => o.cheapestTotal === 400));
  });

  it("respects concurrency limit of 3 during explore", async () => {
    let current = 0;
    let maxConcurrent = 0;

    const result = await searchDateOptions({
      request: baseRequest({ flexDays: 3 }),
      flexDays: 3,
      today: futureDateISO(0),
      providers: mockProviders(),
      concurrency: 3,
      scoutPair: async () => {
        current += 1;
        maxConcurrent = Math.max(maxConcurrent, current);
        await new Promise((r) => setTimeout(r, 40));
        current -= 1;
        return {
          packages: [
            { id: "pkg", totalPrice: 300, currency: "EUR" } as TravelPackage,
          ],
        };
      },
    });

    assert.equal(result.options.length, 6);
    assert.ok(maxConcurrent <= 3);
    assert.ok(maxConcurrent >= 2);
  });

  it("marks slow pairs as timeout when the overall budget is exhausted", async () => {
    const result = await searchDateOptions({
      request: baseRequest({ flexDays: 2 }),
      flexDays: 2,
      today: futureDateISO(0),
      providers: mockProviders(),
      concurrency: 1,
      timeBudgetMs: 40,
      scoutPair: async () => {
        await new Promise((r) => setTimeout(r, 80));
        return {
          packages: [
            { id: "pkg", totalPrice: 300, currency: "EUR" } as TravelPackage,
          ],
        };
      },
    });

    assert.equal(result.options.length, 4);
    assert.ok(result.options.some((o) => o.status === "timeout"));
  });

  it("returns no_results when scout yields empty packages", async () => {
    const result = await searchDateOptions({
      request: baseRequest({ flexDays: 1 }),
      flexDays: 1,
      today: futureDateISO(0),
      providers: mockProviders(),
      scoutPair: async () => ({ packages: [] }),
    });

    assert.ok(result.options.every((o) => o.status === "no_results"));
  });
});

describe("orchestrateTripSearch scout flag", () => {
  it("passes scout:true to the flights provider when requested", async () => {
    let seen: FlightSearchOptions | undefined;
    const flights: FlightsProvider = {
      name: "scout-spy",
      async search(request, options) {
        seen = options;
        return [] as Flight[];
      },
    };
    const hotels: HotelsProvider = {
      name: "hotels-spy",
      async search() {
        return [] as Hotel[];
      },
    };

    await orchestrateTripSearch(
      baseRequest({ productTypes: ["flights", "hotels"] }),
      mockProviders({ flights, hotels }),
      { scout: true },
    );

    assert.deepEqual(seen, { scout: true });
  });
});
