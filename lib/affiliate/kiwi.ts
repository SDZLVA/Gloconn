/**
 * Kiwi.com affiliate links via Travelpayouts (Milestone 19).
 *
 * Source of truth: Travelpayouts Help Center, "Kiwi.com affiliate links"
 * https://support.travelpayouts.com/hc/en-us/articles/360010109719
 *
 * Kiwi.com is one of the brands Travelpayouts' link-creation API does not
 * support, and it has no deep-link form. The documented method is to build
 * a kiwi.com search URL, URL-encode it, and append it to a fixed click
 * template:
 *
 *   https://c111.travelpayouts.com/click?shmarker=ID.SUBID&promo_id=3791
 *     &source_type=customlink&type=click&custom_url=<encoded kiwi url>
 *
 * The template is reproduced exactly, in the documented parameter order, and
 * pinned by a test against the documentation's own worked example. Only
 * links that carry deep-link parameters are counted by Travelpayouts, so a
 * bare kiwi.com homepage link would earn nothing.
 *
 * What goes in the URL: the destination is the traveller's own search — the
 * route and dates they chose — because that is what makes the link land on
 * the right results. The tracking layer adds only the partner ID and a
 * placement SubID. A SubID must never describe the traveller.
 */

import type { AffiliateConfig, TagResult } from "@/lib/affiliate/types";

const KIWI_DEEP_BASE = "https://www.kiwi.com/deep";

const CLICK_BASE = "https://c111.travelpayouts.com/click";

/** Travelpayouts' fixed programme ID for Kiwi.com custom links. */
const KIWI_PROMO_ID = "3791";

/** Three-letter IATA airport or city code. */
const IATA_PATTERN = /^[A-Z]{3}$/;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Documented SubID alphabet: Latin letters, digits, underscores. */
const SUB_ID_PATTERN = /^[A-Za-z0-9_]{1,64}$/;

export type KiwiSearch = {
  /** IATA code, e.g. "MXP". */
  origin: string;
  /** IATA code, e.g. "CDG". */
  destination: string;
  /** ISO date, YYYY-MM-DD. */
  departureDate: string;
  /** ISO date. Omit for a one-way search. */
  returnDate?: string | null;
};

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

/**
 * Builds a kiwi.com deep-link search URL, or null when any field is unusable.
 * Codes are upper-cased; nothing else is coerced.
 */
export function buildKiwiSearchUrl(search: KiwiSearch): string | null {
  const origin = search.origin?.trim().toUpperCase() ?? "";
  const destination = search.destination?.trim().toUpperCase() ?? "";
  const departure = search.departureDate?.trim() ?? "";
  const returning = search.returnDate?.trim() ?? "";

  if (!IATA_PATTERN.test(origin) || !IATA_PATTERN.test(destination)) {
    return null;
  }
  if (origin === destination) {
    return null;
  }
  if (!isValidIsoDate(departure)) {
    return null;
  }
  if (returning && (!isValidIsoDate(returning) || returning < departure)) {
    return null;
  }

  // Parameter order follows the documentation's example.
  let url = `${KIWI_DEEP_BASE}?from=${origin}&to=${destination}&departure=${departure}`;
  if (returning) {
    url += `&return=${returning}`;
  }
  return url;
}

/**
 * Wraps a kiwi.com deep-link URL in the Travelpayouts click template.
 *
 * Falls back to the plain kiwi.com URL — still a useful link for the
 * traveller, just unpaid — whenever affiliate config is off or the input is
 * not a kiwi.com deep link.
 *
 * @param kiwiUrl - Output of buildKiwiSearchUrl.
 * @param config  - Affiliate settings.
 * @param subId   - Optional placement label, e.g. "flight_card". Never
 *                  traveller data. Invalid values are dropped, not rejected.
 */
export function buildKiwiAffiliateUrl(
  kiwiUrl: string,
  config: AffiliateConfig,
  subId?: string,
): TagResult {
  const input = typeof kiwiUrl === "string" ? kiwiUrl.trim() : "";

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { url: kiwiUrl, tagged: false, reason: "invalid_url" };
  }

  const isKiwiDeepLink =
    parsed.protocol === "https:" &&
    parsed.hostname === "www.kiwi.com" &&
    parsed.pathname === "/deep" &&
    parsed.search.length > 1;

  if (!isKiwiDeepLink) {
    return { url: input, tagged: false, reason: "unsupported_host" };
  }

  const marker = config.enabled ? config.travelpayoutsMarker : null;
  if (!marker) {
    return { url: input, tagged: false, reason: "disabled" };
  }

  const shmarker =
    subId && SUB_ID_PATTERN.test(subId) ? `${marker}.${subId}` : marker;

  // Built by hand rather than with URLSearchParams so the result matches
  // the documented template byte for byte.
  const url =
    `${CLICK_BASE}?shmarker=${shmarker}` +
    `&promo_id=${KIWI_PROMO_ID}` +
    `&source_type=customlink` +
    `&type=click` +
    `&custom_url=${encodeURIComponent(input)}`;

  return { url, tagged: true };
}
