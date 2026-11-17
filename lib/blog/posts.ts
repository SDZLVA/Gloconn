/**
 * Milestone 63 — the travel blog (/blog). Each post's text lives in
 * components/blog/posts/*; this list holds what the index, the sitemap and
 * the page <head> need. Newest first.
 */

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  published: string;
  updated?: string;
  readMinutes: number;
  tags: string[];
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
