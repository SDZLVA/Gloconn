/**
 * Replay search orchestration (Sprint 17.6).
 *
 * Serves captured SearchResponse fixtures. Never calls SerpAPI.
 */

import "server-only";

import { createNotFoundError } from "@/lib/api/errors";
import { HOTEL_REPLAY_SNAPSHOT_NOTICE } from "@/types/models/hotel-property-details";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResponse } from "@/types/models/search-response";
import {
  loadReplayCatalog,
  loadReplayDetailsMap,
  loadReplaySearchFixture,
} from "@/lib/replay/load";
import { findMatchingCatalogEntry } from "@/lib/replay/matcher";
import { sealReplaySearchResponse } from "@/lib/replay/seal";

export const REPLAY_SEARCH_WARNING_CODE = "REPLAY_SNAPSHOT";
export const REPLAY_NOT_FOUND_MESSAGE =
  "This test scenario is not available in replay mode.";

/**
 * Returns a sealed SearchResponse from fixtures.
 * Throws NOT_FOUND when no fixture matches (never falls back to live providers).
 */
export function getReplaySearchResponse(
  request: SearchRequest,
): SearchResponse {
  const catalog = loadReplayCatalog();
  const entry = findMatchingCatalogEntry(request, catalog.scenarios);

  if (!entry) {
    throw createNotFoundError(REPLAY_NOT_FOUND_MESSAGE);
  }

  const fixture = loadReplaySearchFixture(entry.dir);
  const detailsMap = loadReplayDetailsMap(entry.dir);
  const hotelIdsWithDetails = new Set(Object.keys(detailsMap));

  const sealed = sealReplaySearchResponse(
    fixture.response,
    entry.match,
    hotelIdsWithDetails,
  );

  const warnings = [
    ...(sealed.warnings ?? []),
    {
      code: REPLAY_SEARCH_WARNING_CODE,
      domain: "hotels" as const,
      message: HOTEL_REPLAY_SNAPSHOT_NOTICE,
    },
  ];

  return {
    ...sealed,
    warnings,
  };
}
