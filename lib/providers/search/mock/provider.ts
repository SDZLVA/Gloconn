/**
 * @deprecated Monolithic mock search provider — delegates to domain providers.
 */

import {
  createCatalogSearchRequest,
  mergeSearchResults,
  toSearchRequest,
} from "@/lib/api/searchMappers";
import {
  getFlightsProvider,
  getHotelsProvider,
  getTransportProvider,
} from "@/lib/providers/core/registry";
import type { SearchProvider } from "@/lib/providers/types";
import type { SearchData } from "@/types/search";

async function runTripSearch(search: SearchData) {
  const request = toSearchRequest(search);
  const [hotels, flights, transport] = await Promise.all([
    getHotelsProvider().search(request),
    getFlightsProvider().search(request),
    getTransportProvider().search(request),
  ]);

  return mergeSearchResults(
    hotels,
    flights,
    transport.buses,
    transport.trains,
  );
}

async function runCatalogSearch() {
  const request = createCatalogSearchRequest();
  const [hotels, flights, transport] = await Promise.all([
    getHotelsProvider().search(request),
    getFlightsProvider().search(request),
    getTransportProvider().search(request),
  ]);

  return mergeSearchResults(
    hotels,
    flights,
    transport.buses,
    transport.trains,
  );
}

export const mockSearchProvider: SearchProvider = {
  name: "mock",

  async search(searchData) {
    return runTripSearch(searchData);
  },

  async getAllResults() {
    return runCatalogSearch();
  },
};
