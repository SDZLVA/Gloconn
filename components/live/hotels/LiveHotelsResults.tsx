"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApplyRefresh } from "@/hooks/useApplyRefresh";
import { FiltersAside, MobileResultsBar, useMobileFilters } from "@/components/filters/MobileFilters";
import { HotelsFilterCard } from "@/components/live/hotels/HotelsFilterCard";
import { HotelsTileMap } from "@/components/live/hotels/HotelsTileMap";
import { LiveHotelCard } from "@/components/live/hotels/LiveHotelCard";
import { filterHotels } from "@/features/liveHotels/filters";
import { mergeHotels } from "@/features/liveHotels/agoda/map";
import type { PropertyKind } from "@/features/liveHotels/propertyKind";
import { LoadingMoreNote } from "@/components/live/LoadingMoreNote";
import { DEFAULT_HOTEL_FILTERS, type LiveHotelsFilters, type LiveHotelsResponse, type LiveHotelsSearch } from "@/features/liveHotels/types";

type LiveHotelsResultsProps = {
  search: LiveHotelsSearch;
  /** Milestone 44: which hotels API to ask (LiteAPI by default). */
  endpoint?: string;
  /** Budget for the whole stay from the search bar, if any. */
  stayBudget: number | null;
  cityName: string;
};

const HOTEL_SORT_OPTIONS = [
  { value: "recommended", label: "Top picks" },
  { value: "price", label: "Price (lowest first)" },
  { value: "rating", label: "Review score" },
  { value: "stars", label: "Stars" },
  { value: "distance", label: "Distance from centre" },
] as const;

/** more (Milestone 57): the first site's hotels are shown, the other site is still loading. */
type State = { status: "loading" } | { status: "done"; data: LiveHotelsResponse; more?: boolean };

/**
 * Milestone 33: "See availability" opens Glooconn's own hotel page
 * (/hotels/{id}), which shows photos, the map and the price and links to the
 * LiteAPI white-label booking site.
 */
function hotelPageUrl(hotelId: string, search: LiveHotelsSearch, back: string): string {
  const params = new URLSearchParams({
    checkin: search.checkin,
    checkout: search.checkout,
    adults: String(search.adults),
    children: String(search.children),
    rooms: String(search.rooms),
    currency: search.currency,
  });
  if (back) params.set("back", back);
  return `/hotels/${encodeURIComponent(hotelId)}?${params.toString()}`;
}

/** Milestone 44: Booking.com hotel link with the search's dates and guests. */
function externalHotelUrl(url: string, search: LiveHotelsSearch): string {
  try {
    const target = new URL(url);
    // Agoda links (M56) already carry the dates and guests.
    if (/(^|\.)agoda\.com$/i.test(target.hostname)) return url;
    target.searchParams.set("checkin", search.checkin);
    target.searchParams.set("checkout", search.checkout);
    target.searchParams.set("group_adults", String(search.adults));
    target.searchParams.set("group_children", String(search.children));
    target.searchParams.set("no_rooms", String(search.rooms));
    target.searchParams.set("selected_currency", search.currency);
    return target.toString();
  } catch {
    return url;
  }
}

/**
 * Milestone 30 — Hotels tab results from LiteAPI, Booking.com-style:
 * map preview + "Filter by" on the left, hotel cards on the right.
 */
