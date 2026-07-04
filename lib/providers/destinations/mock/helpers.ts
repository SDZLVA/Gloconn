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

/** Max suggestions shown while the user types (keeps the dropdown scannable). */
export const DESTINATION_SEARCH_LIMIT = 10;

/**
 * Normalizes user input for search — trim, lowercase, strip accents.
 * "  PARIS  " and "parís" both become "paris".
 */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function destinationSearchFields(destination: Destination): string[] {
  return [
    destination.id,
    destination.name,
    destination.country,
    destination.region,
    formatDestinationLabel(destination),
  ].map(normalizeSearchText);
}

function scoreDestination(destination: Destination, query: string): number {
  const [id, name, country, region, label] = destinationSearchFields(destination);

  if (name === query || label === query) return 100;
  if (name.startsWith(query) || label.startsWith(query)) return 80;
  if (id.startsWith(query.replace(/\s+/g, "-"))) return 75;
  if (country.startsWith(query)) return 60;
  if (name.includes(query) || label.includes(query)) return 40;
  if (country.includes(query)) return 30;
  if (region.includes(query)) return 20;
  if (id.includes(query.replace(/\s+/g, "-"))) return 15;
  return 0;
}

/**
 * Filters mock destinations as the user types.
 * Case- and accent-insensitive; matches name, country, region, and full label.
 * Returns all destinations when the query is empty.
 */
export function filterDestinations(
  query: string,
  limit = DESTINATION_SEARCH_LIMIT,
): Destination[] {
  const normalized = normalizeSearchText(query);
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
    .slice(0, limit)
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
    (item) =>
      normalizeSearchText(formatDestinationLabel(item)) ===
      normalizeSearchText(trimmed),
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

/** Resolves multiple destination ids to full objects (preserves order). */
export function getDestinationsByIds(ids: string[]): Destination[] {
  return ids
    .map((id) => findDestinationById(id))
    .filter((destination): destination is Destination => destination !== null);
}

/** Finds a destination by its display label. */
export function findDestinationByLabel(label: string): Destination | null {
  const normalized = normalizeSearchText(label);
  if (!normalized) {
    return null;
  }

  return (
    MOCK_DESTINATIONS.find((destination) => {
      const formatted = normalizeSearchText(formatDestinationLabel(destination));
      const name = normalizeSearchText(destination.name);
      return formatted === normalized || name === normalized;
    }) ?? null
  );
}
