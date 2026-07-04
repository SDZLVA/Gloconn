import { MOCK_DESTINATIONS } from "@/lib/providers/destinations/mock/data";
import { findDestinationByLabel as findDestinationByLabelHelper } from "@/lib/providers/destinations/mock/helpers";
import type { Destination } from "@/types/destination";

const STORAGE_KEY = "glooconn-recent-destinations";
const MAX_RECENT = 5;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Reads stored destination IDs (most recent first). Safe to call on the server. */
export function readRecentDestinationIds(): string[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

/** Resolves recent IDs to full destination objects, skipping unknown IDs. */
export function getRecentDestinations(ids = readRecentDestinationIds()): Destination[] {
  return ids
    .map((id) => MOCK_DESTINATIONS.find((destination) => destination.id === id))
    .filter((destination): destination is Destination => destination !== undefined);
}

/** Saves a destination to recent searches (deduped, capped). Returns the updated ID list. */
export function addRecentDestinationId(destinationId: string): string[] {
  if (!isBrowser()) {
    return [];
  }

  const existing = readRecentDestinationIds().filter((id) => id !== destinationId);
  const next = [destinationId, ...existing].slice(0, MAX_RECENT);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return readRecentDestinationIds();
  }

  return next;
}

/** Finds a mock destination by its autocomplete label (e.g. "Paris, France"). */
export function findDestinationByLabel(label: string): Destination | undefined {
  return findDestinationByLabelHelper(label) ?? undefined;
}

/** Saves a matching destination to recent searches (e.g. after form submit). */
export function rememberDestinationByLabel(label: string): void {
  const destination = findDestinationByLabel(label);
  if (destination) {
    addRecentDestinationId(destination.id);
  }
}
