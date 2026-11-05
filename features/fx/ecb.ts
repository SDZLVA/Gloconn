/**
 * Milestone 45 — currency conversion with the European Central Bank daily
 * reference rates (free, no key). Booking.com answers in the hotel's local
 * currency (London → GBP), so hotel prices are converted to the currency of
 * the search before they are shown or combined with flights.
 * Pure helpers here; the fetch lives in ./rates.ts.
 */

/** Rates per 1 EUR, e.g. { EUR: 1, GBP: 0.85, USD: 1.08 }. */
export type EurRates = Record<string, number>;

/** Reads the ECB eurofxref-daily.xml answer. */
export function parseEcbXml(xml: string): EurRates {
  const rates: EurRates = { EUR: 1 };
  const re = /currency=['"]([A-Z]{3})['"]\s+rate=['"]([0-9.]+)['"]/g;
  for (let m = re.exec(xml); m; m = re.exec(xml)) {
    const rate = Number(m[2]);
    if (Number.isFinite(rate) && rate > 0) rates[m[1]] = rate;
  }
  return rates;
}

/** amount in `from` → amount in `to`; null when a rate is missing. */
export function convertAmount(amount: number, from: string, to: string, rates: EurRates): number | null {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  if (f === t) return amount;
  const rf = rates[f];
  const rt = rates[t];
  if (!rf || !rt) return null;
  return Math.round(((amount / rf) * rt) * 100) / 100;
}
