"use client";

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

  const recentDestinations = useMemo(
    () => getDestinationsByIds(recentIds),
    [recentIds],
  );

  const addRecent = useCallback(
    (destination: Destination) => {
      setRecentIds(addRecentDestinationId(destination.id, scope));
    },
    [scope],
  );

  const reload = useCallback(() => {
    setRecentIds(readRecentDestinationIds(scope));
  }, [scope]);

  return { recentDestinations, addRecent, reloadRecent: reload };
}
