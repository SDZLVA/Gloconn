/**
 * Mock destination provider — implements DestinationProvider using static data.
 */

import {
  filterDestinations,
  findDestinationById,
  getPopularDestinationsList,
  resolveDestinationIdFromLabel,
} from "@/lib/providers/destinations/mock/helpers";
import { mockDelay } from "@/lib/providers/mock/shared";
import type { DestinationProvider } from "@/lib/providers/core/types";
import type { Destination } from "@/types/models";

export class MockDestinationProvider implements DestinationProvider {
  readonly name = "mock";

  async searchDestinations(query: string): Promise<Destination[]> {
    return mockDelay(filterDestinations(query));
  }

  async getPopularDestinations(): Promise<Destination[]> {
    return mockDelay(getPopularDestinationsList());
  }

  async getDestinationById(id: string): Promise<Destination | null> {
    return mockDelay(findDestinationById(id));
  }

  async resolveDestinationId(destinationLabel: string): Promise<string> {
    return mockDelay(resolveDestinationIdFromLabel(destinationLabel));
  }
}

export const mockDestinationProvider = new MockDestinationProvider();
