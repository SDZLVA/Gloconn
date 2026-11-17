/** Milestone 63 — date helpers for blog price boxes (pure). */

import { addDays } from "@/features/routePrices/parse";

/** The coming winter's months (Dec, Jan, Feb) that are not over yet, as YYYY-MM. */
export function winterMonths(today: string): string[] {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  // From March to November the next winter starts in December of this year.
  const decYear = month <= 2 ? year - 1 : year;
  const all = [`${decYear}-12`, `${decYear + 1}-01`, `${decYear + 1}-02`];
  return all.filter((m) => m >= today.slice(0, 7));
}

/** Christmas and New Year weekends are the most expensive of the winter — skip them. */
const holiday = (date: string) => {
  const md = date.slice(5);
  return md >= "12-18" || md <= "01-06";
};

/** First Friday → Sunday weekend in a month that starts after today (not over Christmas/New Year); null if none left. */
export function weekendIn(month: string, today: string): { departureDate: string; returnDate: string } | null {
  for (let day = 1; day <= 31; day++) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    const t = Date.parse(`${date}T00:00:00Z`);
    if (Number.isNaN(t) || new Date(t).toISOString().slice(0, 7) !== month) break;
    if (date <= today || holiday(date)) continue;
    if (new Date(t).getUTCDay() === 5) return { departureDate: date, returnDate: addDays(date, 2) };
  }
  return null;
}
