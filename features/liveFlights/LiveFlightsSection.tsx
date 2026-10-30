"use client";

import { useCallback, useState } from "react";
import { activeLiveFlightsEngine } from "@/features/liveFlights/config";
import type {
  LiveFlightsFacets,
  LiveFlightsFilters,
  LiveFlightsSearch,
} from "@/features/liveFlights/types";

type LiveFlightsSectionProps = {
  /** Null when the search has no usable route or dates — nothing is shown. */
  search: LiveFlightsSearch | null;
  /** True when Glooconn's own flight list is empty for these dates. */
  ownResultsEmpty: boolean;
  /** Milestone 24: Glooconn's sidebar filters, applied to the live list. */
  filters: LiveFlightsFilters;
  /** The live list's airlines, for the sidebar. */
  onFacets?: (facets: LiveFlightsFacets) => void;
};

/**
 * "All live flights" (Milestone 23): a partner's live search under
 * Glooconn's own results. The only entry point of features/liveFlights.
 */
export function LiveFlightsSection({ search, ownResultsEmpty, filters, onFacets }: LiveFlightsSectionProps) {
  const engine = activeLiveFlightsEngine();
  const [bridged, setBridged] = useState(false);
  const handleFacets = useCallback(
    (facets: LiveFlightsFacets) => {
      setBridged(facets.bridged);
      onFacets?.(facets);
    },
    [onFacets],
  );
  if (!engine || !search) return null;
  const { Panel } = engine;

  return (
    // Hidden (not unmounted) when Flights is unticked, so the search is kept.
    <section className="space-y-3" aria-labelledby="live-flights-heading" hidden={!filters.showFlights}>
      <div className="space-y-1">
        <h2 id="live-flights-heading" className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          All live flights
        </h2>
        <p className="text-sm text-slate-600">
          {ownResultsEmpty
            ? "We have no recent prices for these dates, so here is a live search for the same trip."
            : "A live search for the same trip, including flights not listed above."}{" "}
          {bridged && "The filters apply to both lists. "}Search by {engine.partnerName}. Booking happens on the
          partner&apos;s site; Glooconn may earn a commission.
        </p>
      </div>
      <Panel search={search} filters={filters} onFacets={handleFacets} />
    </section>
  );
}
