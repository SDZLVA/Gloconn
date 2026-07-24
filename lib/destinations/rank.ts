/**
 * Client-side destination ranking — pure, deterministic, no AI/ML.
 *
 * Score ladder (highest wins; first matching rule applies as base):
 * - 120  exact IATA code
 * - 100  exact city name or "Name, Country" label
 * -  95  exact destination id
 * -  80  name / label starts with query
 * -  75  id starts with query (spaces → "-")
 * -  70  IATA starts with query
 * -  65  whole-word / word-prefix in name or label
 * -  60  country starts with query
 * -  45  country whole-word / word-prefix
 * -  40  name / label contains query
 * -  30  country contains query
 * -  20  region contains / starts with query
 * -  15  id contains query
 * -   0  no match (dropped)
 *
 * Soft boosts (never invent matches — only reorder):
 * - +8  previously selected (recent) destination
 * - +5  popular === true
 *
 * Tie-break: higher score → name localeCompare → id localeCompare.
 *
 * Does not modify provider helpers — catalogs are read via MOCK_DESTINATIONS.
 */

import {
  isAirportMatchKind,
  type DestinationMatchKind,
} from "@/lib/destinations/match";
import {
  hasWholeWordMatch,
  normalizeDestinationQuery,
  tokenizeDestinationText,
} from "@/lib/destinations/normalize";
import { MOCK_DESTINATIONS } from "@/lib/destinations";
import type { Destination } from "@/types/destination";

/** Soft boosts — documented constants (not magic). */
export const DESTINATION_RANK_BOOSTS = {
  recent: 8,
  popular: 5,
} as const;

/** Max suggestions while typing (keeps the dropdown scannable). */
export const DESTINATION_CLIENT_SEARCH_LIMIT = 10;

export type RankedDestination = {
  destination: Destination;
  /** Base match score before soft boosts. */
  baseScore: number;
  /** Final score including recent / popular boosts. */
  score: number;
  /** Primary reason this destination matched. */
  matchKind: DestinationMatchKind;
};

export type RankDestinationsOptions = {
  limit?: number;
  /** Canonical ids of recently selected destinations (soft boost). */
  recentIds?: Iterable<string>;
  /** Catalog override for tests — defaults to MOCK_DESTINATIONS. */
  catalog?: Destination[];
};

function formatLabel(destination: Destination): string {
  return `${destination.name}, ${destination.country}`;
}

function scoreDestination(
  destination: Destination,
  query: string,
): { baseScore: number; matchKind: DestinationMatchKind } {
  const name = normalizeDestinationQuery(destination.name);
  const country = normalizeDestinationQuery(destination.country);
  const region = normalizeDestinationQuery(destination.region);
  const label = normalizeDestinationQuery(formatLabel(destination));
  const id = normalizeDestinationQuery(destination.id);
  const idQuery = query.replace(/\s+/g, "-");
  const iata = destination.iataCode
    ? normalizeDestinationQuery(destination.iataCode)
    : "";

  if (iata && iata === query) {
    return { baseScore: 120, matchKind: "iata-exact" };
  }
  if (name === query || label === query) {
    return { baseScore: 100, matchKind: "name-exact" };
  }
  if (id === idQuery) {
    return { baseScore: 95, matchKind: "id" };
  }
  if (name.startsWith(query) || label.startsWith(query)) {
    return { baseScore: 80, matchKind: "name-prefix" };
  }
  if (id.startsWith(idQuery)) {
    return { baseScore: 75, matchKind: "id" };
  }
  if (iata && iata.startsWith(query)) {
    return { baseScore: 70, matchKind: "iata-prefix" };
  }
  if (hasWholeWordMatch(name, query) || hasWholeWordMatch(label, query)) {
    return { baseScore: 65, matchKind: "word" };
  }
  if (country.startsWith(query)) {
    return { baseScore: 60, matchKind: "country" };
  }
  if (hasWholeWordMatch(country, query)) {
    return { baseScore: 45, matchKind: "country" };
  }
  if (name.includes(query) || label.includes(query)) {
    return { baseScore: 40, matchKind: "contains" };
  }
  if (country.includes(query)) {
    return { baseScore: 30, matchKind: "country" };
  }
  if (region.startsWith(query) || region.includes(query)) {
    return { baseScore: 20, matchKind: "region" };
  }
  if (id.includes(idQuery)) {
    return { baseScore: 15, matchKind: "id" };
  }

  return { baseScore: 0, matchKind: "none" };
}

