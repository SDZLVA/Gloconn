"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stayed unchanged for `delayMs`.
 * Keeps typing / slider UIs snappy while deferring expensive work.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}
