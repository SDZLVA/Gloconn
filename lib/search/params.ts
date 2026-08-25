import { buildSearchData } from "@/lib/search/payload";
import { normalizeProductTypes } from "@/lib/search/productTypes";
import {
  buildResultsUrlFromRequest,
  buildSearchRequest,
  buildSearchRequestFromData,
  parseSearchRequestFromParams,
  partialSearchRequestToSearchData,
  searchRequestToParams,
} from "@/lib/search/request";
import type { SearchRequest } from "@/types/models/search-request";
import {
  INITIAL_PASSENGERS,
  INITIAL_SEARCH_FORM,
  type SearchFormState,
} from "@/types/search-form";
import type { SearchData } from "@/types/search";

/** Serializes validated search data into URL query parameters. */
export function searchDataToParams(data: SearchData): URLSearchParams {
  return searchRequestToParams(buildSearchRequestFromData(data));
}

/** Builds URL query params from raw form state (after validation). */
export function formToSearchParams(form: SearchFormState): URLSearchParams {
  return searchDataToParams(buildSearchData(form));
}

/** Parses URL search params into a partial SearchData object. */
export function parseSearchParams(
  params: URLSearchParams,
): Partial<SearchData> {
  return partialSearchRequestToSearchData(parseSearchRequestFromParams(params));
}

/** Rebuilds form state from URL params (e.g. when editing a search from results). */
export function parseSearchParamsToForm(
  params: URLSearchParams,
): SearchFormState {
  const data = parseSearchParams(params);

  return {
    destination: data.destination ?? "",
    destinationId: data.destinationId ?? "",
    origin: data.origin ?? "",
    originId: data.originId ?? "",
    tripType: data.tripType ?? INITIAL_SEARCH_FORM.tripType,
    departureDate: data.departureDate ?? "",
    returnDate: data.returnDate ?? "",
    budget:
      data.budget !== null && data.budget !== undefined
        ? String(data.budget)
        : "",
    budgetCurrency: data.budgetCurrency ?? INITIAL_SEARCH_FORM.budgetCurrency,
    travelers: data.travelers ?? { ...INITIAL_PASSENGERS },
    travelStyle: data.travelStyle ?? INITIAL_SEARCH_FORM.travelStyle,
    productTypes: normalizeProductTypes(data.productTypes),
  };
}

/** Builds the results page URL from validated form state. */
export function buildResultsUrl(form: SearchFormState): string {
  return buildResultsUrlFromRequest(buildSearchRequest(form));
}

/** Builds the home page URL with search params for editing an existing search. */
export function buildHomeSearchUrl(data: Partial<SearchData>): string {
  const merged: SearchData = {
    destination: data.destination ?? "",
    destinationId: data.destinationId,
    origin: data.origin,
    originId: data.originId,
    tripType: data.tripType ?? "round-trip",
    departureDate: data.departureDate ?? "",
    returnDate: data.returnDate ?? null,
    budget: data.budget ?? null,
    budgetCurrency: data.budgetCurrency ?? null,
    travelers: data.travelers ?? { ...INITIAL_PASSENGERS },
    totalGuests:
      data.totalGuests ??
      (data.travelers
        ? data.travelers.adults +
          data.travelers.children +
          data.travelers.infants
        : INITIAL_PASSENGERS.adults),
    travelStyle: data.travelStyle ?? "standard",
    productTypes: normalizeProductTypes(data.productTypes),
  };

  return `/?${searchDataToParams(merged).toString()}`;
}

/** Builds the home page URL from a partial SearchRequest (edit search flow). */
export function buildHomeSearchUrlFromRequest(
  data: Partial<SearchRequest>,
): string {
  return buildHomeSearchUrl(partialSearchRequestToSearchData(data));
}
