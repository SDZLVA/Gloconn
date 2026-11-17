import "server-only";

/**
 * Milestone 62 — cheapest fare per month for a route page. Free
 * Travelpayouts Data API (TRAVELPAYOUTS_API_TOKEN, X-Access-Token header),
 * cached by Next.js for 12 hours, so a route page costs at most two calls
 * a day. Never throws: no token or an error → an empty list.
 */

import { getAppConfig } from "@/lib/config";
import { parseMonthlyPrices, type MonthPrice } from "@/features/routePrices/parse";

const REVALIDATE_S = 12 * 60 * 60;

export async function monthlyPrices(origin: string, destination: string, currency = "EUR"): Promise<MonthPrice[]> {
  const token = getAppConfig().aviasales.apiToken?.trim();
  if (!token) return [];
  const params = new URLSearchParams({ origin, destination, currency: currency.toLowerCase() });
  try {
    const response = await fetch(`https://api.travelpayouts.com/v1/prices/monthly?${params.toString()}`, {
      headers: { "X-Access-Token": token, accept: "application/json" },
      next: { revalidate: REVALIDATE_S },
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok) return [];
    const thisMonth = new Date().toISOString().slice(0, 7);
    return parseMonthlyPrices(await response.json(), thisMonth);
  } catch {
    return [];
  }
}
