/**
 * Destination service — UI and pages call this, not providers directly.
 */

import { runService, serviceSuccess, type ServiceResult } from "@/lib/api/types";
import { getServiceProviders } from "@/lib/services/context";
import type { Destination } from "@/types/destination";

/** Searches destinations for autocomplete suggestions. */
export async function searchDestinations(
  query: string,
): Promise<ServiceResult<Destination[]>> {
  return runService(async () => {
    const { destinations } = getServiceProviders();
    return destinations.searchDestinations(query);
  }, "Could not load destination suggestions.");
}

/** Returns curated popular destinations for the empty autocomplete state. */
export async function getPopularDestinations(): Promise<ServiceResult<Destination[]>> {
  return runService(async () => {
    const { destinations } = getServiceProviders();
    return destinations.getPopularDestinations();
  }, "Could not load popular destinations.");
}

/** Looks up a single destination by its internal id. */
export async function getDestinationById(
  id: string,
): Promise<ServiceResult<Destination | null>> {
  return runService(async () => {
    const { destinations } = getServiceProviders();
    return destinations.getDestinationById(id);
  }, "Could not load destination.");
}

/** Resolves a display label (e.g. "Paris, France") to an internal destination id. */
export async function resolveDestinationId(
  destinationLabel: string,
): Promise<ServiceResult<string>> {
  return runService(async () => {
    const { destinations } = getServiceProviders();
    return destinations.resolveDestinationId(destinationLabel);
  }, "Could not resolve destination.");
}

/** Resolves multiple destination ids in parallel (e.g. recent searches). */
export async function getDestinationsByIds(
  ids: string[],
): Promise<ServiceResult<Destination[]>> {
  if (ids.length === 0) {
    return serviceSuccess([]);
  }

  return runService(async () => {
    const { destinations } = getServiceProviders();
    const results = await Promise.all(
      ids.map((id) => destinations.getDestinationById(id)),
    );
    return results.filter(
      (destination): destination is Destination => destination !== null,
    );
  }, "Could not load destinations.");
}
