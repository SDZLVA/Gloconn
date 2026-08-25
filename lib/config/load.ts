/**
 * Loads configuration from environment variables.
 */

import {
  DEFAULT_AMADEUS_FETCH_TIMEOUT_MS,
  DEFAULT_AMADEUS_OAUTH_TIMEOUT_MS,
  resolveAmadeusBaseUrl,
} from "@/lib/config/amadeusHosts";
import {
  readBooleanEnv,
  readEnv,
  readEnvOrDefault,
  readNodeEnv,
  readPositiveIntEnv,
  readProviderName,
} from "@/lib/config/parse";
import type {
  AmadeusConfig,
  AppConfig,
  ProviderName,
  SerpApiConfig,
} from "@/lib/config/types";
import { validateAppConfig } from "@/lib/config/validate";

const PROVIDER_NAMES: ProviderName[] = [
  "mock",
  "google-maps",
  "amadeus",
  "booking",
  "omio",
  "serpapi",
];

function loadAmadeusEnv(): Pick<
  AmadeusConfig,
  "env" | "envInput" | "envInvalid"
> {
  const envInput = readEnv("AMADEUS_ENV");
  if (envInput === undefined) {
    return { env: "test", envInvalid: false };
  }

  if (envInput === "test" || envInput === "production") {
    return { env: envInput, envInput, envInvalid: false };
  }

  return {
    env: "test",
    envInput,
    envInvalid: true,
  };
}

function loadPositiveTimeout(
  name: string,
  defaultValue: number,
): { value: number; invalidRaw?: string } {
  const parsed = readPositiveIntEnv(name, defaultValue);
  if (!parsed.ok) {
    return { value: defaultValue, invalidRaw: parsed.raw };
  }

  return { value: parsed.value };
}

function loadFlightsProvider(): Pick<
  AppConfig["providers"],
  "flights" | "flightsInput" | "flightsInvalid"
> {
  const flightsInput = readEnv("FLIGHTS_PROVIDER");
  if (flightsInput === undefined) {
    return { flights: "mock", flightsInvalid: false };
  }

  if (PROVIDER_NAMES.includes(flightsInput as ProviderName)) {
    return {
      flights: flightsInput as ProviderName,
      flightsInput,
      flightsInvalid: false,
    };
  }

  return {
    flights: "mock",
    flightsInput,
    flightsInvalid: true,
  };
}

function loadUseMockProviders(): Pick<
  AppConfig["providers"],
  "useMockProviders" | "useMockProvidersInput" | "useMockProvidersInvalid"
> {
  const useMockProvidersInput = readEnv("USE_MOCK_PROVIDERS");
  if (useMockProvidersInput === undefined) {
    return { useMockProviders: true, useMockProvidersInvalid: false };
  }

  if (
    useMockProvidersInput === "true" ||
    useMockProvidersInput === "1" ||
    useMockProvidersInput === "false" ||
    useMockProvidersInput === "0"
  ) {
    return {
      useMockProviders: readBooleanEnv("USE_MOCK_PROVIDERS", true),
      useMockProvidersInput,
      useMockProvidersInvalid: false,
    };
  }

  return {
    useMockProviders: true,
    useMockProvidersInput,
    useMockProvidersInvalid: true,
  };
}

function loadAmadeusConfig(): AmadeusConfig {
  const envLoad = loadAmadeusEnv();
  const apiKey = readEnv("AMADEUS_API_KEY") ?? "";
  const apiSecret = readEnv("AMADEUS_API_SECRET") ?? "";
  const oauthTimeout = loadPositiveTimeout(
    "AMADEUS_OAUTH_TIMEOUT_MS",
    DEFAULT_AMADEUS_OAUTH_TIMEOUT_MS,
  );
  const fetchTimeout = loadPositiveTimeout(
    "AMADEUS_FETCH_TIMEOUT_MS",
    DEFAULT_AMADEUS_FETCH_TIMEOUT_MS,
  );

  return {
    env: envLoad.env,
    envInput: envLoad.envInput,
    envInvalid: envLoad.envInvalid,
    baseUrl: resolveAmadeusBaseUrl(envLoad.env),
    apiKey,
    apiSecret,
    isConfigured: Boolean(apiKey && apiSecret),
    oauthTimeoutMs: oauthTimeout.value,
    fetchTimeoutMs: fetchTimeout.value,
    oauthTimeoutInvalidRaw: oauthTimeout.invalidRaw,
    fetchTimeoutInvalidRaw: fetchTimeout.invalidRaw,
  };
}

