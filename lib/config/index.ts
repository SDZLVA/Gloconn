/**
 * Centralized application configuration.
 *
 * All environment variables are read here — never in UI components or providers.
 * Copy `.env.example` to `.env.local` and fill in values for your environment.
 */

import { loadAppConfig } from "@/lib/config/load";

export type {
  ApiEnv,
  ApiKeysConfig,
  AppConfig,
  AppSection,
  ConfigIssue,
  ConfigValidation,
  NodeEnv,
  ProviderName,
  ProvidersConfig,
  SupabaseConfig,
} from "@/lib/config/types";

export { loadAppConfig, loadAppConfigRaw } from "@/lib/config/load";
export { validateAppConfig } from "@/lib/config/validate";

let cachedConfig: ReturnType<typeof loadAppConfig> | null = null;
let hasLoggedWarnings = false;

/** Returns the cached application configuration (loads once per process). */
export function getAppConfig() {
  if (!cachedConfig) {
    cachedConfig = loadAppConfig();

    if (typeof window === "undefined" && !hasLoggedWarnings) {
      hasLoggedWarnings = true;
      for (const warning of cachedConfig.validation.warnings) {
        console.warn(`[Glooconn config] ${warning.message}`);
      }
      for (const error of cachedConfig.validation.errors) {
        console.error(`[Glooconn config] ${error.message}`);
      }
    }
  }

  return cachedConfig;
}

/** Clears the cached configuration (useful in tests). */
export function resetAppConfig(): void {
  cachedConfig = null;
  hasLoggedWarnings = false;
}

/** Logs configuration warnings and errors to the console. */
export function logConfigWarnings(): void {
  const { validation } = loadAppConfig();

  for (const warning of validation.warnings) {
    console.warn(`[Glooconn config] ${warning.message}`);
  }

  for (const error of validation.errors) {
    console.error(`[Glooconn config] ${error.message}`);
  }
}
