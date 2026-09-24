/**
 * Sprint 18.7 — SerpAPI round-trip return-lookup cap.
 *
 * Guards the SerpAPI quota (250 searches/month): however many outbound
 * offers carry a departure_token, only MAX_ROUND_TRIP_RETURN_LOOKUPS of
 * them may trigger a paid return-leg HTTP call. Remaining offers fall
 * back to the outbound option's own price.
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

describe("SerpApiFlightsProvider return-lookup cap (18.7)", () => {
  it("is 1 so a round-trip search stays cheap", () => {
    assert.equal(MAX_ROUND_TRIP_RETURN_LOOKUPS, 1);
  });

  it("makes at most MAX_ROUND_TRIP_RETURN_LOOKUPS return calls, whatever the offer count", async () => {
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

    // One outbound call plus at most the capped number of return calls.
    assert.equal(outboundCalls, 1);
    assert.equal(tokensSeen.length, MAX_ROUND_TRIP_RETURN_LOOKUPS);
    assert.deepEqual(tokensSeen, ["outbound-token-1"]);

    // Offers past the cap are still returned, priced from the outbound option.
    assert.equal(flights.length, 6);
    assert.equal(flights[0]!.price, 410);
    assert.ok(flights.slice(1).every((flight) => flight.price < 410));
  });
});
