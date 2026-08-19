/**
 * SearchRequest builder — single place to collect search values into the
 * canonical `SearchRequest` model (ready for services and future APIs).
 *
 * Flow: SearchFormState → validate → SearchRequest → URL / orchestrator / API body
 */

import {
  normalizeProductTypes,
  parseProductTypesParam,
  serializeProductTypesParam,
} from "@/lib/search/productTypes";
import { getTotalGuests } from "@/lib/search/travelers";
import {
  hasSearchFormErrors,
  validateSearchForm,
} from "@/lib/search/validation";
import type { Budget } from "@/types/models/budget";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchData } from "@/types/search";
import type { SearchFormErrors, SearchFormState } from "@/types/search-form";

/** Result of validating a form and building a SearchRequest. */
export type BuildSearchRequestResult =
  | { ok: true; request: SearchRequest }
  | { ok: false; errors: SearchFormErrors };

function budgetFromForm(form: SearchFormState): Budget | null {
  const trimmed = form.budget.trim();
  if (!trimmed) {
    return null;
  }

  return {
    amount: Number(trimmed),
    currency: form.budgetCurrency,
  };
}

function budgetFromSearchData(data: SearchData): Budget | null {
  if (data.budget === null || data.budgetCurrency === null) {
    return null;
  }

  return {
    amount: data.budget,
    currency: data.budgetCurrency,
  };
}

/**
 * Builds a SearchRequest from validated form state.
 * Call `validateAndBuildSearchRequest` before submit, or validate separately first.
 */
export function buildSearchRequest(form: SearchFormState): SearchRequest {
  const travelers = { ...form.travelers };

  return {
    origin: form.origin.trim(),
    originId: form.originId.trim() || undefined,
    destination: form.destination.trim(),
    destinationId: form.destinationId.trim() || undefined,
    tripType: form.tripType,
    departureDate: form.departureDate,
    returnDate: form.tripType === "one-way" ? null : form.returnDate,
    budget: budgetFromForm(form),
    travelers,
    totalGuests: getTotalGuests(travelers),
    travelStyle: form.travelStyle,
    productTypes: normalizeProductTypes(form.productTypes),
  };
}

/** Builds a SearchRequest from legacy `SearchData` (URL params, saved trips). */
export function buildSearchRequestFromData(data: SearchData): SearchRequest {
  return {
    origin: data.origin?.trim() ?? "",
    originId: data.originId,
    destination: data.destination,
    destinationId: data.destinationId,
    tripType: data.tripType,
    departureDate: data.departureDate,
    returnDate: data.returnDate,
    budget: budgetFromSearchData(data),
    travelers: { ...data.travelers },
    totalGuests: data.totalGuests,
    travelStyle: data.travelStyle,
    productTypes: normalizeProductTypes(data.productTypes),
  };
}

/** Converts a SearchRequest back to legacy SearchData (saved trips, migrations). */
export function searchRequestToSearchData(request: SearchRequest): SearchData {
  return {
    origin: request.origin,
    originId: request.originId,
    destination: request.destination,
    destinationId: request.destinationId,
    tripType: request.tripType,
    departureDate: request.departureDate,
    returnDate: request.returnDate,
    budget: request.budget?.amount ?? null,
    budgetCurrency: request.budget?.currency ?? null,
    travelers: { ...request.travelers },
    totalGuests: request.totalGuests,
    travelStyle: request.travelStyle,
    productTypes: normalizeProductTypes(request.productTypes),
  };
}

/** Validates the form, then builds a SearchRequest when valid. */
export function validateAndBuildSearchRequest(
  form: SearchFormState,
): BuildSearchRequestResult {
  const errors = validateSearchForm(form);

  if (hasSearchFormErrors(errors)) {
    return { ok: false, errors };
  }

  return { ok: true, request: buildSearchRequest(form) };
}

