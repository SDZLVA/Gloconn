"use client";

import { AirlineLogo } from "@/components/results/AirlineLogo";
import type { LiveFlightsFilters } from "@/features/liveFlights/types";
import { buildExactAviasalesLink } from "@/lib/affiliate/exactFlightLinks";
import { formatMoney } from "@/lib/money";
import type { Flight } from "@/types/models";
import type { FlightLeg } from "@/types/models/flight";

const stopsLabel = (n: number) => (n === 0 ? "Direct" : n === 1 ? "1 stop" : `${n} stops`);
function when(value?: string): { date: string; time: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2})/.exec(value ?? "");
  if (!m) return { date: "", time: "" };
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return { date: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }), time: m[4] };
}

const hm = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? ` ${String(m % 60).padStart(2, "0")}m` : ""}`;
const dayShift = (from?: string, to?: string) => {
  if (!from || !to) return "";
  const d = Math.round((Date.parse(`${to.slice(0, 10)}T00:00:00Z`) - Date.parse(`${from.slice(0, 10)}T00:00:00Z`)) / 86_400_000);
  return d > 0 ? `+${d}` : "";
};

/**
 * Duffel branch: one direction of the trip as a timeline — departure, total
 * time, stops with their waiting time, arrival (+1 when it lands the next day).
 */
function LegRow({ label, leg }: { label: string; leg: FlightLeg }) {
  const dep = when(leg.departureTime);
  const arr = when(leg.arrivalTime);
  const from = leg.airports[0];
  const to = leg.airports[leg.airports.length - 1];
  const stops = leg.airports.length - 2;
  const layovers = leg.layovers ?? [];
  const longest = layovers.reduce((m, l) => Math.max(m, l.minutes), 0);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label} · {dep.date}
      </p>
      <div className="mt-1 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <p className="text-right">
          <span className="block text-lg font-extrabold leading-tight text-slate-900">{dep.time}</span>
          <span className="text-xs font-semibold text-slate-500">{from}</span>
        </p>
        <div className="text-center text-xs">
          <p className="font-semibold text-slate-700">{hm(leg.durationMinutes)}</p>
          <div className="relative my-1 h-px bg-slate-300" aria-hidden="true">
            {Array.from({ length: Math.max(0, stops) }, (_, i) => (
              <span key={i} className="absolute -top-1 h-2 w-2 rounded-full border border-white bg-red-500" style={{ left: `${((i + 1) / (stops + 1)) * 100}%` }} />
            ))}
          </div>
          <p className={stops === 0 ? "font-semibold text-emerald-700" : "text-slate-600"}>
            {stops === 0
              ? "Direct"
              : `${stops} stop${stops > 1 ? "s" : ""} · ${layovers.length > 0 ? layovers.map((l) => `${l.airport} ${hm(l.minutes)}`).join(", ") : leg.airports.slice(1, -1).join(", ")}`}
          </p>
          {longest >= 360 && <p className="font-semibold text-amber-700">Long wait</p>}
          {layovers.some((l) => l.minutes < 60) && <p className="font-semibold text-amber-700">Short connection</p>}
        </div>
        <p>
          <span className="block text-lg font-extrabold leading-tight text-slate-900">
            {arr.time || "—"}
            {dayShift(leg.departureTime, leg.arrivalTime) && <sup className="ml-0.5 text-[10px] font-bold text-red-600">{dayShift(leg.departureTime, leg.arrivalTime)}</sup>}
          </span>
          <span className="text-xs font-semibold text-slate-500">{to}</span>
        </p>
      </div>
    </div>
  );
}

/** Duffel branch: small facts under the timeline — bags, fare, rules, CO2. */
function FlightFacts({ flight }: { flight: Flight }) {
  const facts: { text: string; good?: boolean }[] = [];
  if (flight.carryOnBags != null) facts.push(flight.carryOnBags > 0 ? { text: "Cabin bag included", good: true } : { text: "Personal item only" });
  if (flight.checkedBags != null) facts.push(flight.checkedBags > 0 ? { text: `${flight.checkedBags} checked bag included`, good: true } : { text: "No checked bag" });
  const brand = flight.outboundLeg?.fareBrand;
  if (brand) facts.push({ text: `Fare: ${brand}` });
  if (flight.refundable != null) facts.push(flight.refundable ? { text: "Refundable", good: true } : { text: "Non-refundable" });
  if (flight.changeable != null) facts.push(flight.changeable ? { text: "Changes allowed", good: true } : { text: "No changes" });
  if (flight.co2Kg != null) facts.push({ text: `${Math.round(flight.co2Kg)} kg CO₂` });
  if (flight.outboundLeg?.flightNumbers?.length) facts.push({ text: flight.outboundLeg.flightNumbers.join(" · ") });
  if (facts.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {facts.map((f) => (
        <li key={f.text} className={f.good ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800" : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700"}>
          {f.good ? "✓ " : ""}
          {f.text}
        </li>
      ))}
    </ul>
  );
}

/** Milestone 45: Flights tab filters and sort, applied in the browser. */
export function filterDataFlights(flights: Flight[], filters: LiveFlightsFilters, travelers: number): Flight[] {
  const list = flights.filter((f) => {
    if (filters.maxStops !== null && f.stops > filters.maxStops) return false;
    if (filters.airlines.length > 0 && !filters.airlines.includes(f.airline)) return false;
    if (filters.maxPrice && f.price * travelers > filters.maxPrice) return false;
    // Only sources that say what bags are included can pass this filter.
    if (filters.baggageIncluded && f.checkedBags != null && f.checkedBags < 1) return false;
    return true;
  });
  if (filters.sort === "trip_duration") return [...list].sort((a, b) => a.durationMinutes + (a.returnDurationMinutes ?? 0) - (b.durationMinutes + (b.returnDurationMinutes ?? 0)) || a.price - b.price);
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
      <p className="text-xs text-slate-500">
        {flights.some((f) => f.source === "duffel") ? "Live prices straight from the airlines. Book here on Glooconn — the price is checked again before you pay." : (() => {
          const live = [...new Set(flights.map((f) => f.source).filter((x) => x === "google" || x === "skyscanner"))].map((x) =>
            x === "google" ? "Google Flights" : "Skyscanner",
          );
          const saved = flights.some((f) => !f.source || f.source === "travelpayouts");
          const parts = [
            live.length > 0 ? `live prices from ${live.join(" and ")} (updated every few hours)` : null,
            saved ? "recent prices found by other travellers" : null,
          ].filter(Boolean);
          const text = parts.join(", plus ");
          return `${text.charAt(0).toUpperCase()}${text.slice(1)}. The final price is confirmed on the booking site.`;
        })()}
      </p>
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
{flight.outboundLeg ? (
                <div className="space-y-3">
                  <LegRow label="Outbound" leg={flight.outboundLeg} />
                  {roundTrip && flight.returnLeg && <LegRow label="Return" leg={flight.returnLeg} />}
                  <FlightFacts flight={flight} />
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
            <div className="flex flex-row items-center justify-between gap-3 border-t border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-col sm:items-stretch sm:justify-center sm:border-l sm:border-t-0">
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{formatMoney(flight.price * travelers, flight.currency)}</p>
                <p className="text-xs text-slate-500">
                  {travelers > 1 ? `${formatMoney(flight.price, flight.currency)} per person · ` : ""}
                  {roundTrip ? "return" : "one way"}
                </p>
              </div>
              {/* Milestone 52: the primary button opens the exact flight where we can —
                  Skyscanner's own itinerary page, or the exact Aviasales ticket. */}
              {/* Duffel branch: book on Glooconn. */}
              {flight.source === "duffel" && flight.offerId ? (
                <a
                  href={`/book/flight/${encodeURIComponent(flight.offerId)}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"
                >
                  Book on Glooconn
                </a>
              ) : (flight.source === "skyscanner" || (flight.source === "google" && flight.sourceExact)) && flight.sourceUrl ? (
                <>
                  <a
                    href={flight.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"
                  >
                    {flight.source === "google" ? "Book this flight on Google Flights ↗" : "Book on Skyscanner ↗"}
                  </a>
                  {link && (
                    <a href={link.href} target="_blank" rel="noopener noreferrer nofollow" className="text-center text-xs font-semibold text-brand-700 hover:text-brand-900">
                      Compare on Aviasales ↗
                    </a>
                  )}
                </>
              ) : (
                <>
                  {link && (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"
                    >
                      {flight.bookingUrl?.includes("?t=") ? "Book this flight on Aviasales ↗" : "Book on Aviasales ↗"}
                    </a>
                  )}
                  {flight.sourceUrl && (
                    <a href={flight.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-center text-xs font-semibold text-brand-700 hover:text-brand-900">
                      See on Google Flights ↗
                    </a>
                  )}
                </>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
