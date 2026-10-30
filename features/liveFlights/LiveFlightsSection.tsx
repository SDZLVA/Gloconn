"use client";

import { activeLiveFlightsEngine } from "@/features/liveFlights/config";
import type { LiveFlightsSearch } from "@/features/liveFlights/types";

type LiveFlightsSectionProps = {
  /** Null when the search has no usable route or dates — nothing is shown. */
  search: LiveFlightsSearch | null;
  /** True when Glooconn's own flight list is empty for these dates. */
  ownResultsEmpty: boolean;
};

/**
 * "All live flights" (Milestone 23): a partner's live search under
 * Glooconn's own results. The only entry point of features/liveFlights.
 */
export function LiveFlightsSection({ search, ownResultsEmpty }: LiveFlightsSectionProps) {
  const engine = activeLiveFlightsEngine();
  if (!engine || !search) return null;
  const { Panel } = engine;

  return (
    <section className="space-y-3" aria-labelledby="live-flights-heading">
      <div className="space-y-1">
        <h2 id="live-flights-heading" className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          All live flights
        </h2>
        <p className="text-sm text-slate-600">
          {ownResultsEmpty
            ? "We have no recent prices for these dates, so here is a live search for the same trip."
            : "A live search for the same trip, including flights not listed above."}{" "}
          Search by {engine.partnerName}. Booking happens on the partner&apos;s site; Glooconn may earn a commission.
        </p>
      </div>
      <Panel search={search} />
    </section>
  );
}
