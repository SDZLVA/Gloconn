/**
 * Application configuration types.
 * Loaded from environment variables — see `lib/config/load.ts`.
 */

export type NodeEnv = "development" | "production" | "test";

export type AppSection = {
  nodeEnv: NodeEnv;
  siteUrl: string;
};

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  isConfigured: boolean;
};

export type ProviderName =
  | "mock"
  | "google-maps"
  | "amadeus"
  | "booking"
  | "omio"
  | "serpapi";

/** Amadeus Self-Service environment (maps to a known host). */
export type AmadeusEnvName = "test" | "production";

/**
 * Amadeus runtime settings — loaded only via `lib/config`.
 * Hosts are fixed per `env`; arbitrary base URLs are not supported.
 */
export type AmadeusConfig = {
  /** Selected Amadeus environment (`test` by default). */
  env: AmadeusEnvName;

  /**
   * Raw `AMADEUS_ENV` value when present.
   * Used for validation when the value is not `test` or `production`.
   */
  envInput?: string;

  /** True when `AMADEUS_ENV` was set to an unsupported value. */
  envInvalid: boolean;

  /** Resolved known Amadeus API host for `env`. */
  baseUrl: string;

  apiKey: string;
  apiSecret: string;
  isConfigured: boolean;

  oauthTimeoutMs: number;
  fetchTimeoutMs: number;

  /** Present when `AMADEUS_OAUTH_TIMEOUT_MS` was set but not a positive integer. */
  oauthTimeoutInvalidRaw?: string;

  /** Present when `AMADEUS_FETCH_TIMEOUT_MS` was set but not a positive integer. */
  fetchTimeoutInvalidRaw?: string;
};

/**
 * SerpAPI Google Flights settings — loaded only via `lib/config`.
 * Dev/test flights provider (ADR-036). No HTTP or adapter code in Sprint 9.2.
 */
export type SerpApiConfig = {
  apiKey: string;

  /**
   * Maps to SerpAPI `deep_search`.
   * Default `false` — `true` increases latency and timeout risk.
   */
  deepSearch: boolean;

  /** Raw `SERPAPI_DEEP_SEARCH` when present. */
  deepSearchInput?: string;

  /** True when `SERPAPI_DEEP_SEARCH` is set to an unsupported value. */
  deepSearchInvalid: boolean;

  /** True when `SERPAPI_API_KEY` is non-empty. */
  isConfigured: boolean;
};

export type ProvidersConfig = {
  /** When true, mock adapters are used (default for local development). */
  useMockProviders: boolean;

  /** Raw `USE_MOCK_PROVIDERS` when present. */
  useMockProvidersInput?: string;

  /** True when `USE_MOCK_PROVIDERS` is set to an unsupported value. */
  useMockProvidersInvalid: boolean;

  destinations: ProviderName;
  hotels: ProviderName;
  flights: ProviderName;

  /** Raw `FLIGHTS_PROVIDER` when present. */
  flightsInput?: string;

  /** True when `FLIGHTS_PROVIDER` is set to an unsupported value. */
  flightsInvalid: boolean;

  transport: ProviderName;
};

/**
 * Server-side API credentials (never use NEXT_PUBLIC_ for these).
 * Values are empty on the client — Next.js does not expose non-public env vars in the browser.
 */
export type ApiKeysConfig = {
  googleMaps: { apiKey: string; isConfigured: boolean };
  amadeus: { apiKey: string; apiSecret: string; isConfigured: boolean };
  booking: { apiKey: string; isConfigured: boolean };
  omio: { apiKey: string; isConfigured: boolean };
};

export type ConfigIssue = {
  /** Environment variable name, when relevant. */
  env?: string;
  message: string;
};

export type ConfigValidation = {
  isValid: boolean;
  errors: ConfigIssue[];
  warnings: ConfigIssue[];
};

export type AppConfig = {
  app: AppSection;
  supabase: SupabaseConfig;
  providers: ProvidersConfig;
  apiKeys: ApiKeysConfig;
  amadeus: AmadeusConfig;
  serpapi: SerpApiConfig;
  validation: ConfigValidation;
};

/** @deprecated Use AppConfig — kept for lib/api/env.ts compatibility. */
export type ApiEnv = {
  useMockProviders: boolean;
};