/** Serializes a SearchRequest into URL query parameters. */
export function searchRequestToParams(request: SearchRequest): URLSearchParams {
  const params = new URLSearchParams();

  params.set("origin", request.origin);
  if (request.originId) {
    params.set("originId", request.originId);
  }
  params.set("destination", request.destination);
  if (request.destinationId) {
    params.set("destinationId", request.destinationId);
  }
  params.set("tripType", request.tripType);
  params.set("departureDate", request.departureDate);
  if (request.returnDate) {
    params.set("returnDate", request.returnDate);
  }
  if (request.budget) {
    params.set("budget", String(request.budget.amount));
    params.set("budgetCurrency", request.budget.currency);
  }
  params.set("adults", String(request.travelers.adults));
  params.set("children", String(request.travelers.children));
  params.set("infants", String(request.travelers.infants));
  params.set("rooms", String(request.travelers.rooms));
  params.set("travelStyle", request.travelStyle);

  const productTypesParam = serializeProductTypesParam(
    normalizeProductTypes(request.productTypes),
  );
  if (productTypesParam) {
    params.set("productTypes", productTypesParam);
  }

  return params;
}

/** Parses URL query parameters into a partial SearchRequest. */
export function parseSearchRequestFromParams(
  params: URLSearchParams,
): Partial<SearchRequest> {
  const origin = params.get("origin") ?? undefined;
  const originId = params.get("originId") ?? undefined;
  const destination = params.get("destination") ?? undefined;
  const destinationId = params.get("destinationId") ?? undefined;
  const tripType = params.get("tripType") as SearchRequest["tripType"] | null;
  const departureDate = params.get("departureDate") ?? undefined;
  const returnDate = params.get("returnDate");
  const budgetRaw = params.get("budget");
  const budgetCurrency = params.get("budgetCurrency") as Budget["currency"] | null;
  const adults = Number(params.get("adults") ?? "2");
  const children = Number(params.get("children") ?? "0");
  const infants = Number(params.get("infants") ?? "0");
  const rooms = Number(params.get("rooms") ?? "1");
  const travelStyle = params.get(
    "travelStyle",
  ) as SearchRequest["travelStyle"] | null;
  const productTypes = parseProductTypesParam(params.get("productTypes"));

  const travelers = { adults, children, infants, rooms };
  const totalGuests = adults + children + infants;

  const budget =
    budgetRaw && budgetCurrency
      ? { amount: Number(budgetRaw), currency: budgetCurrency }
      : undefined;

  return {
    origin,
    originId,
    destination,
    destinationId,
    tripType: tripType ?? undefined,
    departureDate,
    returnDate: returnDate ?? null,
    budget,
    travelers,
    totalGuests,
    travelStyle: travelStyle ?? undefined,
    productTypes,
  };
}

/** True when `budget` uses the SearchRequest object shape (not a flat number). */
export function isSearchRequestInput(
  search: Partial<SearchData> | Partial<SearchRequest>,
): search is Partial<SearchRequest> {
  if (!("budget" in search) || search.budget === undefined) {
    return false;
  }

  return search.budget === null || typeof search.budget === "object";
}

/** Converts a partial SearchRequest into legacy SearchData field shape. */
export function partialSearchRequestToSearchData(
  partial: Partial<SearchRequest>,
): Partial<SearchData> {
  return {
    origin: partial.origin,
    originId: partial.originId,
    destination: partial.destination,
    destinationId: partial.destinationId,
    tripType: partial.tripType,
    departureDate: partial.departureDate,
    returnDate: partial.returnDate,
    budget:
      partial.budget === undefined
        ? undefined
        : (partial.budget?.amount ?? null),
    budgetCurrency:
      partial.budget === undefined
        ? undefined
        : (partial.budget?.currency ?? null),
    travelers: partial.travelers,
    totalGuests: partial.totalGuests,
    travelStyle: partial.travelStyle,
    productTypes: partial.productTypes,
  };
}

/** Normalizes SearchRequest or SearchData input to legacy SearchData partial. */
export function normalizeSearchInput(
  search: Partial<SearchData> | Partial<SearchRequest>,
): Partial<SearchData> {
  if (isSearchRequestInput(search)) {
    return partialSearchRequestToSearchData(search);
  }

  return search;
}

/** Builds the search results page URL from a SearchRequest. */
export function buildResultsUrlFromRequest(request: SearchRequest): string {
  return `/search/results?${searchRequestToParams(request).toString()}`;
}

/**
 * Plain JSON-ready object for future Route Handlers or external APIs.
 * No API calls — shape matches what `POST /api/search` will accept.
 */
export function serializeSearchRequest(
  request: SearchRequest,
): SearchRequest {
  return {
    ...request,
    travelers: { ...request.travelers },
    budget: request.budget ? { ...request.budget } : null,
    productTypes: request.productTypes
      ? [...request.productTypes]
      : undefined,
  };
}
