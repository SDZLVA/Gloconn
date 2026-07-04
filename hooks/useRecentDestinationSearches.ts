"use client";

import { useCallback, useMemo, useState } from "react";
import type { Destination } from "@/lib/destinations";
import {
  addRecentDestinationId,
  getRecentDestinations,
  readRecentDestinationIds,
} from "@/lib/destinations/recentSearches";

/**
 * useRecentDestinationSearches — client-side recent destination list (localStorage).
 * No API — persists the last few picked destinations in the browser.
 */
export function useRecentDestinationSearches() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const recentDestinations = useMemo(
    () => getRecentDestinations(recentIds),
    [recentIds],
  );

  const addRecent = useCallback((destination: Destination) => {
    setRecentIds(addRecentDestinationId(destination.id));
  }, []);

  const reload = useCallback(() => {
    setRecentIds(readRecentDestinationIds());
  }, []);

  return { recentDestinations, addRecent, reloadRecent: reload };
}
