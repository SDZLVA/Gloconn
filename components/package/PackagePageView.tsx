"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { SaveTripButton } from "@/components/trips/SaveTripButton";
import { formatShortDate } from "@/lib/calendar/dates";
import { loadPackageView, type PackageFlightOption, type PackageViewPayload } from "@/lib/packages/viewPayload";
import {
  formatFlightDurationLabel,
  formatPackageNightsLabel,
  formatPackageStopsLabel,
} from "@/lib/results/packagesUi";
import { parseSearchRequestFromParams } from "@/lib/search/request";
import { cn } from "@/lib/utils";
import { distanceLabel } from "@/features/liveHotels/propertyKind";

const clock = (value?: string) => {
  const m = /(\d{1,2}):(\d{2})/.exec(value ?? "");
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : "";
};
const city = (label?: string) => (label ?? "").split(",")[0]?.trim();
const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
};
const scoreWord = (s: number) => (s >= 9 ? "Superb" : s >= 8.5 ? "Excellent" : s >= 8 ? "Very good" : s >= 7 ? "Good" : "Pleasant");

/**
 * Milestone 33 — package page from the redesign: back link, badge, title,
 * pictures, "Total from" with "Continue to booking" (M58: opens /packages/{id}/book), "Why this
 * package?", quick facts, flight details, hotel details and the booking
 * options (flight partners; live hotels for the same stay).
 */
