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
