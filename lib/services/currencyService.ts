/**
 * Currency service — UI calls this for supported currencies, not providers directly.
 */

import { runService, type ServiceResult } from "@/lib/api/types";
import { getServiceProviders } from "@/lib/services/context";
import type { Currency } from "@/types/models/currency";

/** Returns all currencies available for budget and price display. */
export async function getCurrencies(): Promise<ServiceResult<Currency[]>> {
  return runService(async () => {
    const { currencies } = getServiceProviders();
    return currencies.getCurrencies();
  }, "Could not load currencies.");
}
