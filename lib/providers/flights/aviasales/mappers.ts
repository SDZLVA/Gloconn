/**
 * Aviasales ticket → Glooconn Flight (Milestone 19).
 *
 * Rules:
 * - Anything missing or malformed drops the ticket; nothing is defaulted
 *   into a plausible-looking value.
 * - A round-trip search only keeps tickets that carry a return date. A
 *   ticket without one cannot be a round-trip fare, and pricing it as one is
 *   exactly the 18.8 bug (outbound price shown as round-trip total).
 * - Schedule fields describe the OUTBOUND leg, matching the SerpAPI adapter:
 *   the card shows one journey.
 * - arrivalTime is left empty. The API gives departure time and duration but
 *   not the destination's time zone, so any computed arrival time would be
 *   wrong whenever the route crosses a zone. The UI hides an empty arrival.
 * - rating is 0 (unknown). The UI hides ratings that are not above 0.
 * - cabin is left empty: the documentation does not state the cabin class.
 * - Each flight carries its own airports, because a whole-city search
 *   (MIL→PAR) mixes MXP, LIN, BGY and CDG, ORY, BVA.
 */

import { buildAviasalesTicketUrl } from "@/lib/affiliate/aviasalesLink";
import { airlineDisplayName } from "@/lib/providers/flights/aviasales/airlines";
import {
  formatWallClock,
  parseTicketCode,
} from "@/lib/providers/flights/aviasales/ticketCode";
import type {
  AviasalesPricesForDatesResponse,
  AviasalesTicket,
} from "@/lib/providers/flights/aviasales/types";
import type { CurrencyCode } from "@/types/models/currency";
import type { Flight } from "@/types/models";
import type { FlightLeg } from "@/types/models/flight";
import type { TripType } from "@/types/models/search-request";

const LOCAL_DATE_TIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/;

/**
 * "2027-03-02T14:40:00+01:00" → "2027-03-02 14:40" (local time, as given).
 * Same display format the SerpAPI adapter produces.
 */
export function formatAviasalesDateTime(value: string | undefined): string | null {
  const match = typeof value === "string" ? LOCAL_DATE_TIME.exec(value.trim()) : null;
  return match ? `${match[1]} ${match[2]}:${match[3]}` : null;
}

function positiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function stopCount(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function idPart(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/[^A-Za-z0-9]+/g, "");
}

export type MapAviasalesOptions = {
  destinationId: string;
  currency: CurrencyCode;
  tripType: TripType;
  /** Milestone 20: travellers, so the exact-ticket link prices the whole group. */
  passengers?: { adults: number; children?: number; infants?: number };
  /**
   * Milestone 21: airline of each return flight, from a one-way search in
   * the opposite direction. Key: returnFlightKey(). The round-trip ticket
   * itself only names the outbound airline.
   */
  returnAirlines?: ReadonlyMap<string, string>;
};

/** "BVA|BGY|2026-11-28 13:25" — origin, destination, local departure. */
export function returnFlightKey(from: string, to: string, localDeparture: string): string {
  return `${from}|${to}|${localDeparture}`;
}

function ticketCodeOf(link: string | undefined): string | null {
  const query = typeof link === "string" ? link.split("?")[1] : undefined;
  return query ? new URLSearchParams(query).get("t") : null;
}

function legAirline(code: string | undefined): Pick<FlightLeg, "airlineCode" | "airline"> {
  const upper = code?.trim().toUpperCase() ?? "";
  const name = /^[A-Z0-9]{2}$/.test(upper) ? airlineDisplayName(upper) : null;
  return name ? { airlineCode: upper, airline: name } : {};
}

/**
 * Milestone 21: outbound/return legs decoded from the ticket code and
 * cross-checked against the documented fields. Null on any doubt.
 *
 * Times in the code are local wall-clock times at each airport (see
 * ticketCode.ts), so arrival times are read directly — no time-zone maths,
 * one-way tickets included. Each leg's departure must equal the documented
 * local departure (departure_at / return_at), and its airports and stop
 * count must match the documented ones.
 */
export function decodeTicketLegs(
  ticket: AviasalesTicket,
  isRoundTrip: boolean,
  returnAirlines?: ReadonlyMap<string, string>,
): { outbound: FlightLeg; back?: FlightLeg } | null {
  const legs = parseTicketCode(ticketCodeOf(ticket.link));
  if (!legs || legs.length !== (isRoundTrip ? 2 : 1)) return null;

  const out = legs[0];
  const departure = formatAviasalesDateTime(ticket.departure_at);
  if (!departure || formatWallClock(out.departUnix) !== departure) return null;
  if (ticket.origin_airport && out.airports[0] !== ticket.origin_airport.toUpperCase()) return null;
  if (ticket.destination_airport && out.airports.at(-1) !== ticket.destination_airport.toUpperCase()) {
    return null;
  }
  if (typeof ticket.transfers === "number" && out.airports.length - 2 !== ticket.transfers) return null;

  const outbound: FlightLeg = {
    ...legAirline(ticket.airline),
    departureTime: departure,
    arrivalTime: formatWallClock(out.arriveUnix),
    durationMinutes: out.minutes,
    airports: out.airports,
  };
  if (!isRoundTrip) return { outbound };

  const back = legs[1];
  const backDeparture = formatAviasalesDateTime(ticket.return_at);
  if (!backDeparture || formatWallClock(back.departUnix) !== backDeparture) return null;
  if (typeof ticket.return_transfers === "number" && back.airports.length - 2 !== ticket.return_transfers) {
    return null;
  }

  const backAirline = returnAirlines?.get(
    returnFlightKey(back.airports[0], back.airports.at(-1) as string, backDeparture),
  );

  return {
    outbound,
    back: {
      ...legAirline(backAirline),
      departureTime: backDeparture,
      arrivalTime: formatWallClock(back.arriveUnix),
      durationMinutes: back.minutes,
      airports: back.airports,
    },
  };
}

