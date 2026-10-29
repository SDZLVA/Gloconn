/**
 * Mock hotels provider — implements HotelsProvider using static data.
 */

import {
  mockDelay,
  searchMockHotels,
} from "@/lib/providers/mock/shared";
import type { HotelsProvider } from "@/lib/providers/core/types";
import type { Hotel } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

export class MockHotelsProvider implements HotelsProvider {
  readonly name = "mock";

  async search(request: SearchRequest): Promise<Hotel[]> {
    const hotels = await mockDelay(searchMockHotels(request));
    return hotels.map((hotel) => ({ ...hotel, isSample: true }));
  }
}

export const mockHotelsProvider = new MockHotelsProvider();
