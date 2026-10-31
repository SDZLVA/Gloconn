"use client";

import { useMemo, useState } from "react";
import { LiveFlightsFilterCard } from "@/components/live/LiveFlightsFilterCard";
import { TripHeader } from "@/components/results/TripHeader";
import { LiveFlightsSection } from "@/features/liveFlights/LiveFlightsSection";
import type { LiveFlightsFacets, LiveFlightsFilters, LiveFlightsSearch } from "@/features/liveFlights/types";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchFormState } from "@/types/search-form";

type LiveFlightsResultsPageProps = {
  search: Partial<SearchRequest>;
  initialForm: SearchFormState;
  /** City (MIL) or airport code resolved on the server; null when unknown. */
  originCode: string | null;
  destinationCode: string | null;
  /** From the URL: stops=0 ("Direct flights only"). */
  initialMaxStops: number | null;
};

/**
 * Milestone 28 — Flights tab results: live prices only (Travelpayouts
 * White Label). Glooconn's own flight API is not called for this page.
 */
export function LiveFlightsResultsPage({
  search,
  initialForm,
  originCode,
  destinationCode,
  initialMaxStops,
}: LiveFlightsResultsPageProps) {
  const currency = search.budget?.currency ?? "EUR";
  const [filters, setFilters] = useState<LiveFlightsFilters>({
    showFlights: true,
    maxStops: initialMaxStops,
    airlines: [],
    baggageIncluded: false,
    maxPrice: search.budget?.amount && search.budget.amount > 0 ? search.budget.amount : null,
  });
  const [facets, setFacets] = useState<LiveFlightsFacets>({ airlines: [], bridged: false });

  const travelers = search.travelers;
  const liveSearch = useMemo((): LiveFlightsSearch | null => {
    if (!originCode || !destinationCode || !search.departureDate) return null;
    return {
      originCode,
      destinationCode,
      departureDate: search.departureDate,
      returnDate: search.tripType === "one-way" ? null : (search.returnDate ?? null),
      adults: travelers?.adults ?? 1,
      children: travelers?.children ?? 0,
      infants: travelers?.infants ?? 0,
      currency,
    };
  }, [originCode, destinationCode, search.departureDate, search.returnDate, search.tripType, travelers, currency]);


  return (
    <div className="space-y-6 sm:space-y-8">
      <TripHeader mode="flights" search={search} initialForm={initialForm} initialDirectOnly={initialMaxStops === 0} />

      {liveSearch ? (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <LiveFlightsFilterCard filters={filters} onChange={setFilters} facets={facets} currency={currency} />
          </aside>
          <div className="min-w-0">
            <LiveFlightsSection
              search={liveSearch}
              filters={filters}
              onFacets={setFacets}
              title="Live flight prices"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950" role="status">
          <p className="font-semibold">We couldn&apos;t match these places to airports.</p>
          <p className="mt-1">Pick the departure and destination from the suggestions in the search bar above, then search again.</p>
        </div>
      )}
    </div>
  );
}
