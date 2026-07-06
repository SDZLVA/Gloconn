/**
 * Mock currency provider — returns static currency list with optional delay.
 */

import { MOCK_CURRENCIES } from "@/lib/providers/currencies/mock/data";
import { mockDelay } from "@/lib/providers/mock/shared";
import type { CurrencyProvider } from "@/lib/providers/core/types";
import type { Currency } from "@/types/models/currency";

export class MockCurrencyProvider implements CurrencyProvider {
  readonly name = "mock";

  async getCurrencies(): Promise<Currency[]> {
    return mockDelay([...MOCK_CURRENCIES]);
  }
}

export const mockCurrencyProvider = new MockCurrencyProvider();
