"use client";

import { useLayoutEffect, useState } from "react";

export type AnchoredPopoverPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

const VIEWPORT_PADDING = 16;
const GAP = 4;
const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 680;

/**
 * Computes fixed viewport coordinates for a popover anchored to a trigger element.
 * Flips above the trigger when there is not enough room below.
 */
export function useAnchoredPopover(
  open: boolean,
  triggerRef: React.RefObject<HTMLElement | null>,
  panelHeightEstimate = 480,
): AnchoredPopoverPosition | null {
  const [position, setPosition] = useState<AnchoredPopoverPosition | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const width = Math.min(
        MAX_PANEL_WIDTH,
        Math.max(MIN_PANEL_WIDTH, rect.width, viewportWidth - VIEWPORT_PADDING * 2),
      );

      let left = rect.left;
      if (left + width > viewportWidth - VIEWPORT_PADDING) {
        left = viewportWidth - VIEWPORT_PADDING - width;
      }
      left = Math.max(VIEWPORT_PADDING, left);

      const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_PADDING;
      const spaceAbove = rect.top - VIEWPORT_PADDING;
      const openBelow =
        spaceBelow >= Math.min(panelHeightEstimate, 280) || spaceBelow >= spaceAbove;

      const maxHeight = Math.max(
        240,
        openBelow
          ? viewportHeight - rect.bottom - GAP - VIEWPORT_PADDING
          : rect.top - GAP - VIEWPORT_PADDING,
      );

      const top = openBelow
        ? rect.bottom + GAP
        : Math.max(VIEWPORT_PADDING, rect.top - GAP - maxHeight);

      setPosition({ top, left, width, maxHeight });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, triggerRef, panelHeightEstimate]);

  return position;
}
