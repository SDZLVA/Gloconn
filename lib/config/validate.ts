/**
 * Validates loaded configuration and reports missing API keys.
 */

import type {
  ApiKeysConfig,
  AppConfig,
  ConfigIssue,
  ConfigValidation,
  ProvidersConfig,
} from "@/lib/config/types";

const PROVIDER_REQUIRED_KEYS: Record<
  string,
  { keys: (keyof ApiKeysConfig)[]; envVars: string[] }
> = {
  "google-maps": {
    keys: ["googleMaps"],
    envVars: ["GOOGLE_MAPS_API_KEY"],
  },
  amadeus: {
    keys: ["amadeus"],
    envVars: ["AMADEUS_API_KEY", "AMADEUS_API_SECRET"],
  },
  booking: {
    keys: ["booking"],
    envVars: ["BOOKING_API_KEY"],
  },
  omio: {
    keys: ["omio"],
    envVars: ["OMIO_API_KEY"],
  },
};

function isProviderConfigured(
  provider: string,
  apiKeys: ApiKeysConfig,
): boolean {
  const requirement = PROVIDER_REQUIRED_KEYS[provider];
  if (!requirement) {
    return provider === "mock";
  }

  return requirement.keys.every((key) => apiKeys[key].isConfigured);
}

function collectProviderKeyErrors(
  providers: ProvidersConfig,
  apiKeys: ApiKeysConfig,
): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  const domains: Array<{
    label: string;
    provider: string;
    envVar: string;
  }> = [
    {
      label: "destinations",
      provider: providers.destinations,
      envVar: "DESTINATIONS_PROVIDER",
    },
    { label: "hotels", provider: providers.hotels, envVar: "HOTELS_PROVIDER" },
    {
      label: "flights",
      provider: providers.flights,
      envVar: "FLIGHTS_PROVIDER",
    },
    {
      label: "transport",
      provider: providers.transport,
      envVar: "TRANSPORT_PROVIDER",
    },
  ];

  for (const { label, provider, envVar } of domains) {
    if (provider === "mock") {
      continue;
    }

    if (!isProviderConfigured(provider, apiKeys)) {
      const requirement = PROVIDER_REQUIRED_KEYS[provider];
      issues.push({
        env: requirement?.envVars.join(", "),
        message: `${label} provider "${provider}" (${envVar}) requires API keys that are not configured.`,
      });
    }
  }

  return issues;
}

/** Validates configuration and returns errors + warnings. */
export function validateAppConfig(
  config: Omit<AppConfig, "validation">,
): ConfigValidation {
  const errors: ConfigIssue[] = [];
  const warnings: ConfigIssue[] = [];

  if (!config.supabase.isConfigured) {
    warnings.push({
      env: "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY",
      message:
        "Supabase is not configured. Auth and saved trips are disabled until these variables are set.",
    });
  }

  if (config.app.siteUrl === "http://localhost:3000" && config.app.nodeEnv === "production") {
    warnings.push({
      env: "NEXT_PUBLIC_SITE_URL",
      message: "Production is using the default localhost site URL.",
    });
  }

  if (!config.providers.useMockProviders) {
    errors.push(
      ...collectProviderKeyErrors(config.providers, config.apiKeys),
    );

    const usesExternalProvider = [
      config.providers.destinations,
      config.providers.hotels,
      config.providers.flights,
      config.providers.transport,
    ].some((name) => name !== "mock");

    if (!usesExternalProvider) {
      warnings.push({
        env: "USE_MOCK_PROVIDERS",
        message:
          "USE_MOCK_PROVIDERS=false but all domain providers are still set to mock.",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
