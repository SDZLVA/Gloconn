/**
 * Helper functions for the mock destination provider.
 */

import { MOCK_DESTINATIONS } from "@/lib/providers/destinations/mock/data";
import type { Destination } from "@/types/destination";

/** Formatted label shown in the autocomplete dropdown. */
export function formatDestinationLabel(destination: Destination): string {
  return `${destination.name}, ${destination.country}`;
}

/** Converts a destination to an autocomplete option shape. */
export function destinationToAutocompleteOption(destination: Destination) {
  return {
    id: destination.id,
    label: formatDestinationLabel(destination),
    description: destination.region,
  };
}

function scoreDestination(destination: Destination, query: string): number {
  const name = destination.name.toLowerCase();
  const country = destination.country.toLowerCase();
  const region = destination.region.toLowerCase();

  if (name === query) return 100;
  if (name.startsWith(query)) return 80;
  if (country.startsWith(query)) return 60;
  if (name.includes(query)) return 40;
  if (country.includes(query)) return 30;
  if (region.includes(query)) return 20;
  return 0;
}

/**
 * Filters destinations by query (name, country, or region).
 * Case-insensitive; returns all destinations when query is empty.
 */
export function filterDestinations(query: string): Destination[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return MOCK_DESTINATIONS;
  }

  return MOCK_DESTINATIONS.map((destination) => ({
    destination,
    score: scoreDestination(destination, normalized),
  }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.destination.name.localeCompare(b.destination.name),
    )
    .map(({ destination }) => destination);
}

/** Popular destinations for the empty-state dropdown. */
export function getPopularDestinationsList(): Destination[] {
  return MOCK_DESTINATIONS.filter((destination) => destination.popular);
}

/** Resolves a destination label to an internal id. */
export function resolveDestinationIdFromLabel(destination: string): string {
  const trimmed = destination.trim();
  if (!trimmed) {
    return "paris";
  }

  const exact = MOCK_DESTINATIONS.find(
    (item) => formatDestinationLabel(item).toLowerCase() === trimmed.toLowerCase(),
  );
  if (exact) {
    return exact.id;
  }

  const matches = filterDestinations(trimmed);
  return matches[0]?.id ?? "paris";
}

/** Finds a destination by its internal id. */
export function findDestinationById(id: string): Destination | null {
  return MOCK_DESTINATIONS.find((destination) => destination.id === id) ?? null;
}

/** Finds a destination by its display label. */
export function findDestinationByLabel(label: string): Destination | null {
  const normalized = label.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return (
    MOCK_DESTINATIONS.find(
      (destination) =>
        formatDestinationLabel(destination).toLowerCase() === normalized ||
        destination.name.toLowerCase() === normalized,
    ) ?? null
  );
}
