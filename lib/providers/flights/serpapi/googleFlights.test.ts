/**
 * Sprint 9.4 — SerpAPI Google Flights query parameter builder tests.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import {
  buildSerpApiSearchParams,
  mapCabinLabelToSerpApiTravelClass,
  mapTravelStyleToSerpApiTravelClass,
  mapTripTypeToSerpApiType,
} from "@/lib/providers/flights/serpapi/googleFlights";
import type { SearchRequest } from "@/types/models/search-request";

function baseRequest(overrides: Partial<SearchRequest> = {}): SearchRequest {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    originIata: "mxp",
    destination: "Paris, France",
    destinationId: "paris",
    destinationIata: "cdg",
    tripType: "one-way",
    departureDate: "2026-08-01",
    returnDate: null,
    budget: null,
    travelers: { adults: 1, children: 0, infants: 0, rooms: 1 },
    totalGuests: 1,
    travelStyle: "standard",
    productTypes: ["flights"],
    ...overrides,
  };
}

function paramsToRecord(params: URLSearchParams): Record<string, string> {
  const record: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    record[key] = value;
  }
  return record;
}

describe("mapTripTypeToSerpApiType", () => {
  it("maps one-way to 2 and round-trip to 1", () => {
    assert.equal(mapTripTypeToSerpApiType("one-way"), 2);
    assert.equal(mapTripTypeToSerpApiType("round-trip"), 1);
  });
});

describe("mapCabinLabelToSerpApiTravelClass / mapTravelStyleToSerpApiTravelClass", () => {
  it("maps Economy and Business cabin labels", () => {
    assert.equal(mapCabinLabelToSerpApiTravelClass("Economy"), 1);
    assert.equal(mapCabinLabelToSerpApiTravelClass("Premium Economy"), 2);
    assert.equal(mapCabinLabelToSerpApiTravelClass("Business"), 3);
    assert.equal(mapCabinLabelToSerpApiTravelClass("First"), 4);
  });

  it("maps travelStyle to Economy or Business codes", () => {
    assert.equal(mapTravelStyleToSerpApiTravelClass("budget"), 1);
    assert.equal(mapTravelStyleToSerpApiTravelClass("standard"), 1);
    assert.equal(mapTravelStyleToSerpApiTravelClass("luxury"), 3);
  });
});

describe("buildSerpApiSearchParams", () => {
  it("builds a one-way search", () => {
    const params = buildSerpApiSearchParams(baseRequest(), { deepSearch: false });
    const record = paramsToRecord(params);

    assert.equal(record.engine, "google_flights");
    assert.equal(record.departure_id, "MXP");
    assert.equal(record.arrival_id, "CDG");
    assert.equal(record.outbound_date, "2026-08-01");
    assert.equal(record.type, "2");
    assert.equal(record.return_date, undefined);
    assert.equal(record.adults, "1");
    assert.equal(record.deep_search, "false");
  });

  it("builds a round-trip search with return_date", () => {
    const params = buildSerpApiSearchParams(
      baseRequest({
        tripType: "round-trip",
        returnDate: "2026-08-10",
      }),
      { deepSearch: false },
    );
    const record = paramsToRecord(params);

    assert.equal(record.type, "1");
    assert.equal(record.return_date, "2026-08-10");
  });

  it("includes adults only when children and infants are zero", () => {
    const params = buildSerpApiSearchParams(
      baseRequest({
        travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
        totalGuests: 2,
      }),
      { deepSearch: false },
    );
    const record = paramsToRecord(params);

    assert.equal(record.adults, "2");
    assert.equal(record.children, undefined);
    assert.equal(record.infants_on_lap, undefined);
    assert.equal(record.infants_in_seat, undefined);
  });

  it("includes adults, children, and infants_on_lap when present", () => {
    const params = buildSerpApiSearchParams(
      baseRequest({
        travelers: { adults: 2, children: 1, infants: 1, rooms: 1 },
        totalGuests: 4,
      }),
      { deepSearch: false },
    );
    const record = paramsToRecord(params);

    assert.equal(record.adults, "2");
    assert.equal(record.children, "1");
    assert.equal(record.infants_on_lap, "1");
    assert.equal(record.infants_in_seat, undefined);
  });

  it("maps Economy travel styles to travel_class=1", () => {
    const budget = paramsToRecord(
      buildSerpApiSearchParams(baseRequest({ travelStyle: "budget" }), {
        deepSearch: false,
      }),
    );
    const standard = paramsToRecord(
      buildSerpApiSearchParams(baseRequest({ travelStyle: "standard" }), {
        deepSearch: false,
      }),
    );

    assert.equal(budget.travel_class, "1");
    assert.equal(standard.travel_class, "1");
  });

  it("maps Business (luxury) to travel_class=3", () => {
    const record = paramsToRecord(
      buildSerpApiSearchParams(baseRequest({ travelStyle: "luxury" }), {
        deepSearch: false,
      }),
    );

    assert.equal(record.travel_class, "3");
  });

  it("includes currency when present on the budget", () => {
    const record = paramsToRecord(
      buildSerpApiSearchParams(
        baseRequest({ budget: { amount: 500, currency: "EUR" } }),
        { deepSearch: false },
      ),
    );

    assert.equal(record.currency, "EUR");
  });

  it("omits currency when budget is null", () => {
    const record = paramsToRecord(
      buildSerpApiSearchParams(baseRequest({ budget: null }), {
        deepSearch: false,
      }),
    );

    assert.equal(record.currency, undefined);
  });

  it("sets deep_search=true when configured", () => {
    const record = paramsToRecord(
      buildSerpApiSearchParams(baseRequest(), { deepSearch: true }),
    );

    assert.equal(record.deep_search, "true");
  });

  it("sets deep_search=false when configured", () => {
    const record = paramsToRecord(
      buildSerpApiSearchParams(baseRequest(), { deepSearch: false }),
    );

    assert.equal(record.deep_search, "false");
  });

  it("omits undefined optional values from the query", () => {
    const params = buildSerpApiSearchParams(baseRequest(), { deepSearch: false });
    const keys = [...params.keys()].sort();

    assert.deepEqual(keys, [
      "adults",
      "arrival_id",
      "deep_search",
      "departure_id",
      "engine",
      "outbound_date",
      "travel_class",
      "type",
    ]);
  });

  it("fails fast when required IATA codes are missing", () => {
    assert.throws(
      () =>
        buildSerpApiSearchParams(baseRequest({ originIata: undefined }), {
          deepSearch: false,
        }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /originIata/);
        return true;
      },
    );

    assert.throws(
      () =>
        buildSerpApiSearchParams(baseRequest({ destinationIata: "  " }), {
          deepSearch: false,
        }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /destinationIata/);
        return true;
      },
    );
  });
});
