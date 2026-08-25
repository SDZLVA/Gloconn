/**
 * Load replay fixtures from lib/test-fixtures/replay (Sprint 17.6).
 */

import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ReplayCatalog,
  ReplayDetailsMap,
  ReplaySearchFixture,
} from "@/lib/replay/types";

const FIXTURES_ROOT = join(
  process.cwd(),
  "lib",
  "test-fixtures",
  "replay",
);

function readJsonFile<T>(absolutePath: string): T {
  const raw = readFileSync(absolutePath, "utf8");
  return JSON.parse(raw) as T;
}

export function getReplayFixturesRoot(): string {
  return FIXTURES_ROOT;
}

export function loadReplayCatalog(): ReplayCatalog {
  return readJsonFile<ReplayCatalog>(join(FIXTURES_ROOT, "catalog.json"));
}

export function loadReplaySearchFixture(
  dir: string,
): ReplaySearchFixture {
  return readJsonFile<ReplaySearchFixture>(
    join(FIXTURES_ROOT, dir, "search.json"),
  );
}

export function loadReplayDetailsMap(dir: string): ReplayDetailsMap {
  try {
    return readJsonFile<ReplayDetailsMap>(
      join(FIXTURES_ROOT, dir, "details.json"),
    );
  } catch {
    return {};
  }
}

export function loadReplayDetailsForHotel(
  dir: string,
  hotelId: string,
): ReplayDetailsMap[string] | null {
  const map = loadReplayDetailsMap(dir);
  return map[hotelId] ?? null;
}

/** In-memory index: hotelId → fixture dir (for details lookup). */
let hotelIdToDir: Map<string, string> | null = null;

export function resetReplayFixtureIndexForTests(): void {
  hotelIdToDir = null;
}

export function buildReplayHotelDirIndex(): Map<string, string> {
  if (hotelIdToDir) {
    return hotelIdToDir;
  }

  const catalog = loadReplayCatalog();
  const index = new Map<string, string>();

  for (const scenario of catalog.scenarios) {
    const details = loadReplayDetailsMap(scenario.dir);
    for (const hotelId of Object.keys(details)) {
      index.set(hotelId, scenario.dir);
    }
  }

  hotelIdToDir = index;
  return index;
}

export function findReplayDetailsDirForHotel(
  hotelId: string,
): string | null {
  return buildReplayHotelDirIndex().get(hotelId) ?? null;
}
