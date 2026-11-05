import "server-only";

import { parseEcbXml, type EurRates } from "@/features/fx/ecb";

const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const CACHE_MS = 12 * 60 * 60_000;
let cached: { at: number; rates: EurRates } | null = null;

/** ECB rates per 1 EUR, cached 12 h. Null if the ECB can't be reached. */
export async function eurRates(): Promise<EurRates | null> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.rates;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4_000);
  try {
    const response = await fetch(ECB_URL, { signal: controller.signal, next: { revalidate: 43_200 } });
    if (!response.ok) return cached?.rates ?? null;
    const rates = parseEcbXml(await response.text());
    if (Object.keys(rates).length < 5) return cached?.rates ?? null;
    cached = { at: Date.now(), rates };
    return rates;
  } catch {
    return cached?.rates ?? null;
  } finally {
    clearTimeout(timer);
  }
}
