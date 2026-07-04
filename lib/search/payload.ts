import {
  buildSearchRequest,
  searchRequestToSearchData,
} from "@/lib/search/request";
import type { SearchData } from "@/types/search";
import type { SearchFormState } from "@/types/search-form";

/** Converts raw form strings into legacy SearchData (saved trips, migrations). */
export function buildSearchData(form: SearchFormState): SearchData {
  return searchRequestToSearchData(buildSearchRequest(form));
}

/** Prints search data to the browser console (F12 → Console). */
export function logSearchData(form: SearchFormState): void {
  console.log("Glooconn search data:", buildSearchData(form));
}
