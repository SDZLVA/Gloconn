/**
 * SerpAPI Google Hotels — pure query parameter builders.
 *
 * Converts Glooconn `SearchRequest` into Google Hotels query params.
 * No HTTP. Parameter names follow SerpAPI docs:
 * https://serpapi.com/google-hotels-api
 *
 * Limitation (documented): Google Hotels has no hotel `rooms` parameter.
 * `travelers.rooms` is intentionally not sent. Infants are not mapped
 * (API has children + ages only; SearchRequest has no child ages).
 * When `children > 0`, ages default to `8` each so SerpAPI does not reject
 * the request (vendor requires `children_ages` length to match `children`).
 */

import { createProviderError } from "@/lib/api/errors";
import { DEFAULT_SERPAPI_HOTELS_CURRENCY } from "@/lib/providers/hotels/serpapi/mappingHelpers";
import type { SearchRequest } from "@/types/models/search-request";

/** YYYY-MM-DD date-only pattern required by SerpAPI hotel dates. */
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Builds SerpAPI Google Hotels query parameters from a SearchRequest.
 *
 * Requires:
 * - non-empty destination (`q`)
 * - departureDate → check_in_date
 * - returnDate → check_out_date (not invented when missing)
 * - at least one adult
 *
 * Does not include `api_key` (added by the HTTP client).
 */
export function buildSerpApiHotelsSearchParams(
  request: SearchRequest,
): URLSearchParams {
  const query = request.destination?.trim();
  const checkInDate = request.departureDate?.trim();
  const checkOutDate = request.returnDate?.trim();
  const adults = request.travelers.adults;

  if (!query) {
    throw createProviderError(
      "Hotel search requires a destination query.",
    );
  }

  if (!checkInDate || !ISO_DATE_ONLY.test(checkInDate)) {
    throw createProviderError(
      "Hotel search requires a check-in date (departureDate as YYYY-MM-DD).",
    );
  }

  if (!checkOutDate) {
    throw createProviderError(
      "Hotel search requires a check-out date (returnDate). One-way trips without returnDate are not supported for live hotel search.",
    );
  }

  if (!ISO_DATE_ONLY.test(checkOutDate)) {
    throw createProviderError(
      "Hotel search requires check-out date (returnDate) as YYYY-MM-DD.",
    );
  }

  if (checkOutDate <= checkInDate) {
    throw createProviderError(
      "Hotel search requires check-out date (returnDate) after check-in date (departureDate).",
    );
  }

  if (!Number.isFinite(adults) || adults < 1) {
    throw createProviderError("Hotel search requires at least one adult.");
  }

  const params = new URLSearchParams();
  params.set("engine", "google_hotels");
  params.set("q", query);
  params.set("check_in_date", checkInDate);
  params.set("check_out_date", checkOutDate);
  params.set("adults", String(adults));

  if (request.travelers.children > 0) {
    const childCount = request.travelers.children;
    params.set("children", String(childCount));
    // SerpAPI requires `children_ages` to match `children` count.
    // SearchRequest has no ages yet — use a documented default (8) so live
    // searches do not 400. Replace when ages exist on the request contract.
    params.set(
      "children_ages",
      Array.from({ length: childCount }, () => "8").join(","),
    );
  }

  // Prefer request budget currency; otherwise EUR (SerpAPI Hotels would default to USD).
  const currency =
    request.budget?.currency?.trim().toUpperCase() ||
    DEFAULT_SERPAPI_HOTELS_CURRENCY;
  params.set("currency", currency);

  return params;
}
