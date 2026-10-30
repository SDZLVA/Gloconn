"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HotelsFilterCard } from "@/components/live/hotels/HotelsFilterCard";
import { HotelsTileMap } from "@/components/live/hotels/HotelsTileMap";
import { LiveHotelCard } from "@/components/live/hotels/LiveHotelCard";
import { filterHotels } from "@/features/liveHotels/filters";
import { DEFAULT_HOTEL_FILTERS, type LiveHotelsFilters, type LiveHotelsResponse, type LiveHotelsSearch } from "@/features/liveHotels/types";

type LiveHotelsResultsProps = {
  search: LiveHotelsSearch;
  /** Budget for the whole stay from the search bar, if any. */
  stayBudget: number | null;
  cityName: string;
};

type State = { status: "loading" } | { status: "done"; data: LiveHotelsResponse };

/** Optional LiteAPI white-label site for "See availability" (set when it exists). */
function bookingUrl(hotelId: string, search: LiveHotelsSearch): string | null {
  const base = process.env.NEXT_PUBLIC_LITEAPI_WHITELABEL_URL?.replace(/\/$/, "");
  if (!base) return null;
  const params = new URLSearchParams({
    checkin: search.checkin,
    checkout: search.checkout,
    adults: String(search.adults),
    rooms: String(search.rooms),
    currency: search.currency,
  });
  return `${base}/hotels/${encodeURIComponent(hotelId)}?${params.toString()}`;
}

/**
 * Milestone 30 — Hotels tab results from LiteAPI, Booking.com-style:
 * map preview + "Filter by" on the left, hotel cards on the right.
 */
export function LiveHotelsResults({ search, stayBudget, cityName }: LiveHotelsResultsProps) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [filters, setFilters] = useState<LiveHotelsFilters>(DEFAULT_HOTEL_FILTERS);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    fetch(`/api/hotels/live?${query}`)
      .then((response) => response.json() as Promise<LiveHotelsResponse>)
      .catch((): LiveHotelsResponse => ({ ok: false, code: "PROVIDER_ERROR", message: "Live hotel prices are unavailable right now." }))
      .then((data) => {
        if (cancelled) return;
        setState({ status: "done", data });
        if (data.ok && stayBudget && stayBudget > 0) {
          setFilters((current) => ({ ...current, maxPerNight: Math.max(1, Math.floor(stayBudget / data.nights)) }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [query, stayBudget]);

  const data = state.status === "done" && state.data.ok ? state.data : null;
  const shown = useMemo(() => (data ? filterHotels(data.hotels, filters, data.nights) : []), [data, filters]);
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
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
        <HotelsFilterCard filters={filters} onChange={setFilters} currency={search.currency} starCounts={starCounts} />
      </aside>

      <section className="min-w-0 space-y-4" aria-labelledby="hotels-count">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="hotels-count" className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            {data ? `${cityName}: ${shown.length} ${shown.length === 1 ? "property" : "properties"} found` : `Searching stays in ${cityName}…`}
          </h2>
          <label className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
            <span>Sort by:</span>
            <select
              value={filters.sort}
              onChange={(event) => setFilters({ ...filters, sort: event.target.value as LiveHotelsFilters["sort"] })}
              className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-slate-900 focus:outline-none"
            >
              <option value="recommended">Top picks</option>
              <option value="price">Price (lowest first)</option>
              <option value="rating">Review score</option>
              <option value="stars">Stars</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-slate-500">Live prices from LiteAPI hotel partners · Glooconn may earn a commission</p>

        {state.status === "loading" &&
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

        {data && shown.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-700">
            {data.hotels.length === 0
              ? "No live availability for these dates. Try other dates or a nearby city."
              : "No stays match your filters. Try a higher budget or fewer filters."}
          </div>
        )}

        {data &&
          shown.map((hotel) => (
            <LiveHotelCard
              key={hotel.id}
              hotel={hotel}
              nights={data.nights}
              guestsLabel={guestsLabel}
              bookingUrl={bookingUrl(hotel.id, search)}
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
