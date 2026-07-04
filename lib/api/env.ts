/**
 * Centralized API and provider environment configuration.
 * All external API keys and feature flags are read here — never in UI components.
 */

export type ApiEnv = {
  /** When true (default), mock providers are used instead of external APIs. */
  useMockProviders: boolean;
};

/**
 * Reads API-related environment variables.
 * Defaults to mock providers so local development works without API keys.
 */
export function getApiEnv(): ApiEnv {
  const raw = process.env.USE_MOCK_PROVIDERS;

  return {
    useMockProviders: raw === undefined ? true : raw !== "false",
  };
}
