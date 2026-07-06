"use client";

import { useServiceQuery } from "@/hooks/useServiceQuery";
import { getCurrencies } from "@/lib/services/currencyService";
import type { Currency } from "@/types/models/currency";

/**
 * useCurrencies — loads supported currencies from the mock provider via the service layer.
 */
export function useCurrencies() {
  const state = useServiceQuery<Currency[]>(() => getCurrencies(), []);

  return {
    currencies: state.data ?? [],
    isLoading: state.status === "loading",
    error: state.error?.message ?? null,
  };
}
