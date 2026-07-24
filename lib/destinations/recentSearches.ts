import { findDestinationByLabel } from "@/lib/destinations";

/** Maximum recent places stored per field (destination / origin). */
export const MAX_RECENT_DESTINATIONS = 5;

export type RecentSearchScope = "destination" | "origin";

const STORAGE_KEYS: Record<RecentSearchScope, string> = {
  destination: "glooconn-recent-destinations",
  origin: "glooconn-recent-origins",
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function storageKey(scope: RecentSearchScope): string {
  return STORAGE_KEYS[scope];
}

/** Reads stored destination IDs (most recent first). Safe to call on the server. */
export function readRecentDestinationIds(
  scope: RecentSearchScope = "destination",
): string[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey(scope));
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((id): id is string => typeof id === "string")
      .slice(0, MAX_RECENT_DESTINATIONS);
  } catch {
    return [];
  }
}

/** Saves a destination to recent searches (deduped, capped). Returns the updated ID list. */
export function addRecentDestinationId(
  destinationId: string,
  scope: RecentSearchScope = "destination",
): string[] {
  if (!isBrowser()) {
    return [];
  }

  const existing = readRecentDestinationIds(scope).filter((id) => id !== destinationId);
  const next = [destinationId, ...existing].slice(0, MAX_RECENT_DESTINATIONS);

  try {
    window.localStorage.setItem(storageKey(scope), JSON.stringify(next));
  } catch {
    return readRecentDestinationIds(scope);
  }

  return next;
}

/** Saves a matching place to recent searches after form submit. */
export function rememberRecentPlace(
  scope: RecentSearchScope,
  options: { id?: string; label?: string },
): void {
  if (options.id?.trim()) {
    addRecentDestinationId(options.id.trim(), scope);
    return;
  }

  if (options.label?.trim()) {
    const destination = findDestinationByLabel(options.label);
    if (destination) {
      addRecentDestinationId(destination.id, scope);
    }
  }
}

/** Saves a matching destination to recent searches (e.g. after form submit). */
export function rememberDestinationByLabel(label: string): void {
  rememberRecentPlace("destination", { label });
}

/** Saves a known destination id to recent searches (preferred on form submit). */
export function rememberDestinationById(destinationId: string): void {
  rememberRecentPlace("destination", { id: destinationId });
}

/** Saves a matching origin to recent searches after form submit. */
export function rememberOriginByLabel(label: string): void {
  rememberRecentPlace("origin", { label });
}

/** Saves a known origin id to recent searches. */
export function rememberOriginById(originId: string): void {
  rememberRecentPlace("origin", { id: originId });
}
