"use client";

import { useEffect, useMemo, useState } from "react";
import { TripHeader } from "@/components/results/TripHeader";
import { buildOmioResultsLink, type OmioTravelMode } from "@/lib/affiliate/omio";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { Flight } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchFormState } from "@/types/search-form";

type Props = {
  search: Partial<SearchRequest>;
  initialForm: SearchFormState;
  /** City or airport codes for the flight price (null when unknown). */
  originCode: string | null;
  destinationCode: string | null;
};

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
};
const hours = (minutes: number) => (minutes > 0 ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m` : "");

const MODES: { mode: OmioTravelMode; title: string; icon: string; text: string }[] = [
  { mode: "TRAIN", title: "Train", icon: "🚆", text: "City centre to city centre. Live times and prices on Omio." },
  { mode: "BUS", title: "Bus", icon: "🚌", text: "Often the cheapest way. Live times and prices on Omio." },
  { mode: "FLIGHT", title: "Flight", icon: "✈", text: "Fastest for long distances." },
];

/**
 * Milestone 54 — Mixed Transport results: one card per way to travel. Each
 * opens Omio's own search results for the route and dates (tracked link).
 * Flight cards also show Glooconn's cheapest flight price for the trip.
 * Omio gives affiliates no price API, so train and bus prices are shown on Omio.
 */
export function TransportResultsPage({ search, initialForm, originCode, destinationCode }: Props) {
  const currency = search.budget?.currency ?? "EUR";
  const from = search.origin ?? "";
  const to = search.destination ?? "";
  const departureDate = search.departureDate ?? "";
  const returnDate = search.tripType === "one-way" ? null : (search.returnDate ?? null);
  const travelers = Math.max(1, (search.travelers?.adults ?? 1) + (search.travelers?.children ?? 0));

  const link = (mode: OmioTravelMode | null) => buildOmioResultsLink({ from, to, departureDate, returnDate, travelMode: mode, currency });

  const [flight, setFlight] = useState<{ status: "loading" | "done"; cheapest: Flight | null }>({ status: "loading", cheapest: null });
  const flightQuery = useMemo(() => {
    if (!originCode || !destinationCode || !departureDate) return null;
    return new URLSearchParams({
      origin: originCode,
      destination: destinationCode,
      departureDate,
      returnDate: returnDate ?? "",
      adults: String(search.travelers?.adults ?? 1),
      children: String(search.travelers?.children ?? 0),
      infants: String(search.travelers?.infants ?? 0),
      currency,
    }).toString();
  }, [originCode, destinationCode, departureDate, returnDate, search.travelers, currency]);

  useEffect(() => {
    if (!flightQuery) {
      setFlight({ status: "done", cheapest: null });
      return;
    }
    let cancelled = false;
    fetch(`/api/flights/data?${flightQuery}`)
      .then((r) => r.json() as Promise<{ ok?: boolean; flights?: Flight[] }>)
      .catch(() => ({ ok: false, flights: [] as Flight[] }))
      .then((body) => {
        if (cancelled) return;
        const flights = body.ok && Array.isArray(body.flights) ? body.flights : [];
        const cheapest = flights.reduce<Flight | null>((best, f) => (!best || f.price < best.price ? f : best), null);
        setFlight({ status: "done", cheapest });
      });
    return () => {
      cancelled = true;
    };
  }, [flightQuery]);

  const all = link(null);
  const flightsHref = `/search/results?${new URLSearchParams({
    ...(search.origin ? { origin: search.origin } : {}),
    ...(search.originId ? { originId: search.originId } : {}),
    ...(search.destination ? { destination: search.destination } : {}),
    ...(search.destinationId ? { destinationId: search.destinationId } : {}),
    tripType: search.tripType ?? "round-trip",
    departureDate,
    ...(returnDate ? { returnDate } : {}),
    adults: String(search.travelers?.adults ?? 1),
    children: String(search.travelers?.children ?? 0),
    infants: String(search.travelers?.infants ?? 0),
    rooms: "1",
    travelStyle: search.travelStyle ?? "standard",
    productTypes: "flights",
  }).toString()}`;

  return (
    <div className="space-y-6 sm:space-y-8">
      <TripHeader mode="transport" search={search} initialForm={initialForm} />
      {!all ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          Choose where you leave from, where you&apos;re going and a date in the search bar above.
        </p>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            Ways to travel from {from.split(",")[0]} to {to.split(",")[0]}. Pick one to see live times and prices on Omio, where you book.
          </p>
          <ul className="grid gap-4 md:grid-cols-3">
            {MODES.map((m) => {
              const href = link(m.mode);
              const price = m.mode === "FLIGHT" ? flight.cheapest : null;
              return (
                <li key={m.mode} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl" aria-hidden="true">
                      {m.icon}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">{m.title}</h2>
                  </div>
                  <p className="mt-3 flex-1 text-sm text-slate-600">{m.text}</p>
                  {m.mode === "FLIGHT" && (
                    <p className="mt-3 text-sm text-slate-700" aria-live="polite">
                      {flight.status === "loading" ? (
                        <span className="inline-block h-4 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                      ) : price ? (
                        <>
                          From <span className="text-xl font-extrabold text-slate-900">{money(price.price * travelers, price.currency)}</span>
                          {travelers > 1 ? ` for ${travelers}` : ""}
                          {price.durationMinutes ? ` · ${hours(price.durationMinutes)}` : ""} · {price.airline}
                        </>
                      ) : (
                        "No flight price found for these dates."
                      )}
                    </p>
                  )}
                  <div className="mt-4 flex flex-col gap-2">
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className={cn(
                          "inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800",
                          focusRing,
                        )}
                      >
                        See {m.title.toLowerCase()}s on Omio ↗
                      </a>
                    )}
                    {m.mode === "FLIGHT" && price && (
                      <a href={flightsHref} className="text-center text-xs font-semibold text-brand-700 hover:text-brand-900">
                        Compare all flights on Glooconn
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <a
            href={all}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className={cn(
              "flex min-h-12 w-full items-center justify-center rounded-xl border border-brand-700 px-4 text-sm font-bold text-brand-700 hover:bg-brand-50 sm:w-auto sm:px-8",
              focusRing,
            )}
          >
            Compare every option on Omio ↗
          </a>
        </>
      )}
    </div>
  );
}
