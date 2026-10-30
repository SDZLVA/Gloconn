"use client";

import { useCallback, useEffect, useState } from "react";
import { activeLiveFlightsEngine } from "@/features/liveFlights/config";
import type {
  LiveFlightsFacets,
  LiveFlightsFilters,
  LiveFlightsSearch,
} from "@/features/liveFlights/types";

type LiveFlightsSectionProps = {
  /** Null when the search has no usable route or dates — nothing is shown. */
  search: LiveFlightsSearch | null;
  /** Glooconn's sidebar filters, applied to the live list (Milestone 24). */
  filters: LiveFlightsFilters;
  /** The live list's airlines, for the sidebar. */
  onFacets?: (facets: LiveFlightsFacets) => void;
  /** Milestone 28: heading text (the flights-only page says "Live flight prices"). */
  title?: string;
};

/**
 * "All live flights" (Milestone 23): a partner's live search under
 * Glooconn's own results. The only entry point of features/liveFlights.
 *
 * Milestone 25 (Shehan, 2026-10-30): no explanation paragraph; a slim
 * "checking more" line replaces the widget's large progress block. The
 * commission disclosure stays, in one short line of small print (see
 * /terms, section 6).
 */
export function LiveFlightsSection({ search, filters, onFacets, title = "All live flights" }: LiveFlightsSectionProps) {
  const engine = activeLiveFlightsEngine();
  // Searching from the start: the live search begins when the page opens.
  const [searching, setSearching] = useState(true);
  // Safety net: never claim to be searching forever (full search ≈ 25 s).
  useEffect(() => {
    const timer = window.setTimeout(() => setSearching(false), 45_000);
    return () => window.clearTimeout(timer);
  }, [search]);
  const handleFacets = useCallback(
    (facets: LiveFlightsFacets) => {
      setSearching(Boolean(facets.searching));
      onFacets?.(facets);
    },
    [onFacets],
  );
  if (!engine || !search) return null;
  const { Panel } = engine;

  return (
    // Hidden (not unmounted) when Flights is unticked, so the search is kept.
    <section className="space-y-2" aria-labelledby="live-flights-heading" hidden={!filters.showFlights}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="live-flights-heading" className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>
        <p className="text-xs text-slate-500">Prices from {engine.partnerName} partners · Glooconn may earn a commission</p>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={searching ? "flex items-center gap-2 text-sm text-slate-600" : "sr-only"}
      >
        {searching ? (
          <>
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-600 opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-700" />
            </span>
            Searching airlines and agencies — new prices appear automatically.
          </>
        ) : (
          "Live search complete."
        )}
      </p>
      <Panel search={search} filters={filters} onFacets={handleFacets} />
    </section>
  );
}
