"use client";

import { useEffect, useState } from "react";
import { twelveGoDateLink, type TwelveGoMode, type TwelveGoOption, type TwelveGoRoute } from "@/features/twelveGo/parse";
import { buildOmioResultsLink, type OmioTravelMode } from "@/lib/affiliate/omio";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

const ICON: Record<TwelveGoMode, string> = { train: "🚆", bus: "🚌", avia: "✈", ferry: "⛴", van: "🚐", charter: "🚕", other: "🧭" };
const NAME: Record<TwelveGoMode, string> = { train: "Train", bus: "Bus", avia: "Flight", ferry: "Ferry", van: "Van", charter: "Taxi / private car", other: "Transport" };

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: amount < 100 ? 2 : 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};
const dur = (m: number | null) => (m === null ? "" : m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 ? ` ${String(m % 60).padStart(2, "0")}m` : ""}`);

function priceText(o: TwelveGoOption, currency: string) {
  if (o.priceMin === null) return "Price on 12Go";
  if (o.priceMax !== null && o.priceMax > o.priceMin) return `${money(o.priceMin, currency)} – ${money(o.priceMax, currency)}`;
  return `from ${money(o.priceMin, currency)}`;
}

type Picked = { option: number; className: string; time: string | null };

/** The same kind of transport on Omio (Milestone 55b: 12Go first, Omio as the alternative). */
const OMIO_MODE: Partial<Record<TwelveGoMode, OmioTravelMode>> = { train: "TRAIN", bus: "BUS", van: "BUS", avia: "FLIGHT", ferry: "FERRY" };

/**
 * Milestone 55 — trains, buses, ferries, vans and flights from 12Go's partner
 * timetable. The traveller picks a way to travel, a class and a departure time
 * here; the last step opens 12Go for that route and date to book.
 */
export function TwelveGoOptions({
  from,
  to,
  date,
  returnDate = null,
  currency,
  maxPrice = null,
  onLoaded,
}: {
  from: string;
  to: string;
  date: string;
  returnDate?: string | null;
  currency: string;
  /** Milestone 58: the search budget = max ticket price per person (null = any). */
  maxPrice?: number | null;
  /** Tells the page whether 12Go had results (Omio is shown first when not). */
  onLoaded?: (hasResults: boolean) => void;
}) {
  const [state, setState] = useState<{ status: "loading" | "done"; route: TwelveGoRoute | null }>({ status: "loading", route: null });
  const [picked, setPicked] = useState<Picked | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", route: null });
    setPicked(null);
    const q = new URLSearchParams({ from, to, currency });
    fetch(`/api/transport/12go?${q.toString()}`)
      .then((r) => r.json() as Promise<{ ok?: boolean; routes?: TwelveGoRoute[] }>)
      .catch(() => ({ ok: false, routes: [] as TwelveGoRoute[] }))
      .then((body) => {
        if (cancelled) return;
        const routes = body.ok && Array.isArray(body.routes) ? body.routes : [];
        setState({ status: "done", route: routes[0] ?? null });
        onLoaded?.(Boolean(routes[0]));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, currency]);

  if (state.status === "loading") {
    return (
      <div className="space-y-3" aria-label="Loading trains and buses">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" />
        ))}
      </div>
    );
  }
  const route = state.route;
  if (!route) return null;
  // Milestone 58: options within the budget first; the rest stay visible but marked.
  const overBudget = (o: TwelveGoOption) => maxPrice !== null && o.priceMin !== null && o.priceMin > maxPrice;
  const options = [...route.options].sort(
    (a, b) => Number(overBudget(a)) - Number(overBudget(b)) || (a.priceMin ?? Infinity) - (b.priceMin ?? Infinity),
  );
  const withinBudget = options.filter((o) => !overBudget(o)).length;
  const chosen = picked ? options[picked.option] : null;

  return (
    <section className="space-y-4" aria-labelledby="twelvego-heading">
      <div>
        <h2 id="twelvego-heading" className="text-xl font-bold text-slate-900">
          Ways to travel {route.name.replace(" - ", " → ")}
        </h2>
        <p className="text-sm text-slate-600">
          Timetable and price ranges from 12Go. Pick a way to travel and a departure — the exact price for your date is confirmed on 12Go.
        </p>
        {maxPrice !== null && (
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {withinBudget === 0
              ? `Nothing on this route starts under your ${money(maxPrice, currency)} budget per person — the closest options are below.`
              : `${withinBudget} of ${options.length} ${options.length === 1 ? "way" : "ways"} to travel start within your ${money(maxPrice, currency)} budget per person.`}
          </p>
        )}
      </div>
      <ul className="space-y-3">
        {options.map((o, i) => {
          const isOpen = open === i;
          return (
            <li key={o.link} className={cn("rounded-2xl border bg-white shadow-sm", picked?.option === i ? "border-brand-700 ring-1 ring-brand-700" : "border-slate-200")}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className={cn("flex w-full items-center gap-4 p-4 text-left sm:p-5", focusRing)}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-2xl" aria-hidden="true">
                  {ICON[o.mode]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900">{NAME[o.mode]}</span>
                  <span className="block text-sm text-slate-600">
                    {[o.durationMin !== null ? (o.durationMax && o.durationMax !== o.durationMin ? `${dur(o.durationMin)} – ${dur(o.durationMax)}` : dur(o.durationMin)) : null, `${o.classes.length} ${o.classes.length === 1 ? "option" : "options"}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-lg font-extrabold text-slate-900">{priceText(o, currency)}</span>
                  {overBudget(o) && <span className="block text-xs font-semibold text-amber-700">Above your budget</span>}
                  <span className="block text-xs font-semibold text-brand-700">{isOpen ? "Hide times ▴" : "Choose a time ▾"}</span>
                </span>
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-slate-100 p-4 sm:p-5">
                  {o.classes.length === 0 && <p className="text-sm text-slate-600">Times and classes are shown on 12Go.</p>}
                  {o.classes.map((c) => (
                    <div key={c.name}>
                      <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {(c.departures.length > 0 ? c.departures : [null]).map((t) => {
                          const active = picked?.option === i && picked.className === c.name && picked.time === t;
                          return (
                            <button
                              key={t ?? "any"}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setPicked({ option: i, className: c.name, time: t })}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-sm font-semibold",
                                active ? "border-brand-700 bg-brand-700 text-white" : "border-slate-200 text-slate-800 hover:border-brand-700",
                                focusRing,
                              )}
                            >
                              {t ?? "Choose"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {chosen && picked && (
        <div className="sticky bottom-20 z-10 flex flex-col gap-3 rounded-2xl border border-brand-700 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between md:bottom-4">
          <p className="text-sm text-slate-800">
            <span className="font-bold">{NAME[chosen.mode]}</span> · {picked.className}
            {picked.time ? ` · departs ${picked.time}` : ""} · {priceText(chosen, currency)}
          </p>
          <a
            href={twelveGoDateLink(chosen.link, date)}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className={cn("inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800", focusRing)}
          >
            Continue to 12Go to book ↗
          </a>
          {OMIO_MODE[chosen.mode] && (() => {
            const omio = buildOmioResultsLink({ from, to, departureDate: date, returnDate, travelMode: OMIO_MODE[chosen.mode], currency });
            return omio ? (
              <a href={omio} target="_blank" rel="noopener noreferrer nofollow sponsored" className="text-center text-xs font-semibold text-brand-700 hover:text-brand-900 sm:text-right">
                or check {NAME[chosen.mode].toLowerCase()}s on Omio ↗
              </a>
            ) : null;
          })()}
        </div>
      )}
      <p className="text-xs text-slate-500">Powered by 12Go. Glooconn may earn a commission.</p>
    </section>
  );
}
