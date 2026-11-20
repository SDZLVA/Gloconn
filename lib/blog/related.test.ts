import assert from "node:assert/strict";
import { test } from "node:test";
import { otherPosts, relatedPostsForRoute, relatedRoutesForPost } from "@/lib/blog/related";
import { BLOG_POSTS, findPost } from "@/lib/blog/posts";
import { FLIGHT_ROUTES, findRoute } from "@/lib/routes/catalog";

test("vienna post links to routes that end in Vienna", () => {
  const post = findPost("vienna-christmas-markets-2026")!;
  const routes = relatedRoutesForPost(post);
  assert.ok(routes.length > 0);
  assert.ok(routes.every((r) => r.to.name === "Vienna"));
});

test("route page finds the post about its destination", () => {
  const posts = relatedPostsForRoute(findRoute("milan-to-vienna")!, BLOG_POSTS);
  assert.ok(posts.some((p) => p.slug === "vienna-christmas-markets-2026"));
});

test("highlight anchors count (Budapest is a section of the Milan weekend post)", () => {
  const posts = relatedPostsForRoute(findRoute("milan-to-budapest")!, BLOG_POSTS);
  assert.ok(posts.some((p) => p.slug === "cheap-weekend-trips-from-milan-winter"));
});

test("otherPosts never returns the current post", () => {
  const post = BLOG_POSTS[0];
  assert.ok(otherPosts(post, BLOG_POSTS).every((p) => p.slug !== post.slug));
});

test("catalog: no route goes from a city to itself, no duplicate pairs", () => {
  const keys = FLIGHT_ROUTES.map((r) => `${r.from.code}-${r.to.code}`);
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(FLIGHT_ROUTES.every((r) => r.from.code !== r.to.code));
});
