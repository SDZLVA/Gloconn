"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PartnerLinks } from "@/components/results/PartnerLinks";
import { ResultDuration } from "@/components/results/ResultDuration";
import { ResultPrice } from "@/components/results/ResultPrice";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { FlightLinksResolver } from "@/lib/affiliate/exactFlightLinks";
import { formatFlightDateTime } from "@/lib/results/flightTime";
import { groupByDeparture, type DepartureOption } from "@/lib/results/flightPairs";
import { formatFlightRoute } from "@/lib/results/packagesUi";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { FlightResult } from "@/types/results";

type RoundTripFlightPickerProps = {
  /** Filtered and sorted round-trip tickets, each with a return leg. */
  flights: FlightResult[];
  originIata?: string | null;
  destinationIata?: string | null;
  getFlightLinks?: FlightLinksResolver;
};

const RECENT_PRICE_NOTE = "Recent price found by other travellers — it may have changed.";

function stopsLabel(stops: number | undefined): string | null {
  if (stops === undefined) return null;
  return stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`;
}

function Steps({ step }: { step: 1 | 2 | 3 }) {
  const items = ["Departure", "Return", "Book"];
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold" aria-label="Steps">
      {items.map((item, index) => {
        const number = index + 1;
        const state = number < step ? "done" : number === step ? "current" : "next";
        return (
          <li
            key={item}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "rounded-full px-3 py-1",
              state === "current" && "bg-brand-700 text-white",
              state === "done" && "bg-brand-50 text-brand-800",
              state === "next" && "bg-slate-100 text-slate-500",
            )}
          >
            {number}. {item}
          </li>
        );
      })}
    </ol>
  );
}

/** One leg in a compact row: time, duration, stops. */
function LegLine({
  label,
  time,
  minutes,
  stops,
  route,
}: {
  label: string;
  time: string;
  minutes?: number;
  stops?: number;
  route?: string | null;
}) {
  const stopText = stopsLabel(stops);
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
      <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="font-bold text-slate-900">{formatFlightDateTime(time)}</span>
      {route && <span className="font-semibold text-brand-700">{route}</span>}
      {minutes !== undefined && (
        <ResultDuration minutes={minutes} className="text-slate-500" />
      )}
      {stopText && <span className="font-medium text-brand-700">{stopText}</span>}
    </div>
  );
}

function routeOf(
  flight: FlightResult,
  originIata?: string | null,
  destinationIata?: string | null,
): string | null {
  return formatFlightRoute(
    flight.originAirport ?? originIata,
    flight.destinationAirport ?? destinationIata,
  );
}

/**
 * Round-trip flights in three steps (Milestone 20): choose a departure,
 * then one of the returns sold with it, then continue to the partner on
 * the exact pair. Aviasales sells each outbound + return as one ticket
 * with one price, so step 2 shows the full round-trip price of each pair.
 */
export function RoundTripFlightPicker({
  flights,
  originIata,
  destinationIata,
  getFlightLinks,
}: RoundTripFlightPickerProps) {
  const departures = useMemo(() => groupByDeparture(flights), [flights]);
  const [departureKey, setDepartureKey] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // A new search or filter can remove the chosen flights; start over then.
  const departure: DepartureOption | null =
    departures.find((option) => option.key === departureKey) ?? null;
  const ticket = departure?.returns.find((flight) => flight.id === ticketId) ?? null;
  const step: 1 | 2 | 3 = !departure ? 1 : !ticket ? 2 : 3;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const heading =
    step === 1
      ? "Choose your departure flight"
      : step === 2
        ? "Choose your return flight"
        : "Your flights";

  return (
    <section className="space-y-4" aria-labelledby="flight-picker-heading">
      <div className="space-y-2">
        <Steps step={step} />
        <h2
          id="flight-picker-heading"
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-24 text-lg font-bold tracking-tight text-slate-900 outline-none sm:text-xl"
        >
          {heading}
        </h2>
        {step === 1 && (
          <p className="text-sm text-slate-600">
            {departures.length} departure flight{departures.length === 1 ? "" : "s"}. Prices are
            for the whole round trip, per person — pick a departure to see its return flights.
          </p>
        )}
      </div>

      {departure && (
        <Card className="space-y-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Departure
              </p>
              <h3 className="text-base font-bold text-slate-900">{departure.outbound.airline}</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setDepartureKey(null);
                setTicketId(null);
              }}
              className={cn("rounded-md text-sm font-semibold text-brand-800 underline underline-offset-2", focusRing)}
            >
              Change departure
            </button>
          </div>
          <LegLine
            label="Out"
            time={departure.outbound.departureTime}
            minutes={departure.outbound.durationMinutes}
            stops={departure.outbound.stops}
            route={routeOf(departure.outbound, originIata, destinationIata)}
          />
          {ticket && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2 border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Return
                </p>
                <button
                  type="button"
                  onClick={() => setTicketId(null)}
                  className={cn("rounded-md text-sm font-semibold text-brand-800 underline underline-offset-2", focusRing)}
                >
                  Change return
                </button>
              </div>
              <LegLine
                label="Back"
                time={ticket.returnDepartureTime ?? ""}
                minutes={ticket.returnDurationMinutes}
                stops={ticket.returnStops}
              />
              <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">
                <p className="text-sm text-slate-500">Round-trip · per person</p>
                <ResultPrice price={ticket.price} currency={ticket.currency} suffix="per person" />
              </div>
              {ticket.priceIsRecent && (
                <p className="-mt-1 text-right text-xs text-slate-500">{RECENT_PRICE_NOTE}</p>
              )}
              <PartnerLinks links={getFlightLinks?.(ticket) ?? []} context="flight" />
            </>
          )}
        </Card>
      )}

      {step === 1 && (
        <ul className="flex flex-col gap-3" aria-label="Departure flights">
          {departures.map((option) => (
            <li key={option.key}>
              <Card hoverable className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{option.outbound.airline}</h3>
                  <LegLine
                    label="Out"
                    time={option.outbound.departureTime}
                    minutes={option.outbound.durationMinutes}
                    stops={option.outbound.stops}
                    route={routeOf(option.outbound, originIata, destinationIata)}
                  />
                  <p className="text-xs text-slate-500">
                    {option.returns.length} return flight{option.returns.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Round trip from</p>
                    <ResultPrice price={option.fromPrice} currency={option.outbound.currency} suffix="per person" />
                  </div>
                  <Button type="button" onClick={() => setDepartureKey(option.key)}>
                    Choose departure
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {step === 2 && departure && (
        <ul className="flex flex-col gap-3" aria-label="Return flights">
          {departure.returns.map((flight) => (
            <li key={flight.id}>
              <Card hoverable className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{flight.airline}</h3>
                  <LegLine
                    label="Back"
                    time={flight.returnDepartureTime ?? ""}
                    minutes={flight.returnDurationMinutes}
                    stops={flight.returnStops}
                  />
                </div>
                <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Round trip total</p>
                    <ResultPrice price={flight.price} currency={flight.currency} suffix="per person" />
                  </div>
                  <Button type="button" onClick={() => setTicketId(flight.id)}>
                    Choose return
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {step !== 3 && flights.some((flight) => flight.priceIsRecent) && (
        <p className="text-xs text-slate-500">{RECENT_PRICE_NOTE}</p>
      )}
    </section>
  );
}