/** Maps one ticket, or returns null when it cannot be shown honestly. */
export function mapAviasalesTicketToFlight(
  ticket: AviasalesTicket,
  options: MapAviasalesOptions,
): Flight | null {
  const destinationId = options.destinationId?.trim();
  if (!destinationId) {
    return null;
  }

  const price = positiveNumber(ticket.price);
  const airline = airlineDisplayName(ticket.airline);
  const departureTime = formatAviasalesDateTime(ticket.departure_at);
  if (price === null || airline === null || departureTime === null) {
    return null;
  }

  const isRoundTrip = options.tripType === "round-trip";
  const returnTime = formatAviasalesDateTime(ticket.return_at);
  if (isRoundTrip && returnTime === null) {
    return null;
  }

  // Outbound duration. For one-way, `duration` is the same journey, so it is
  // an acceptable fallback; for round trips it covers both legs and is not.
  const durationMinutes = positiveNumber(
    ticket.duration_to ?? (isRoundTrip ? undefined : ticket.duration),
  );
  const stops = stopCount(ticket.transfers);
  if (durationMinutes === null || stops === null) {
    return null;
  }

  const id = [
    "aviasales",
    idPart(ticket.origin_airport ?? ticket.origin),
    idPart(ticket.destination_airport ?? ticket.destination),
    idPart(ticket.airline) + idPart(ticket.flight_number),
    idPart(ticket.departure_at),
    isRoundTrip ? idPart(ticket.return_at) : "ow",
  ].join("-");

  const legs = decodeTicketLegs(ticket, isRoundTrip, options.returnAirlines);

  const airlineCode = ticket.airline?.trim().toUpperCase() ?? "";
  const bookingUrl = buildAviasalesTicketUrl(ticket.link, options.passengers ?? { adults: 1 });

  return {
    id,
    destinationId,
    price,
    currency: options.currency,
    rating: 0,
    airline,
    departureTime,
    // Known only when the ticket code decodes cleanly (Milestone 21).
    arrivalTime: legs?.outbound.arrivalTime ?? "",
    // Door to door when known: the API's duration_to leaves out stopovers
    // (BGY→TIA→BVA: 275 min in the API, 440 min actually).
    durationMinutes: legs?.outbound.durationMinutes ?? Math.round(durationMinutes),
    stops,
    cabin: "",
    priceIsRecent: true,
    originAirport: airportCode(ticket.origin_airport),
    destinationAirport: airportCode(ticket.destination_airport),
    ...(/^[A-Z0-9]{2}$/.test(airlineCode) ? { airlineCode } : {}),
    ...(bookingUrl ? { bookingUrl } : {}),
    ...(isRoundTrip ? returnLeg(ticket, returnTime) : {}),
    ...(legs?.back ? { returnDurationMinutes: legs.back.durationMinutes } : {}),
    ...(legs ? { outboundLeg: legs.outbound } : {}),
    ...(legs?.back ? { returnLeg: legs.back } : {}),
  };
}

function airportCode(value: string | undefined): string | undefined {
  const code = value?.trim().toUpperCase() ?? "";
  return /^[A-Z]{3}$/.test(code) ? code : undefined;
}

function returnLeg(
  ticket: AviasalesTicket,
  returnTime: string | null,
): Pick<Flight, "returnDepartureTime" | "returnStops" | "returnDurationMinutes"> {
  const stops = stopCount(ticket.return_transfers);
  const duration = positiveNumber(ticket.duration_back);
  return {
    ...(returnTime ? { returnDepartureTime: returnTime } : {}),
    ...(stops !== null ? { returnStops: stops } : {}),
    ...(duration !== null ? { returnDurationMinutes: Math.round(duration) } : {}),
  };
}

/**
 * Maps a full response, dropping unusable tickets. Every distinct
 * outbound + return combination is kept — the card shows the return leg,
 * so fares that differ only in the return flight are distinguishable
 * (Shehan, 2026-10-29: "show all suitable results"). Exact duplicates
 * (same id) keep the cheaper price.
 */
export function mapAviasalesResponse(
  response: AviasalesPricesForDatesResponse,
  options: MapAviasalesOptions,
): Flight[] {
  const tickets = Array.isArray(response.data) ? response.data : [];
  const byId = new Map<string, Flight>();

  for (const ticket of tickets) {
    const flight = mapAviasalesTicketToFlight(ticket, options);
    if (!flight) {
      continue;
    }
    const current = byId.get(flight.id);
    if (!current || flight.price < current.price) {
      byId.set(flight.id, flight);
    }
  }

  return [...byId.values()];
}
