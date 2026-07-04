import { getTotalGuests } from "@/lib/search/travelers";
import { normalizeProductTypes } from "@/lib/search/productTypes";
import type { SearchData } from "@/types/search";
import type { SearchFormState } from "@/types/search-form";

/** Converts raw form strings into a typed search payload. */
export function buildSearchData(form: SearchFormState): SearchData {
  const budgetValue = form.budget.trim();

  return {
    destination: form.destination.trim(),
    destinationId: form.destinationId.trim() || undefined,
    origin: form.origin.trim() || undefined,
    originId: form.originId.trim() || undefined,
    tripType: form.tripType,
    departureDate: form.departureDate,
    returnDate: form.tripType === "one-way" ? null : form.returnDate,
    budget: budgetValue ? Number(budgetValue) : null,
    budgetCurrency: budgetValue ? form.budgetCurrency : null,
    travelers: { ...form.travelers },
    totalGuests: getTotalGuests(form.travelers),
    travelStyle: form.travelStyle,
    productTypes: normalizeProductTypes(form.productTypes),
  };
}

/** Prints search data to the browser console (F12 → Console). */
export function logSearchData(form: SearchFormState): void {
  console.log("Glooconn search data:", buildSearchData(form));
}
