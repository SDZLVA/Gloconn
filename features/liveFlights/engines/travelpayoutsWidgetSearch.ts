/**
 * Pure helpers for the Travelpayouts White Label widget (no React, tested).
 */

import { buildAviasalesSearchUrl } from "@/lib/affiliate/aviasalesLink";
import type { LiveFlightsSearch } from "@/features/liveFlights/types";

/** White Label ID of the Glooconn widget (not a secret; it is in the page). */
export const DEFAULT_TPWL_ID = "24018";

export function widgetScriptUrl(whiteLabelId: string): string | null {
  return /^\d{1,10}$/.test(whiteLabelId)
    ? `https://tpwgts.com/wl_web/main.js?wl_id=${whiteLabelId}`
    : null;
}

/**
 * The widget's `flightSearch` value: the same code aviasales.com uses in
 * its search links — "MIL2311PAR28111" = MIL, 23 Nov, PAR, 28 Nov, 1 adult.
 */
export function widgetFlightSearch(search: LiveFlightsSearch): string | null {
  const url = buildAviasalesSearchUrl({
    origin: search.originCode,
    destination: search.destinationCode,
    departureDate: search.departureDate,
    returnDate: search.returnDate,
    adults: search.adults,
    children: search.children,
    infants: search.infants,
  });
  return url ? url.slice(url.lastIndexOf("/") + 1) : null;
}

/**
 * The current page URL with the widget's parameters added, keeping every
 * Glooconn parameter. Null when the search cannot be expressed.
 */
export function urlWithWidgetSearch(pageUrl: string, search: LiveFlightsSearch): string | null {
  const flightSearch = widgetFlightSearch(search);
  if (!flightSearch) return null;
  const url = new URL(pageUrl);
  url.searchParams.set("flightSearch", flightSearch);
  if (/^[A-Z]{3}$/.test(search.currency)) url.searchParams.set("currency", search.currency);
  return url.toString();
}
