/**
 * Milestone 63 — the travel blog (/blog). Each post's text lives in
 * components/blog/posts/*; this list holds what the index, the sitemap and
 * the page <head> need. Newest first.
 */

import type { PhotoKey } from "@/lib/blog/photos";

/** Milestone 64: a card on the home page "Travel ideas" (a city inside a post). */
export type BlogHighlight = { title: string; anchor: string; photo: PhotoKey };

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  published: string;
  updated?: string;
  readMinutes: number;
  tags: string[];
  /** Milestone 64: card photo (home page + blog index). */
  photo: PhotoKey;
  /** Milestone 64: extra home-page cards that open a section of the post. */
  highlights?: BlogHighlight[];
};

export const BLOG_POSTS: readonly BlogPostMeta[] = [
  {
    slug: "budapest-christmas-markets-2026",
    title: "Budapest Christmas markets 2026: dates, what to eat and how to get there",
    description:
      "Budapest's Christmas markets run to 31 Dec (Vörösmarty tér) and 1 Jan (Basilica). Dates, hours, chimney cake, how to get there from London, Paris and more.",
    published: "2026-11-21",
    readMinutes: 5,
    tags: ["Christmas markets", "Budapest", "Winter", "City break"],
    photo: "budapestBasilica",
  },
  {
    slug: "tromso-polar-night-northern-lights-2026",
    title: "Tromsø polar night 2026: northern lights, what to do and how to get there",
    description:
      "Tromsø's polar night runs about 27 Nov to 15 Jan. Northern lights season, what to do and eat, and how to get there from London, Paris and more.",
    published: "2026-11-21",
    readMinutes: 5,
    tags: ["Northern lights", "Tromsø", "Winter", "Arctic"],
    photo: "tromsoAurora",
  },
  {
    slug: "vienna-christmas-markets-2026",
    title: "Vienna Christmas markets 2026: dates, hours and how to get there",
    description:
      "Vienna's Christmas markets are open now: Rathausplatz to 26 Dec, Schönbrunn to 6 Jan. Hours, what to try, how to get there by flight or train, where to stay.",
    published: "2026-11-20",
    readMinutes: 4,
    tags: ["Christmas markets", "Vienna", "Winter", "City break"],
    photo: "viennaChristkindlmarkt",
  },
  {
    slug: "prague-christmas-markets-2026",
    title: "Prague Christmas markets 2026: dates, what to eat and how to get there",
    description:
      "Prague's big Christmas markets run 28 Nov 2026 to 6 Jan 2027. Dates, hours, what to eat and drink, how to get there from London, Paris and more, where to stay.",
    published: "2026-11-19",
    readMinutes: 5,
    tags: ["Christmas markets", "Prague", "Winter", "City break"],
    photo: "prague",
  },
  {
    slug: "strasbourg-christmas-market-2026",
    title: "Strasbourg Christmas market 2026: dates, how to get there and where to stay",
    description:
      "Strasbourg Christmas market: 27 Nov to 24 Dec 2026. Opening hours, how to get there by train from Paris or by flight, and where to stay, with live prices.",
    published: "2026-11-18",
    readMinutes: 4,
    tags: ["Christmas markets", "Strasbourg", "Winter", "City break"],
    photo: "strasbourg",
  },
  {
    slug: "cheap-weekend-trips-from-milan-winter",
    title: "5 cheap weekend trips from Milan this winter",
    description:
      "Budapest, Kraków, Lisbon, Seville and Athens: five easy, cheap weekend breaks from Milan this winter, with live flight prices, what to do and how to keep the trip on budget.",
    published: "2026-11-18",
    readMinutes: 7,
    tags: ["Milan", "Weekend trips", "Winter", "Budget travel"],
    photo: "milan",
    highlights: [
      { title: "Budapest: thermal baths in the snow", anchor: "budapest", photo: "budapest" },
      { title: "Kraków: the budget champion", anchor: "krakow", photo: "krakow" },
      { title: "Lisbon: winter sunshine", anchor: "lisbon", photo: "lisbon" },
      { title: "Seville: orange trees in January", anchor: "seville", photo: "seville" },
      { title: "Athens: the Acropolis without crowds", anchor: "athens", photo: "athens" },
    ],
  },
];

export function findPost(slug: string): BlogPostMeta | null {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

/** "18 November 2026" */
export function postDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d} ${months[m - 1]} ${y}`;
}
