/**
 * Sprint 17.5.2 — hotel search must not depend on PROPERTY_REF_SEAL_SECRET.
 */

import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ViewHotelAction } from "@/components/results/ViewHotelAction";
import { resetAppConfig } from "@/lib/config";
import {
  mapSerpApiHotelsResponse,
  mapSerpApiPropertyToHotel,
} from "@/lib/providers/hotels/serpapi/mapper";
import { ritzCarltonBaliProperty } from "@/lib/providers/hotels/serpapi/__fixtures__/googleHotels.sample";
import { SEALED_PROPERTY_REF_PREFIX } from "@/lib/hotels/sealedPropertyRef";
import type { Hotel } from "@/types/models/hotel";

const TEST_SEAL_SECRET = "test-property-ref-seal-secret-32chars-min!!";

afterEach(() => {
  resetAppConfig();
});

describe("Sprint 17.5.2 — search/details sealing decoupling", () => {
  it("A: property_token + secret → sealed providerPropertyRef", () => {
    const hotel = mapSerpApiPropertyToHotel(ritzCarltonBaliProperty, {
      destinationId: "bali",
      currency: "EUR",
      locationFallback: "Bali",
      nights: 2,
      propertyRefSealSecret: TEST_SEAL_SECRET,
    });
    assert.ok(hotel);
    assert.match(
      hotel.providerPropertyRef!,
      new RegExp(`^${SEALED_PROPERTY_REF_PREFIX}`),
    );
    assert.doesNotMatch(
      hotel.providerPropertyRef!,
      new RegExp(ritzCarltonBaliProperty.property_token!),
    );
  });

  it("B/H: property_token + missing secret → Hotel returned, no ref, no throw", () => {
    const hotel = mapSerpApiPropertyToHotel(ritzCarltonBaliProperty, {
      destinationId: "bali",
      currency: "EUR",
      locationFallback: "Bali",
      nights: 2,
      propertyRefSealSecret: "",
    });
    assert.ok(hotel);
    assert.equal(hotel.name, "The Ritz-Carlton, Bali");
    assert.equal(hotel.providerPropertyRef, undefined);
    assert.doesNotMatch(
      JSON.stringify(hotel),
      /ChkIv|property_token/i,
    );
  });

  it("C: no property_token → Hotel returned without ref", () => {
    const hotel = mapSerpApiPropertyToHotel(
      {
        name: "No Token Inn",
        extracted_price: 55,
      },
      {
        destinationId: "bali",
        currency: "EUR",
        locationFallback: "Bali",
        nights: 1,
        propertyRefSealSecret: "",
      },
    );
    assert.ok(hotel);
    assert.equal(hotel.providerPropertyRef, undefined);
  });

  it("G: mapped hotels never include raw property_token in the payload", () => {
    const withSeal = mapSerpApiPropertyToHotel(ritzCarltonBaliProperty, {
      destinationId: "bali",
      currency: "EUR",
      locationFallback: "Bali",
      nights: 2,
      propertyRefSealSecret: TEST_SEAL_SECRET,
    });
    const withoutSeal = mapSerpApiPropertyToHotel(ritzCarltonBaliProperty, {
      destinationId: "bali",
      currency: "EUR",
      locationFallback: "Bali",
      nights: 2,
      propertyRefSealSecret: "",
    });
    for (const hotel of [withSeal, withoutSeal] as Hotel[]) {
      assert.ok(hotel);
      assert.equal(
        JSON.stringify(hotel).includes(ritzCarltonBaliProperty.property_token!),
        false,
      );
    }
  });

  it("H: full response mapping still returns hotels when sealing is disabled", () => {
    const hotels = mapSerpApiHotelsResponse(
      {
        properties: [ritzCarltonBaliProperty],
        search_parameters: {
          currency: "EUR",
          check_in_date: "2026-04-08",
          check_out_date: "2026-04-10",
        },
      },
      {
        destinationId: "bali",
        locationFallback: "Bali Resorts",
        checkInDate: "2026-04-08",
        checkOutDate: "2026-04-10",
        propertyRefSealSecret: "",
      },
    );
    assert.equal(hotels.length, 1);
    assert.equal(hotels[0]!.providerPropertyRef, undefined);
    assert.equal(hotels[0]!.name, "The Ritz-Carlton, Bali");
  });

  it("UI: View hotel hidden without sealed ref", () => {
    const html = renderToStaticMarkup(
      createElement(ViewHotelAction, {
        hotel: {
          id: "h1",
          destinationId: "paris",
          price: 100,
          currency: "EUR",
          rating: 4,
          name: "No Ref Hotel",
          stars: 3,
          amenities: [],
          nights: 2,
          location: "Paris",
        },
      }),
    );
    assert.equal(html, "");
  });
});
