/**
 * The partner link shown on flight result cards (Milestone 19).
 *
 * One link per search, not per flight: a Kiwi.com deep link opens a search
 * for the route and dates, not a specific itinerary, so every flight card
 * for the same search shares it. That is also why the card copy must say
 * "check this route", never "book this flight" — see FlightResultCard.
 */

import { buildKiwiAffiliateUrl, buildKiwiSearchUrl } from "@/lib/affiliate/kiwi";
import type { AffiliateConfig } from "@/lib/affiliate/types";
import type { TripType } from "@/types/models/search-request";

/** Placement label reported to Travelpayouts. Never traveller data. */
export const FLIGHT_CARD_SUB_ID = "flight_card";

export type FlightPartnerLinkInput = {
  originIata?: string | null;
  destinationIata?: string | null;
  departureDate?: string | null;
  returnDate?: string | null;
  tripType?: TripType;
};

export type FlightPartnerLink = {
  href: string;
  /** True when the link carries Glooconn's marker and can earn commission. */
  tagged: boolean;
  partnerName: "Kiwi.com";
};

/**
 * Builds the flight partner link for a search, or null when the route or
 * dates are not usable (in which case the card shows no link at all).
 */
export function buildFlightPartnerLink(
  input: FlightPartnerLinkInput,
  config: AffiliateConfig,
): FlightPartnerLink | null {
  const search = buildKiwiSearchUrl({
    origin: input.originIata ?? "",
    destination: input.destinationIata ?? "",
    departureDate: input.departureDate ?? "",
    returnDate: input.tripType === "one-way" ? null : input.returnDate ?? null,
  });

  if (search === null) {
    return null;
  }

  const result = buildKiwiAffiliateUrl(search, config, FLIGHT_CARD_SUB_ID);
  return { href: result.url, tagged: result.tagged, partnerName: "Kiwi.com" };
}
