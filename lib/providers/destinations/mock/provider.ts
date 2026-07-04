/**
 * Mock destination provider — wraps static data as the first provider implementation.
 * Future providers (Google Places, GeoNames, etc.) implement the same interface.
 */

import {
  filterDestinations,
  findDestinationById,
  getPopularDestinationsList,
  resolveDestinationIdFromLabel,
} from "@/lib/providers/destinations/mock/helpers";
import type { DestinationProvider } from "@/lib/providers/types";
import type { Destination } from "@/types/destination";

/** Simulates a short network delay so loading states can be tested locally. */
const MOCK_DELAY_MS = 0;

function delay<T>(value: T): Promise<T> {
  if (MOCK_DELAY_MS === 0) {
    return Promise.resolve(value);
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

export const mockDestinationProvider: DestinationProvider = {
  name: "mock",

  async searchDestinations(query: string): Promise<Destination[]> {
    return delay(filterDestinations(query));
  },

  async getPopularDestinations(): Promise<Destination[]> {
    return delay(getPopularDestinationsList());
  },

  async getDestinationById(id: string): Promise<Destination | null> {
    return delay(findDestinationById(id));
  },

  async resolveDestinationId(destinationLabel: string): Promise<string> {
    return delay(resolveDestinationIdFromLabel(destinationLabel));
  },
};
