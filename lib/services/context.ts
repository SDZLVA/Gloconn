/**
 * Service context — simple dependency injection for the service layer.
 *
 * By default services read providers from the central registry.
 * Tests can call `setServiceProviders()` to inject fakes without touching env vars.
 */

import { getProviderRegistry } from "@/lib/providers/core/registry";
import type { ServiceProviders } from "@/lib/services/types";

let injectedProviders: ServiceProviders | null = null;

/** Returns the active provider set (injected in tests, registry in production). */
export function getServiceProviders(): ServiceProviders {
  return injectedProviders ?? getProviderRegistry();
}

/** Replaces providers for the current process (use in tests). */
export function setServiceProviders(providers: ServiceProviders): void {
  injectedProviders = providers;
}

/** Restores the default registry-backed providers. */
export function resetServiceProviders(): void {
  injectedProviders = null;
}
