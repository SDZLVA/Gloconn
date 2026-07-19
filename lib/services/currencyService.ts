/**
 * Currency service — UI calls this for supported currencies, not providers directly.
 *
 * Uses the mock currency provider directly so the client budget UI does not import
 * the full provider registry (which includes server-only Amadeus HTTP).
 */

import { runService, type ServiceResult } from "@/lib/api/types";
import { mockCurrencyProvider } from "@/lib/providers/currencies/mock";
import type { Currency } from "@/types/models/currency";

/** Returns all currencies available for budget and price display. */
export async function getCurrencies(): Promise<ServiceResult<Currency[]>> {
  return runService(async () => {
    return mockCurrencyProvider.getCurrencies();
  }, "Could not load currencies.");
}
