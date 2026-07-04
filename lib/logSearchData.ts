import type { SearchData, SearchFormState } from "@/types/search";

/**
 * buildSearchData — turns raw form strings into a clean search object.
 */
export function buildSearchData(form: SearchFormState): SearchData {
  const budgetValue = form.budget.trim();

  return {
    destination: form.destination.trim(),
    departureDate: form.departureDate,
    returnDate: form.returnDate,
    budget: budgetValue ? Number(budgetValue) : null,
    travelers: Number(form.travelers),
    travelStyle: form.travelStyle,
  };
}

/**
 * logSearchData — prints the search data to the browser console.
 *
 * Open DevTools (F12) → Console tab to see the output.
 * No API calls are made.
 */
export function logSearchData(form: SearchFormState): void {
  const searchData = buildSearchData(form);

  console.log("Glooconn search data:", searchData);
}
