/**
 * Sprint 12.2 — HotelsProvider factory selection tests.
 * No HTTP — asserts which adapter instance is returned.
 */

import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { resetAppConfig } from "@/lib/config";
import { createHotelsProvider } from "@/lib/providers/core/factories";
import type { HotelsProvider } from "@/lib/providers/core/types";
import { mockHotelsProvider } from "@/lib/providers/hotels/mock";
import { serpApiHotelsProvider } from "@/lib/providers/hotels/serpapi";

type SavedEnv = Record<string, string | undefined>;

const ENV_KEYS = [
  "USE_MOCK_PROVIDERS",
  "HOTELS_PROVIDER",
  "SERPAPI_API_KEY",
  "SERPAPI_DEEP_SEARCH",
  "BOOKING_API_KEY",
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

function assertHotelsProvider(provider: HotelsProvider): void {
  assert.equal(typeof provider.name, "string");
  assert.equal(typeof provider.search, "function");
}

afterEach(() => {
  restoreEnv();
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
    assert.equal(provider.name, "mock");
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
    assert.equal(provider.name, "mock");
  });

  it("preserves booking placeholder fallback to mock", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      HOTELS_PROVIDER: "booking",
      BOOKING_API_KEY: "booking-key",
    });

    const provider = createHotelsProvider();

    assertHotelsProvider(provider);
    assert.equal(provider, mockHotelsProvider);
    assert.equal(provider.name, "mock");
  });

  it("selects mock when HOTELS_PROVIDER=mock in live mode", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      HOTELS_PROVIDER: "mock",
    });

    const provider = createHotelsProvider();

    assertHotelsProvider(provider);
    assert.equal(provider, mockHotelsProvider);
  });
});
