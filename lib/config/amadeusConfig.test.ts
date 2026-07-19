/**
 * Step 8.3 — Amadeus configuration: env selection, validation, timeouts.
 */

import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AMADEUS_HOSTS,
  DEFAULT_AMADEUS_FETCH_TIMEOUT_MS,
  DEFAULT_AMADEUS_OAUTH_TIMEOUT_MS,
  loadAppConfig,
  resetAppConfig,
} from "@/lib/config";

type SavedEnv = Record<string, string | undefined>;

const ENV_KEYS = [
  "USE_MOCK_PROVIDERS",
  "FLIGHTS_PROVIDER",
  "AMADEUS_ENV",
  "AMADEUS_API_KEY",
  "AMADEUS_API_SECRET",
  "AMADEUS_OAUTH_TIMEOUT_MS",
  "AMADEUS_FETCH_TIMEOUT_MS",
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

function setEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string>>): void {
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

describe("Amadeus environment selection", () => {
  it("defaults AMADEUS_ENV to test and maps to the known test host", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
    });

    const config = loadAppConfig();

    assert.equal(config.amadeus.env, "test");
    assert.equal(config.amadeus.envInvalid, false);
    assert.equal(config.amadeus.baseUrl, AMADEUS_HOSTS.test);
    assert.equal(config.validation.isValid, true);
  });

  it("selects the production host when AMADEUS_ENV=production", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
      AMADEUS_ENV: "production",
    });

    const config = loadAppConfig();

    assert.equal(config.amadeus.env, "production");
    assert.equal(config.amadeus.baseUrl, AMADEUS_HOSTS.production);
    assert.equal(config.amadeus.baseUrl, "https://api.amadeus.com");
    assert.equal(config.validation.isValid, true);
  });

  it("fails validation for invalid AMADEUS_ENV values", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
      AMADEUS_ENV: "staging",
    });

    const config = loadAppConfig();

    assert.equal(config.amadeus.envInvalid, true);
    assert.equal(config.validation.isValid, false);
    assert.ok(
      config.validation.errors.some(
        (issue) =>
          issue.env === "AMADEUS_ENV" &&
          issue.message.includes("test") &&
          issue.message.includes("production"),
      ),
    );
  });
});

describe("Amadeus credential validation", () => {
  it("fails when live Amadeus is intended but credentials are missing", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "amadeus",
    });

    const config = loadAppConfig();

    assert.equal(config.amadeus.isConfigured, false);
    assert.equal(config.validation.isValid, false);
    assert.ok(
      config.validation.errors.some((issue) =>
        issue.message.includes("Live Amadeus flights require AMADEUS_API_KEY"),
      ),
    );
  });

  it("accepts live Amadeus when credentials are present", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "amadeus",
      AMADEUS_ENV: "test",
      AMADEUS_API_KEY: "key",
      AMADEUS_API_SECRET: "secret",
    });

    const config = loadAppConfig();

    assert.equal(config.amadeus.isConfigured, true);
    assert.equal(config.validation.isValid, true);
  });

  it("bypasses live Amadeus credential validation in mock mode", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
      FLIGHTS_PROVIDER: "amadeus",
    });

    const config = loadAppConfig();

    assert.equal(config.amadeus.isConfigured, false);
    assert.equal(config.providers.useMockProviders, true);
    assert.equal(config.validation.isValid, true);
    assert.equal(
      config.validation.errors.some((issue) =>
        issue.message.includes("Live Amadeus"),
      ),
      false,
    );
  });
});

describe("Amadeus timeout configuration", () => {
  it("uses default OAuth and fetch timeouts when unset", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
    });

    const config = loadAppConfig();

    assert.equal(config.amadeus.oauthTimeoutMs, DEFAULT_AMADEUS_OAUTH_TIMEOUT_MS);
    assert.equal(config.amadeus.fetchTimeoutMs, DEFAULT_AMADEUS_FETCH_TIMEOUT_MS);
    assert.equal(config.amadeus.oauthTimeoutMs, 10_000);
    assert.equal(config.amadeus.fetchTimeoutMs, 15_000);
  });

  it("applies timeout overrides from environment", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
      AMADEUS_OAUTH_TIMEOUT_MS: "2500",
      AMADEUS_FETCH_TIMEOUT_MS: "8000",
    });

    const config = loadAppConfig();

    assert.equal(config.amadeus.oauthTimeoutMs, 2500);
    assert.equal(config.amadeus.fetchTimeoutMs, 8000);
    assert.equal(config.validation.isValid, true);
  });

  it("fails validation for invalid timeout overrides", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
      AMADEUS_OAUTH_TIMEOUT_MS: "0",
      AMADEUS_FETCH_TIMEOUT_MS: "fast",
    });

    const config = loadAppConfig();

    assert.equal(config.validation.isValid, false);
    assert.ok(
      config.validation.errors.some(
        (issue) => issue.env === "AMADEUS_OAUTH_TIMEOUT_MS",
      ),
    );
    assert.ok(
      config.validation.errors.some(
        (issue) => issue.env === "AMADEUS_FETCH_TIMEOUT_MS",
      ),
    );
  });
});

describe("Provider flag validation", () => {
  it("fails validation for invalid FLIGHTS_PROVIDER values", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "true",
      FLIGHTS_PROVIDER: "skyscanner",
    });

    const config = loadAppConfig();

    assert.equal(config.providers.flightsInvalid, true);
    assert.equal(config.validation.isValid, false);
    assert.ok(
      config.validation.errors.some((issue) => issue.env === "FLIGHTS_PROVIDER"),
    );
  });

  it("fails validation for invalid USE_MOCK_PROVIDERS values", () => {
    setEnv({
      USE_MOCK_PROVIDERS: "sometimes",
    });

    const config = loadAppConfig();

    assert.equal(config.providers.useMockProvidersInvalid, true);
    assert.equal(config.validation.isValid, false);
    assert.ok(
      config.validation.errors.some((issue) => issue.env === "USE_MOCK_PROVIDERS"),
    );
  });
});
