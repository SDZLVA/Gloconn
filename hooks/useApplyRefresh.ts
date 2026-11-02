"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Milestone 35: after Confirm (or a new sort) the results show a short
 * "Updating results" state and the page scrolls to the top of the list, so
 * the traveller sees the page refresh with the new filters.
 */
export function useApplyRefresh(durationMs = 700): { refreshing: boolean; refresh: (scrollTo?: HTMLElement | null) => void } {
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);
  const refresh = useCallback(
    (scrollTo?: HTMLElement | null) => {
      setRefreshing(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setRefreshing(false), durationMs);
      if (scrollTo) scrollTo.scrollIntoView({ block: "start", behavior: "smooth" });
    },
    [durationMs],
  );
  return { refreshing, refresh };
}
