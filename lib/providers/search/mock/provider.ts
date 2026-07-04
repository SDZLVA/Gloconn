/**
 * @deprecated Monolithic mock search provider — delegates to the service orchestrator.
 */

import {
  getAllTripSearchResults,
  orchestrateTripSearch,
} from "@/lib/services/searchOrchestrator";
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
