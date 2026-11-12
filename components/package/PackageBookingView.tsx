"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { PartnerLinks } from "@/components/results/PartnerLinks";
import { hotelSiteName } from "@/features/liveHotels/agoda/map";
import { distanceLabel } from "@/features/liveHotels/propertyKind";
import { formatShortDate } from "@/lib/calendar/dates";
import { loadPackageView, type PackageFlightOption, type PackageViewPayload } from "@/lib/packages/viewPayload";
import { formatFlightDurationLabel, formatPackageNightsLabel, formatPackageStopsLabel } from "@/lib/results/packagesUi";
import { parseSearchRequestFromParams } from "@/lib/search/request";

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

/**
 * Milestone 58 — "Continue to booking" page for a package: every way to book
 * the flight and the hotel, plus a short note that Glooconn is a search
 * engine (you book and pay on the partner sites, for now).
 */
export function PackageBookingView({ packageId, flightId }: { packageId: string; flightId: string | null }) {
  const [payload, setPayload] = useState<PackageViewPayload | null | "loading">("loading");
  useEffect(() => setPayload(loadPackageView(packageId)), [packageId]);

  if (payload === "loading") {
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-100 motion-reduce:animate-none" aria-label="Loading booking options" />;
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

  const { package: pkg, resultsUrl, tripType } = payload;
  const { hotel } = pkg;
  const options: PackageFlightOption[] =
    payload.flightOptions && payload.flightOptions.length > 0 ? payload.flightOptions : [{ flight: pkg.flight, links: payload.flightLinks }];
  const picked = options.find((o) => o.flight.id === (flightId ?? pkg.flight.id)) ?? options[0];
  const flight = picked.flight;
  const flightLinks = picked.links.length > 0 || flight.id !== pkg.flight.id ? picked.links : payload.flightLinks;
  const query = resultsUrl.split("?")[1] ?? "";
  const search = parseSearchRequestFromParams(new URLSearchParams(query));
  const from = city(search.origin);
  const to = city(search.destination) || "your destination";
  const people = (search.travelers?.adults ?? 1) + (search.travelers?.children ?? 0) + (search.travelers?.infants ?? 0);
  const flyers = pkg.breakdown?.travelers ?? Math.max(1, people - (search.travelers?.infants ?? 0));
  const flightTotal = Math.round(flight.price * flyers * 100) / 100;
  const hotelTotal = pkg.breakdown?.hotelTotal ?? hotel.price;
  const total = pkg.breakdown ? Math.round((flightTotal + hotelTotal) * 100) / 100 : pkg.totalPrice;
  const dates = [search.departureDate, tripType === "one-way" ? null : search.returnDate]
    .filter((v): v is string => Boolean(v))
    .map(formatShortDate)
    .join(" – ");
  const flightsQuery = new URLSearchParams(query);
  flightsQuery.set("productTypes", "flights");
  const hotelsQuery = new URLSearchParams(query);
  hotelsQuery.set("productTypes", "hotels");
  const external = Boolean(hotel.detailsUrl && /^https?:\/\//.test(hotel.detailsUrl));
  const distance = distanceLabel(hotel.distanceKm);

  return (
    <div className="space-y-6">
      <Link href={`/packages/${encodeURIComponent(pkg.id)}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900">
        ← Back to package
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">Book your trip</h1>
        <p className="mt-1 text-sm text-slate-600">
          {[from ? `${from} → ${to}` : to, dates, `${people} ${people === 1 ? "traveler" : "travelers"}`, formatPackageNightsLabel(pkg.nights)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <section className="rounded-2xl border border-brand-100 bg-brand-50 p-5" aria-labelledby="how-booking-works">
        <h2 id="how-booking-works" className="text-base font-bold text-brand-900">
          How booking works
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">
          Glooconn is a travel package search engine. We compare flights and hotels and put together the best-value trips for you. To book,
          continue to the partner sites below: you pay them directly and they confirm your booking.
        </p>
        <p className="mt-2 text-sm font-semibold text-brand-800">Coming soon: book and pay for your whole trip in one place, on Glooconn.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="book-flight">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Step 1</p>
            <h2 id="book-flight" className="text-lg font-bold text-slate-900">
              Book your flight
            </h2>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <AirlineLogo code={flight.airlineCode} name={flight.airline} className="h-10 w-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{flight.airline}</p>
                <p className="truncate text-xs text-slate-600">
                  {[
                    `Out ${clock(flight.departureTime)}`,
                    tripType === "round-trip" && flight.returnDepartureTime ? `back ${clock(flight.returnDepartureTime)}` : null,
                    formatPackageStopsLabel(flight.stops),
                    formatFlightDurationLabel(flight.durationMinutes),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <p className="shrink-0 text-right">
                <span className="block text-base font-extrabold text-slate-900">{money(flightTotal, pkg.currency)}</span>
                <span className="block text-[11px] text-slate-500">
                  {money(flight.price, pkg.currency)} × {flyers}
                </span>
              </p>
            </div>
            <div className="mt-4">
              {flightLinks.length > 0 ? (
                <PartnerLinks links={flightLinks} context="package" />
              ) : (
                <p className="text-sm text-slate-600">This fare can be booked from the flights list.</p>
              )}
            </div>
            <Link href={`/search/results?${flightsQuery.toString()}`} className="mt-3 block text-sm font-semibold text-brand-700 hover:text-brand-900">
              Compare all flights for these dates →
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="book-hotel">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Step 2</p>
            <h2 id="book-hotel" className="text-lg font-bold text-slate-900">
              Book your stay
            </h2>
            <div className="mt-3 flex gap-3 rounded-xl bg-slate-50 p-3">
              {hotel.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hotel.photo} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{hotel.name}</p>
                {hotel.stars > 0 && <p className="text-sm leading-none text-amber-500">{"★".repeat(Math.round(hotel.stars))}</p>}
                <p className="truncate text-xs text-slate-600">{[hotel.location, distance].filter(Boolean).join(" · ")}</p>
                <p className="text-xs text-slate-600">
                  {formatPackageNightsLabel(pkg.nights)} · {pkg.breakdown?.rooms ?? 1} {(pkg.breakdown?.rooms ?? 1) === 1 ? "room" : "rooms"}
                </p>
              </div>
              <p className="shrink-0 text-base font-extrabold text-slate-900">{money(hotelTotal, pkg.currency)}</p>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              {hotel.detailsUrl && (
                <Link
                  href={hotel.detailsUrl}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800"
                >
                  {external ? `Book this hotel on ${hotelSiteName(hotel.detailsUrl)} ↗` : "See this hotel & book"}
                </Link>
              )}
              <Link
                href={`/search/results?${hotelsQuery.toString()}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-700 px-5 text-sm font-bold text-brand-700 hover:bg-brand-50"
              >
                Compare other stays in {to}
              </Link>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Total from</p>
            <p className="mt-1 text-4xl font-extrabold text-slate-900">{money(total, pkg.currency)}</p>
            <dl className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-700">
              <div className="flex justify-between gap-3">
                <dt>Flight ({flyers} {flyers === 1 ? "traveler" : "travelers"})</dt>
                <dd className="font-semibold">{money(flightTotal, pkg.currency)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Hotel ({formatPackageNightsLabel(pkg.nights)})</dt>
                <dd className="font-semibold">{money(hotelTotal, pkg.currency)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] leading-snug text-slate-500">
              Prices are set by each partner and confirmed when you book. They can change before you complete your booking.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
