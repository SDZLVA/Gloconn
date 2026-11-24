import type { Destination } from "@/lib/destinations/types";
import type { JsonLdObject } from "@/lib/seo/jsonld";

/**
 * Milestone 79 — SEO helpers for the destination pages. Pure functions built only from the data
 * in lib/destinations (no invented facts), so they are easy to test.
 */

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

/** The root layout adds " — Glooconn" (11 characters). Google shows about 60 characters. */
const TITLE_ROOM = 49;

/** Search-result title (before the site-name suffix) that stays short enough not to be cut off. */
export function seoTitle(d: Pick<Destination, "name">): string {
  const options = [`${d.name} travel guide: best time, sights, flights`, `${d.name} travel guide: best time and flights`, `${d.name} travel guide`];
  return options.find((t) => t.length <= TITLE_ROOM) ?? options[2];
}

/** Groups months (1–12) into runs of consecutive months; December and January join into one run. */
export function monthRuns(months: readonly number[]): number[][] {
  const sorted = [...new Set(months)].sort((a, b) => a - b);
  const runs: number[][] = [];
  for (const m of sorted) {
    const last = runs[runs.length - 1];
    if (last && last[last.length - 1] === m - 1) last.push(m);
    else runs.push([m]);
  }
  if (runs.length > 1 && runs[0][0] === 1 && runs[runs.length - 1].slice(-1)[0] === 12) {
    const first = runs.shift() as number[];
    runs[runs.length - 1].push(...first);
  }
  return runs;
}

function joinList(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** "April to June and September to October" — the months as plain words for a sentence. */
export function monthsPhrase(months: readonly number[]): string {
  const parts = monthRuns(months).map((run) => {
    const first = MONTH_NAMES[run[0] - 1];
    const last = MONTH_NAMES[run[run.length - 1] - 1];
    return run.length === 1 ? first : `${first} to ${last}`;
  });
  return joinList(parts);
}

/** Twelve cells for the month grid: short name and whether the place is at its best that month. */
export function monthCells(months: readonly number[]): { name: string; short: string; best: boolean }[] {
  return MONTH_NAMES.map((name, i) => ({ name, short: name.slice(0, 3), best: months.includes(i + 1) }));
}

/**
 * Other destinations to link to from a page: the same region first, those at their best this
 * month ahead of the rest, then the best-ranked. Tops up from other regions. Never the page itself.
 */
export function relatedDestinations(d: Destination, all: readonly Destination[], month: number, count = 4): Destination[] {
  const score = (x: Destination) => (x.region === d.region ? 0 : 2) + (x.bestMonths.includes(month) ? 0 : 1);
  return all
    .filter((x) => x.slug !== d.slug)
    .sort((a, b) => score(a) - score(b) || a.rank - b.rank || a.slug.localeCompare(b.slug))
    .slice(0, count);
}

type PostLike = { slug: string; title: string; tags: readonly string[] };

/** Blog posts that are about this place: its name is a tag or appears in the title. */
export function postsAbout<T extends PostLike>(d: Pick<Destination, "name">, posts: readonly T[], count = 2): T[] {
  const n = d.name.toLowerCase();
  return posts.filter((p) => p.tags.some((t) => t.toLowerCase() === n) || p.title.toLowerCase().includes(n)).slice(0, count);
}

const abs = (siteUrl: string, path: string) => `${siteUrl.replace(/\/$/, "")}${path}`;

/** schema.org TouristDestination (the place) plus a WebPage with its last-checked date. */
export function destinationJsonLd(
  siteUrl: string,
  d: Destination,
  image?: string,
  /** Italian pages (milestone 90) pass their own path and language. */
  opts: { path?: string; lang?: string } = {},
): JsonLdObject[] {
  const url = abs(siteUrl, opts.path ?? `/destinations/${d.slug}`);
  return [
    {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      "@id": `${url}#place`,
      name: d.name,
      description: d.description,
      url,
      ...(image ? { image } : {}),
      containedInPlace: { "@type": "Country", name: d.country },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: d.title,
      description: d.description,
      url,
      dateModified: d.checked,
      inLanguage: opts.lang ?? "en",
      about: { "@id": `${url}#place` },
      isPartOf: { "@type": "WebSite", name: "Glooconn", url: abs(siteUrl, "") },
    },
  ];
}

/** schema.org ItemList of pages (used on the /destinations hub). */
export function itemListJsonLd(siteUrl: string, items: readonly { name: string; path: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: abs(siteUrl, it.path) })),
  };
}
