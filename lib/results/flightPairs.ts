/**
 * Departure → return picking for round trips (Milestone 20).
 *
 * Aviasales prices a round trip as one ticket: an outbound flight plus a
 * return flight, one total price. The page lets the traveller pick in two
 * steps, as on aviasales.com and kiwi.com:
 *   1. a departure flight (tickets grouped by their outbound flight),
 *   2. one of the return flights sold together with it.
 * The chosen ticket then carries the exact partner links.
 *
 * Pure functions — no React — so the grouping is unit-tested.
 */

import type { TripType } from "@/types/models/search-request";
import type { FlightResult } from "@/types/results";

export type DepartureOption = {
  /** Identifies the outbound flight; stable across renders. */
  key: string;
  /** Ticket used to describe the outbound flight (first in sort order). */
  outbound: FlightResult;
  /** Tickets with this outbound flight, cheapest first. */
  returns: FlightResult[];
  /** Cheapest round-trip price with this departure. */
  fromPrice: number;
};

/** Same airline, airports, departure time, duration and stops = same flight. */
export function departureKey(flight: FlightResult): string {
  return [
    flight.airlineCode ?? flight.airline,
    flight.originAirport ?? "",
    flight.destinationAirport ?? "",
    flight.departureTime,
    flight.durationMinutes,
    flight.stops,
  ].join("|");
}

/**
 * True when results can be picked as departure + return: a round trip, and
 * every flight knows its return leg. Sources without return details (mock,
 * SerpAPI) keep the single list.
 */
export function canPickDepartureAndReturn(
  flights: readonly FlightResult[],
  tripType: TripType | undefined,
): boolean {
  return (
    tripType !== "one-way" &&
    flights.length > 0 &&
    flights.every((flight) => Boolean(flight.returnDepartureTime))
  );
}

/**
 * Groups tickets by departure flight. Departures keep the order of the
 * (already filtered and sorted) input, so the page's sort applies to step 1.
 */
export function groupByDeparture(flights: readonly FlightResult[]): DepartureOption[] {
  const groups = new Map<string, DepartureOption>();

  for (const flight of flights) {
    const key = departureKey(flight);
    const group = groups.get(key);
    if (group) {
      group.returns.push(flight);
      group.fromPrice = Math.min(group.fromPrice, flight.price);
    } else {
      groups.set(key, { key, outbound: flight, returns: [flight], fromPrice: flight.price });
    }
  }

  for (const group of groups.values()) {
    group.returns.sort(
      (a, b) =>
        a.price - b.price ||
        (a.returnDepartureTime ?? "").localeCompare(b.returnDepartureTime ?? ""),
    );
  }

  return [...groups.values()];
}
