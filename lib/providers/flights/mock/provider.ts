/**
 * Mock flights provider — implements FlightsProvider using static data.
 */

import {
  mockDelay,
  searchMockFlights,
} from "@/lib/providers/mock/shared";
import type {
  FlightSearchOptions,
  FlightsProvider,
} from "@/lib/providers/core/types";
import type { Flight } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

export class MockFlightsProvider implements FlightsProvider {
  readonly name = "mock";

  async search(
    request: SearchRequest,
    options?: FlightSearchOptions,
  ): Promise<Flight[]> {
    void options; // Mock data is already cheap; scout does not change results.
    return mockDelay(searchMockFlights(request));
  }
}

export const mockFlightsProvider = new MockFlightsProvider();
