/**
 * Replay fixture matcher (Sprint 17.6).
 */

import type { SearchRequest } from "@/types/models/search-request";
import type {
  ReplayCatalogEntry,
  ReplayFixtureMatch,
} from "@/lib/replay/types";

function norm(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function matchesReplayFixture(
  request: SearchRequest,
  match: ReplayFixtureMatch,
): boolean {
  const originId = norm(request.originId);
  const destinationId = norm(request.destinationId);

  if (!originId || !destinationId) {
    return false;
  }

  if (originId !== norm(match.originId)) {
    return false;
  }
  if (destinationId !== norm(match.destinationId)) {
    return false;
  }

  if (match.departureDate) {
    if (norm(request.departureDate) !== norm(match.departureDate)) {
      return false;
    }
  }

  if (match.returnDate) {
    if (norm(request.returnDate) !== norm(match.returnDate)) {
      return false;
    }
  }

  return true;
}

export function findMatchingCatalogEntry(
  request: SearchRequest,
  scenarios: readonly ReplayCatalogEntry[],
): ReplayCatalogEntry | null {
  for (const scenario of scenarios) {
    if (matchesReplayFixture(request, scenario.match)) {
      return scenario;
    }
  }
  return null;
}
