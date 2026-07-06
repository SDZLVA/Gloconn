"use client";

import { useEffect } from "react";

type UseBodyScrollLockOptions = {
  /** Only lock scroll below the `sm` breakpoint (640px). */
  mobileOnly?: boolean;
};

/**
 * Prevents background scrolling while overlays (e.g. mobile sheets) are open.
 */
export function useBodyScrollLock(
  locked: boolean,
  options: UseBodyScrollLockOptions = {},
) {
  const { mobileOnly = false } = options;

  useEffect(() => {
    if (!locked) {
      return;
    }

    if (mobileOnly && !window.matchMedia("(max-width: 639px)").matches) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked, mobileOnly]);
}
