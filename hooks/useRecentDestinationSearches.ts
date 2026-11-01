"use client";

import { getWorldPlace } from "@/lib/destinations/worldCache";
import { useCallback, useMemo, useState } from "react";
import { getDestinationsByIds } from "@/lib/destinations";
import {
  addRecentDestinationId,
  readRecentDestinationIds,
  type RecentSearchScope,
} from "@/lib/destinations/recentSearches";
import type { Destination } from "@/types/destination";

function readInitialRecentIds(scope: RecentSearchScope): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  return readRecentDestinationIds(scope);
}

/**
 * useRecentDestinationSearches — client-side recent place list (localStorage).
 * Resolves stored IDs from mock destination data (no API / backend).
 */
export function useRecentDestinationSearches(
  scope: RecentSearchScope = "destination",
) {
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    readInitialRecentIds(scope),
  );

  // Milestone 34: also worldwide places picked earlier (kept in this browser).
  const recentDestinations = useMemo(() => {
    const catalog = new Map(getDestinationsByIds(recentIds).map((d) => [d.id, d]));
    return recentIds
      .map((id) => catalog.get(id) ?? getWorldPlace(id))
      .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined);
  }, [recentIds]);

  const addRecent = useCallback(
    (destination: Destination) => {
      setRecentIds(addRecentDestinationId(destination.id, scope));
    },
    [scope],
  );

  const reload = useCallback(() => {
    const nextIds = readRecentDestinationIds(scope);
    // Avoid a re-render when localStorage content is unchanged.
    setRecentIds((previous) =>
      previous.length === nextIds.length &&
      previous.every((id, index) => id === nextIds[index])
        ? previous
        : nextIds,
    );
  }, [scope]);

  return { recentDestinations, addRecent, reloadRecent: reload };
}
