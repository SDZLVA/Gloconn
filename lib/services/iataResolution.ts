/**
 * IATA airport resolution — maps Glooconn places to airport codes.
 *
 * Used by the search orchestrator (server-side) before flight providers run.
 * Does not call external flight APIs. Depends only on DestinationProvider.
 */

import type { DestinationProvider } from "@/lib/providers/core/types";
import type { Destination } from "@/types/models/destination";
import type { SearchRequest } from "@/types/models/search-request";

/**
 * Provider-independent airport reference.
 * Starts with IATA + catalog links; can grow with more metadata later.
 */
export type AirportRef = {
  /** IATA airport code (e.g. "CDG"). */
  iataCode: string;

  /** Glooconn destination id when resolved from the catalog. */
  destinationId?: string;

  /** Display label used during resolution (e.g. "Paris, France"). */
  label?: string;
};

/** One place to resolve — label is required; id is preferred when known. */
export type PlaceRef = {
  label: string;
  id?: string;
};

/** Result of resolving a single place to an airport (or failing to). */
export type ResolveAirportResult = {
  /** Airport when an IATA code was found; otherwise null. */
  airport: AirportRef | null;

  /** Catalog destination used for the lookup, when found. */
  destination: Destination | null;
};

/** Result of enriching a SearchRequest with origin and destination airports. */
export type EnrichSearchAirportsResult = {
  /** Copy of the request with ids and IATA fields filled when available. */
  request: SearchRequest;

  /** Resolved origin airport, if any. */
  origin: AirportRef | null;

  /** Resolved destination airport, if any. */
  destination: AirportRef | null;
};

/** Reads a destination's primary IATA code, or null when missing. */
export function getIataCodeFromDestination(
  destination: Destination | null | undefined,
): string | null {
  const code = destination?.iataCode?.trim();
  return code ? code.toUpperCase() : null;
}

/**
 * Builds an AirportRef from a catalog destination.
 * Returns null when the destination has no IATA code.
 */
export function toAirportRef(
  destination: Destination,
  label?: string,
): AirportRef | null {
  const iataCode = getIataCodeFromDestination(destination);
  if (!iataCode) {
    return null;
  }

  return {
    iataCode,
    destinationId: destination.id,
    label: label?.trim() || undefined,
  };
}

/**
 * Resolves one place (origin or destination) to an airport via the destination catalog.
 *
 * Preference order:
 * 1. Look up by `id` when present
 * 2. Otherwise resolve `label` → id, then look up
 */
export async function resolveAirportForPlace(
  place: PlaceRef,
  destinations: DestinationProvider,
): Promise<ResolveAirportResult> {
  const label = place.label.trim();
  let destinationId = place.id?.trim() || undefined;
  let destination: Destination | null = null;

  if (destinationId) {
    destination = await destinations.getDestinationById(destinationId);
  }

  if (!destination && label) {
    destinationId = await destinations.resolveDestinationId(label);
    destination = await destinations.getDestinationById(destinationId);
  }

  if (!destination) {
    return { airport: null, destination: null };
  }

  return {
    airport: toAirportRef(destination, label || undefined),
    destination,
  };
}

/**
 * Enriches a SearchRequest with origin/destination ids and IATA codes.
 * Does not throw when codes are missing — callers decide how to validate.
 */
export async function enrichSearchRequestWithAirports(
  request: SearchRequest,
  destinations: DestinationProvider,
): Promise<EnrichSearchAirportsResult> {
  const [originResult, destinationResult] = await Promise.all([
    resolveAirportForPlace(
      { label: request.origin, id: request.originId },
      destinations,
    ),
    resolveAirportForPlace(
      { label: request.destination, id: request.destinationId },
      destinations,
    ),
  ]);

  const enriched: SearchRequest = {
    ...request,
    originId: originResult.destination?.id ?? request.originId,
    destinationId: destinationResult.destination?.id ?? request.destinationId,
    originIata: originResult.airport?.iataCode ?? request.originIata,
    destinationIata:
      destinationResult.airport?.iataCode ?? request.destinationIata,
  };

  return {
    request: enriched,
    origin: originResult.airport,
    destination: destinationResult.airport,
  };
}

/**
 * True when both origin and destination IATA codes are present on the request.
 * Used before calling flight providers that require airport codes.
 */
export function hasResolvedFlightAirports(request: SearchRequest): boolean {
  return Boolean(request.originIata?.trim() && request.destinationIata?.trim());
}
