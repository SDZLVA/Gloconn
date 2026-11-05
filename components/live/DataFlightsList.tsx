"use client";

import { AirlineLogo } from "@/components/results/AirlineLogo";
import type { LiveFlightsFilters } from "@/features/liveFlights/types";
import { buildExactAviasalesLink } from "@/lib/affiliate/exactFlightLinks";
import { formatMoney } from "@/lib/money";
import type { Flight } from "@/types/models";

const stopsLabel = (n: number) => (n === 0 ? "Direct" : n === 1 ? "1 stop" : `${n} stops`);
function when(value?: string): { date: string; time: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2})/.exec(value ?? "");
  if (!m) return { date: "", time: "" };
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return { date: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }), time: m[4] };
}

/** Milestone 45: Flights tab filters and sort, applied in the browser. */
export function filterDataFlights(flights: Flight[], filters: LiveFlightsFilters, travelers: number): Flight[] {
  const list = flights.filter((f) => {
    if (filters.maxStops !== null && f.stops > filters.maxStops) return false;
    if (filters.airlines.length > 0 && !filters.airlines.includes(f.airline)) return false;
    if (filters.maxPrice && f.price * travelers > filters.maxPrice) return false;
    return true;
  });
  if (filters.sort === "departure_time") return [...list].sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  return [...list].sort((a, b) => a.price - b.price);
}

/**
 * Milestone 45 — flight cards from the Travelpayouts Flight Data API. These
 * are recent prices other travellers found (cached), so the card says so and
 * "Book" opens the same search on Aviasales with today's live price.
 */
export function DataFlightsList({ flights, travelers, roundTrip }: { flights: Flight[]; travelers: number; roundTrip: boolean }) {
  if (flights.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-700">
        No flights match your filters. Try more stops or a higher budget.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">Recent prices found by other travellers in the last 48 hours. The live price is confirmed on the booking site.</p>
      {flights.map((flight, index) => {
        const out = when(flight.departureTime);
        const back = when(flight.returnDepartureTime);
        const link = buildExactAviasalesLink(flight);
        return (
          <article key={flight.id} className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <AirlineLogo code={flight.airlineCode} name={flight.airline} className="h-9 w-9 rounded-lg" />
                <p className="font-semibold text-slate-900">{flight.airline}</p>
                {index === 0 && <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">Cheapest</span>}
              </div>
              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Outbound</span>
                  <span className="font-bold text-slate-900">{out.time}</span> · {out.date} · {flight.originAirport} → {flight.destinationAirport}
                </p>
                {roundTrip && back.date && (
                  <p>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Return</span>
                    <span className="font-bold text-slate-900">{back.time}</span> · {back.date} · {flight.destinationAirport} → {flight.originAirport}
                  </p>
                )}
              </div>
              <p className={flight.stops === 0 ? "text-sm font-semibold text-emerald-700" : "text-sm text-slate-600"}>{stopsLabel(flight.stops)}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3 border-t border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-col sm:items-stretch sm:justify-center sm:border-l sm:border-t-0">
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{formatMoney(flight.price * travelers, flight.currency)}</p>
                <p className="text-xs text-slate-500">
                  {travelers > 1 ? `${formatMoney(flight.price, flight.currency)} per person · ` : ""}
                  {roundTrip ? "return" : "one way"}
                </p>
              </div>
              {link && (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"
                >
                  Book on Aviasales ↗
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
