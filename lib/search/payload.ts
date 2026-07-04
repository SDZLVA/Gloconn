import { getTotalGuests } from "@/lib/search/travelers";
import type { SearchData, SearchFormState } from "@/types/search";

/** Converts raw form strings into a typed search payload. */
export function buildSearchData(form: SearchFormState): SearchData {
  const budgetValue = form.budget.trim();

  return {
    destination: form.destination.trim(),
    tripType: form.tripType,
    departureDate: form.departureDate,
    returnDate: form.tripType === "one-way" ? null : form.returnDate,
    budget: budgetValue ? Number(budgetValue) : null,
    travelers: { ...form.travelers },
    totalGuests: getTotalGuests(form.travelers),
    travelStyle: form.travelStyle,
  };
}

/** Prints search data to the browser console (F12 → Console). No API calls yet. */
export function logSearchData(form: SearchFormState): void {
  console.log("Glooconn search data:", buildSearchData(form));
}