export function PackagePageView({ packageId }: { packageId: string }) {
  const [payload, setPayload] = useState<PackageViewPayload | null | "loading">("loading");
  const [copied, setCopied] = useState(false);
  // Milestone 47: the flight the traveller picked (null = the package's own flight).
  const [pickedFlightId, setPickedFlightId] = useState<string | null>(null);
  useEffect(() => setPayload(loadPackageView(packageId)), [packageId]);

  if (payload === "loading") {
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-100 motion-reduce:animate-none" aria-label="Loading package" />;
  }
  if (!payload) {
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

  const { package: pkg, explanation, resultsUrl, tripType } = payload;
  const { hotel } = pkg;
  const options: PackageFlightOption[] =
    payload.flightOptions && payload.flightOptions.length > 0
      ? payload.flightOptions
      : [{ flight: pkg.flight, links: payload.flightLinks }];
  const picked = options.find((o) => o.flight.id === (pickedFlightId ?? pkg.flight.id)) ?? options[0];
  const flight = picked.flight;
  const cheapestFlight = Math.min(...options.map((o) => o.flight.price));
  const query = resultsUrl.split("?")[1] ?? "";
  const search = parseSearchRequestFromParams(new URLSearchParams(query));
  const from = city(search.origin);
  const to = city(search.destination) || "your trip";
  const people = (search.travelers?.adults ?? 1) + (search.travelers?.children ?? 0) + (search.travelers?.infants ?? 0);
  // Exact totals: flight price per person × travellers (infants fly on a lap) + the hotel for the stay.
  const flyers = pkg.breakdown?.travelers ?? Math.max(1, people - (search.travelers?.infants ?? 0));
  const flightTotal = Math.round(flight.price * flyers * 100) / 100;
  const hotelTotal = pkg.breakdown?.hotelTotal ?? hotel.price;
  const total = pkg.breakdown ? Math.round((flightTotal + hotelTotal) * 100) / 100 : pkg.totalPrice;
  const dates = [search.departureDate, tripType === "one-way" ? null : search.returnDate]
    .filter((v): v is string => Boolean(v))
    .map(formatShortDate)
    .join(" – ");
  const score = hotel.rating > 0 ? (hotel.rating <= 5 ? hotel.rating * 2 : hotel.rating) : 0;
  const originCode = flight.originAirport ?? payload.originIata ?? "";
  const destCode = flight.destinationAirport ?? payload.destinationIata ?? "";
  const stops = formatPackageStopsLabel(flight.stops);
  const duration = formatFlightDurationLabel(flight.durationMinutes);
  const why =
    explanation?.reason?.trim() ||
    [stops, hotel.stars > 0 ? `${hotel.stars}★ hotel` : null, score ? `${scoreWord(score).toLowerCase()} reviews` : null].filter(Boolean).join(" · ");

  const facts = [
    { icon: "✈", title: stops, text: duration },
    { icon: "📍", title: hotel.location || to, text: distanceLabel(hotel.distanceKm) ?? "Hotel area" },
    { icon: "★", title: hotel.stars > 0 ? `${hotel.stars}-star hotel` : "Unrated hotel", text: `${formatPackageNightsLabel(pkg.nights)}` },
    { icon: "€", title: "Total from", text: money(total, pkg.currency) },
  ];

  async function share() {
    const url = window.location.origin + resultsUrl;
    try {
      if (navigator.share) await navigator.share({ title: `${from} → ${to} on Glooconn`, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="space-y-6">
      <Link href={resultsUrl} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900">
        ← Back to results
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {explanation && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">✓ {explanation.label}</span>
          )}
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
            {from ? `${from} → ${to}` : to} Package
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {[dates, `${people} ${people === 1 ? "traveler" : "travelers"}`, formatPackageNightsLabel(pkg.nights)].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SaveTripButton search={search} />
          <button type="button" onClick={share} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            {copied ? "Link copied" : "Share"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 via-brand-600 to-sky-400 p-4">
              <svg viewBox="0 0 120 80" className="absolute inset-x-0 bottom-0 h-3/4 w-full text-white/25" fill="currentColor" aria-hidden="true">
                <path d="M0 80V52h10V38h8v14h8V30h12v22h6V20l8-8 8 8v32h6V36h10v16h8V44h10v36Z" />
              </svg>
              <span className="relative text-lg font-bold text-white drop-shadow">{to}</span>
            </div>
            <div className="relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-500 to-amber-300 p-4">
              {hotel.photo ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hotel.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" aria-hidden="true" />
                </>
              ) : (
                <svg viewBox="0 0 24 24" className="absolute right-4 top-4 h-10 w-10 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M3 20V9l9-5 9 5v11M9 20v-6h6v6" />
                </svg>
              )}
              <span className="relative text-lg font-bold text-white drop-shadow">{hotel.name}</span>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {facts.map((fact) => (
              <li key={fact.title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700" aria-hidden="true">
                  {fact.icon}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">{fact.title}</span>
                  <span className="block truncate text-xs text-slate-500">{fact.text}</span>
                </span>
              </li>
            ))}
          </ul>

          {options.length > 1 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="choose-flight">
              <h2 id="choose-flight" className="text-lg font-bold text-slate-900">Choose your flight</h2>
              <p className="mt-1 text-sm text-slate-600">Pick a flight and the total updates. Prices are for all {flyers} {flyers === 1 ? "traveler" : "travelers"}.</p>
              <ul className="mt-3 space-y-2">
                {options.map((option) => {
                  const f = option.flight;
                  const active = f.id === flight.id;
                  const diff = Math.round((f.price - cheapestFlight) * flyers);
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => setPickedFlightId(f.id)}
                        aria-pressed={active}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                          active ? "border-brand-700 bg-brand-50 ring-1 ring-brand-700" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                        )}
                      >
                        <span
                          className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", active ? "border-brand-700" : "border-slate-300")}
                          aria-hidden="true"
                        >
                          {active && <span className="h-2.5 w-2.5 rounded-full bg-brand-700" />}
                        </span>
                        <AirlineLogo code={f.airlineCode} name={f.airline} className="h-8 w-8" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-900">{f.airline}</span>
                          <span className="block truncate text-xs text-slate-600">
                            {[
                              `Out ${clock(f.departureTime)}`,
                              tripType === "round-trip" && f.returnDepartureTime ? `back ${clock(f.returnDepartureTime)}` : null,
                              formatPackageStopsLabel(f.stops),
                              formatFlightDurationLabel(f.durationMinutes),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-sm font-extrabold text-slate-900">{money(f.price * flyers, pkg.currency)}</span>
                          <span className="block text-[11px] text-slate-500">{diff > 0 ? `+${money(diff, pkg.currency)}` : "Cheapest"}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Flight details</h2>
              <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Outbound</p>
              <div className="mt-3 flex items-center gap-3">
                <AirlineLogo code={flight.airlineCode} name={flight.airline} className="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{flight.airline}</p>
                  <div className="flex items-center gap-3 text-slate-900">
                    <span className="text-lg font-extrabold">{clock(flight.departureTime)} <span className="text-xs font-semibold text-slate-500">{originCode}</span></span>
                    <span className="text-center text-xs text-slate-500">
                      → <span className="block">{duration}</span>
                    </span>
                    <span className="text-lg font-extrabold">{clock(flight.arrivalTime)} <span className="text-xs font-semibold text-slate-500">{destCode}</span></span>
                  </div>
                  <p className={cn("text-xs font-semibold", flight.stops === 0 ? "text-emerald-700" : "text-slate-600")}>{stops}</p>
                </div>
              </div>
              {tripType === "round-trip" && flight.returnDepartureTime && (
                <>
                  <p className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Return</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Departs {clock(flight.returnDepartureTime)}
                    {typeof flight.returnStops === "number" ? ` · ${formatPackageStopsLabel(flight.returnStops)}` : ""}
                    {flight.returnDurationMinutes ? ` · ${formatFlightDurationLabel(flight.returnDurationMinutes)}` : ""}
                  </p>
                </>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Hotel details{" "}
                <span className="text-sm font-normal text-slate-500">
                  {formatPackageNightsLabel(pkg.nights)} · {pkg.breakdown?.rooms ?? 1} {(pkg.breakdown?.rooms ?? 1) === 1 ? "room" : "rooms"}
                </span>
              </h2>
              <p className="mt-3 font-semibold text-slate-900">{hotel.name}</p>
              {hotel.stars > 0 && <p className="text-amber-500">{"★".repeat(Math.round(hotel.stars))}</p>}
              {score > 0 && (
                <p className="mt-1 flex items-center gap-1.5 text-sm">
                  <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">{score.toFixed(1)}</span>
                  <span className="font-semibold text-emerald-700">{scoreWord(score)}</span>
                </p>
              )}
              <p className="mt-1 text-sm text-slate-600">{[hotel.location, ...hotel.amenities.slice(0, 3)].filter(Boolean).join(" · ")}</p>
              {hotel.isSample && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">This hotel is an example to show the package price. Pick a real stay below.</p>}
            </section>
          </div>

        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Total from</p>
            <p className="mt-1 text-4xl font-extrabold text-slate-900">{money(total, pkg.currency)}</p>
            <p className="text-xs text-slate-500">
              {flyers} {flyers === 1 ? "traveler" : "travelers"} · {formatPackageNightsLabel(pkg.nights)}
            </p>
            <dl className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-700">
              <div className="flex justify-between gap-3">
                <dt>Hotel ({formatPackageNightsLabel(pkg.nights)})</dt>
                <dd className="font-semibold">{money(hotelTotal, pkg.currency)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>
                  Flight from ({money(flight.price, pkg.currency)} × {flyers})
                </dt>
                <dd className="font-semibold">{money(flightTotal, pkg.currency)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] leading-snug text-slate-500">
              {flight.source === "google" || flight.source === "skyscanner"
                ? `Flight prices are live from ${flight.source === "google" ? "Google Flights" : "Skyscanner"} when you searched (updated every few hours).`
                : "Flight prices are recent fares found by other travellers."}{" "}
              The final price is confirmed on the booking site.
            </p>
            <Link
              href={`/packages/${encodeURIComponent(pkg.id)}/book?flight=${encodeURIComponent(flight.id)}`}
              className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white shadow-md shadow-brand-700/20 hover:bg-brand-800"
            >
              Continue to booking
            </Link>
            <p className="mt-2 text-center text-[11px] text-slate-500">You&apos;ll book directly with our partner sites.</p>
          </div>
          {why && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <p className="text-sm font-bold text-emerald-900">Why this package?</p>
              <p className="mt-1 text-sm text-emerald-900/90">{why}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
