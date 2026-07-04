import { buildSearchData } from "@/lib/search/payload";
import type { SearchData, SearchFormState } from "@/types/search";

/** Serializes validated search data into URL query parameters. */
export function searchDataToParams(data: SearchData): URLSearchParams {
  const params = new URLSearchParams();

  params.set("destination", data.destination);
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

  const travelers = { adults, children, infants, rooms };
  const totalGuests = adults + children + infants;

  return {
    destination,
    tripType: tripType ?? "round-trip",
    departureDate,
    returnDate: returnDate ?? null,
    budget: budgetRaw ? Number(budgetRaw) : null,
    budgetCurrency: budgetRaw ? (budgetCurrency ?? "EUR") : null,
    travelers,
    totalGuests,
    travelStyle: travelStyle ?? "standard",
  };
}

/** Builds the results page URL from validated form state. */
export function buildResultsUrl(form: SearchFormState): string {
  return `/search/results?${formToSearchParams(form).toString()}`;
}
