import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import { buildFlightOffersSearchParams } from "@/lib/providers/flights/amadeus/flightOffers";
import type { SearchRequest } from "@/types/models/search-request";

const REQUIRED_KEYS = [
  "originLocationCode",
  "destinationLocationCode",
  "departureDate",
  "adults",
  "max",
] as const;

function baseRequest(
  overrides: Partial<SearchRequest> = {},
): SearchRequest {
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

function assertExactKeys(
  params: URLSearchParams,
  expectedKeys: readonly string[],
) {
  const actual = [...params.keys()].sort();
  const expected = [...expectedKeys].sort();
  assert.deepEqual(actual, expected);
}

describe("buildFlightOffersSearchParams — happy path", () => {
  it("builds required parameters for a minimal one-way request", () => {
    const request = baseRequest();
    const params = buildFlightOffersSearchParams(request);
    const record = paramsToRecord(params);

    assert.equal(record.originLocationCode, "MXP");
    assert.equal(record.destinationLocationCode, "CDG");
    assert.equal(record.departureDate, "2026-08-01");
    assert.equal(record.adults, "1");
    assert.equal(record.max, "20");
    assert.equal(record.travelClass, "ECONOMY");

    assertExactKeys(params, [...REQUIRED_KEYS, "travelClass"]);
    assert.equal(record.returnDate, undefined);
    assert.equal(record.children, undefined);
    assert.equal(record.infants, undefined);
    assert.equal(record.currencyCode, undefined);
    assert.equal(record.maxPrice, undefined);
  });

  it("includes all optional parameters when provided", () => {
    const request = baseRequest({
      tripType: "round-trip",
      returnDate: "2026-08-10",
      travelStyle: "luxury",
      budget: { amount: 499.9, currency: "EUR" },
      travelers: { adults: 2, children: 1, infants: 1, rooms: 1 },
      totalGuests: 4,
    });
    const params = buildFlightOffersSearchParams(request);
    const record = paramsToRecord(params);

    assert.equal(record.originLocationCode, "MXP");
    assert.equal(record.destinationLocationCode, "CDG");
    assert.equal(record.departureDate, "2026-08-01");
    assert.equal(record.returnDate, "2026-08-10");
    assert.equal(record.adults, "2");
    assert.equal(record.children, "1");
    assert.equal(record.infants, "1");
    assert.equal(record.travelClass, "BUSINESS");
    assert.equal(record.currencyCode, "EUR");
    assert.equal(record.maxPrice, "499");
    assert.equal(record.max, "20");

    assertExactKeys(params, [
      ...REQUIRED_KEYS,
      "returnDate",
      "children",
      "infants",
      "travelClass",
      "currencyCode",
      "maxPrice",
    ]);
  });

  it("omits returnDate for one-way trips", () => {
    const params = buildFlightOffersSearchParams(
      baseRequest({ tripType: "one-way", returnDate: null }),
    );
    assert.equal(params.has("returnDate"), false);
  });

  it("includes returnDate for round-trip with a return date", () => {
    const params = buildFlightOffersSearchParams(
      baseRequest({
        tripType: "round-trip",
        returnDate: "2026-08-15",
      }),
    );
    assert.equal(params.get("returnDate"), "2026-08-15");
  });
});

describe("buildFlightOffersSearchParams — query generation", () => {
  it("omits undefined optional fields from the query", () => {
    const params = buildFlightOffersSearchParams(
      baseRequest({
        tripType: "round-trip",
        returnDate: null,
        budget: null,
        travelers: { adults: 1, children: 0, infants: 0, rooms: 1 },
      }),
    );

    assert.equal(params.has("returnDate"), false);
    assert.equal(params.has("children"), false);
    assert.equal(params.has("infants"), false);
    assert.equal(params.has("currencyCode"), false);
    assert.equal(params.has("maxPrice"), false);
  });

  it("does not generate unexpected query parameters", () => {
    const params = buildFlightOffersSearchParams(baseRequest());
    const allowed = new Set([
      ...REQUIRED_KEYS,
      "returnDate",
      "children",
      "infants",
      "travelClass",
      "currencyCode",
      "maxPrice",
    ]);

    for (const key of params.keys()) {
      assert.ok(allowed.has(key), `unexpected query param: ${key}`);
    }
  });

  it("matches SearchRequest values exactly (with IATA uppercasing)", () => {
    const request = baseRequest({
      originIata: "lin",
      destinationIata: "ory",
      departureDate: "2026-09-12",
      travelers: { adults: 3, children: 0, infants: 0, rooms: 1 },
      totalGuests: 3,
    });
    const record = paramsToRecord(buildFlightOffersSearchParams(request));

    assert.equal(record.originLocationCode, "LIN");
    assert.equal(record.destinationLocationCode, "ORY");
    assert.equal(record.departureDate, request.departureDate);
    assert.equal(record.adults, String(request.travelers.adults));
  });
});

describe("buildFlightOffersSearchParams — validation", () => {
  it("throws when originIata is missing", () => {
    assert.throws(
      () =>
        buildFlightOffersSearchParams(
          baseRequest({ originIata: undefined }),
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.match(error.message, /originIata/);
        return true;
      },
    );
  });

  it("throws when destinationIata is missing", () => {
    assert.throws(
      () =>
        buildFlightOffersSearchParams(
          baseRequest({ destinationIata: "  " }),
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /destinationIata/);
        return true;
      },
    );
  });

  it("throws when departureDate is missing", () => {
    assert.throws(
      () =>
        buildFlightOffersSearchParams(baseRequest({ departureDate: "" })),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /departure date/);
        return true;
      },
    );
  });

  it("throws when adults is invalid", () => {
    assert.throws(
      () =>
        buildFlightOffersSearchParams(
          baseRequest({
            travelers: { adults: 0, children: 0, infants: 0, rooms: 1 },
          }),
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /adult/);
        return true;
      },
    );
  });

  it("omits returnDate for round-trip without a return date (invalid combination)", () => {
    const params = buildFlightOffersSearchParams(
      baseRequest({
        tripType: "round-trip",
        returnDate: null,
      }),
    );
    assert.equal(params.has("returnDate"), false);
  });
});
