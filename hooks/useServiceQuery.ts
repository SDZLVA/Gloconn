"use client";

import { useEffect, useState } from "react";
import { toApiError } from "@/lib/api/errors";
import {
  createInitialServiceState,
  serviceFailure,
  toServiceState,
  type ServiceResult,
  type ServiceState,
} from "@/lib/api/types";

type UseServiceQueryOptions = {
  /** When false, the query does not run and state resets to idle. */
  enabled?: boolean;
  /**
   * When true (default), keep the last successful `data` while a new fetch runs.
   * Improves perceived performance — callers can show prior results instead of
   * blanking the UI on every dependency change.
   */
  keepPreviousData?: boolean;
};

/**
 * Generic hook that calls an async service and tracks loading / success / error.
 * Reused by destination autocomplete and search results.
 */
export function useServiceQuery<T>(
  fetcher: () => Promise<ServiceResult<T>>,
  deps: React.DependencyList,
  options?: UseServiceQueryOptions,
): ServiceState<T> {
  const enabled = options?.enabled ?? true;
  const keepPreviousData = options?.keepPreviousData ?? true;
  const [state, setState] = useState<ServiceState<T>>(createInitialServiceState);

  useEffect(() => {
    if (!enabled) {
      setState(createInitialServiceState());
      return;
    }

    let cancelled = false;

    // Keep prior data during refetch so remounts / cache hits feel instant.
    setState((previous) => ({
      status: "loading",
      data: keepPreviousData ? previous.data : null,
      error: null,
    }));

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setState(toServiceState(result));
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState(
            toServiceState(
              serviceFailure(
                toApiError(error, "Something went wrong. Please try again."),
              ),
            ),
          );
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, [enabled, keepPreviousData, ...deps]);

  return state;
}
