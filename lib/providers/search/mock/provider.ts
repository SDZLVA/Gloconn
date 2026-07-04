/**
 * @deprecated Monolithic mock search provider — delegates to provider orchestration.
 */

import {
  getAllTripSearchResults,
  orchestrateTripSearch,
} from "@/lib/providers/orchestrate";
import type { SearchProvider } from "@/lib/providers/types";

export const mockSearchProvider: SearchProvider = {
  name: "mock",

  async search(searchData) {
    return orchestrateTripSearch(searchData);
  },

  async getAllResults() {
    return getAllTripSearchResults();
  },
};
