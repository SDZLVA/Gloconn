/**
 * Partner buttons for ONE flight or flight pair (Milestone 20).
 *
 * Shehan, 2026-10-29: the buttons must open the exact flights the traveller
 * picked, not the general results for the route.
 *
 * - Aviasales: exact. Every Glooconn flight comes from Aviasales, and each
 *   ticket carries its own aviasales.com page (Flight.bookingUrl). The
 *   click goes through /api/out/aviasales, which adds attribution.
 * - Kiwi.com: as close as Kiwi allows. Kiwi has no public link to a single
 *   itinerary, but its search page takes filters in the URL (checked in a
 *   browser, 2026-10-29):
 *     airlinesList=U2 & selectedAirlinesExclude=false   only this airline
 *     stopNumber=0~true                                 at most N stops
 *     times=19-20-0-24_13-14-0-24                       outbound departs
 *       19:00–20:00, return departs 13:00–14:00 (one-way: "19-20-0-24")
 *     adults=2 & children=1                             travellers
 *   With those, MXP→CDG easyJet 19:05 / 13:20 returned exactly that one
 *   pair. A round trip searches the whole city (MIL→PAR), because the API
 *   does not say which airport the return flight uses (Ryanair flies back
 *   BVA→BGY, not to MXP); the filters still narrow it to this airline and
 *   these departure hours.
 *
 * Glooconn cannot check Kiwi's stock in advance (no Kiwi API access), so a
 * Kiwi button is only shown when a filtered link can be built — and the
 * copy says that Kiwi may not sell the same flights.
 *
 * Built after sorting and never fed back into it: commission must not
 * affect result order.
 */

import {
  buildKiwiAffiliateUrl,
  buildKiwiSearchUrl,
} from "@/lib/affiliate/kiwi";
import type { FlightPartnerLink } from "@/lib/affiliate/flightPartnerLink";
import type { AffiliateConfig } from "@/lib/affiliate/types";
import type { Flight } from "@/types/models";
import type { TripType } from "@/types/models/search-request";

export const KIWI_EXACT_SUB_ID = "flight_exact";
export const AVIASALES_OUT_PATH = "/api/out/aviasales";

/** Given a flight, the buttons to show for it. */
export type FlightLinksResolver = (flight: Flight) => readonly FlightPartnerLink[];

export type ExactFlightLinkContext = {
  tripType?: TripType;
  /** Whole-city codes (MIL, PAR) when known; airport codes otherwise. */
  originCode?: string | null;
  destinationCode?: string | null;
  adults?: number;
  children?: number;
  infants?: number;
  config: AffiliateConfig;
};

/** "2026-11-23 19:05" → { date: "2026-11-23", hour: 19 } */
function splitDateTime(value: string | undefined): { date: string; hour: number } | null {
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):\d{2}/.exec(value?.trim() ?? "");
  if (!match) return null;
  const hour = Number(match[2]);
  return hour >= 0 && hour <= 23 ? { date: match[1], hour } : null;
}

function hourWindow(hour: number): string {
  return `${hour}-${Math.min(hour + 1, 24)}-0-24`;
}

function passengerCount(value: number | undefined, min: number): number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= 9
    ? (value as number)
    : min;
}

/**
 * Kiwi.com search filtered to this flight (or pair), wrapped in the
 * Travelpayouts click template. Null when the flight lacks what the
 * filters need (airline code, departure time, return time for a round trip).
 */
