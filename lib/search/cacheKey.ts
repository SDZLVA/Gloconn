/**
 * Stable client cache key for trip search criteria.
 *
 * Why not `JSON.stringify(search)` alone?
 * - Object key order can differ across parses → false cache misses / extra fetches
 * - `productTypes` order should not change the logical search
 *
 * Does not change SearchRequest — only normalizes a Partial for hashing.
 */

import type {
  SearchProductType,
  SearchRequest,
} from "@/types/models/search-request";

const PRODUCT_TYPE_ORDER: SearchProductType[] = [
  "hotels",
  "flights",
  "transport",
];

function sortedProductTypes(
  productTypes: SearchProductType[] | undefined,
): SearchProductType[] | undefined {
  if (!productTypes || productTypes.length === 0) {
    return undefined;
  }

  return [...productTypes].sort(
    (a, b) => PRODUCT_TYPE_ORDER.indexOf(a) - PRODUCT_TYPE_ORDER.indexOf(b),
  );
}

/**
 * Builds a deterministic string key for client caching / query deps.
 * Omits undefined optional fields so equivalent searches share a key.
 */
export function buildSearchCacheKey(search: Partial<SearchRequest>): string {
  const travelers = search.travelers;
  const budget = search.budget;

  const canonical = {
    origin: search.origin ?? "",
    originId: search.originId ?? "",
    destination: search.destination ?? "",
    destinationId: search.destinationId ?? "",
    tripType: search.tripType ?? "",
    departureDate: search.departureDate ?? "",
    returnDate: search.returnDate ?? null,
    travelStyle: search.travelStyle ?? "",
    totalGuests: search.totalGuests ?? 0,
    budgetAmount: budget?.amount ?? null,
    budgetCurrency: budget?.currency ?? null,
    adults: travelers?.adults ?? 0,
    children: travelers?.children ?? 0,
    infants: travelers?.infants ?? 0,
    rooms: travelers?.rooms ?? 0,
    productTypes: sortedProductTypes(search.productTypes) ?? null,
    // IATA is server-enriched; include when present so enriched vs raw stay distinct.
    originIata: search.originIata ?? "",
    destinationIata: search.destinationIata ?? "",
  };

  return JSON.stringify(canonical);
}
