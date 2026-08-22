/**
 * Sprint 9.2 — SerpAPI configuration loading and validation (config only).
 */

import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadAppConfig, resetAppConfig } from "@/lib/config";

type SavedEnv = Record<string, string | undefined>;

const ENV_KEYS = [
  "USE_MOCK_PROVIDERS",
  "FLIGHTS_PROVIDER",
  "HOTELS_PROVIDER",
  "SERPAPI_API_KEY",
  "SERPAPI_DEEP_SEARCH",
  "PROPERTY_REF_SEAL_SECRET",
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

afterEach(() => {
  restoreEnv();
});

describe("SerpAPI configuration — ProviderName parsing", () => {
  it("accepts FLIGHTS_PROVIDER=serpapi", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
      FLIGHTS_PROVIDER: "serpapi",
    });

    const config = loadAppConfig();

    assert.equal(config.providers.flights, "serpapi");
    assert.equal(config.providers.flightsInvalid, false);
    assert.equal(config.validation.isValid, true);
  });
});

describe("SerpAPI configuration — valid configuration", () => {
  it("loads apiKey and deepSearch defaults when live SerpAPI is intended", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "serpapi",
      SERPAPI_API_KEY: "serp-test-key",
    });

    const config = loadAppConfig();

    assert.equal(config.serpapi.apiKey, "serp-test-key");
    assert.equal(config.serpapi.isConfigured, true);
    assert.equal(config.serpapi.deepSearch, false);
    assert.equal(config.serpapi.deepSearchInvalid, false);
    assert.equal(config.validation.isValid, true);
  });

  it("applies SERPAPI_DEEP_SEARCH=true", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "serpapi",
      SERPAPI_API_KEY: "serp-test-key",
      SERPAPI_DEEP_SEARCH: "true",
    });

    const config = loadAppConfig();

    assert.equal(config.serpapi.deepSearch, true);
    assert.equal(config.validation.isValid, true);
  });
});

describe("SerpAPI configuration — missing API key", () => {
  it("fails when live SerpAPI is intended but SERPAPI_API_KEY is missing", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "serpapi",
    });

    const config = loadAppConfig();

    assert.equal(config.serpapi.isConfigured, false);
    assert.equal(config.validation.isValid, false);
    assert.ok(
      config.validation.errors.some(
        (issue) =>
          issue.env === "SERPAPI_API_KEY" &&
          issue.message.includes("Live SerpAPI") &&
          issue.message.includes("SERPAPI_API_KEY"),
      ),
    );
  });

  it("warns (does not fail) when live SerpAPI hotels lack PROPERTY_REF_SEAL_SECRET", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      HOTELS_PROVIDER: "serpapi",
      FLIGHTS_PROVIDER: "mock",
      SERPAPI_API_KEY: "serp-test-key",
    });

    const config = loadAppConfig();

    assert.equal(config.propertyRefSeal.isConfigured, false);
    assert.equal(config.validation.isValid, true);
    assert.equal(
      config.validation.errors.some(
        (issue) => issue.env === "PROPERTY_REF_SEAL_SECRET",
      ),
      false,
    );
    assert.ok(
      config.validation.warnings.some(
        (issue) =>
          issue.env === "PROPERTY_REF_SEAL_SECRET" &&
          issue.message.includes("Hotel search still works"),
      ),
    );
  });

  it("passes when live SerpAPI hotels include PROPERTY_REF_SEAL_SECRET", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      HOTELS_PROVIDER: "serpapi",
      FLIGHTS_PROVIDER: "mock",
      SERPAPI_API_KEY: "serp-test-key",
      PROPERTY_REF_SEAL_SECRET: "test-property-ref-seal-secret-32chars!!",
    });

    const config = loadAppConfig();

    assert.equal(config.propertyRefSeal.isConfigured, true);
    assert.equal(config.validation.isValid, true);
    assert.equal(
      config.validation.warnings.some(
        (issue) => issue.env === "PROPERTY_REF_SEAL_SECRET",
      ),
      false,
    );
  });
});

describe("SerpAPI configuration — invalid deepSearch", () => {
  it("fails validation for unsupported SERPAPI_DEEP_SEARCH values", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
      SERPAPI_DEEP_SEARCH: "sometimes",
    });

    const config = loadAppConfig();

    assert.equal(config.serpapi.deepSearchInvalid, true);
    assert.equal(config.serpapi.deepSearch, false);
    assert.equal(config.validation.isValid, false);
    assert.ok(
      config.validation.errors.some((issue) => issue.env === "SERPAPI_DEEP_SEARCH"),
    );
  });
});

describe("SerpAPI configuration — mock mode bypass", () => {
  it("bypasses SerpAPI credential validation when USE_MOCK_PROVIDERS=true", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
      FLIGHTS_PROVIDER: "serpapi",
    });

    const config = loadAppConfig();

    assert.equal(config.serpapi.isConfigured, false);
    assert.equal(config.providers.useMockProviders, true);
    assert.equal(config.validation.isValid, true);
    assert.equal(
      config.validation.errors.some((issue) =>
        issue.message.includes("Live SerpAPI"),
      ),
      false,
    );
  });
});
