/**
 * Low-level helpers for reading environment variables.
 */

import type { NodeEnv, ProviderName } from "@/lib/config/types";

const PROVIDER_NAMES: ProviderName[] = [
  "mock",
  "google-maps",
  "amadeus",
  "booking",
  "omio",
];

/** Reads a trimmed env value, or undefined when missing/empty. */
export function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Reads an env value with a fallback default. */
export function readEnvOrDefault(name: string, defaultValue: string): string {
  return readEnv(name) ?? defaultValue;
}

/** Parses a boolean env flag (`true`/`1` vs `false`/`0`). */
export function readBooleanEnv(name: string, defaultValue: boolean): boolean {
  const raw = readEnv(name);
  if (raw === undefined) {
    return defaultValue;
  }

  return raw !== "false" && raw !== "0";
}

/** Parses NODE_ENV with a safe fallback. */
export function readNodeEnv(): NodeEnv {
  const raw = readEnv("NODE_ENV");
  if (raw === "production" || raw === "test" || raw === "development") {
    return raw;
  }

  return "development";
}

/** Parses a provider name env var, falling back to `mock`. */
export function readProviderName(name: string): ProviderName {
  const raw = readEnvOrDefault(name, "mock");
  if (PROVIDER_NAMES.includes(raw as ProviderName)) {
    return raw as ProviderName;
  }

  return "mock";
}
