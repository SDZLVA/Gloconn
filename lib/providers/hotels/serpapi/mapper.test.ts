/**
 * Sprint 12.2 — SerpAPI Google Hotels mapper tests.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import {
  emptyGoogleHotelsResponse,
  incompletePropertiesResponse,
  midRangeWithExtractedPrice,
  ritzCarltonBaliProperty,
  successfulGoogleHotelsResponse,
} from "@/lib/providers/hotels/serpapi/__fixtures__/googleHotels.sample";
import {
  mapSerpApiHotelsResponse,
  mapSerpApiPropertyToHotel,
} from "@/lib/providers/hotels/serpapi/mapper";
import {
  buildDeterministicHotelId,
  computeNights,
  DEFAULT_SERPAPI_HOTELS_CURRENCY,
  mapHotelPrice,
  mapRating,
  mapStars,
  resolveHotelCurrency,
} from "@/lib/providers/hotels/serpapi/mappingHelpers";

describe("mappingHelpers — hotels", () => {
  it("prefers total_rate over extracted_price and nightly", () => {
    assert.equal(mapHotelPrice(ritzCarltonBaliProperty), 332);
    assert.equal(mapHotelPrice(midRangeWithExtractedPrice), 44);
    assert.equal(
      mapHotelPrice({
        rate_per_night: { extracted_lowest: 99 },
      }),
      99,
    );
  });

  it("maps stars from extracted_hotel_class or hotel_class string/number", () => {
    assert.equal(mapStars(ritzCarltonBaliProperty), 5);
    assert.equal(mapStars(midRangeWithExtractedPrice), 4);
    assert.equal(mapStars({ hotel_class: "3-star hotel" }), 3);
    assert.equal(mapStars({}), 0);
  });

  it("clamps ratings into 0–5", () => {
    assert.equal(mapRating(4.6), 4.6);
    assert.equal(mapRating(undefined), 0);
    assert.equal(mapRating(6), 5);
    assert.equal(mapRating(-1), 0);
  });

  it("computes nights from ISO date-only strings", () => {
    assert.equal(computeNights("2026-04-08", "2026-04-10"), 2);
    assert.equal(computeNights("2026-04-08", "2026-04-09"), 1);
    assert.equal(computeNights("2026-04-08", "2026-04-08"), null);
    assert.equal(computeNights("bad", "2026-04-09"), null);
  });

  it("resolves currency with response → request → EUR fallbacks", () => {
    assert.deepEqual(
      resolveHotelCurrency({
        responseCurrency: "USD",
        requestCurrency: "EUR",
      }),
      { ok: true, currency: "USD" },
    );
    assert.deepEqual(
      resolveHotelCurrency({
        requestCurrency: "GBP",
      }),
      { ok: true, currency: "GBP" },
    );
    assert.deepEqual(
      resolveHotelCurrency({}),
      { ok: true, currency: DEFAULT_SERPAPI_HOTELS_CURRENCY },
    );
    assert.equal(
      resolveHotelCurrency({ responseCurrency: "SEK" }).ok,
      false,
    );
  });

  it("builds stable serpapi-hotel ids", () => {
    const a = buildDeterministicHotelId(ritzCarltonBaliProperty);
    const b = buildDeterministicHotelId(ritzCarltonBaliProperty);
    assert.equal(a, b);
    assert.match(a, /^serpapi-hotel-[a-f0-9]{16}$/);
  });
});

describe("mapSerpApiPropertyToHotel", () => {
  it("maps a complete property to Hotel", () => {
    const hotel = mapSerpApiPropertyToHotel(ritzCarltonBaliProperty, {
      destinationId: "bali",
      currency: "EUR",
      locationFallback: "Bali Resorts",
      nights: 2,
    });

    assert.ok(hotel);
    assert.equal(hotel.name, "The Ritz-Carlton, Bali");
    assert.equal(hotel.destinationId, "bali");
    assert.equal(hotel.price, 332);
    assert.equal(hotel.currency, "EUR");
    assert.equal(hotel.rating, 4.6);
    assert.equal(hotel.stars, 5);
    assert.equal(hotel.nights, 2);
    assert.equal(hotel.location, "I Gusti Ngurah Rai International Airport");
    assert.ok(hotel.amenities.includes("Pool"));
    assert.match(hotel.id, /^serpapi-hotel-/);
  });

  it("returns null when price or name is missing", () => {
    assert.equal(
      mapSerpApiPropertyToHotel(
        { name: "No Price", property_token: "x" },
        {
          destinationId: "bali",
          currency: "EUR",
          locationFallback: "Bali",
          nights: 1,
        },
      ),
      null,
    );
    assert.equal(
      mapSerpApiPropertyToHotel(
        { extracted_price: 40 },
        {
          destinationId: "bali",
          currency: "EUR",
          locationFallback: "Bali",
          nights: 1,
        },
      ),
      null,
    );
  });
});

describe("mapSerpApiHotelsResponse", () => {
  it("maps properties and ignores ads", () => {
    const hotels = mapSerpApiHotelsResponse(successfulGoogleHotelsResponse, {
      destinationId: "bali",
      requestCurrency: "EUR",
      locationFallback: "Bali Resorts",
      checkInDate: "2026-04-08",
      checkOutDate: "2026-04-10",
    });

    assert.equal(hotels.length, 2);
    assert.equal(hotels[0]!.name, "The Ritz-Carlton, Bali");
    assert.equal(hotels[0]!.nights, 2);
    assert.equal(hotels[0]!.currency, "EUR");
    assert.equal(hotels[1]!.price, 44);
    assert.ok(hotels.every((h) => !h.name.includes("Sponsored")));
  });

  it("returns empty array for empty properties", () => {
    const hotels = mapSerpApiHotelsResponse(emptyGoogleHotelsResponse, {
      destinationId: "bali",
      locationFallback: "Nowhere",
      checkInDate: "2026-04-08",
      checkOutDate: "2026-04-09",
    });

    assert.deepEqual(hotels, []);
  });

  it("drops incomplete properties", () => {
    const hotels = mapSerpApiHotelsResponse(incompletePropertiesResponse, {
      destinationId: "bali",
      locationFallback: "Bali",
      checkInDate: "2026-04-08",
      checkOutDate: "2026-04-09",
    });

    assert.equal(hotels.length, 1);
    assert.equal(hotels[0]!.name, "The Ritz-Carlton, Bali");
    assert.equal(hotels[0]!.nights, 1);
  });

  it("throws for invalid raw response shape", () => {
    assert.throws(
      () =>
        mapSerpApiHotelsResponse(null as unknown as never, {
          destinationId: "paris",
          locationFallback: "Paris",
          checkInDate: "2026-04-08",
          checkOutDate: "2026-04-10",
        }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /invalid response/i);
        return true;
      },
    );
  });

  it("throws for unsupported currency on the response", () => {
    assert.throws(
      () =>
        mapSerpApiHotelsResponse(
          {
            ...successfulGoogleHotelsResponse,
            search_parameters: {
              ...successfulGoogleHotelsResponse.search_parameters,
              currency: "SEK",
            },
          },
          {
            destinationId: "bali",
            locationFallback: "Bali",
            checkInDate: "2026-04-08",
            checkOutDate: "2026-04-10",
          },
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /SEK/);
        return true;
      },
    );
  });
});
