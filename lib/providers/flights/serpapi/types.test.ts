/**
 * Sprint 9.3 — SerpAPI response model / fixture structural tests.
 * No mapping or provider behavior.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  emptyGoogleFlightsResponse,
  nonstopOneWayOption,
  oneStopOption,
  successfulGoogleFlightsResponse,
} from "@/lib/providers/flights/serpapi/__fixtures__/googleFlights.sample";
import type {
  SerpApiFlightOption,
  SerpApiFlightSegment,
  SerpApiGoogleFlightsResponse,
} from "@/lib/providers/flights/serpapi/types";

function assertAirportShape(
  airport: SerpApiFlightSegment["departure_airport"],
  label: string,
): void {
  assert.ok(airport, `${label} airport should be defined on the fixture`);
  assert.equal(typeof airport.id, "string");
  assert.equal(typeof airport.time, "string");
  assert.ok(airport.id!.length > 0);
  assert.ok(airport.time!.length > 0);
}

function assertFlightOptionShape(option: SerpApiFlightOption, label: string): void {
  assert.ok(Array.isArray(option.flights), `${label}.flights should be an array`);
  assert.ok(option.flights!.length >= 1, `${label} should have at least one segment`);
  assert.equal(typeof option.price, "number");
  assert.equal(typeof option.total_duration, "number");

  for (const [index, segment] of option.flights!.entries()) {
    assertAirportShape(segment.departure_airport, `${label} segment[${index}] departure`);
    assertAirportShape(segment.arrival_airport, `${label} segment[${index}] arrival`);
    assert.equal(typeof segment.airline, "string");
    assert.equal(typeof segment.travel_class, "string");
  }
}

describe("SerpAPI Google Flights fixture — response shape", () => {
  it("matches SerpApiGoogleFlightsResponse and exposes required fields", () => {
    const response: SerpApiGoogleFlightsResponse = successfulGoogleFlightsResponse;

    assert.equal(response.search_metadata?.status, "Success");
    assert.equal(response.search_parameters?.currency, "EUR");
    assert.equal(response.search_parameters?.departure_id, "MXP");
    assert.equal(response.search_parameters?.arrival_id, "CDG");
    assert.equal(response.error, undefined);

    assert.ok(Array.isArray(response.best_flights));
    assert.ok(Array.isArray(response.other_flights));
    assert.ok(response.best_flights!.length >= 1);
    assert.ok(response.other_flights!.length >= 1);
  });

  it("allows safe array reads for best_flights and other_flights", () => {
    const response = successfulGoogleFlightsResponse;
    const best = response.best_flights ?? [];
    const other = response.other_flights ?? [];

    assert.ok(best.length > 0);
    assert.ok(other.length > 0);

    for (const [index, option] of best.entries()) {
      assertFlightOptionShape(option, `best_flights[${index}]`);
    }

    for (const [index, option] of other.entries()) {
      assertFlightOptionShape(option, `other_flights[${index}]`);
    }
  });

  it("handles optional fields on segments and options", () => {
    const nonstop = nonstopOneWayOption;
    const oneStop = oneStopOption;

    assert.equal(nonstop.layovers, undefined);
    assert.equal(nonstop.departure_token, undefined);
    assert.equal(nonstop.type, "One way");

    assert.ok(Array.isArray(oneStop.layovers));
    assert.equal(oneStop.layovers!.length, 1);
    assert.equal(oneStop.layovers![0]?.id, "AMS");
    assert.equal(typeof oneStop.layovers![0]?.duration, "number");

    const overnightSegment = oneStop.flights?.[1];
    assert.equal(overnightSegment?.overnight, undefined);

    const evening = successfulGoogleFlightsResponse.other_flights?.[0]?.flights?.[0];
    assert.equal(evening?.overnight, false);
  });

  it("supports an empty successful response without throwing on array access", () => {
    const response: SerpApiGoogleFlightsResponse = emptyGoogleFlightsResponse;
    const best = response.best_flights ?? [];
    const other = response.other_flights ?? [];

    assert.deepEqual(best, []);
    assert.deepEqual(other, []);
    assert.equal(response.search_parameters?.currency, "EUR");
  });
});
