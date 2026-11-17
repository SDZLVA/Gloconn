/**
 * Milestone 62 — Travelpayouts "prices by month" (GET /v1/prices/monthly):
 * the cheapest round trip travellers found for each month on a route.
 * Read loosely: a month without a usable price is skipped.
 */

export type MonthPrice = {
  /** "2026-12" */
  month: string;
  price: number;
  airlineCode: string | null;
  transfers: number | null;
  /** YYYY-MM-DD, when known. */
  departureDate: string | null;
  returnDate: string | null;
};

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};
const day = (v: unknown): string | null => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : null);

/** Months from `fromMonth` on (YYYY-MM), cheapest per month, in date order. */
export function parseMonthlyPrices(raw: unknown, fromMonth: string): MonthPrice[] {
  const data = isObject(raw) && isObject(raw.data) ? raw.data : null;
  if (!data) return [];
  const out: MonthPrice[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (!isObject(value)) continue;
    const month = /^\d{4}-\d{2}$/.test(key) ? key : (day(value.departure_at)?.slice(0, 7) ?? null);
    const price = num(value.price ?? value.value);
    if (!month || month < fromMonth || price === null || price <= 0) continue;
    const airline = typeof value.airline === "string" && /^[A-Z0-9]{2}$/.test(value.airline) ? value.airline : null;
    out.push({
      month,
      price: Math.round(price),
      airlineCode: airline,
      transfers: num(value.transfers ?? value.number_of_changes),
      departureDate: day(value.departure_at ?? value.depart_date),
      returnDate: day(value.return_at ?? value.return_date),
    });
  }
  return out.sort((a, b) => a.month.localeCompare(b.month));
}

/** "2026-12" → "December 2026". */
export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return names[m - 1] ? `${names[m - 1]} ${y}` : month;
}

/**
 * Dates to search for a month: the fare's own dates when they are still
 * ahead, otherwise the 15th (or tomorrow, if later) for a 7-night trip.
 */
export function searchDatesFor(entry: Pick<MonthPrice, "month" | "departureDate" | "returnDate">, today: string): { departureDate: string; returnDate: string } {
  if (entry.departureDate && entry.departureDate > today && entry.returnDate && entry.returnDate > entry.departureDate) {
    return { departureDate: entry.departureDate, returnDate: entry.returnDate };
  }
  const mid = `${entry.month}-15`;
  const tomorrow = addDays(today, 1);
  const start = mid > tomorrow ? mid : tomorrow;
  return { departureDate: start, returnDate: addDays(start, 7) };
}

export function addDays(date: string, days: number): string {
  const t = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}
