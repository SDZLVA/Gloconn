"use client";

import { useMemo } from "react";
import {
  getPopularDestinations,
  POPULAR_DESTINATIONS_HEADING,
} from "@/lib/destinations/popularDestinations";
import { formatDestinationLabel } from "@/lib/destinations";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types/destination";

type PopularDestinationsProps = {
  /** Destination ids to hide (e.g. already shown under Recent searches). */
  excludeIds?: ReadonlySet<string>;
  /** Called when the user picks a destination. */
  onSelect?: (destination: Destination) => void;
  /** Section heading override. */
  heading?: string;
  className?: string;
};

/**
 * PopularDestinations — reusable list of curated mock destinations.
 *
 * Use in autocomplete empty states, browse panels, or marketing sections.
 * Data comes from static mock catalog only (no backend).
 */
export function PopularDestinations({
  excludeIds,
  onSelect,
  heading = POPULAR_DESTINATIONS_HEADING,
  className,
}: PopularDestinationsProps) {
  const destinations = useMemo(
    () => getPopularDestinations(excludeIds),
    [excludeIds],
  );

  if (destinations.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {heading}
      </p>
      <ul role="list" className="flex flex-col">
        {destinations.map((destination) => (
          <li key={destination.id}>
            <button
              type="button"
              onClick={() => onSelect?.(destination)}
              className={cn(
                "w-full cursor-pointer px-4 py-3 text-left text-sm motion-safe:transition-colors motion-safe:duration-150 sm:py-2.5",
                "text-slate-700 hover:bg-slate-50 focus-visible:bg-brand-50 focus-visible:text-brand-800 focus-visible:outline-none",
              )}
            >
              <span className="font-medium">
                {formatDestinationLabel(destination)}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {destination.region}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}