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

import { airlineDisplayName } from "@/lib/providers/flights/aviasales/airlines";
import type {
  AviasalesPricesForDatesResponse,
  AviasalesTicket,
} from "@/lib/providers/flights/aviasales/types";
import type { CurrencyCode } from "@/types/models/currency";
import type { Flight } from "@/types/models";
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
};

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

  return {
    id,
    destinationId,
    price,
    currency: options.currency,
    rating: 0,
    airline,
    departureTime,
    arrivalTime: "",
    durationMinutes: Math.round(durationMinutes),
    stops,
    cabin: "",
    priceIsRecent: true,
    originAirport: airportCode(ticket.origin_airport),
    destinationAirport: airportCode(ticket.destination_airport),
    ...(isRoundTrip ? returnLeg(ticket, returnTime) : {}),
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
