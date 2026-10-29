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

/** Path of Glooconn's own page that hosts the widget (inside an iframe). */
export const WIDGET_FRAME_PATH = "/live-flights/frame";

/** Message the frame sends to report its content height. */
export const FRAME_HEIGHT_MESSAGE = "glooconn:live-flights:height";

const FLIGHT_SEARCH = /^[A-Z]{3}\d{4}[A-Z]{3}(?:\d{4})?\d{1,3}$/;

export function isValidFlightSearch(value: string | null | undefined): value is string {
  return typeof value === "string" && FLIGHT_SEARCH.test(value);
}

/**
 * Milestone 23: the widget runs in its own page inside an iframe. Its CSS
 * reset (an @layer that outranked Tailwind) broke Glooconn's whole layout,
 * and it rewrites the page URL, dropping Glooconn's search parameters.
 * In a frame, neither can touch the results page.
 */
export function widgetFrameSrc(search: LiveFlightsSearch): string | null {
  const flightSearch = widgetFlightSearch(search);
  if (!flightSearch) return null;
  const params = new URLSearchParams({ flightSearch });
  if (/^[A-Z]{3}$/.test(search.currency)) params.set("currency", search.currency);
  return `${WIDGET_FRAME_PATH}?${params.toString()}`;
}