function loadSerpApiDeepSearch(): Pick<
  SerpApiConfig,
  "deepSearch" | "deepSearchInput" | "deepSearchInvalid"
> {
  const deepSearchInput = readEnv("SERPAPI_DEEP_SEARCH");
  if (deepSearchInput === undefined) {
    return { deepSearch: false, deepSearchInvalid: false };
  }

  if (
    deepSearchInput === "true" ||
    deepSearchInput === "1" ||
    deepSearchInput === "false" ||
    deepSearchInput === "0"
  ) {
    return {
      deepSearch: deepSearchInput === "true" || deepSearchInput === "1",
      deepSearchInput,
      deepSearchInvalid: false,
    };
  }

  return {
    deepSearch: false,
    deepSearchInput,
    deepSearchInvalid: true,
  };
}

function loadSerpApiConfig(): SerpApiConfig {
  const apiKey = readEnv("SERPAPI_API_KEY") ?? "";
  const deepSearch = loadSerpApiDeepSearch();

  return {
    apiKey,
    deepSearch: deepSearch.deepSearch,
    deepSearchInput: deepSearch.deepSearchInput,
    deepSearchInvalid: deepSearch.deepSearchInvalid,
    isConfigured: Boolean(apiKey),
  };
}

function loadPropertyRefSealConfig(): import("@/lib/config/types").PropertyRefSealConfig {
  const secret = readEnv("PROPERTY_REF_SEAL_SECRET") ?? "";
  const trimmed = secret.trim();
  const isConfigured =
    trimmed.length >= 32 || /^[0-9a-fA-F]{64}$/.test(trimmed);

  return {
    secret: trimmed,
    isConfigured,
  };
}

function loadReplayConfig(
  nodeEnv: import("@/lib/config/types").NodeEnv,
): import("@/lib/config/types").ReplayConfig {
  const input = readEnv("GLOOCONN_REPLAY_MODE");
  const requested =
    input === "true" || input === "1" || input === "yes";

  // Production must never run replay — even if the env var is set.
  if (nodeEnv === "production") {
    return {
      enabled: false,
      input,
      blockedInProduction: requested,
    };
  }

  return {
    enabled: requested,
    input,
    blockedInProduction: false,
  };
}

/** Reads raw configuration without caching or validation attachment. */
export function loadAppConfigRaw(): Omit<AppConfig, "validation"> {
  const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL") ?? "";
  const supabaseAnonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? "";
  const mockFlag = loadUseMockProviders();
  const flightsProvider = loadFlightsProvider();
  const amadeus = loadAmadeusConfig();
  const serpapi = loadSerpApiConfig();

  const nodeEnv = readNodeEnv();

  return {
    app: {
      nodeEnv,
      siteUrl: readEnvOrDefault("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
    },
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
    },
    providers: {
      useMockProviders: mockFlag.useMockProviders,
      useMockProvidersInput: mockFlag.useMockProvidersInput,
      useMockProvidersInvalid: mockFlag.useMockProvidersInvalid,
      destinations: readProviderName("DESTINATIONS_PROVIDER"),
      hotels: readProviderName("HOTELS_PROVIDER"),
      flights: flightsProvider.flights,
      flightsInput: flightsProvider.flightsInput,
      flightsInvalid: flightsProvider.flightsInvalid,
      transport: readProviderName("TRANSPORT_PROVIDER"),
    },
    apiKeys: {
      googleMaps: {
        apiKey: readEnv("GOOGLE_MAPS_API_KEY") ?? "",
        isConfigured: Boolean(readEnv("GOOGLE_MAPS_API_KEY")),
      },
      amadeus: {
        apiKey: amadeus.apiKey,
        apiSecret: amadeus.apiSecret,
        isConfigured: amadeus.isConfigured,
      },
      booking: {
        apiKey: readEnv("BOOKING_API_KEY") ?? "",
        isConfigured: Boolean(readEnv("BOOKING_API_KEY")),
      },
      omio: {
        apiKey: readEnv("OMIO_API_KEY") ?? "",
        isConfigured: Boolean(readEnv("OMIO_API_KEY")),
      },
    },
    amadeus,
    serpapi,
    propertyRefSeal: loadPropertyRefSealConfig(),
    replay: loadReplayConfig(nodeEnv),
  };
}

/** Loads and validates configuration. */
export function loadAppConfig(): AppConfig {
  const raw = loadAppConfigRaw();
  const validation = validateAppConfig(raw);
  return { ...raw, validation };
}
