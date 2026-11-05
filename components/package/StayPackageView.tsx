"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LiveFlightsSection } from "@/features/liveFlights/LiveFlightsSection";
import type { LiveFlightsFilters } from "@/features/liveFlights/types";
import { formatShortDate } from "@/lib/calendar/dates";
import { formatMoney } from "@/lib/money";
import { loadStayView, type StayViewPayload } from "@/lib/packages/stayViewPayload";
import { formatPackageNightsLabel } from "@/lib/results/packagesUi";
import { parseSearchRequestFromParams } from "@/lib/search/request";

const city = (label?: string) => (label ?? "").split(",")[0]?.trim();
const scoreWord = (s: number) => (s >= 9 ? "Superb" : s >= 8.5 ? "Excellent" : s >= 8 ? "Very good" : s >= 7 ? "Good" : "Pleasant");

/**
 * Milestone 40b — hotel-led package page: the chosen live hotel (book it on
 * book.glooconn.com) and the live White Label flights for the same trip,
 * filtered to the money left in the budget.
 */
export function StayPackageView({ stayId }: { stayId: string }) {
  const [payload, setPayload] = useState<StayViewPayload | null | "loading">("loading");
  useEffect(() => setPayload(loadStayView(stayId)), [stayId]);
  // The live flights open inside the package box (kept loaded once opened).
  const [flightsOpen, setFlightsOpen] = useState(false);
  const [flightsLoaded, setFlightsLoaded] = useState(false);

  const filters = useMemo((): LiveFlightsFilters | null => {
    if (!payload || payload === "loading") return null;
    return {
      showFlights: true,
      maxStops: null,
      airlines: [],
      baggageIncluded: false,
      maxPrice: payload.stay.flightBudget && payload.stay.flightBudget > 0 ? payload.stay.flightBudget : null,
      sort: "cheapest",
    };
  }, [payload]);

  if (payload === "loading") {
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-100 motion-reduce:animate-none" aria-label="Loading package" />;
  }
  if (!payload || !filters) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">This package has expired</h1>
        <p className="text-slate-600">Prices change quickly, so packages are kept only while you browse. Search again to see current packages.</p>
        <Link href="/?mode=packages" className="inline-flex rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white">
          Search packages
        </Link>
      </div>
    );
  }

  const { stay, flights, resultsUrl } = payload;
  const { hotel } = stay;
  const search = parseSearchRequestFromParams(new URLSearchParams(resultsUrl.split("?")[1] ?? ""));
  const from = city(search.origin);
  const to = city(search.destination) || "your trip";
  const dates = [search.departureDate, search.returnDate].filter((v): v is string => Boolean(v)).map(formatShortDate).join(" – ");
  const score = hotel.rating > 0 ? (hotel.rating <= 5 ? hotel.rating * 2 : hotel.rating) : 0;
  const people = `${stay.travelers} ${stay.travelers === 1 ? "traveler" : "travelers"}`;

  return (
    <div className="space-y-6">
      <Link href={resultsUrl} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900">
        ← Back to results
      </Link>

      <div>
        {stay.label && <span className="inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">✓ {stay.label}</span>}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">{from ? `${from} → ${to}` : to} Package</h1>
        <p className="mt-1 text-sm text-slate-600">{[dates, people, formatPackageNightsLabel(stay.nights)].filter(Boolean).join(" · ")}</p>
      </div>

      {/* Milestone 42: one package box — price, hotel and flights with their booking options together. */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="package-price">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 bg-brand-50/60 p-5">
          <div>
            <p id="package-price" className="text-sm font-semibold text-slate-700">Package price</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">
              {formatMoney(stay.hotelTotal, stay.currency)} <span className="text-lg font-bold text-slate-500">+ flights</span>
            </p>
            <p className="text-xs text-slate-500">
              {people} · {formatPackageNightsLabel(stay.nights)} · hotel + return flights at today&apos;s live price
            </p>
          </div>
          {stay.budget !== null && (
            <dl className="text-sm text-slate-700">
              <div className="flex justify-between gap-6">
                <dt>Your budget</dt>
                <dd className="font-semibold">{formatMoney(stay.budget, stay.currency)}</dd>
              </div>
              {stay.flightBudget !== null && (
                <div className="flex justify-between gap-6">
                  <dt>Left for flights</dt>
                  <dd className="font-bold text-emerald-700">{formatMoney(stay.flightBudget, stay.currency)}</dd>
                </div>
              )}
            </dl>
          )}
        </div>

        <div className="grid gap-4 border-b border-slate-100 p-5 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-center">
          <div className="relative h-28 overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 via-slate-500 to-amber-300 sm:h-24">
            {hotel.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hotel.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">1 · Hotel</p>
            <p className="text-lg font-bold text-slate-900">{hotel.name}</p>
            <p className="flex flex-wrap items-center gap-2 text-sm">
              {hotel.stars > 0 && <span className="text-amber-500">{"★".repeat(Math.round(hotel.stars))}</span>}
              {score > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">{score.toFixed(1)}</span>
                  <span className="font-semibold text-emerald-700">{scoreWord(score)}</span>
                </span>
              )}
              <span className="text-slate-500">{hotel.location}</span>
            </p>
          </div>
          <div className="space-y-2 sm:text-right">
            <p className="text-xl font-extrabold text-slate-900">{formatMoney(stay.hotelTotal, stay.currency)}</p>
            <p className="text-xs text-slate-500">
              {formatPackageNightsLabel(stay.nights)} · {stay.rooms} {stay.rooms === 1 ? "room" : "rooms"}
            </p>
            {hotel.detailsUrl && (
              <Link
                href={hotel.detailsUrl}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800"
              >
                Book hotel · all room options
              </Link>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">2 · Return flights</p>
              <p className="text-sm text-slate-700">
                {stay.flightBudget !== null
                  ? `Live prices for ${people}, only flights up to ${formatMoney(stay.flightBudget, stay.currency)} — cheapest first.`
                  : `Live prices for ${people}, cheapest first.`}
              </p>
            </div>
            {flights && (
              <button
                type="button"
                onClick={() => {
                  setFlightsOpen((open) => !open);
                  setFlightsLoaded(true);
                }}
                aria-expanded={flightsOpen}
                aria-controls="live-flights"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-700 px-5 text-sm font-bold text-brand-700 hover:bg-brand-50"
              >
                {flightsOpen ? "Hide flight options ↑" : "Book flights · all flight options ↓"}
              </button>
            )}
          </div>
          {!flights && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              We couldn&apos;t match these places to airports. Search flights from the Flights tab.
            </p>
          )}
          {flights && flightsLoaded && (
            <div id="live-flights" hidden={!flightsOpen} className="mt-4 border-t border-slate-100 pt-4">
              <LiveFlightsSection search={flights} filters={filters} title="Flight options" />
              <p className="mt-2 text-xs text-slate-500">
                Each ticket&apos;s price is the live total for {people}. Pick a ticket to book it with the airline or agency; your package price is the hotel plus that ticket.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
