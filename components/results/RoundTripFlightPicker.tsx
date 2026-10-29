"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { FlightLegTimeline } from "@/components/results/FlightLegTimeline";
import { PartnerLinks } from "@/components/results/PartnerLinks";
import { ResultPrice } from "@/components/results/ResultPrice";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { FlightLinksResolver } from "@/lib/affiliate/exactFlightLinks";
import { groupByDeparture, type DepartureOption } from "@/lib/results/flightPairs";
import { airportChangeNotes, displayLegs, legAirlines } from "@/lib/results/flightLegs";
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

const changeLink = cn(
  "rounded-md text-sm font-semibold text-brand-800 underline underline-offset-2",
  focusRing,
);

/** "Ryanair" or "easyJet + Ryanair" with logos — every airline on the trip. */
function AirlineChips({ flight, withReturn }: { flight: FlightResult; withReturn: boolean }) {
  const legs = displayLegs(flight);
  const shown = withReturn ? legs : { outbound: legs.outbound };
  const codes = [shown.outbound, shown.back]
    .filter((leg): leg is NonNullable<typeof leg> => Boolean(leg?.airline))
    .map((leg) => ({ code: leg.airlineCode, name: leg.airline as string }));
  const unique = codes.filter((item, index) => codes.findIndex((c) => c.name === item.name) === index);
  const names = legAirlines(shown);
  if (unique.length === 0) return <span />;
  return (
    <p className="flex flex-wrap items-center gap-2">
      <span className="flex -space-x-2">
        {unique.map((item) => (
          <AirlineLogo key={item.name} code={item.code} name={item.name} className="h-8 w-8 rounded-lg ring-2 ring-white" />
        ))}
      </span>
      <span className="text-sm font-bold text-slate-900">{names.join(" + ")}</span>
    </p>
  );
}

/**
 * Boarding-pass style card: flights on the left, a perforated stub with
 * the price and the action on the right (below on phones).
 */
function TicketCard({
  children,
  caption,
  price,
  currency,
  detail,
  actionLabel,
  onAction,
}: {
  children: ReactNode;
  caption: string;
  price: number;
  currency: FlightResult["currency"];
  detail?: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Card hoverable className="flex flex-col overflow-hidden p-0 sm:flex-row">
      <div className="min-w-0 flex-1">{children}</div>
      <div className="relative flex shrink-0 items-center justify-between gap-3 border-t-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 sm:w-48 sm:flex-col sm:items-stretch sm:justify-center sm:border-l-2 sm:border-t-0 sm:text-center">
        {/* Punch holes where the stub tears off. */}
        <span aria-hidden="true" className="absolute -top-2 left-0 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-slate-100 sm:-left-2 sm:top-0 sm:block sm:-translate-y-1/2 sm:translate-x-0" />
        <span aria-hidden="true" className="absolute bottom-0 left-0 hidden h-4 w-4 rounded-full bg-slate-100 sm:-left-2 sm:block sm:translate-y-1/2" />
        <div>
          <p className="text-xs text-slate-500">{caption}</p>
          <ResultPrice price={price} currency={currency} suffix="per person" />
          {detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}
        </div>
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </Card>
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <AirlineChips flight={ticket ?? departure.outbound} withReturn={Boolean(ticket)} />
            <div className="flex gap-4">
              {ticket && (
                <button type="button" onClick={() => setTicketId(null)} className={changeLink}>
                  Change return
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setDepartureKey(null);
                  setTicketId(null);
                }}
                className={changeLink}
              >
                Change departure
              </button>
            </div>
          </div>
          {(() => {
            const legs = displayLegs(ticket ?? departure.outbound);
            const notes = ticket ? airportChangeNotes(legs) : [];
            return (
              <>
                <FlightLegTimeline leg={legs.outbound} label="Outbound" fallbackStops={departure.outbound.stops} />
                {ticket && legs.back && (
                  <FlightLegTimeline
                    leg={legs.back}
                    label="Return"
                    fallbackStops={ticket.returnStops}
                    notes={notes}
                  />
                )}
              </>
            );
          })()}
          {ticket && (
            <>
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
              <TicketCard
                caption="Round trip from"
                price={option.fromPrice}
                currency={option.outbound.currency}
                detail={`${option.returns.length} return flight${option.returns.length === 1 ? "" : "s"}`}
                actionLabel="Choose departure"
                onAction={() => setDepartureKey(option.key)}
              >
                <FlightLegTimeline
                  leg={displayLegs(option.outbound).outbound}
                  label="Outbound"
                  fallbackStops={option.outbound.stops}
                  className="border-0"
                />
              </TicketCard>
            </li>
          ))}
        </ul>
      )}

      {step === 2 && departure && (
        <ul className="flex flex-col gap-3" aria-label="Return flights">
          {departure.returns.map((flight) => {
            const legs = displayLegs(flight);
            return (
              <li key={flight.id}>
                <TicketCard
                  caption="Round trip total"
                  price={flight.price}
                  currency={flight.currency}
                  actionLabel="Choose return"
                  onAction={() => setTicketId(flight.id)}
                >
                  {legs.back && (
                    <FlightLegTimeline
                      leg={legs.back}
                      label="Return"
                      fallbackStops={flight.returnStops}
                      notes={airportChangeNotes(legs)}
                      className="border-0"
                    />
                  )}
                </TicketCard>
              </li>
            );
          })}
        </ul>
      )}

      {step !== 3 && flights.some((flight) => flight.priceIsRecent) && (
        <p className="text-xs text-slate-500">{RECENT_PRICE_NOTE}</p>
      )}
    </section>
  );
}
