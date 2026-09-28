/**
 * Sprint 18.7 / 18.8 — SerpAPI round-trip return-lookup cap.
 *
 * Guards the SerpAPI quota (250 searches/month): however many outbound
 * offers carry a departure_token, only MAX_ROUND_TRIP_RETURN_LOOKUPS of
 * them may trigger a paid return-leg HTTP call. Remaining offers are
 * dropped — outbound-only prices are not honest round-trip totals.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { SerpApiConfig } from "@/lib/config/types";
import {
  MAX_ROUND_TRIP_RETURN_LOOKUPS,
  SerpApiFlightsProvider,
} from "@/lib/providers/flights/serpapi/provider";
import type { SearchRequest } from "@/types/models/search-request";

function roundTripRequest(): SearchRequest {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    originIata: "MXP",
    destination: "Paris, France",
    destinationId: "paris",
    destinationIata: "CDG",
    tripType: "round-trip",
    departureDate: "2026-08-01",
    returnDate: "2026-08-10",
    budget: { amount: 500, currency: "EUR" },
    travelers: { adults: 1, children: 0, infants: 0, rooms: 1 },
    totalGuests: 1,
    travelStyle: "standard",
    productTypes: ["flights"],
  };
}

function oneWayRequest(): SearchRequest {
  return {
    ...roundTripRequest(),
    tripType: "one-way",
    returnDate: null,
  };
}

function config(): SerpApiConfig {
  return {
    apiKey: "serp-test-key",
    deepSearch: false,
    deepSearchInvalid: false,
    isConfigured: true,
  };
}

function outboundOption(index: number) {
  return {
    flights: [
      {
        departure_airport: { id: "MXP", time: `2026-08-01 0${index}:00` },
        arrival_airport: { id: "CDG", time: `2026-08-01 0${index}:30` },
        duration: 90,
        airline: "Air France",
        travel_class: "Economy",
        flight_number: `AF ${index}`,
      },
    ],
    total_duration: 90,
    price: 100 + index,
    type: "Round trip",
    departure_token: `outbound-token-${index}`,
  };
}

function returnOption() {
  return {
    flights: [
      {
        departure_airport: { id: "CDG", time: "2026-08-10 18:00" },
        arrival_airport: { id: "MXP", time: "2026-08-10 19:30" },
        duration: 90,
        airline: "Air France",
        travel_class: "Economy",
        flight_number: "AF 99",
      },
    ],
    total_duration: 90,
    price: 410,
    type: "Round trip",
  };
}

describe("SerpApiFlightsProvider return-lookup cap (18.7 / 18.8)", () => {
  it("is 3 so a full round-trip search stays within quota", () => {
    assert.equal(MAX_ROUND_TRIP_RETURN_LOOKUPS, 3);
  });

  it("makes at most MAX_ROUND_TRIP_RETURN_LOOKUPS return calls and drops the rest", async () => {
    const tokensSeen: string[] = [];
    let outboundCalls = 0;

    const provider = new SerpApiFlightsProvider({
      getSerpApiConfig: config,
      buildParams: () => new URLSearchParams({ engine: "google_flights" }),
      buildReturnParams: (token) => {
        tokensSeen.push(token);
        return new URLSearchParams({
          engine: "google_flights",
          departure_token: token,
        });
      },
      searchHttp: async (params) => {
        if (params.get("departure_token")) {
          return {
            search_parameters: { currency: "EUR" },
            best_flights: [returnOption()],
          };
        }
        outboundCalls += 1;
        return {
          search_parameters: { currency: "EUR" },
          best_flights: [1, 2, 3, 4, 5, 6].map(outboundOption),
        };
      },
      mapResponse: () => {
        throw new Error("one-way mapper should not run for round-trip with tokens");
      },
    });

    const flights = await provider.search(roundTripRequest());

    assert.equal(outboundCalls, 1);
    assert.equal(tokensSeen.length, MAX_ROUND_TRIP_RETURN_LOOKUPS);
    assert.deepEqual(tokensSeen, [
      "outbound-token-1",
      "outbound-token-2",
      "outbound-token-3",
    ]);

    // Only enriched offers — beyond-cap outbounds are dropped (no understated prices).
    assert.equal(flights.length, 3);
    assert.ok(flights.every((flight) => flight.price === 410));
    assert.ok(flights.every((flight) => flight.id.startsWith("serpapi-rt-")));
  });

  it("does not run return lookups for one-way searches (scout or full)", async () => {
    let httpCalls = 0;
    let returnBuilderCalls = 0;
    let mapCalls = 0;
    const mapped = [
      {
        id: "serpapi-ow-1",
        destinationId: "paris",
        price: 120,
        currency: "EUR" as const,
        rating: 4,
        airline: "AF",
        departureTime: "2026-08-01 07:00",
        arrivalTime: "2026-08-01 08:30",
        durationMinutes: 90,
        stops: 0,
        cabin: "Economy" as const,
      },
    ];

    const provider = new SerpApiFlightsProvider({
      getSerpApiConfig: config,
      buildParams: () => new URLSearchParams({ engine: "google_flights" }),
      buildReturnParams: () => {
        returnBuilderCalls += 1;
        return new URLSearchParams({ departure_token: "x" });
      },
      searchHttp: async () => {
        httpCalls += 1;
        return {
          search_parameters: { currency: "EUR" },
          best_flights: [outboundOption(1)],
        };
      },
      mapResponse: () => {
        mapCalls += 1;
        return mapped;
      },
    });

    const full = await provider.search(oneWayRequest());
    const scout = await provider.search(oneWayRequest(), { scout: true });

    assert.equal(httpCalls, 2);
    assert.equal(returnBuilderCalls, 0);
    assert.equal(mapCalls, 2);
    assert.equal(full, mapped);
    assert.equal(scout, mapped);
  });
});
