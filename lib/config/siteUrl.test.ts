/**
 * Security regression tests — F-11: production site URL validation
 *
 * Verifies that NEXT_PUBLIC_SITE_URL=localhost in production is treated as
 * a hard configuration error, not a warning. In development/test it remains
 * a warning (non-blocking).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateAppConfig } from "@/lib/config/validate";
import type { AppConfig } from "@/lib/config/types";

/** Builds a minimal valid config skeleton for testing siteUrl behaviour. */
function makeConfig(
  siteUrl: string,
  nodeEnv: "development" | "production" | "test",
): Omit<AppConfig, "validation"> {
  return {
    app: { nodeEnv, siteUrl },
    supabase: { url: "https://x.supabase.co", anonKey: "key", isConfigured: true },
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
  };
}

describe("F-11: NEXT_PUBLIC_SITE_URL — production localhost", () => {
  it("produces an ERROR when siteUrl is localhost in production", () => {
    const result = validateAppConfig(makeConfig("http://localhost:3000", "production"));
    const hasError = result.errors.some(
      (e) => e.env === "NEXT_PUBLIC_SITE_URL",
    );
    assert.ok(hasError, "Expected NEXT_PUBLIC_SITE_URL error in production with localhost");
    assert.ok(!result.isValid, "Config should be invalid when siteUrl is localhost in production");
  });

  it("produces an ERROR for https://localhost in production", () => {
    const result = validateAppConfig(makeConfig("https://localhost", "production"));
    const hasError = result.errors.some((e) => e.env === "NEXT_PUBLIC_SITE_URL");
    assert.ok(hasError);
  });

  it("produces an ERROR for http://localhost:8080 in production", () => {
    const result = validateAppConfig(makeConfig("http://localhost:8080", "production"));
    const hasError = result.errors.some((e) => e.env === "NEXT_PUBLIC_SITE_URL");
    assert.ok(hasError);
  });

  it("does NOT produce an error when a real domain is set in production", () => {
    const result = validateAppConfig(
      makeConfig("https://app.glooconn.com", "production"),
    );
    const hasError = result.errors.some((e) => e.env === "NEXT_PUBLIC_SITE_URL");
    assert.ok(!hasError, "Real domain in production should not produce a siteUrl error");
  });

  it("does NOT produce an error when siteUrl is localhost in development", () => {
    const result = validateAppConfig(makeConfig("http://localhost:3000", "development"));
    const hasError = result.errors.some((e) => e.env === "NEXT_PUBLIC_SITE_URL");
    assert.ok(!hasError, "localhost is expected and valid in development");
  });

  it("does NOT produce an error when siteUrl is localhost in test", () => {
    const result = validateAppConfig(makeConfig("http://localhost:3000", "test"));
    const hasError = result.errors.some((e) => e.env === "NEXT_PUBLIC_SITE_URL");
    assert.ok(!hasError, "localhost is expected and valid in test");
  });

  it("produces a WARNING (not error) when siteUrl is localhost in development", () => {
    const result = validateAppConfig(makeConfig("http://localhost:3000", "development"));
    const hasWarning = result.warnings.some(
      (w) => w.env === "NEXT_PUBLIC_SITE_URL",
    );
    assert.ok(hasWarning, "localhost in development should produce a warning, not an error");
  });
});
