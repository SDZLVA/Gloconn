/**
 * @deprecated Monolithic mock search provider — delegates to the service orchestrator.
 */

import { searchResponseToResults } from "@/lib/api/searchMappers";
import {
  getAllTripSearchResults,
  orchestrateTripSearch,
} from "@/lib/services/searchOrchestrator";
import { buildSearchRequestFromData } from "@/lib/search/request";
import type { SearchProvider } from "@/lib/providers/types";

export const mockSearchProvider: SearchProvider = {
  name: "mock",

  async search(searchData) {
    const response = await orchestrateTripSearch(
      buildSearchRequestFromData(searchData),
    );
    return searchResponseToResults(response);
  },

  async getAllResults() {
    const response = await getAllTripSearchResults();
    return searchResponseToResults(response);
  },
};
