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

export type ProviderName = "mock" | "google-maps" | "amadeus" | "booking" | "omio";

export type ProvidersConfig = {
  /** When true, mock adapters are used (default for local development). */
  useMockProviders: boolean;
  destinations: ProviderName;
  hotels: ProviderName;
  flights: ProviderName;
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
  validation: ConfigValidation;
};

/** @deprecated Use AppConfig — kept for lib/api/env.ts compatibility. */
export type ApiEnv = {
  useMockProviders: boolean;
};