/**
 * Deduplicates by canonical `destination.id`, keeping the higher score.
 * Catalog entries are already unique; this guards merged / aliased inputs.
 */
export function dedupeRankedDestinations(
  ranked: RankedDestination[],
): RankedDestination[] {
  const byId = new Map<string, RankedDestination>();

  for (const entry of ranked) {
    const existing = byId.get(entry.destination.id);
    if (!existing || entry.score > existing.score) {
      byId.set(entry.destination.id, entry);
    }
  }

  return Array.from(byId.values());
}

function compareRanked(a: RankedDestination, b: RankedDestination): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  const byName = a.destination.name.localeCompare(b.destination.name);
  if (byName !== 0) {
    return byName;
  }
  return a.destination.id.localeCompare(b.destination.id);
}

/**
 * Ranks destinations for autocomplete. Empty query → [].
 * (Idle UI uses recent + popular sections instead of dumping the catalog.)
 */
export function rankDestinations(
  query: string,
  options: RankDestinationsOptions = {},
): RankedDestination[] {
  const normalized = normalizeDestinationQuery(query);
  if (!normalized) {
    return [];
  }

  const catalog = options.catalog ?? MOCK_DESTINATIONS;
  const limit = options.limit ?? DESTINATION_CLIENT_SEARCH_LIMIT;
  const recentIds = new Set(options.recentIds ?? []);

  const ranked: RankedDestination[] = [];

  for (const destination of catalog) {
    const { baseScore, matchKind } = scoreDestination(destination, normalized);
    if (baseScore <= 0) {
      continue;
    }

    let score = baseScore;
    if (recentIds.has(destination.id)) {
      score += DESTINATION_RANK_BOOSTS.recent;
    }
    if (destination.popular) {
      score += DESTINATION_RANK_BOOSTS.popular;
    }

    ranked.push({ destination, baseScore, score, matchKind });
  }

  return dedupeRankedDestinations(ranked)
    .sort(compareRanked)
    .slice(0, limit);
}

/** Convenience: destinations only (same order as `rankDestinations`). */
export function filterDestinationsRanked(
  query: string,
  options: RankDestinationsOptions = {},
): Destination[] {
  return rankDestinations(query, options).map((entry) => entry.destination);
}

/**
 * True when the query looks like an airport code (1–3 letters)
 * or any ranked hit is an IATA match — used for Cities / Airports grouping.
 */
export function shouldGroupAirportMatches(
  query: string,
  ranked: RankedDestination[],
): boolean {
  const normalized = normalizeDestinationQuery(query);
  const looksLikeIata = /^[a-z]{1,3}$/.test(normalized);
  if (looksLikeIata) {
    return ranked.some((entry) => isAirportMatchKind(entry.matchKind));
  }
  return ranked.some((entry) => entry.matchKind === "iata-exact");
}

/** Splits ranked results into airport vs city groups (order preserved). */
export function splitRankedByMatchGroup(ranked: RankedDestination[]): {
  airports: RankedDestination[];
  cities: RankedDestination[];
} {
  const airports: RankedDestination[] = [];
  const cities: RankedDestination[] = [];

  for (const entry of ranked) {
    if (isAirportMatchKind(entry.matchKind)) {
      airports.push(entry);
    } else {
      cities.push(entry);
    }
  }

  return { airports, cities };
}

/** Exported for tests — token helper re-export. */
export { tokenizeDestinationText, normalizeDestinationQuery };
