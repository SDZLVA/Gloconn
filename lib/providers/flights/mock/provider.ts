/**
 * Mock flights provider — implements FlightsProvider using static data.
 */

import {
  mockDelay,
  searchMockFlights,
} from "@/lib/providers/mock/shared";
import type { FlightsProvider } from "@/lib/providers/core/types";
import type { Flight } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

export class MockFlightsProvider implements FlightsProvider {
  readonly name = "mock";

  async search(request: SearchRequest): Promise<Flight[]> {
    return mockDelay(searchMockFlights(request));
  }
}

export const mockFlightsProvider = new MockFlightsProvider();
