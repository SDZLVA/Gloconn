"use client";

import { useCallback, useEffect, useState } from "react";
import type { Destination } from "@/types/destination";
import { getDestinationsByIds } from "@/lib/services/destinationService";
import {
  addRecentDestinationId,
  readRecentDestinationIds,
} from "@/lib/destinations/recentSearches";

/**
 * useRecentDestinationSearches — client-side recent destination list (localStorage).
 * Resolves stored IDs through the destination service.
 */
export function useRecentDestinationSearches() {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [recentDestinations, setRecentDestinations] = useState<Destination[]>([]);

  const loadDestinations = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setRecentDestinations([]);
      return;
    }

    const result = await getDestinationsByIds(ids);
    if (result.success) {
      const byId = new Map(result.data.map((destination) => [destination.id, destination]));
      setRecentDestinations(
        ids
          .map((id) => byId.get(id))
          .filter((destination): destination is Destination => destination !== undefined),
      );
      return;
    }

    setRecentDestinations([]);
  }, []);

  useEffect(() => {
    void loadDestinations(recentIds);
  }, [recentIds, loadDestinations]);

  const addRecent = useCallback((destination: Destination) => {
    setRecentIds(addRecentDestinationId(destination.id));
  }, []);

  const reload = useCallback(() => {
    const ids = readRecentDestinationIds();
    setRecentIds(ids);
  }, []);

  return { recentDestinations, addRecent, reloadRecent: reload };
}
