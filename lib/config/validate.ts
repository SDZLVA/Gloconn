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

    // SerpAPI credentials live on config.serpapi (validated separately).
    if (provider === "serpapi") {
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

function isLiveAmadeusIntended(config: Omit<AppConfig, "validation">): boolean {
  return (
    !config.providers.useMockProviders &&
    !config.providers.useMockProvidersInvalid &&
    config.providers.flights === "amadeus" &&
    !config.providers.flightsInvalid
  );
}

function isLiveSerpapiIntended(config: Omit<AppConfig, "validation">): boolean {
  if (
    config.providers.useMockProviders ||
    config.providers.useMockProvidersInvalid
  ) {
    return false;
  }

  const liveFlights =
    config.providers.flights === "serpapi" && !config.providers.flightsInvalid;
  const liveHotels = config.providers.hotels === "serpapi";

  return liveFlights || liveHotels;
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

  if (config.providers.useMockProvidersInvalid) {
    errors.push({
      env: "USE_MOCK_PROVIDERS",
      message: `USE_MOCK_PROVIDERS must be true, false, 1, or 0 (got "${config.providers.useMockProvidersInput}").`,
    });
  }

  if (config.providers.flightsInvalid) {
    errors.push({
      env: "FLIGHTS_PROVIDER",
      message: `FLIGHTS_PROVIDER must be mock, google-maps, amadeus, booking, omio, or serpapi (got "${config.providers.flightsInput}").`,
    });
  }

  if (config.amadeus.envInvalid) {
    errors.push({
      env: "AMADEUS_ENV",
      message: `AMADEUS_ENV must be "test" or "production" (got "${config.amadeus.envInput}"). Arbitrary base URLs are not supported.`,
    });
  }

  if (config.amadeus.oauthTimeoutInvalidRaw !== undefined) {
    errors.push({
      env: "AMADEUS_OAUTH_TIMEOUT_MS",
      message: `AMADEUS_OAUTH_TIMEOUT_MS must be a positive integer (got "${config.amadeus.oauthTimeoutInvalidRaw}").`,
    });
  }

  if (config.amadeus.fetchTimeoutInvalidRaw !== undefined) {
    errors.push({
      env: "AMADEUS_FETCH_TIMEOUT_MS",
      message: `AMADEUS_FETCH_TIMEOUT_MS must be a positive integer (got "${config.amadeus.fetchTimeoutInvalidRaw}").`,
    });
  }

  if (config.serpapi.deepSearchInvalid) {
    errors.push({
      env: "SERPAPI_DEEP_SEARCH",
      message: `SERPAPI_DEEP_SEARCH must be true, false, 1, or 0 (got "${config.serpapi.deepSearchInput}").`,
    });
  }

  if (!config.providers.useMockProviders && !config.providers.useMockProvidersInvalid) {
    const providerKeyErrors = collectProviderKeyErrors(
      config.providers,
      config.apiKeys,
    );

    if (isLiveAmadeusIntended(config) && !config.amadeus.isConfigured) {
      errors.push({
        env: "AMADEUS_API_KEY, AMADEUS_API_SECRET",
        message:
          "Live Amadeus flights require AMADEUS_API_KEY and AMADEUS_API_SECRET. Set both credentials, or keep USE_MOCK_PROVIDERS=true.",
      });
      errors.push(
        ...providerKeyErrors.filter(
          (issue) => !issue.message.includes('flights provider "amadeus"'),
        ),
      );
    } else if (isLiveSerpapiIntended(config) && !config.serpapi.isConfigured) {
      errors.push({
        env: "SERPAPI_API_KEY",
        message:
          "Live SerpAPI (flights or hotels) requires SERPAPI_API_KEY. Set the credential, or keep USE_MOCK_PROVIDERS=true.",
      });
      errors.push(...providerKeyErrors);
    } else {
      errors.push(...providerKeyErrors);
    }

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
