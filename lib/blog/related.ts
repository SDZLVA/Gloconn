/**
 * Milestone 73 — internal links between blog posts and route pages.
 * A post is about a city when the city is one of its tags, or one of its
 * highlight anchors (a section id like "budapest"). Automatic: a new post
 * with the city tag gets linked with no extra work.
 */

import type { BlogPostMeta } from "@/lib/blog/posts";
import { FLIGHT_ROUTES, type FlightRoute } from "@/lib/routes/catalog";

export function postMentionsCity(post: BlogPostMeta, city: { name: string; slug: string }): boolean {
  return post.tags.includes(city.name) || (post.highlights ?? []).some((h) => h.anchor === city.slug);
}

/** Route pages that end in a city this post is about (several origins per city, spread so one origin does not fill the list). */
export function relatedRoutesForPost(post: BlogPostMeta, max = 6): FlightRoute[] {
  const matches = FLIGHT_ROUTES.filter((r) => postMentionsCity(post, r.to));
  const perOrigin = new Map<string, number>();
  const picked: FlightRoute[] = [];
  // Pass 1: at most 2 per origin; pass 2: fill the rest.
  for (const r of matches) {
    const n = perOrigin.get(r.from.code) ?? 0;
    if (n < 2 && picked.length < max) {
      picked.push(r);
      perOrigin.set(r.from.code, n + 1);
    }
  }
  for (const r of matches) if (picked.length < max && !picked.includes(r)) picked.push(r);
  return picked;
}

/** Posts about the route's destination. */
export function relatedPostsForRoute(route: FlightRoute, posts: readonly BlogPostMeta[], max = 3): BlogPostMeta[] {
  return posts.filter((p) => postMentionsCity(p, route.to)).slice(0, max);
}

/** Other posts to read next (newest first, not the current one). */
export function otherPosts(current: BlogPostMeta, posts: readonly BlogPostMeta[], max = 3): BlogPostMeta[] {
  return posts.filter((p) => p.slug !== current.slug).slice(0, max);
}
