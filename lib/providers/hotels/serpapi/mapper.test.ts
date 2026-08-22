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
  buildOpaqueProviderPropertyRef,
  computeNights,
  DEFAULT_SERPAPI_HOTELS_CURRENCY,
  mapGpsCoordinates,
  mapHotelPrice,
  mapRating,
  mapStars,
  resolveHotelCurrency,
} from "@/lib/providers/hotels/serpapi/mappingHelpers";
import {
  SEALED_PROPERTY_REF_PREFIX,
  unsealHotelPropertyRef,
} from "@/lib/hotels/sealedPropertyRef";

const TEST_SEAL_SECRET =
  "test-property-ref-seal-secret-32chars-min!!";

const sealOpts = { propertyRefSealSecret: TEST_SEAL_SECRET };

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

  it("maps GPS when both coordinates are valid", () => {
    assert.deepEqual(mapGpsCoordinates(ritzCarltonBaliProperty.gps_coordinates), {
      latitude: -8.8306709,
      longitude: 115.2153312,
    });
  });

  it("returns null GPS when coordinates are missing or invalid", () => {
    assert.equal(mapGpsCoordinates(undefined), null);
    assert.equal(mapGpsCoordinates({ latitude: 48.8 }), null);
    assert.equal(mapGpsCoordinates({ latitude: 91, longitude: 2 }), null);
    assert.equal(mapGpsCoordinates({ latitude: NaN, longitude: 2 }), null);
  });

  it("builds opaque provider refs that are not raw SerpAPI tokens", () => {
    const raw = ritzCarltonBaliProperty.property_token!;
    const ref = buildOpaqueProviderPropertyRef(raw);
    assert.ok(ref);
    assert.match(ref!, /^gpref-[a-f0-9]{32}$/);
    assert.notEqual(ref, raw);
    assert.equal(buildOpaqueProviderPropertyRef(undefined), undefined);
    assert.equal(buildOpaqueProviderPropertyRef("  "), undefined);
    assert.equal(
      buildOpaqueProviderPropertyRef(raw),
      buildOpaqueProviderPropertyRef(raw),
    );
  });
});

describe("mapSerpApiPropertyToHotel", () => {
  it("maps a complete property to Hotel", () => {
    const hotel = mapSerpApiPropertyToHotel(ritzCarltonBaliProperty, {
      destinationId: "bali",
      currency: "EUR",
      locationFallback: "Bali Resorts",
      nights: 2,
      ...sealOpts,
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
    assert.equal(hotel.latitude, -8.8306709);
    assert.equal(hotel.longitude, 115.2153312);
    assert.ok(hotel.providerPropertyRef);
    assert.match(
      hotel.providerPropertyRef!,
      new RegExp(`^${SEALED_PROPERTY_REF_PREFIX}`),
    );
    assert.notEqual(
      hotel.providerPropertyRef,
      ritzCarltonBaliProperty.property_token,
    );
    assert.doesNotMatch(
      hotel.providerPropertyRef!,
      new RegExp(ritzCarltonBaliProperty.property_token!),
    );
  });

  it("seals the property token without using the in-process registry", async () => {
    const { clearHotelPropertyTokenRegistry, resolveHotelPropertyToken } =
      await import("@/lib/hotels/propertyTokenRegistry");
    clearHotelPropertyTokenRegistry();

    const hotel = mapSerpApiPropertyToHotel(ritzCarltonBaliProperty, {
      destinationId: "bali",
      currency: "EUR",
      locationFallback: "Bali Resorts",
      nights: 2,
      checkInDate: "2026-04-08",
      checkOutDate: "2026-04-10",
      adults: 2,
      ...sealOpts,
    });
    assert.ok(hotel);
    assert.equal(resolveHotelPropertyToken(hotel.id), null);

    const unsealed = unsealHotelPropertyRef(
      hotel.providerPropertyRef!,
      TEST_SEAL_SECRET,
    );
    assert.equal(unsealed.hotelId, hotel.id);
    assert.equal(
      unsealed.lookup.propertyToken,
      ritzCarltonBaliProperty.property_token,
    );
    assert.equal(unsealed.lookup.query, "Bali Resorts");
  });

  it("returns Hotel without providerPropertyRef when seal secret is missing (no throw)", () => {
    const hotel = mapSerpApiPropertyToHotel(ritzCarltonBaliProperty, {
      destinationId: "bali",
      currency: "EUR",
      locationFallback: "Bali Resorts",
      nights: 2,
      propertyRefSealSecret: "",
    });

    assert.ok(hotel);
    assert.equal(hotel.name, "The Ritz-Carlton, Bali");
    assert.equal(hotel.price, 332);
    assert.equal(hotel.providerPropertyRef, undefined);
    assert.doesNotMatch(
      JSON.stringify(hotel),
      new RegExp(ritzCarltonBaliProperty.property_token!),
    );
  });

  it("omits GPS when coordinates are absent", () => {
    const hotel = mapSerpApiPropertyToHotel(midRangeWithExtractedPrice, {
      destinationId: "bali",
      currency: "EUR",
      locationFallback: "Bali",
      nights: 1,
      ...sealOpts,
    });

    assert.ok(hotel);
    assert.equal(hotel.latitude, undefined);
    assert.equal(hotel.longitude, undefined);
    assert.ok(hotel.providerPropertyRef);
    assert.match(
      hotel.providerPropertyRef!,
      new RegExp(`^${SEALED_PROPERTY_REF_PREFIX}`),
    );
  });

  it("omits providerPropertyRef when property_token is missing", () => {
    const hotel = mapSerpApiPropertyToHotel(
      {
        name: "No Token Inn",
        extracted_price: 55,
        gps_coordinates: { latitude: 1, longitude: 2 },
      },
      {
        destinationId: "bali",
        currency: "EUR",
        locationFallback: "Bali",
        nights: 1,
        ...sealOpts,
      },
    );

    assert.ok(hotel);
    assert.equal(hotel.latitude, 1);
    assert.equal(hotel.longitude, 2);
    assert.equal(hotel.providerPropertyRef, undefined);
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
          ...sealOpts,
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
          ...sealOpts,
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
      ...sealOpts,
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
      ...sealOpts,
    });

    assert.deepEqual(hotels, []);
  });

  it("drops incomplete properties", () => {
    const hotels = mapSerpApiHotelsResponse(incompletePropertiesResponse, {
      destinationId: "bali",
      locationFallback: "Bali",
      checkInDate: "2026-04-08",
      checkOutDate: "2026-04-09",
      ...sealOpts,
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
          ...sealOpts,
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
            ...sealOpts,
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
