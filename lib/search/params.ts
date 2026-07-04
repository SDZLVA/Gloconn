import { buildSearchData } from "@/lib/search/payload";
import {
  normalizeProductTypes,
  parseProductTypesParam,
  serializeProductTypesParam,
} from "@/lib/search/productTypes";
import {
  INITIAL_PASSENGERS,
  INITIAL_SEARCH_FORM,
  type SearchFormState,
} from "@/types/search-form";
import type { SearchData } from "@/types/search";

/** Serializes validated search data into URL query parameters. */
export function searchDataToParams(data: SearchData): URLSearchParams {
  const params = new URLSearchParams();

  params.set("destination", data.destination);
  if (data.destinationId) {
    params.set("destinationId", data.destinationId);
  }
  if (data.origin) {
    params.set("origin", data.origin);
  }
  if (data.originId) {
    params.set("originId", data.originId);
  }
  params.set("tripType", data.tripType);
  params.set("departureDate", data.departureDate);
  if (data.returnDate) {
    params.set("returnDate", data.returnDate);
  }
  if (data.budget !== null) {
    params.set("budget", String(data.budget));
    params.set("budgetCurrency", data.budgetCurrency ?? "EUR");
  }
  params.set("adults", String(data.travelers.adults));
  params.set("children", String(data.travelers.children));
  params.set("infants", String(data.travelers.infants));
  params.set("rooms", String(data.travelers.rooms));
  params.set("travelStyle", data.travelStyle);

  const productTypesParam = serializeProductTypesParam(
    normalizeProductTypes(data.productTypes),
  );
  if (productTypesParam) {
    params.set("productTypes", productTypesParam);
  }

  return params;
}

/** Builds URL query params from raw form state (after validation). */
export function formToSearchParams(form: SearchFormState): URLSearchParams {
  return searchDataToParams(buildSearchData(form));
}

/** Parses URL search params into a partial SearchData object. */
export function parseSearchParams(
  params: URLSearchParams,
): Partial<SearchData> {
  const destination = params.get("destination") ?? "";
  const destinationId = params.get("destinationId") ?? undefined;
  const origin = params.get("origin") ?? undefined;
  const originId = params.get("originId") ?? undefined;
  const tripType = params.get("tripType") as SearchData["tripType"] | null;
  const departureDate = params.get("departureDate") ?? "";
  const returnDate = params.get("returnDate");
  const budgetRaw = params.get("budget");
  const budgetCurrency = params.get(
    "budgetCurrency",
  ) as SearchData["budgetCurrency"];
  const adults = Number(params.get("adults") ?? "2");
  const children = Number(params.get("children") ?? "0");
  const infants = Number(params.get("infants") ?? "0");
  const rooms = Number(params.get("rooms") ?? "1");
  const travelStyle = params.get(
    "travelStyle",
  ) as SearchData["travelStyle"] | null;
  const productTypes = parseProductTypesParam(params.get("productTypes"));

  const travelers = { adults, children, infants, rooms };
  const totalGuests = adults + children + infants;

  return {
    destination,
    destinationId,
    origin,
    originId,
    tripType: tripType ?? "round-trip",
    departureDate,
    returnDate: returnDate ?? null,
    budget: budgetRaw ? Number(budgetRaw) : null,
    budgetCurrency: budgetRaw ? (budgetCurrency ?? "EUR") : null,
    travelers,
    totalGuests,
    travelStyle: travelStyle ?? "standard",
    productTypes,
  };
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
  return `/search/results?${formToSearchParams(form).toString()}`;
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
        : 2),
    travelStyle: data.travelStyle ?? "standard",
    productTypes: normalizeProductTypes(data.productTypes),
  };

  return `/?${searchDataToParams(merged).toString()}`;
}
