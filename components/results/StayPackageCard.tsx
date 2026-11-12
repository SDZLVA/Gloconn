"use client";

import { WHITE_LABEL_ON } from "@/components/live/NoFlightPrices";

import type { LiveFlightsSearch } from "@/features/liveFlights/types";
import { formatMoney } from "@/lib/money";
import { saveStayView } from "@/lib/packages/stayViewPayload";
import { formatPackageNightsLabel } from "@/lib/results/packagesUi";
import { cn } from "@/lib/utils";
import type { StayPackage } from "@/types/models/stay-package";

const scoreWord = (s: number) => (s >= 9 ? "Superb" : s >= 8.5 ? "Excellent" : s >= 8 ? "Very good" : s >= 7 ? "Good" : "Pleasant");

type StayPackageCardProps = {
  stay: StayPackage;
  flights: LiveFlightsSearch | null;
  destinationName?: string;
};

/**
 * Milestone 40b — package card: live hotel + the money left for live flights.
 * "See flights & hotel" opens the package page with the live flights filtered
 * to that amount.
 */
export function StayPackageCard({ stay, flights, destinationName }: StayPackageCardProps) {
  const { hotel } = stay;
  const score = hotel.rating > 0 ? (hotel.rating <= 5 ? hotel.rating * 2 : hotel.rating) : 0;
  const href = `/packages/stay/${encodeURIComponent(stay.id)}`;
  const people = `${stay.travelers} ${stay.travelers === 1 ? "traveler" : "travelers"}`;

  return (
    <article className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm motion-safe:transition-shadow hover:shadow-md md:grid-cols-[200px_minmax(0,1fr)_220px]">
      <div className="relative min-h-[150px] overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-sky-400">
        {hotel.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hotel.photo} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />
        {stay.label && (
          <span className={cn("absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-bold text-white shadow", stay.label === "Cheapest" ? "bg-emerald-600" : "bg-brand-700")}>
            {stay.label}
          </span>
        )}
        {destinationName && <span className="absolute bottom-3 left-3 text-sm font-bold text-white drop-shadow">{destinationName}</span>}
      </div>

      <div className="min-w-0 space-y-2 p-4 sm:p-5">
        <h3 className="text-lg font-bold text-slate-900">{hotel.name}</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {hotel.stars > 0 && (
            <span className="text-amber-500" aria-label={`${hotel.stars} stars`}>
              {"★".repeat(Math.round(hotel.stars))}
            </span>
          )}
          {score > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">{score.toFixed(1)}</span>
              <span className="font-semibold text-emerald-700">{scoreWord(score)}</span>
            </span>
          )}
        </div>
        <p className="truncate text-sm text-slate-500">{hotel.location}</p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">{WHITE_LABEL_ON ? "✈ Live flights" : "✈ Flights"}</span>
          {stay.flightBudget !== null ? <> up to {formatMoney(stay.flightBudget, stay.currency)} for {people}</> : <> for {people}</>}
          {stay.flightEstimate !== null && (
            <span className="text-slate-500"> · recently from {formatMoney(stay.flightEstimate, stay.currency)}</span>
          )}
        </p>
        {hotel.amenities.length > 0 && <p className="text-xs text-emerald-700">{hotel.amenities.join(" · ")}</p>}
      </div>

      <div className="flex flex-row items-center justify-between gap-3 border-t border-slate-100 bg-brand-50/70 p-4 md:flex-col md:items-stretch md:justify-center md:border-l md:border-t-0">
        <div>
          {stay.flightEstimate !== null ? (
            <>
              <p className="text-xs font-semibold text-slate-600">Package from</p>
              <p className="text-2xl font-extrabold text-slate-900">{formatMoney(stay.hotelTotal + stay.flightEstimate, stay.currency)}</p>
              <p className="text-[11px] text-slate-500">Hotel {formatMoney(stay.hotelTotal, stay.currency)} + flights from {formatMoney(stay.flightEstimate, stay.currency)}</p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-slate-600">Hotel, {formatPackageNightsLabel(stay.nights)}</p>
              <p className="text-2xl font-extrabold text-slate-900">{formatMoney(stay.hotelTotal, stay.currency)}</p>
            </>
          )}
          <p className="text-[11px] leading-snug text-slate-500">
            {stay.overBudget
              ? "Over your budget with flights"
              : stay.budget !== null
                ? `+ flights within your ${formatMoney(stay.budget, stay.currency)} budget`
                : WHITE_LABEL_ON
                  ? "+ live flights"
                  : stay.flightsLimited
                    ? "+ flights (live prices busy, try later)"
                    : "+ flights (no price found yet)"}
          </p>
        </div>
        <a
          href={href}
          onClick={() =>
            saveStayView({ stay, flights, resultsUrl: window.location.pathname + window.location.search, savedAt: Date.now() })
          }
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-700/20 hover:bg-brand-800"
        >
          See flights &amp; hotel
        </a>
      </div>
    </article>
  );
}
