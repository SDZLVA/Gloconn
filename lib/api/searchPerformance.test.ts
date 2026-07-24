import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createUnexpectedError } from "@/lib/api/errors";
import { createClientTtlCache } from "@/lib/api/clientTtlCache";
import {
  clearSearchResultCache,
  getCachedSearchResult,
  withSearchResultCache,
} from "@/lib/api/searchResultCache";
import { serviceFailure, serviceSuccess, type ServiceResult } from "@/lib/api/types";
import { buildSearchCacheKey } from "@/lib/search/cacheKey";
import {
  clearDestinationFilterCache,
  filterDestinationsCached,
  rankDestinationsCached,
} from "@/lib/destinations/filterCache";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResponse } from "@/types/models/search-response";

const baseSearch: Partial<SearchRequest> = {
  origin: "Milan, Italy",
  originId: "milan",
  destination: "Paris, France",
  destinationId: "paris",
  tripType: "round-trip",
  departureDate: "2026-08-01",
  returnDate: "2026-08-08",
  travelStyle: "standard",
  totalGuests: 2,
  budget: { amount: 2000, currency: "EUR" },
  travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
  productTypes: ["hotels", "flights", "transport"],
};

function emptyResponse(): SearchResponse {
  return {
    hotels: [],
    flights: [],
    buses: [],
    trains: [],
    restaurants: [],
    attractions: [],
    totalCount: 0,
    searchedAt: "2026-07-24T00:00:00.000Z",
  };
}

describe("buildSearchCacheKey", () => {
  it("is stable for productTypes order differences", () => {
    const a = buildSearchCacheKey({
      ...baseSearch,
      productTypes: ["flights", "hotels", "transport"],
    });
    const b = buildSearchCacheKey({
      ...baseSearch,
      productTypes: ["transport", "flights", "hotels"],
    });
    assert.equal(a, b);
  });

  it("differs when destination changes", () => {
    const a = buildSearchCacheKey(baseSearch);
    const b = buildSearchCacheKey({
      ...baseSearch,
      destination: "Rome, Italy",
      destinationId: "rome",
    });
    assert.notEqual(a, b);
  });
});

describe("createClientTtlCache", () => {
  it("returns undefined for a miss and value for a hit", () => {
    const cache = createClientTtlCache<string>({ ttlMs: 60_000 });
    assert.equal(cache.get("a"), undefined);
    cache.set("a", "one");
    assert.equal(cache.get("a"), "one");
  });

  it("evicts oldest entries when over maxEntries", () => {
    const cache = createClientTtlCache<number>({ ttlMs: 60_000, maxEntries: 2 });
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    assert.equal(cache.get("a"), undefined);
    assert.equal(cache.get("b"), 2);
    assert.equal(cache.get("c"), 3);
  });
});

describe("withSearchResultCache", () => {
  beforeEach(() => {
    clearSearchResultCache();
  });

  it("reuses a successful result without calling the fetcher again", async () => {
    let calls = 0;

    const first = await withSearchResultCache(baseSearch, async () => {
      calls += 1;
      return serviceSuccess(emptyResponse());
    });
    const second = await withSearchResultCache(baseSearch, async () => {
      calls += 1;
      return serviceSuccess(emptyResponse());
    });

    assert.equal(first.success, true);
    assert.equal(second.success, true);
    assert.equal(calls, 1);
    assert.ok(getCachedSearchResult(baseSearch));
  });

  it("dedupes concurrent identical fetches", async () => {
    let calls = 0;

    const fetcher = async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return serviceSuccess(emptyResponse());
    };

    const [a, b] = await Promise.all([
      withSearchResultCache(baseSearch, fetcher),
      withSearchResultCache(baseSearch, fetcher),
    ]);

    assert.equal(a.success, true);
    assert.equal(b.success, true);
    assert.equal(calls, 1);
  });

  it("bypassCache forces a new fetch", async () => {
    let calls = 0;

    await withSearchResultCache(baseSearch, async () => {
      calls += 1;
      return serviceSuccess(emptyResponse());
    });
    await withSearchResultCache(
      baseSearch,
      async () => {
        calls += 1;
        return serviceSuccess(emptyResponse());
      },
      { bypassCache: true },
    );

    assert.equal(calls, 2);
  });

  it("does not cache failures", async () => {
    let calls = 0;
    const fail = async (): Promise<ServiceResult<SearchResponse>> => {
      calls += 1;
      return serviceFailure(createUnexpectedError("fail"));
    };

    await withSearchResultCache(baseSearch, fail);
    await withSearchResultCache(baseSearch, fail);
    assert.equal(calls, 2);
  });
});

describe("filterDestinationsCached", () => {
  beforeEach(() => {
    clearDestinationFilterCache();
  });

  it("returns the same ranked list for a repeated query", () => {
    const first = rankDestinationsCached("par");
    const second = rankDestinationsCached("par");
    assert.equal(first, second);
    assert.ok(filterDestinationsCached("par").length > 0);
  });

  it("normalizes query case for cache hits", () => {
    const first = rankDestinationsCached("Paris");
    const second = rankDestinationsCached("paris");
    assert.equal(first, second);
  });
});
