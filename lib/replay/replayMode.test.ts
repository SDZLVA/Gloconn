/**
 * Sprint 17.6 — real-data replay mode tests.
 */

import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { resetAppConfig, getAppConfig, loadAppConfig } from "@/lib/config";
import { validateAppConfig } from "@/lib/config/validate";
import type { AppConfig } from "@/lib/config/types";
import {
  REPLAY_NOT_FOUND_MESSAGE,
  REPLAY_SEARCH_WARNING_CODE,
  findMatchingCatalogEntry,
  getReplaySearchResponse,
  getReplaySealSecret,
  isReplayPropertyToken,
  loadReplayCatalog,
  loadReplayDetailsMap,
  loadReplaySearchFixture,
  matchesReplayFixture,
  requireReplayHotelPropertyDetails,
  resetReplayFixtureIndexForTests,
} from "@/lib/replay";
import { isSealedPropertyRef, unsealHotelPropertyRef } from "@/lib/hotels/sealedPropertyRef";
import { searchTrips } from "@/lib/services/searchService";
import { getHotelPropertyDetails } from "@/lib/services/hotelPropertyDetailsService";
import { clearHotelPropertyDetailsCache } from "@/lib/hotels/propertyDetailsCache";
import type { SearchRequest } from "@/types/models/search-request";
import { isSafeExternalHttpsUrl } from "@/lib/hotels/googleMapsUrl";
import { validateHotelOfferUrl, validateHotelWebsiteUrl } from "@/lib/hotels/safeExternalUrls";

const ENV_KEYS = [
  "GLOOCONN_REPLAY_MODE",
  "USE_MOCK_PROVIDERS",
  "HOTELS_PROVIDER",
  "FLIGHTS_PROVIDER",
  "SERPAPI_API_KEY",
  "PROPERTY_REF_SEAL_SECRET",
  "NODE_ENV",
] as const;

const originalEnv: Record<string, string | undefined> = {};
const envStore = process.env as Record<string, string | undefined>;

function snapshotEnv(): void {
  for (const key of ENV_KEYS) {
    originalEnv[key] = envStore[key];
  }
}

function restoreEnv(): void {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) {
      delete envStore[key];
    } else {
      envStore[key] = originalEnv[key];
    }
  }
  resetAppConfig();
  resetReplayFixtureIndexForTests();
  clearHotelPropertyDetailsCache();
}

function setEnv(values: Record<string, string | undefined>): void {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      delete envStore[key];
    } else {
      envStore[key] = value;
    }
  }
  resetAppConfig();
}

function milanParisRequest(
  overrides: Partial<SearchRequest> = {},
): Partial<SearchRequest> {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    destination: "Paris, France",
    destinationId: "paris",
    tripType: "round-trip",
    departureDate: "2026-11-01",
    returnDate: "2026-11-05",
    budget: { amount: 2000, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels", "flights"],
    ...overrides,
  };
}

function makeConfigSkeleton(
  overrides: Partial<Omit<AppConfig, "validation">> = {},
): Omit<AppConfig, "validation"> {
  return {
    app: { nodeEnv: "development", siteUrl: "http://localhost:3000" },
    supabase: { url: "", anonKey: "", isConfigured: false },
    providers: {
      useMockProviders: true,
      useMockProvidersInvalid: false,
      destinations: "mock",
      hotels: "mock",
      flights: "mock",
      flightsInvalid: false,
      transport: "mock",
    },
    apiKeys: {
      googleMaps: { apiKey: "", isConfigured: false },
      amadeus: { apiKey: "", apiSecret: "", isConfigured: false },
      booking: { apiKey: "", isConfigured: false },
      omio: { apiKey: "", isConfigured: false },
    },
    amadeus: {
      env: "test",
      envInvalid: false,
      baseUrl: "https://test.api.amadeus.com",
      apiKey: "",
      apiSecret: "",
      isConfigured: false,
      oauthTimeoutMs: 10000,
      fetchTimeoutMs: 15000,
    },
    serpapi: {
      apiKey: "",
      deepSearch: false,
      deepSearchInvalid: false,
      isConfigured: false,
    },
    propertyRefSeal: { secret: "", isConfigured: false },
    replay: { enabled: false, blockedInProduction: false },
    ...overrides,
  };
}

