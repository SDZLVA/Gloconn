"use client";

import { useCallback, useMemo, useState } from "react";
import { getDestinationsByIds } from "@/lib/destinations";
import {
  addRecentDestinationId,
  readRecentDestinationIds,
} from "@/lib/destinations/recentSearches";
import type { Destination } from "@/types/destination";

/**
 * useRecentDestinationSearches — client-side recent destination list (localStorage).
 * Resolves stored IDs from mock destination data (no API calls).
 */
export function useRecentDestinationSearches() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const recentDestinations = useMemo(
    () => getDestinationsByIds(recentIds),
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
