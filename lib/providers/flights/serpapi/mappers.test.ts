/**
 * Sprint 9.6 — SerpAPI → Flight mapper tests (no HTTP / provider).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import {
  emptyGoogleFlightsResponse,
  missingTimesOption,
  nonstopOneWayOption,
  oneStopOption,
  roundTripGoogleFlightsResponse,
  roundTripOption,
  successfulGoogleFlightsResponse,
  threeStopOption,
} from "@/lib/providers/flights/serpapi/__fixtures__/googleFlights.sample";
import {
  mapSerpApiFlightsResponse,
  mapSerpApiOptionToFlight,
} from "@/lib/providers/flights/serpapi/mappers";
import {
  buildDeterministicFlightId,
  formatSerpApiTime,
  mapAirline,
  mapCabin,
  mapDuration,
  mapPrice,
  mapStops,
  validateCurrency,
} from "@/lib/providers/flights/serpapi/mappingHelpers";
import type { SerpApiGoogleFlightsResponse } from "@/lib/providers/flights/serpapi/types";

const DESTINATION_ID = "paris";

describe("SerpAPI mapping helpers", () => {
  it("formats SerpAPI times and maps price/stops/duration/cabin/airline", () => {
    assert.equal(formatSerpApiTime("2026-08-01 08:15"), "08:15");
    assert.equal(formatSerpApiTime(undefined), null);
    assert.equal(mapPrice(98), 98);
    assert.equal(mapPrice(-1), null);
    assert.equal(mapStops(nonstopOneWayOption.flights), 0);
    assert.equal(mapStops(oneStopOption.flights), 1);
    assert.equal(mapStops(threeStopOption.flights), 2);
    assert.equal(mapDuration(nonstopOneWayOption), 85);
    assert.equal(mapCabin("Business"), "Business");
    assert.equal(mapCabin(undefined), "Economy");
    assert.equal(mapAirline(nonstopOneWayOption.flights), "Air France");
  });

  it("validates currency and builds deterministic ids", () => {
    assert.deepEqual(validateCurrency("EUR"), { ok: true, currency: "EUR" });
    assert.deepEqual(validateCurrency("SEK"), {
      ok: false,
      received: "SEK",
    });

    const first = buildDeterministicFlightId(nonstopOneWayOption);
    const second = buildDeterministicFlightId(nonstopOneWayOption);
    assert.equal(first, second);
    assert.match(first, /^serpapi-[a-f0-9]{16}$/);
  });
});

describe("mapSerpApiOptionToFlight", () => {
  it("maps a successful nonstop itinerary", () => {
    const flight = mapSerpApiOptionToFlight(nonstopOneWayOption, {
      destinationId: DESTINATION_ID,
      currency: "EUR",
    });

    assert.ok(flight);
    assert.equal(flight.destinationId, DESTINATION_ID);
    assert.equal(flight.price, 98);
    assert.equal(flight.currency, "EUR");
    assert.equal(flight.airline, "Air France");
    assert.equal(flight.departureTime, "08:15");
    assert.equal(flight.arrivalTime, "09:40");
    assert.equal(flight.durationMinutes, 85);
    assert.equal(flight.stops, 0);
    assert.equal(flight.cabin, "Economy");
    assert.equal(flight.rating, 0);
    assert.match(flight.id, /^serpapi-/);
  });

  it("maps multiple stops", () => {
    const flight = mapSerpApiOptionToFlight(threeStopOption, {
      destinationId: DESTINATION_ID,
      currency: "EUR",
    });

    assert.ok(flight);
    assert.equal(flight.stops, 2);
    assert.equal(flight.airline, "Lufthansa");
    assert.equal(flight.departureTime, "05:00");
    assert.equal(flight.arrivalTime, "12:10");
    assert.equal(flight.durationMinutes, 430);
  });

  it("filters invalid itineraries with missing times", () => {
    const flight = mapSerpApiOptionToFlight(missingTimesOption, {
      destinationId: DESTINATION_ID,
      currency: "EUR",
    });

    assert.equal(flight, null);
  });

  it("maps a round-trip sample using outbound schedule and total price", () => {
    const flight = mapSerpApiOptionToFlight(roundTripOption, {
      destinationId: DESTINATION_ID,
      currency: "EUR",
    });

    assert.ok(flight);
    assert.equal(flight.cabin, "Business");
    assert.equal(flight.price, 410);
    assert.equal(flight.departureTime, "07:00");
    assert.equal(flight.arrivalTime, "08:25");
    assert.equal(flight.rating, 0);
  });
});

describe("mapSerpApiFlightsResponse", () => {
  it("maps multiple flights from best_flights and other_flights", () => {
    const flights = mapSerpApiFlightsResponse(successfulGoogleFlightsResponse, {
      destinationId: DESTINATION_ID,
    });

    assert.equal(flights.length, 3);
    assert.equal(flights[0]?.airline, "Air France");
    assert.equal(flights[1]?.stops, 1);
    assert.equal(flights[2]?.airline, "easyJet");
    assert.ok(flights.every((flight) => flight.destinationId === DESTINATION_ID));
    assert.ok(flights.every((flight) => flight.currency === "EUR"));
    assert.ok(flights.every((flight) => flight.rating === 0));
  });

  it("returns an empty array for an empty response", () => {
    const flights = mapSerpApiFlightsResponse(emptyGoogleFlightsResponse, {
      destinationId: DESTINATION_ID,
    });

    assert.deepEqual(flights, []);
  });

  it("handles missing optional arrays without throwing", () => {
    const response: SerpApiGoogleFlightsResponse = {
      search_parameters: { currency: "USD" },
    };

    assert.deepEqual(
      mapSerpApiFlightsResponse(response, { destinationId: DESTINATION_ID }),
      [],
    );
  });

  it("filters invalid itineraries while keeping valid ones", () => {
    const response: SerpApiGoogleFlightsResponse = {
      search_parameters: { currency: "EUR" },
      best_flights: [missingTimesOption, nonstopOneWayOption],
    };

    const flights = mapSerpApiFlightsResponse(response, {
      destinationId: DESTINATION_ID,
    });

    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.airline, "Air France");
  });

  it("maps a round-trip response fixture", () => {
    const flights = mapSerpApiFlightsResponse(roundTripGoogleFlightsResponse, {
      destinationId: DESTINATION_ID,
    });

    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.cabin, "Business");
    assert.equal(flights[0]?.price, 410);
  });

  it("throws ProviderError for unsupported currency", () => {
    const response: SerpApiGoogleFlightsResponse = {
      search_parameters: { currency: "SEK" },
      best_flights: [nonstopOneWayOption],
    };

    assert.throws(
      () =>
        mapSerpApiFlightsResponse(response, { destinationId: DESTINATION_ID }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.match(error.message, /SEK/);
        return true;
      },
    );
  });

  it("throws ProviderError when currency is missing but offers exist", () => {
    const response: SerpApiGoogleFlightsResponse = {
      best_flights: [nonstopOneWayOption],
    };

    assert.throws(
      () =>
        mapSerpApiFlightsResponse(response, { destinationId: DESTINATION_ID }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /missing/i);
        return true;
      },
    );
  });
});
