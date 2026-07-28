/**
 * Sprint 12.2 — SerpAPI Google Hotels query builder tests.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import { DEFAULT_SERPAPI_HOTELS_CURRENCY } from "@/lib/providers/hotels/serpapi/mappingHelpers";
import { buildSerpApiHotelsSearchParams } from "@/lib/providers/hotels/serpapi/query";
import type { SearchRequest } from "@/types/models/search-request";

function baseRequest(overrides: Partial<SearchRequest> = {}): SearchRequest {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    destination: "Bali Resorts",
    destinationId: "bali",
    tripType: "round-trip",
    departureDate: "2026-04-08",
    returnDate: "2026-04-10",
    budget: { amount: 800, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels"],
    ...overrides,
  };
}

describe("buildSerpApiHotelsSearchParams", () => {
  it("builds required Google Hotels params from SearchRequest", () => {
    const params = buildSerpApiHotelsSearchParams(baseRequest());

    assert.equal(params.get("engine"), "google_hotels");
    assert.equal(params.get("q"), "Bali Resorts");
    assert.equal(params.get("check_in_date"), "2026-04-08");
    assert.equal(params.get("check_out_date"), "2026-04-10");
    assert.equal(params.get("adults"), "2");
    assert.equal(params.get("currency"), "EUR");
    assert.equal(params.has("children"), false);
    assert.equal(params.has("api_key"), false);
    // Rooms are not supported by Google Hotels — must not invent a param.
    assert.equal(params.has("rooms"), false);
  });

  it("includes children and default children_ages when travelers.children > 0", () => {
    const params = buildSerpApiHotelsSearchParams(
      baseRequest({
        travelers: { adults: 2, children: 1, infants: 0, rooms: 1 },
        totalGuests: 3,
      }),
    );

    assert.equal(params.get("children"), "1");
    assert.equal(params.get("children_ages"), "8");
  });

  it("repeats default children_ages for each child", () => {
    const params = buildSerpApiHotelsSearchParams(
      baseRequest({
        travelers: { adults: 2, children: 3, infants: 0, rooms: 1 },
        totalGuests: 5,
      }),
    );

    assert.equal(params.get("children"), "3");
    assert.equal(params.get("children_ages"), "8,8,8");
  });

  it("defaults currency to EUR when budget currency is missing", () => {
    const params = buildSerpApiHotelsSearchParams(
      baseRequest({ budget: null }),
    );

    assert.equal(params.get("currency"), DEFAULT_SERPAPI_HOTELS_CURRENCY);
  });

  it("rejects missing returnDate instead of inventing checkout", () => {
    assert.throws(
      () =>
        buildSerpApiHotelsSearchParams(
          baseRequest({ tripType: "one-way", returnDate: null }),
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.match(error.message, /check-out date \(returnDate\)/i);
        assert.match(error.message, /not supported/i);
        return true;
      },
    );
  });

  it("rejects checkout on or before check-in", () => {
    assert.throws(
      () =>
        buildSerpApiHotelsSearchParams(
          baseRequest({
            departureDate: "2026-04-10",
            returnDate: "2026-04-10",
          }),
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /after check-in/i);
        return true;
      },
    );
  });

  it("rejects missing destination and adults", () => {
    assert.throws(
      () => buildSerpApiHotelsSearchParams(baseRequest({ destination: "  " })),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /destination/i);
        return true;
      },
    );

    assert.throws(
      () =>
        buildSerpApiHotelsSearchParams(
          baseRequest({
            travelers: { adults: 0, children: 0, infants: 0, rooms: 1 },
            totalGuests: 0,
          }),
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /adult/i);
        return true;
      },
    );
  });
});
