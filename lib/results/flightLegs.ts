/**
 * Flight legs for display (Milestone 21). Pure functions, unit-tested.
 *
 * Flights from Aviasales carry decoded legs (outboundLeg / returnLeg).
 * Other flights (sample data, older sources) get a leg built from the flat
 * fields, with only what is actually known.
 */

import type { Flight, FlightLeg } from "@/types/models/flight";

export type DisplayLegs = { outbound: FlightLeg; back?: FlightLeg };

export function displayLegs(flight: Flight): DisplayLegs {
  const outbound: FlightLeg = flight.outboundLeg ?? {
    airline: flight.airline,
    ...(flight.airlineCode ? { airlineCode: flight.airlineCode } : {}),
    departureTime: flight.departureTime,
    ...(flight.arrivalTime ? { arrivalTime: flight.arrivalTime } : {}),
    durationMinutes: flight.durationMinutes,
    airports: [flight.originAirport ?? "", flight.destinationAirport ?? ""],
  };

  if (flight.returnLeg) return { outbound, back: flight.returnLeg };
  if (!flight.returnDepartureTime) return { outbound };

  return {
    outbound,
    back: {
      departureTime: flight.returnDepartureTime,
      durationMinutes: flight.returnDurationMinutes ?? 0,
      // Unknown airports stay empty rather than mirrored from the outbound.
      airports: ["", ""],
    },
  };
}

/** Stops on a leg; falls back to the flat count when airports are unknown. */
export function legStops(leg: FlightLeg, fallback: number | undefined): number {
  const known = leg.airports.filter(Boolean);
  return known.length >= 2 ? known.length - 2 : fallback ?? 0;
}

/** Stopover airports (between origin and destination). */
export function legStopovers(leg: FlightLeg): string[] {
  return leg.airports.slice(1, -1).filter(Boolean);
}

/** Whole days between departure and arrival dates ("+1" overnight). */
export function arrivalDayOffset(leg: FlightLeg): number {
  if (!leg.arrivalTime) return 0;
  const from = Date.parse(`${leg.departureTime.slice(0, 10)}T00:00:00Z`);
  const to = Date.parse(`${leg.arrivalTime.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.round((to - from) / 86_400_000);
}

export type AirportNote = { airport: string; text: string };

/**
 * Airport changes a traveller must notice, e.g. landing at CDG but flying
 * home from BVA, or returning to BGY instead of MXP. Only for known codes.
 */
export function airportChangeNotes(legs: DisplayLegs): AirportNote[] {
  const { outbound, back } = legs;
  if (!back) return [];
  const notes: AirportNote[] = [];
  const arrivedAt = outbound.airports.at(-1) ?? "";
  const leavesFrom = back.airports[0] ?? "";
  const startedAt = outbound.airports[0] ?? "";
  const endsAt = back.airports.at(-1) ?? "";

  if (arrivedAt && leavesFrom && arrivedAt !== leavesFrom) {
    notes.push({ airport: leavesFrom, text: `Return leaves from ${leavesFrom} — you land at ${arrivedAt}.` });
  }
  if (startedAt && endsAt && startedAt !== endsAt) {
    notes.push({ airport: endsAt, text: `Return lands at ${endsAt}, not ${startedAt}.` });
  }
  return notes;
}

/** Distinct airline names across legs, in order. Unknown airlines skipped. */
export function legAirlines(legs: DisplayLegs): string[] {
  const names = [legs.outbound.airline, legs.back?.airline].filter(
    (name): name is string => Boolean(name),
  );
  return [...new Set(names)];
}
