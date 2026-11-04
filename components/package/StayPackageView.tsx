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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid sm:grid-cols-[240px_minmax(0,1fr)]">
            <div className="relative min-h-[180px] bg-gradient-to-br from-slate-700 via-slate-500 to-amber-300">
              {hotel.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hotel.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
            <div className="space-y-2 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">1 · Your hotel</p>
              <h2 className="text-xl font-bold text-slate-900">{hotel.name}</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {hotel.stars > 0 && <span className="text-amber-500">{"★".repeat(Math.round(hotel.stars))}</span>}
                {score > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">{score.toFixed(1)}</span>
                    <span className="font-semibold text-emerald-700">{scoreWord(score)}</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">{hotel.location}</p>
              <p className="text-sm text-slate-700">
                {formatMoney(stay.hotelTotal, stay.currency)} for {formatPackageNightsLabel(stay.nights)} · {stay.rooms} {stay.rooms === 1 ? "room" : "rooms"}
              </p>
              {hotel.detailsUrl && (
                <Link
                  href={hotel.detailsUrl}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800"
                >
                  See this hotel &amp; book
                </Link>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">2 · Your flights</p>
              <p className="text-sm text-slate-600">
                {stay.flightBudget !== null
                  ? `Live prices, showing only flights up to ${formatMoney(stay.flightBudget, stay.currency)} for ${people} — what's left of your budget after the hotel.`
                  : `Live prices for ${people}, cheapest first.`}
              </p>
            </div>
            {flights ? (
              <LiveFlightsSection search={flights} filters={filters} title="Live flights" />
            ) : (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
                We couldn&apos;t match these places to airports. Search flights from the Flights tab.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Your trip budget</p>
            <dl className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between gap-3">
                <dt>Hotel ({formatPackageNightsLabel(stay.nights)})</dt>
                <dd className="font-semibold">{formatMoney(stay.hotelTotal, stay.currency)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Flights ({people})</dt>
                <dd className="font-semibold">{stay.flightBudget !== null ? `up to ${formatMoney(stay.flightBudget, stay.currency)}` : "live price"}</dd>
              </div>
              {stay.budget !== null && (
                <div className="flex justify-between gap-3 border-t border-slate-100 pt-2 text-base">
                  <dt className="font-bold text-slate-900">Total budget</dt>
                  <dd className="font-extrabold text-slate-900">{formatMoney(stay.budget, stay.currency)}</dd>
                </div>
              )}
            </dl>
            {stay.overBudget && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                This hotel leaves little or nothing for flights within your budget.
              </p>
            )}
            {stay.flightEstimate !== null && (
              <p className="mt-3 text-xs text-slate-500">Recent flights on this route started from {formatMoney(stay.flightEstimate, stay.currency)} for {people}.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
