/**
 * Mock ground transport provider — implements TransportProvider using static data.
 */

import {
  mockDelay,
  searchMockTransport,
} from "@/lib/providers/mock/shared";
import type {
  TransportProvider,
  TransportSearchResult,
} from "@/lib/providers/core/types";
import type { SearchRequest } from "@/types/models/search-request";

export class MockTransportProvider implements TransportProvider {
  readonly name = "mock";

  async search(request: SearchRequest): Promise<TransportSearchResult> {
    return mockDelay(searchMockTransport(request));
  }
}

export const mockTransportProvider = new MockTransportProvider();
