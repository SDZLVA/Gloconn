"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DataFlightsList, filterDataFlights } from "@/components/live/DataFlightsList";
import { NoFlightPrices, WHITE_LABEL_ON } from "@/components/live/NoFlightPrices";
import type { Flight } from "@/types/models";
import { useApplyRefresh } from "@/hooks/useApplyRefresh";
import { FiltersAside, MobileResultsBar, useMobileFilters } from "@/components/filters/MobileFilters";
import { LiveFlightsFilterCard } from "@/components/live/LiveFlightsFilterCard";
import { TripHeader } from "@/components/results/TripHeader";
import { LiveFlightsSection } from "@/features/liveFlights/LiveFlightsSection";
import {
  LIVE_FLIGHTS_SORT_OPTIONS,
  type LiveFlightsFacets,
  type LiveFlightsFilters,
  type LiveFlightsSearch,
  type LiveFlightsSort,
} from "@/features/liveFlights/types";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchFormState } from "@/types/search-form";
import { LoadingMoreNote } from "@/components/live/LoadingMoreNote";

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
    sort: "best",
  });
  const { refreshing, refresh } = useApplyRefresh(900);
  const listTop = useRef<HTMLDivElement | null>(null);
  const { open: filtersSheetOpen, setOpen: setFiltersSheetOpen } = useMobileFilters();
  const activeFilterCount =
    (filters.maxStops !== null ? 1 : 0) + (filters.baggageIncluded ? 1 : 0) + (filters.airlines.length > 0 ? 1 : 0) + (filters.maxPrice ? 1 : 0);
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

  // Milestone 45: flights engine (NEXT_PUBLIC_FLIGHTS_ENGINE): "travelpayouts-rapidapi"
  // (default — Travelpayouts Flight Data via RapidAPI) or "whitelabel" (live box).
  // With the data engine, the live box only appears when no recent prices exist.
  const flightsEngine = process.env.NEXT_PUBLIC_FLIGHTS_ENGINE || "travelpayouts-rapidapi";
  // Milestone 57: "more" = the first (free, fast) prices are shown and live prices are still loading.
  const [data, setData] = useState<{ status: "idle" | "loading" | "more" | "done"; flights: Flight[] }>({ status: "idle", flights: [] });
  useEffect(() => {
    if (flightsEngine === "whitelabel" || !liveSearch) return;
    let cancelled = false;
    setData({ status: "loading", flights: [] });
    const params = new URLSearchParams({
      origin: liveSearch.originCode,
      destination: liveSearch.destinationCode,
      departureDate: liveSearch.departureDate,
      returnDate: liveSearch.returnDate ?? "",
      adults: String(liveSearch.adults),
      children: String(liveSearch.children),
      infants: String(liveSearch.infants),
      currency: liveSearch.currency,
    });
    type Answer = { ok?: boolean; flights?: Flight[]; more?: boolean };
    const load = (phase: "quick" | "full") =>
      fetch(`/api/flights/data?${params.toString()}${phase === "quick" ? "&phase=quick" : ""}`)
        .then((r) => r.json() as Promise<Answer>)
        .catch((): Answer => ({ ok: false, flights: [] }));
    const show = (flights: Flight[], status: "more" | "done") => {
      setData({ status, flights });
      if (flights.length > 0) setFacets({ airlines: [...new Set(flights.map((f) => f.airline))], bridged: true, searching: false });
    };
    // Milestone 57: saved fares first (≈1 s), then the live prices; the list re-sorts itself.
    void load("quick").then((quick) => {
      if (cancelled) return;
      const first = quick.ok && Array.isArray(quick.flights) ? quick.flights : [];
      if (!quick.ok || !quick.more) {
        if (quick.ok) return show(first, "done");
      } else if (first.length > 0) {
        show(first, "more");
      }
      void load("full").then((full) => {
        if (cancelled) return;
        const flights = full.ok && Array.isArray(full.flights) && full.flights.length > 0 ? full.flights : first;
        show(flights, "done");
      });
    });
    return () => {
      cancelled = true;
    };
  }, [flightsEngine, liveSearch]);
  const groupSize = (travelers?.adults ?? 1) + (travelers?.children ?? 0);
  // Milestone 49: without White Label, the data list (or its empty state) always shows.
  const useData = flightsEngine !== "whitelabel" && (data.status === "loading" || data.status === "more" || data.flights.length > 0 || !WHITE_LABEL_ON);
  const shownFlights = useMemo(() => filterDataFlights(data.flights, filters, Math.max(1, groupSize)), [data.flights, filters, groupSize]);


  return (
    <div className="space-y-6 sm:space-y-8">
      <TripHeader mode="flights" search={search} initialForm={initialForm} initialDirectOnly={initialMaxStops === 0} />

      {liveSearch ? (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <MobileResultsBar
            filtersId="flight-filters"
            onOpenFilters={() => setFiltersSheetOpen(true)}
            activeFilterCount={activeFilterCount}
            sortValue={filters.sort ?? "best"}
            sortOptions={LIVE_FLIGHTS_SORT_OPTIONS}
            onSortChange={(value) => {
              setFilters({ ...filters, sort: value as LiveFlightsSort });
              refresh();
            }}
          />
          <FiltersAside
            id="flight-filters"
            open={filtersSheetOpen}
            onClose={() => setFiltersSheetOpen(false)}
            className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
          >
            <LiveFlightsFilterCard filters={filters} onChange={(next) => { setFilters(next); setFiltersSheetOpen(false); refresh(listTop.current); }} facets={facets} currency={currency} />
          </FiltersAside>
          <div ref={listTop} className="min-w-0 scroll-mt-24">
            <div className="mb-3 hidden justify-end lg:flex">
              <label className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
                <span>Sort by:</span>
                <select
                  value={filters.sort ?? "best"}
                  onChange={(event) => {
                    setFilters({ ...filters, sort: event.target.value as LiveFlightsSort });
                    refresh();
                  }}
                  className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-slate-900 focus:outline-none"
                >
                  {LIVE_FLIGHTS_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className={refreshing ? "pointer-events-none opacity-40 transition-opacity" : "transition-opacity"} aria-busy={refreshing}>
            {useData ? (
              data.status === "loading" ? (
                <div className="space-y-4" aria-label="Loading flights">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" />
                  ))}
                </div>
              ) : data.flights.length === 0 ? (
                <NoFlightPrices
                  origin={liveSearch.originCode}
                  destination={liveSearch.destinationCode}
                  departureDate={liveSearch.departureDate}
                  returnDate={liveSearch.returnDate ?? null}
                  adults={liveSearch.adults}
                  kids={liveSearch.children}
                  infants={liveSearch.infants}
                />
              ) : (
                <>
                  {data.status === "more" && <LoadingMoreNote text="Finding more live prices…" />}
                  <DataFlightsList flights={shownFlights} travelers={Math.max(1, groupSize)} roundTrip={Boolean(liveSearch.returnDate)} />
                </>
              )
            ) : (
              <LiveFlightsSection
                search={liveSearch}
                filters={filters}
                onFacets={setFacets}
                title="Live flight prices"
              />
            )}
            </div>
            {refreshing && (
              <p role="status" className="mt-3 text-center text-sm font-semibold text-brand-700">
                Updating results…
              </p>
            )}
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
