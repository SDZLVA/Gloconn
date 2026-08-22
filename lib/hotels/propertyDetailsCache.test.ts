/**
 * Sprint 17.3 — property token registry + details cache.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clearHotelPropertyDetailsCache,
  getCachedHotelPropertyDetails,
  HOTEL_PROPERTY_DETAILS_CACHE_TTL_MS,
  setCachedHotelPropertyDetails,
} from "@/lib/hotels/propertyDetailsCache";
import {
  clearHotelPropertyTokenRegistry,
  getHotelPropertyTokenRegistrySizeForTests,
  registerHotelPropertyLookup,
  resolveHotelPropertyLookup,
  resolveHotelPropertyToken,
  PROPERTY_TOKEN_REGISTRY_TTL_MS,
} from "@/lib/hotels/propertyTokenRegistry";

describe("propertyTokenRegistry", () => {
  beforeEach(() => {
    clearHotelPropertyTokenRegistry();
  });

  it("registers and resolves a token by hotel id", () => {
    registerHotelPropertyLookup("serpapi-hotel-abc", {
      propertyToken: "ChkIv_token_example",
      query: "Paris, France",
    });
    assert.equal(
      resolveHotelPropertyToken("serpapi-hotel-abc"),
      "ChkIv_token_example",
    );
    assert.equal(
      resolveHotelPropertyLookup("serpapi-hotel-abc")?.query,
      "Paris, France",
    );
    assert.equal(getHotelPropertyTokenRegistrySizeForTests(), 1);
  });

  it("returns null for unknown ids", () => {
    assert.equal(resolveHotelPropertyToken("missing"), null);
  });

  it("expires entries after TTL", () => {
    const realNow = Date.now;
    let now = 1_000_000;
    Date.now = () => now;
    try {
      registerHotelPropertyLookup("h1", {
        propertyToken: "token-1",
        query: "Bali",
      });
      assert.equal(resolveHotelPropertyToken("h1"), "token-1");
      now += PROPERTY_TOKEN_REGISTRY_TTL_MS + 1;
      assert.equal(resolveHotelPropertyToken("h1"), null);
    } finally {
      Date.now = realNow;
    }
  });
});

describe("propertyDetailsCache", () => {
  beforeEach(() => {
    clearHotelPropertyDetailsCache();
  });

  it("stores and returns details within TTL", () => {
    setCachedHotelPropertyDetails("h1", {
      hotelId: "h1",
      address: "1 Rue Example, Paris",
    });
    assert.deepEqual(getCachedHotelPropertyDetails("h1"), {
      hotelId: "h1",
      address: "1 Rue Example, Paris",
    });
  });

  it("expires details after TTL", () => {
    const realNow = Date.now;
    let now = 2_000_000;
    Date.now = () => now;
    try {
      setCachedHotelPropertyDetails("h2", { hotelId: "h2", address: "NYC" });
      now += HOTEL_PROPERTY_DETAILS_CACHE_TTL_MS + 1;
      assert.equal(getCachedHotelPropertyDetails("h2"), undefined);
    } finally {
      Date.now = realNow;
    }
  });
});
