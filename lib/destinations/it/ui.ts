import { monthRuns } from "@/lib/destinations/seo";

/**
 * Milestone 90 — Italian wording helpers for the /it/destinazioni pages. Same logic as the
 * English helpers in lib/destinations/seo.ts, with Italian month and region names.
 */

export const MONTH_NAMES_IT = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"] as const;
export const MONTH_SHORT_IT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"] as const;

export const REGION_NAMES_IT: Record<string, string> = {
  africa: "Africa",
  asia: "Asia",
  europe: "Europa",
  "north-america": "Nord America",
  "south-america": "Sud America",
  oceania: "Oceania",
  antarctica: "Antartide",
};

/** "da aprile a giugno e da settembre a ottobre" */
export function monthsPhraseIt(months: readonly number[]): string {
  const parts = monthRuns(months).map((run) => {
    const first = MONTH_NAMES_IT[run[0] - 1];
    const last = MONTH_NAMES_IT[run[run.length - 1] - 1];
    return run.length === 1 ? first : `da ${first} a ${last}`;
  });
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
}

export function monthCellsIt(months: readonly number[]): { name: string; short: string; best: boolean }[] {
  return MONTH_NAMES_IT.map((name, i) => ({ name, short: MONTH_SHORT_IT[i], best: months.includes(i + 1) }));
}

/** "2026-12" -> "dicembre 2026" */
export function monthLabelIt(month: string): string {
  const [y, m] = month.split("-");
  return `${MONTH_NAMES_IT[Number(m) - 1]} ${y}`;
}

/** "2026-12-16" -> "16 dic" */
export function shortDayIt(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(d)} ${MONTH_SHORT_IT[Number(m) - 1]}`;
}

/** Search-result title (before the site-name suffix), at most 49 characters. */
export function seoTitleIt(name: string): string {
  const options = [`${name}: guida di viaggio, quando andare e voli`, `${name}: guida di viaggio e quando andare`, `${name}: guida di viaggio`];
  return options.find((t) => t.length <= 49) ?? options[2];
}