export function buildExactKiwiLink(
  flight: Flight,
  context: ExactFlightLinkContext,
): FlightPartnerLink | null {
  const roundTrip = context.tripType !== "one-way";
  const airlines = kiwiAirlines(flight, roundTrip);
  if (airlines === null) return null;

  const outbound = splitDateTime(flight.departureTime);
  if (!outbound) return null;

  const back = roundTrip ? splitDateTime(flight.returnDepartureTime) : null;
  if (roundTrip && !back) return null;

  // One-way: the flight's own airports are exact. Round trip: whole city,
  // because the return airport is unknown (see file comment).
  const origin = roundTrip
    ? context.originCode ?? flight.originAirport
    : flight.originAirport ?? context.originCode;
  const destination = roundTrip
    ? context.destinationCode ?? flight.destinationAirport
    : flight.destinationAirport ?? context.destinationCode;

  const base = buildKiwiSearchUrl({
    origin: origin ?? "",
    destination: destination ?? "",
    departureDate: outbound.date,
    returnDate: back?.date ?? null,
  });
  if (!base) return null;

  const maxStops = Math.max(flight.stops, back ? flight.returnStops ?? flight.stops : 0);
  const adults = passengerCount(context.adults, 1);
  const children = passengerCount(context.children, 0);
  const infants = passengerCount(context.infants, 0);

  const params = [
    `adults=${adults}`,
    ...(children > 0 ? [`children=${children}`] : []),
    ...(infants > 0 ? [`infants=${infants}`] : []),
    ...(airlines.length > 0
      ? [`airlinesList=${airlines.join("%2C")}`, "selectedAirlinesExclude=false"]
      : []),
    `stopNumber=${maxStops}%7Etrue`,
    `times=${hourWindow(outbound.hour)}${back ? `_${hourWindow(back.hour)}` : ""}`,
  ];

  const result = buildKiwiAffiliateUrl(`${base}&${params.join("&")}`, context.config, KIWI_EXACT_SUB_ID);
  return { href: result.url, tagged: result.tagged, partnerName: "Kiwi.com", exact: true };
}

const AIRLINE_CODE = /^[A-Z0-9]{2}$/;

/**
 * Airlines for Kiwi's filter. Milestone 21: both legs' airlines when known
 * (Kiwi accepts "U2%2CFR" — checked 2026-10-29: easyJet out + Ryanair back
 * then shows first). A return leg with an unknown airline drops the airline
 * filter (times and stops still narrow it) rather than filtering the right
 * flight out. Null = cannot narrow at all → no Kiwi button.
 */
function kiwiAirlines(flight: Flight, roundTrip: boolean): string[] | null {
  const out = flight.outboundLeg?.airlineCode ?? flight.airlineCode ?? "";
  if (!AIRLINE_CODE.test(out)) return null;
  if (!roundTrip || !flight.returnLeg) return [out];
  const back = flight.returnLeg.airlineCode ?? "";
  if (!AIRLINE_CODE.test(back)) return [];
  return back === out ? [out] : [out, back];
}

/** Exact Aviasales ticket button, or null when the flight has no ticket page. */
export function buildExactAviasalesLink(flight: Flight): FlightPartnerLink | null {
  if (!flight.bookingUrl) return null;
  return {
    href: `${AVIASALES_OUT_PATH}?u=${encodeURIComponent(flight.bookingUrl)}`,
    // Attribution is added on the server; the copy says "may earn".
    tagged: true,
    partnerName: "Aviasales",
    exact: true,
  };
}

/**
 * Buttons for one flight: exact links where they can be made, otherwise
 * the general route search links (`fallback`).
 */
export function buildFlightLinks(
  flight: Flight,
  context: ExactFlightLinkContext,
  fallback: readonly FlightPartnerLink[],
): readonly FlightPartnerLink[] {
  if (flight.isSample) {
    return fallback;
  }
  const aviasales = buildExactAviasalesLink(flight);
  const kiwi = buildExactKiwiLink(flight, context);

  if (!aviasales && !kiwi) {
    return fallback;
  }

  const links: FlightPartnerLink[] = [];
  // Aviasales first: it is where these flights and prices came from.
  if (aviasales) {
    links.push(aviasales);
  } else {
    const general = fallback.find((link) => link.partnerName === "Aviasales");
    if (general) links.push(general);
  }
  if (kiwi) links.push(kiwi);
  return links;
}
