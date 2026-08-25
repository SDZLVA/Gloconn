/**
 * Real-data replay mode (Sprint 17.6) — public server API.
 */

export {
  REPLAY_NOT_FOUND_MESSAGE,
  REPLAY_SEARCH_WARNING_CODE,
  getReplaySearchResponse,
} from "@/lib/replay/searchReplay";
export {
  getReplayHotelPropertyDetails,
  requireReplayHotelPropertyDetails,
} from "@/lib/replay/detailsReplay";
export {
  REPLAY_PROPERTY_TOKEN_PREFIX,
  REPLAY_SEAL_SECRET,
  buildReplayPropertyToken,
  getReplaySealSecret,
  isReplayPropertyToken,
  sealReplaySearchResponse,
} from "@/lib/replay/seal";
export {
  findMatchingCatalogEntry,
  matchesReplayFixture,
} from "@/lib/replay/matcher";
export {
  buildReplayHotelDirIndex,
  getReplayFixturesRoot,
  loadReplayCatalog,
  loadReplayDetailsMap,
  loadReplaySearchFixture,
  resetReplayFixtureIndexForTests,
} from "@/lib/replay/load";
export type {
  ReplayCatalog,
  ReplayCatalogEntry,
  ReplayDetailsMap,
  ReplayFixtureMatch,
  ReplayFixtureMeta,
  ReplaySearchFixture,
} from "@/lib/replay/types";
export { stripHotelSealedRefs } from "@/lib/replay/types";
