/**
 * Sprint 17.3 — hotel property details service (legacy hotelId deps path).
 * Sprint 17.5.1 production path is covered in sealedPropertyRef.test.ts.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import { clearHotelPropertyDetailsCache } from "@/lib/hotels/propertyDetailsCache";
import { clearHotelPropertyTokenRegistry } from "@/lib/hotels/propertyTokenRegistry";
import { sealHotelPropertyRef } from "@/lib/hotels/sealedPropertyRef";
import { getHotelPropertyDetails } from "@/lib/services/hotelPropertyDetailsService";
import type { HotelPropertyDetails } from "@/types/models/hotel-property-details";

const SECRET = "test-property-ref-seal-secret-service!!";

describe("getHotelPropertyDetails", () => {
  beforeEach(() => {
    clearHotelPropertyTokenRegistry();
    clearHotelPropertyDetailsCache();
  });

  it("resolves via sealed ref deps, maps safely, and caches", async () => {
    const cache = new Map<string, HotelPropertyDetails>();
    let fetchCount = 0;
    let seenQuery: string | undefined;
    const sealed = sealHotelPropertyRef(
      {
        hotelId: "serpapi-hotel-live1",
        propertyToken: "ChkIv_live_token",
        query: "Paris, France",
        checkInDate: "2026-10-12",
        checkOutDate: "2026-10-15",
        currency: "EUR",
        adults: 2,
      },
      SECRET,
    );

    const first = await getHotelPropertyDetails(
      { ref: sealed, hotelId: "serpapi-hotel-live1" },
      {},
      {
        getSealSecret: () => SECRET,
        getSerpApiConfig: () => ({ apiKey: "test-key" }),
        fetchDetails: async (_token, _config, options) => {
          fetchCount += 1;
          seenQuery = options.query;
          return {
            name: "Paris Test Hotel",
            address: "10 Rue de Rivoli, Paris",
            directions: "https://www.google.com/maps?q=48.8,2.3",
            link: "https://www.paris-hotel.example/",
            featured_prices: [
              {
                source: "Expedia",
                link: "https://www.google.com/aclk?sa=l&ai=x",
              },
            ],
            property_token: "ChkIv_live_token",
          };
        },
        getCached: (id) => cache.get(id),
        setCached: (id, details) => {
          cache.set(id, details);
        },
      },
    );

    assert.equal(first.cached, false);
    assert.equal(fetchCount, 1);
    assert.equal(seenQuery, "Paris, France");
    assert.equal(first.details.address, "10 Rue de Rivoli, Paris");
    assert.ok(first.details.mapsUrl);
    assert.ok(first.details.websiteUrl);
    assert.equal(first.details.offers?.[0]?.source, "Expedia");
    assert.equal(
      JSON.stringify(first.details).includes("ChkIv_live_token"),
      false,
    );

    const second = await getHotelPropertyDetails(
      { ref: sealed, hotelId: "serpapi-hotel-live1" },
      {},
      {
        getSealSecret: () => SECRET,
        getSerpApiConfig: () => ({ apiKey: "test-key" }),
        fetchDetails: async () => {
          fetchCount += 1;
          return { name: "should not run" };
        },
        getCached: (id) => cache.get(id),
        setCached: (id, details) => {
          cache.set(id, details);
        },
      },
    );

    assert.equal(second.cached, true);
    assert.equal(fetchCount, 1);
    assert.equal(second.details.address, "10 Rue de Rivoli, Paris");
  });

  it("fails safely for unknown hotel ids without a sealed ref", async () => {
    await assert.rejects(
      () => getHotelPropertyDetails("serpapi-hotel-unknown"),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "NOT_FOUND");
        assert.doesNotMatch(error.message, /Chk|token|serpapi\.com/i);
        return true;
      },
    );
  });

  it("rejects raw-looking provider tokens as hotel ids", async () => {
    await assert.rejects(
      () =>
        getHotelPropertyDetails(
          {
            hotelId: "ChkIv_HyiNKHpf6yARoML2cvMXozdGJnZ3BzEAE",
            ref: sealHotelPropertyRef(
              {
                hotelId: "serpapi-hotel-x",
                propertyToken: "ChkIv_HyiNKHpf6yARoML2cvMXozdGJnZ3BzEAE",
                query: "Paris",
              },
              SECRET,
            ),
          },
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "VALIDATION_ERROR");
        return true;
      },
    );
  });
});