export function LiveHotelsResults({ search, stayBudget, cityName, endpoint = "/api/hotels/live" }: LiveHotelsResultsProps) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [filters, setFilters] = useState<LiveHotelsFilters>(DEFAULT_HOTEL_FILTERS);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { refreshing, refresh } = useApplyRefresh();
  const listTop = useRef<HTMLElement | null>(null);
  const { open: filtersSheetOpen, setOpen: setFiltersSheetOpen } = useMobileFilters();
  // Where the hotel page's "Back to results" returns to.
  const [backUrl, setBackUrl] = useState("");
  useEffect(() => setBackUrl(window.location.pathname + window.location.search), []);

  const query = useMemo(
    () =>
      new URLSearchParams({
        destination: search.destination,
        checkin: search.checkin,
        checkout: search.checkout,
        adults: String(search.adults),
        children: String(search.children),
        rooms: String(search.rooms),
        currency: search.currency,
      }).toString(),
    [search],
  );

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    const get = (part?: "booking" | "agoda") =>
      fetch(`${endpoint}?${query}${part ? `&part=${part}` : ""}`)
        .then((response) => response.json() as Promise<LiveHotelsResponse>)
        .catch((): LiveHotelsResponse => ({ ok: false, code: "PROVIDER_ERROR", message: "Live hotel prices are unavailable right now." }));
    let budgetSet = false;
    const apply = (data: LiveHotelsResponse, more: boolean) => {
      if (cancelled) return;
      setState({ status: "done", data, more });
      if (!budgetSet && data.ok && stayBudget && stayBudget > 0) {
        budgetSet = true;
        setFilters((current) => ({ ...current, maxPerNight: Math.max(1, Math.floor(stayBudget / data.nights)) }));
      }
    };
    if (endpoint !== "/api/hotels/bookingcom") {
      void get().then((data) => apply(data, false));
    } else {
      // Milestone 57: Booking.com (~2 s) and Agoda (~12 s) load side by side.
      // The first one with hotels shows at once; when both are in, they are
      // merged (cheaper price wins) and the list re-sorts by the chosen sort.
      let booking: LiveHotelsResponse | null = null;
      let agoda: LiveHotelsResponse | null = null;
      const settle = () => {
        if (booking && agoda) {
          if (booking.ok && agoda.ok) apply({ ...booking, hotels: mergeHotels(booking.hotels, agoda.hotels) }, false);
          else if (!booking.ok && agoda.ok && agoda.hotels.length > 0) apply(agoda, false);
          else apply(booking, false);
          return;
        }
        const first = booking ?? agoda;
        if (first?.ok && first.hotels.length > 0) apply(first, true);
      };
      void get("booking").then((data) => {
        booking = data;
        settle();
      });
      void get("agoda").then((data) => {
        agoda = data;
        settle();
      });
    }
    return () => {
      cancelled = true;
    };
  }, [query, stayBudget, endpoint]);

  const data = state.status === "done" && state.data.ok ? state.data : null;
  const loadingMore = state.status === "done" && Boolean(state.more);
  const shown = useMemo(() => (data ? filterHotels(data.hotels, filters, data.nights) : []), [data, filters]);
  const typeCounts = useMemo(() => {
    const counts: Partial<Record<PropertyKind, number>> = {};
    for (const hotel of data?.hotels ?? []) {
      const kind = hotel.propertyType ?? "other";
      counts[kind] = (counts[kind] ?? 0) + 1;
    }
    return counts;
  }, [data]);
  const starCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const hotel of data?.hotels ?? []) counts[hotel.stars] = (counts[hotel.stars] ?? 0) + 1;
    return counts;
  }, [data]);

  const guestCount = search.adults + search.children;
  const guestsLabel = `${guestCount} ${guestCount === 1 ? "guest" : "guests"}`;

  const showOnMap = useCallback((id: string) => {
    setSelectedId(id);
    setMapOpen(true);
  }, []);

  useEffect(() => {
    if (!mapOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMapOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mapOpen]);

  if (state.status === "done" && !state.data.ok) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950" role="status">
        <p className="font-semibold">{state.data.message}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
      <MobileResultsBar
        filtersId="hotel-filters"
        onOpenFilters={() => setFiltersSheetOpen(true)}
        activeFilterCount={(filters.maxPerNight ? 1 : 0) + filters.stars.length + (filters.minRating ? 1 : 0) + (filters.refundableOnly ? 1 : 0)}
        sortValue={filters.sort}
        sortOptions={HOTEL_SORT_OPTIONS}
        onSortChange={(value) => {
          setFilters({ ...filters, sort: value as LiveHotelsFilters["sort"] });
          refresh();
        }}
        onOpenMap={data ? () => setMapOpen(true) : undefined}
      />
      <FiltersAside
        id="hotel-filters"
        open={filtersSheetOpen}
        onClose={() => setFiltersSheetOpen(false)}
        className="space-y-4 lg:sticky lg:top-24"
      >
        <div className="relative hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <HotelsTileMap hotels={data?.hotels ?? []} nights={data?.nights ?? 1} height={190} preview />
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              disabled={!data}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-brand-800 disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
              </svg>
              Show on map
            </button>
          </div>
        </div>
        <HotelsFilterCard filters={filters} onChange={(next) => { setFilters(next); setFiltersSheetOpen(false); refresh(listTop.current); }} currency={search.currency} starCounts={starCounts} typeCounts={typeCounts} />
      </FiltersAside>

      <section ref={listTop} className="min-w-0 scroll-mt-24 space-y-4" aria-labelledby="hotels-count">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="hotels-count" className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            {data ? `${cityName}: ${shown.length} ${shown.length === 1 ? "property" : "properties"} found` : `Searching stays in ${cityName}…`}
          </h2>
          <label className="hidden items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 lg:flex">
            <span>Sort by:</span>
            <select
              value={filters.sort}
              onChange={(event) => { setFilters({ ...filters, sort: event.target.value as LiveHotelsFilters["sort"] }); refresh(); }}
              className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-slate-900 focus:outline-none"
            >
              <option value="recommended">Top picks</option>
              <option value="price">Price (lowest first)</option>
              <option value="rating">Review score</option>
              <option value="stars">Stars</option>
              <option value="distance">Distance from centre</option>
            </select>
          </label>
        </div>

        {(state.status === "loading" || refreshing) &&
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[220px_1fr]" aria-hidden="true">
              <div className="h-44 animate-pulse rounded-xl bg-slate-200 motion-reduce:animate-none" />
              <div className="space-y-3">
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
              </div>
            </div>
          ))}

        {loadingMore && !refreshing && <LoadingMoreNote text="Adding more hotels and prices…" />}

        {data && !refreshing && !loadingMore && shown.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-700">
            {data.hotels.length === 0
              ? "No live availability for these dates. Try other dates or a nearby city."
              : "No stays match your filters. Try a higher budget or fewer filters."}
          </div>
        )}

        {data &&
          !refreshing &&
          shown.map((hotel) => (
            <LiveHotelCard
              key={hotel.id}
              hotel={hotel}
              nights={data.nights}
              guestsLabel={guestsLabel}
              bookingUrl={hotel.externalUrl ? externalHotelUrl(hotel.externalUrl, search) : hotelPageUrl(hotel.id, search, backUrl)}
              onShowOnMap={() => showOnMap(hotel.id)}
              highlighted={hotel.id === selectedId}
            />
          ))}
      </section>

      {mapOpen && data && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white" role="dialog" aria-modal="true" aria-label={`Map of stays in ${cityName}`}>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="font-bold text-slate-900">
              {cityName}: {shown.length} properties
            </p>
            <button type="button" onClick={() => setMapOpen(false)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Close ✕
            </button>
          </div>
          <div className="grid min-h-0 flex-1 lg:grid-cols-[380px_minmax(0,1fr)]">
            <div className="hidden min-h-0 space-y-3 overflow-y-auto border-r border-slate-200 p-3 lg:block">
              {shown.map((hotel) => (
                <button
                  key={hotel.id}
                  type="button"
                  onClick={() => setSelectedId(hotel.id)}
                  className={`flex w-full gap-3 rounded-xl border p-2 text-left ${hotel.id === selectedId ? "border-brand-700 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  {hotel.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={hotel.photo} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="h-16 w-20 shrink-0 rounded-lg bg-slate-100" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-900">{hotel.name}</span>
                    <span className="block text-xs text-slate-500">{hotel.rating !== null ? `${hotel.rating.toFixed(1)} · ` : ""}{hotel.stars ? `${hotel.stars}★` : ""}</span>
                    <span className="block text-sm font-bold text-slate-900">{new Intl.NumberFormat("en-GB", { style: "currency", currency: hotel.currency, maximumFractionDigits: 0 }).format(hotel.totalPrice)}</span>
                  </span>
                </button>
              ))}
            </div>
            <HotelsTileMap hotels={shown} nights={data.nights} height={typeof window === "undefined" ? 600 : window.innerHeight - 58} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </div>
      )}
    </div>
  );
}
