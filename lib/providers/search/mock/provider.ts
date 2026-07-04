/**
 * Mock search provider — wraps static result data as the first provider implementation.
 * Future providers (Amadeus, Booking.com, Omio, etc.) implement the same interface.
 */

import {
  ALL_MOCK_RESULTS,
  searchMockResults,
} from "@/lib/providers/search/mock/search";
import type { SearchProvider } from "@/lib/providers/types";
import type { SearchResult } from "@/types/results";
import type { SearchData } from "@/types/search";

const MOCK_DELAY_MS = 0;

function delay<T>(value: T): Promise<T> {
  if (MOCK_DELAY_MS === 0) {
    return Promise.resolve(value);
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

export const mockSearchProvider: SearchProvider = {
  name: "mock",

  async search(searchData: SearchData): Promise<SearchResult[]> {
    return delay(
      searchMockResults(searchData.destination, searchData.travelStyle),
    );
  },

  async getAllResults(): Promise<SearchResult[]> {
    return delay(ALL_MOCK_RESULTS);
  },
};
