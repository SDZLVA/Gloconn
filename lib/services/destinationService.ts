/**
 * Destination service — UI and pages call this, not providers directly.
 */

import { toApiError } from "@/lib/api/errors";
import {
  serviceFailure,
  serviceSuccess,
  type ServiceResult,
} from "@/lib/api/types";
import { getServiceProviders } from "@/lib/services/context";
import type { Destination } from "@/types/destination";

/** Searches destinations for autocomplete suggestions. */
export async function searchDestinations(
  query: string,
): Promise<ServiceResult<Destination[]>> {
  try {
    const { destinations } = getServiceProviders();
    const data = await destinations.searchDestinations(query);
    return serviceSuccess(data);
  } catch (error) {
    return serviceFailure(toApiError(error, "Could not load destination suggestions."));
  }
}

/** Returns curated popular destinations for the empty autocomplete state. */
export async function getPopularDestinations(): Promise<ServiceResult<Destination[]>> {
  try {
    const { destinations } = getServiceProviders();
    const data = await destinations.getPopularDestinations();
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
    const { destinations } = getServiceProviders();
    const data = await destinations.getDestinationById(id);
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
    const { destinations } = getServiceProviders();
    const data = await destinations.resolveDestinationId(destinationLabel);
    return serviceSuccess(data);
  } catch (error) {
    return serviceFailure(toApiError(error, "Could not resolve destination."));
  }
}

/** Resolves multiple destination ids in parallel (e.g. recent searches). */
export async function getDestinationsByIds(
  ids: string[],
): Promise<ServiceResult<Destination[]>> {
  if (ids.length === 0) {
    return serviceSuccess([]);
  }

  try {
    const { destinations } = getServiceProviders();
    const results = await Promise.all(
      ids.map((id) => destinations.getDestinationById(id)),
    );
    const data = results.filter(
      (destination): destination is Destination => destination !== null,
    );
    return serviceSuccess(data);
  } catch (error) {
    return serviceFailure(toApiError(error, "Could not load destinations."));
  }
}
