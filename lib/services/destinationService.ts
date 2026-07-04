/**
 * Destination service — UI and pages call this, not providers directly.
 */

import { toApiError } from "@/lib/api/errors";
import {
  serviceFailure,
  serviceSuccess,
  type ServiceResult,
} from "@/lib/api/types";
import { getDestinationProvider } from "@/lib/providers/destinations";
import type { Destination } from "@/types/destination";

/** Searches destinations for autocomplete suggestions. */
export async function searchDestinations(
  query: string,
): Promise<ServiceResult<Destination[]>> {
  try {
    const provider = getDestinationProvider();
    const data = await provider.searchDestinations(query);
    return serviceSuccess(data);
  } catch (error) {
    return serviceFailure(toApiError(error, "Could not load destination suggestions."));
  }
}

/** Returns curated popular destinations for the empty autocomplete state. */
export async function getPopularDestinations(): Promise<ServiceResult<Destination[]>> {
  try {
    const provider = getDestinationProvider();
    const data = await provider.getPopularDestinations();
    return serviceSuccess(data);
  } catch (error) {
    return serviceFailure(toApiError(error, "Could not load popular destinations."));
  }
}

/** Looks up a single destination by its internal id. */
export async function getDestinationById(
  id: string,
): Promise<ServiceResult<Destination | null>> {
  try {
    const provider = getDestinationProvider();
    const data = await provider.getDestinationById(id);
    return serviceSuccess(data);
  } catch (error) {
    return serviceFailure(toApiError(error, "Could not load destination."));
  }
}

/** Resolves a display label (e.g. "Paris, France") to an internal destination id. */
export async function resolveDestinationId(
  destinationLabel: string,
): Promise<ServiceResult<string>> {
  try {
    const provider = getDestinationProvider();
    const data = await provider.resolveDestinationId(destinationLabel);
    return serviceSuccess(data);
  } catch (error) {
    return serviceFailure(toApiError(error, "Could not resolve destination."));
  }
}
