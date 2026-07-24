/**
 * Sprint 9.6 / 11.2 — SerpAPI → Flight mapper tests (no HTTP / provider).
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
  mapSerpApiRoundTripPairToFlight,
} from "@/lib/providers/flights/serpapi/mappers";
import {
  buildDeterministicFlightId,
  buildRoundTripFlightId,
  DEFAULT_SERPAPI_CURRENCY,
  formatSerpApiDateTime,
  formatSerpApiTime,
  mapAirline,
  mapCabin,
  mapDuration,
  mapPrice,
  mapStops,
  resolveFlightCurrency,
  validateCurrency,
} from "@/lib/providers/flights/serpapi/mappingHelpers";
import type { SerpApiGoogleFlightsResponse } from "@/lib/providers/flights/serpapi/types";

const DESTINATION_ID = "paris";

describe("SerpAPI mapping helpers", () => {
  it("preserves full date-time and falls back to clock time", () => {
    assert.equal(formatSerpApiDateTime("2026-09-15 06:30"), "2026-09-15 06:30");
    assert.equal(formatSerpApiDateTime("2026-09-15T06:30:00"), "2026-09-15 06:30");
    assert.equal(formatSerpApiDateTime("06:30"), "06:30");
    assert.equal(formatSerpApiTime("2026-08-01 08:15"), "2026-08-01 08:15");
    assert.equal(formatSerpApiDateTime(undefined), null);
  });

  it("maps price/stops/duration/cabin/airline", () => {
    assert.equal(mapPrice(98), 98);
    assert.equal(mapPrice("142"), 142);
    assert.equal(mapPrice(-1), null);
    assert.equal(mapStops(nonstopOneWayOption.flights), 0);
    assert.equal(mapStops(oneStopOption.flights), 1);
    assert.equal(mapStops(threeStopOption.flights), 2);
    assert.equal(mapDuration(nonstopOneWayOption), 85);
    assert.equal(mapCabin("Business"), "Business");
    assert.equal(mapCabin(undefined), "Economy");
    assert.equal(mapAirline(nonstopOneWayOption.flights), "Air France");
  });

  it("validates currency and resolves fallbacks", () => {
    assert.deepEqual(validateCurrency("EUR"), { ok: true, currency: "EUR" });
    assert.deepEqual(validateCurrency("SEK"), {
      ok: false,
      received: "SEK",
    });

    assert.deepEqual(
      resolveFlightCurrency({ responseCurrency: undefined, requestCurrency: "USD" }),
      { ok: true, currency: "USD" },
    );
    assert.deepEqual(
      resolveFlightCurrency({
        responseCurrency: undefined,
        requestCurrency: undefined,
      }),
      { ok: true, currency: DEFAULT_SERPAPI_CURRENCY },
    );
    assert.deepEqual(
      resolveFlightCurrency({ responseCurrency: "SEK", requestCurrency: "EUR" }),
      { ok: false, received: "SEK" },
    );

    const first = buildDeterministicFlightId(nonstopOneWayOption);
    const second = buildDeterministicFlightId(nonstopOneWayOption);
    assert.equal(first, second);
    assert.match(first, /^serpapi-[a-f0-9]{16}$/);
  });
});

describe("mapSerpApiOptionToFlight", () => {
  it("maps a successful nonstop itinerary with full date-time", () => {
    const flight = mapSerpApiOptionToFlight(nonstopOneWayOption, {
      destinationId: DESTINATION_ID,
      currency: "EUR",
    });

    assert.ok(flight);
    assert.equal(flight.destinationId, DESTINATION_ID);
    assert.equal(flight.price, 98);
    assert.equal(flight.currency, "EUR");
    assert.equal(flight.airline, "Air France");
    assert.equal(flight.departureTime, "2026-08-01 08:15");
    assert.equal(flight.arrivalTime, "2026-08-01 09:40");
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
    assert.equal(flight.departureTime, "2026-08-01 05:00");
    assert.equal(flight.arrivalTime, "2026-08-01 12:10");
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
    assert.equal(flight.departureTime, "2026-08-01 07:00");
    assert.equal(flight.arrivalTime, "2026-08-01 08:25");
    assert.equal(flight.rating, 0);
  });
});

describe("mapSerpApiRoundTripPairToFlight", () => {
  it("combines outbound schedule with return price and summed duration/stops", () => {
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
      price: 420,
      type: "Round trip",
    };

    const flight = mapSerpApiRoundTripPairToFlight(roundTripOption, returnLeg, {
      destinationId: DESTINATION_ID,
      currency: "EUR",
    });

    assert.ok(flight);
    assert.match(flight.id, /^serpapi-rt-/);
    assert.equal(flight.price, 420);
    assert.equal(flight.departureTime, "2026-08-01 07:00");
    assert.equal(flight.arrivalTime, "2026-08-01 08:25");
    assert.equal(flight.durationMinutes, 85 + 85);
    assert.equal(flight.stops, 0);
    assert.equal(flight.airline, "Air France");
    assert.equal(
      buildRoundTripFlightId(roundTripOption, returnLeg),
      flight.id,
    );
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
    assert.equal(flights[0]?.departureTime, "2026-08-01 08:15");
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

  it("falls back to request currency then EUR when response currency is missing", () => {
    const response: SerpApiGoogleFlightsResponse = {
      best_flights: [nonstopOneWayOption],
    };

    const withRequest = mapSerpApiFlightsResponse(response, {
      destinationId: DESTINATION_ID,
      requestCurrency: "USD",
    });
    assert.equal(withRequest[0]?.currency, "USD");

    const withDefault = mapSerpApiFlightsResponse(response, {
      destinationId: DESTINATION_ID,
    });
    assert.equal(withDefault[0]?.currency, "EUR");
  });
});
