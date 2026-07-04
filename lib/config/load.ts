/**
 * Loads configuration from environment variables.
 */

import {
  readBooleanEnv,
  readEnv,
  readEnvOrDefault,
  readNodeEnv,
  readProviderName,
} from "@/lib/config/parse";
import type { AppConfig } from "@/lib/config/types";
import { validateAppConfig } from "@/lib/config/validate";

/** Reads raw configuration without caching or validation attachment. */
export function loadAppConfigRaw(): Omit<AppConfig, "validation"> {
  const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL") ?? "";
  const supabaseAnonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? "";

  return {
    app: {
      nodeEnv: readNodeEnv(),
      siteUrl: readEnvOrDefault("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
    },
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
    },
    providers: {
      useMockProviders: readBooleanEnv("USE_MOCK_PROVIDERS", true),
      destinations: readProviderName("DESTINATIONS_PROVIDER"),
      hotels: readProviderName("HOTELS_PROVIDER"),
      flights: readProviderName("FLIGHTS_PROVIDER"),
      transport: readProviderName("TRANSPORT_PROVIDER"),
    },
    apiKeys: {
      googleMaps: {
        apiKey: readEnv("GOOGLE_MAPS_API_KEY") ?? "",
        isConfigured: Boolean(readEnv("GOOGLE_MAPS_API_KEY")),
      },
      amadeus: {
        apiKey: readEnv("AMADEUS_API_KEY") ?? "",
        apiSecret: readEnv("AMADEUS_API_SECRET") ?? "",
        isConfigured: Boolean(
          readEnv("AMADEUS_API_KEY") && readEnv("AMADEUS_API_SECRET"),
        ),
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
  };
}

/** Loads and validates configuration. */
export function loadAppConfig(): AppConfig {
  const raw = loadAppConfigRaw();
  const validation = validateAppConfig(raw);
  return { ...raw, validation };
}
