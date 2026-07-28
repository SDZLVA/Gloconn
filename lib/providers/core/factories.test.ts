/**
 * Sprint 9.8 / 12.4 — Provider factory selection tests.
 * No HTTP — asserts which adapter instance is returned.
 */

import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import { resetAppConfig } from "@/lib/config";
import {
  createFlightsProvider,
  createHotelsProvider,
} from "@/lib/providers/core/factories";
import type {
  FlightsProvider,
  HotelsProvider,
} from "@/lib/providers/core/types";
import { amadeusFlightsProvider } from "@/lib/providers/flights/amadeus";
import { serpApiFlightsProvider } from "@/lib/providers/flights/serpapi";
import { mockHotelsProvider } from "@/lib/providers/hotels/mock";
import { serpApiHotelsProvider } from "@/lib/providers/hotels/serpapi";

type SavedEnv = Record<string, string | undefined>;

const ENV_KEYS = [
  "USE_MOCK_PROVIDERS",
  "FLIGHTS_PROVIDER",
  "HOTELS_PROVIDER",
  "SERPAPI_API_KEY",
  "SERPAPI_DEEP_SEARCH",
  "AMADEUS_API_KEY",
  "AMADEUS_API_SECRET",
  "AMADEUS_ENV",
] as const;

const savedEnv: SavedEnv = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
);

function restoreEnv(): void {
  for (const key of ENV_KEYS) {
    const previous = savedEnv[key];
    if (previous === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = previous;
    }
  }
  resetAppConfig();
}

function setEnv(
  values: Partial<Record<(typeof ENV_KEYS)[number], string>>,
): void {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
  resetAppConfig();
}

function assertFlightsProvider(provider: FlightsProvider): void {
  assert.equal(typeof provider.name, "string");
  assert.equal(typeof provider.search, "function");
}

function assertHotelsProvider(provider: HotelsProvider): void {
  assert.equal(typeof provider.name, "string");
  assert.equal(typeof provider.search, "function");
}

afterEach(() => {
  restoreEnv();
});

describe("createFlightsProvider — selection", () => {
  it("defaults to Amadeus when live mode has no FLIGHTS_PROVIDER", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      AMADEUS_API_KEY: "amadeus-key",
      AMADEUS_API_SECRET: "amadeus-secret",
    });

    const provider = createFlightsProvider();

    assertFlightsProvider(provider);
    assert.equal(provider, amadeusFlightsProvider);
    assert.equal(provider.name, "amadeus");
  });

  it("selects Amadeus when FLIGHTS_PROVIDER=amadeus", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "amadeus",
      AMADEUS_API_KEY: "amadeus-key",
      AMADEUS_API_SECRET: "amadeus-secret",
    });

    const provider = createFlightsProvider();

    assertFlightsProvider(provider);
    assert.equal(provider, amadeusFlightsProvider);
    assert.equal(provider.name, "amadeus");
  });

  it("selects SerpAPI when FLIGHTS_PROVIDER=serpapi", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "serpapi",
      SERPAPI_API_KEY: "serp-test-key",
    });

    const provider = createFlightsProvider();

    assertFlightsProvider(provider);
    assert.equal(provider, serpApiFlightsProvider);
    assert.equal(provider.name, "serpapi");
  });

  it("throws ProviderError for an invalid FLIGHTS_PROVIDER", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "skyscanner",
      AMADEUS_API_KEY: "amadeus-key",
      AMADEUS_API_SECRET: "amadeus-secret",
    });

    assert.throws(
      () => createFlightsProvider(),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.match(error.message, /skyscanner/);
        assert.match(error.message, /serpapi/);
        return true;
      },
    );
  });

  it("returns a FlightsProvider instance", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "amadeus",
      AMADEUS_API_KEY: "amadeus-key",
      AMADEUS_API_SECRET: "amadeus-secret",
    });

    const provider = createFlightsProvider();

    assertFlightsProvider(provider);
  });
});

describe("createHotelsProvider — selection", () => {
  it("defaults to mock when USE_MOCK_PROVIDERS=true", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
      HOTELS_PROVIDER: "serpapi",
      SERPAPI_API_KEY: "serp-test-key",
    });

    const provider = createHotelsProvider();

    assertHotelsProvider(provider);
    assert.equal(provider, mockHotelsProvider);
  });

  it("selects SerpAPI when HOTELS_PROVIDER=serpapi and key is present", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      HOTELS_PROVIDER: "serpapi",
      SERPAPI_API_KEY: "serp-test-key",
    });

    const provider = createHotelsProvider();

    assertHotelsProvider(provider);
    assert.equal(provider, serpApiHotelsProvider);
    assert.equal(provider.name, "serpapi");
  });

  it("falls back to mock when HOTELS_PROVIDER=serpapi but key is missing", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      HOTELS_PROVIDER: "serpapi",
    });

    const provider = createHotelsProvider();

    assertHotelsProvider(provider);
    assert.equal(provider, mockHotelsProvider);
  });
});