describe("Sprint 17.6 — replay mode", () => {
  snapshotEnv();
  afterEach(() => {
    restoreEnv();
  });

  it("defaults replay mode off", () => {
    setEnv({ GLOOCONN_REPLAY_MODE: undefined, NODE_ENV: "test" });
    const config = loadAppConfig();
    assert.equal(config.replay.enabled, false);
  });

  it("enables replay mode outside production", () => {
    setEnv({ GLOOCONN_REPLAY_MODE: "true", NODE_ENV: "development" });
    const config = loadAppConfig();
    assert.equal(config.replay.enabled, true);
    assert.equal(config.replay.blockedInProduction, false);
  });

  it("blocks replay mode in production", () => {
    const result = validateAppConfig(
      makeConfigSkeleton({
        app: { nodeEnv: "production", siteUrl: "https://app.glooconn.com" },
        replay: {
          enabled: false,
          input: "true",
          blockedInProduction: true,
        },
      }),
    );
    assert.ok(
      result.errors.some((e) => e.env === "GLOOCONN_REPLAY_MODE"),
      "expected production replay block error",
    );
    assert.equal(result.isValid, false);
  });

  it("matches fixtures by originId + destinationId", () => {
    const catalog = loadReplayCatalog();
    assert.ok(catalog.scenarios.length >= 5);
    const request = milanParisRequest() as SearchRequest;
    // Fill required SearchRequest fields loosely for matcher
    const full = {
      ...request,
      tripType: "round-trip" as const,
      returnDate: "2026-11-05",
      budget: { amount: 2000, currency: "EUR" as const },
      travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
      totalGuests: 2,
      travelStyle: "standard" as const,
    };
    const entry = findMatchingCatalogEntry(full, catalog.scenarios);
    assert.ok(entry);
    assert.equal(entry!.id, "milan-paris");
    assert.ok(
      matchesReplayFixture(full, {
        originId: "milan",
        destinationId: "paris",
      }),
    );
  });

  it("returns fixture search with sealed gpref1 refs and snapshot warning", () => {
    setEnv({ GLOOCONN_REPLAY_MODE: "true", NODE_ENV: "test" });
    const response = getReplaySearchResponse({
      origin: "Milan, Italy",
      originId: "milan",
      destination: "Paris, France",
      destinationId: "paris",
      tripType: "round-trip",
      departureDate: "2026-11-01",
      returnDate: "2026-11-05",
      budget: { amount: 2000, currency: "EUR" },
      travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
      totalGuests: 2,
      travelStyle: "standard",
      productTypes: ["hotels", "flights"],
    });

    assert.ok(response.hotels.length > 0);
    assert.ok(response.flights.length > 0);
    assert.ok(response.packages.length > 0);
    assert.ok(
      response.warnings?.some((w) => w.code === REPLAY_SEARCH_WARNING_CODE),
    );

    const sealed = response.hotels.filter((h) =>
      h.providerPropertyRef?.startsWith("gpref1."),
    );
    assert.ok(sealed.length > 0, "expected sealed hotels for details fixtures");

    const ref = sealed[0]!.providerPropertyRef!;
    assert.ok(isSealedPropertyRef(ref));
    const unsealed = unsealHotelPropertyRef(ref, getReplaySealSecret());
    assert.ok(isReplayPropertyToken(unsealed.lookup.propertyToken));
    assert.match(unsealed.lookup.propertyToken, /^replay:/);
  });

  it("throws when fixture is missing (no live fallback)", () => {
    setEnv({ GLOOCONN_REPLAY_MODE: "true", NODE_ENV: "test" });
    assert.throws(
      () =>
        getReplaySearchResponse({
          origin: "Nowhere",
          originId: "nowhere",
          destination: "Atlantis",
          destinationId: "atlantis",
          tripType: "round-trip",
          departureDate: "2026-11-01",
          returnDate: "2026-11-05",
          budget: null,
          travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
          totalGuests: 2,
          travelStyle: "standard",
          productTypes: ["hotels", "flights"],
        }),
      (error: unknown) =>
        error instanceof Error &&
        error.message.includes(REPLAY_NOT_FOUND_MESSAGE),
    );
  });

  it("searchTrips in replay mode returns fixtures with zero provider calls", async () => {
    setEnv({
      GLOOCONN_REPLAY_MODE: "true",
      NODE_ENV: "test",
      // Even if serpapi looks configured, replay must not call it.
      USE_MOCK_PROVIDERS: "false",
      HOTELS_PROVIDER: "serpapi",
      FLIGHTS_PROVIDER: "serpapi",
      SERPAPI_API_KEY: "should-never-be-used-for-replay",
    });

    assert.equal(getAppConfig().replay.enabled, true);

    let fetchCalls = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (...args: Parameters<typeof fetch>) => {
      fetchCalls += 1;
      throw new Error(`Unexpected fetch in replay: ${String(args[0])}`);
    };

    try {
      const result = await searchTrips(milanParisRequest());
      assert.equal(result.success, true);
      if (result.success) {
        assert.ok(result.data.hotels.length > 0);
        assert.ok(result.data.packages.length > 0);
      }
      assert.equal(fetchCalls, 0, "replay search must not call fetch/SerpAPI");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("replay hotel details uses fixtures and never fetch", async () => {
    setEnv({ GLOOCONN_REPLAY_MODE: "true", NODE_ENV: "test" });
    const response = getReplaySearchResponse({
      origin: "Milan, Italy",
      originId: "milan",
      destination: "Paris, France",
      destinationId: "paris",
      tripType: "round-trip",
      departureDate: "2026-11-01",
      returnDate: "2026-11-05",
      budget: null,
      travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
      totalGuests: 2,
      travelStyle: "standard",
      productTypes: ["hotels", "flights"],
    });

    const hotel = response.packages[0]?.hotel ?? response.hotels.find((h) =>
      h.providerPropertyRef?.startsWith("gpref1."),
    );
    assert.ok(hotel?.providerPropertyRef);

    let fetchCalls = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      fetchCalls += 1;
      throw new Error("Unexpected fetch in replay details");
    };

    try {
      const details = await getHotelPropertyDetails({
        ref: hotel!.providerPropertyRef,
        hotelId: hotel!.id,
      });
      assert.equal(details.details.hotelId, hotel!.id);
      assert.ok(details.details.snapshotNotice);
      assert.equal(fetchCalls, 0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("fixtures contain no API keys or property tokens", () => {
    const catalog = loadReplayCatalog();
    for (const scenario of catalog.scenarios) {
      const search = loadReplaySearchFixture(scenario.dir);
      const details = loadReplayDetailsMap(scenario.dir);
      const blob = JSON.stringify({ search, details });
      assert.doesNotMatch(blob, /api_key|apikey|authorization|property_token/i);
      assert.doesNotMatch(blob, /serpapi\.com\/search/i);
      for (const hotel of search.response.hotels) {
        assert.equal(hotel.providerPropertyRef, undefined);
      }
    }
  });

  it("replay details external URLs pass validation when present", () => {
    const catalog = loadReplayCatalog();
    for (const scenario of catalog.scenarios) {
      const details = loadReplayDetailsMap(scenario.dir);
      for (const entry of Object.values(details)) {
        if (entry.websiteUrl) {
          assert.ok(validateHotelWebsiteUrl(entry.websiteUrl));
        }
        if (entry.mapsUrl) {
          assert.equal(isSafeExternalHttpsUrl(entry.mapsUrl), true);
        }
        for (const offer of entry.offers ?? []) {
          assert.ok(validateHotelOfferUrl(offer.url));
        }
      }
    }
  });

  it("requireReplayHotelPropertyDetails returns snapshot notice", () => {
    const catalog = loadReplayCatalog();
    const paris = catalog.scenarios.find((s) => s.id === "milan-paris");
    assert.ok(paris);
    const details = loadReplayDetailsMap(paris!.dir);
    const hotelId = Object.keys(details)[0];
    assert.ok(hotelId);
    resetReplayFixtureIndexForTests();
    const loaded = requireReplayHotelPropertyDetails(hotelId!);
    assert.ok(loaded.snapshotNotice);
  });
});
