import type { MetadataRoute } from "next";
import { getAppConfig } from "@/lib/config";
import { CITY_GUIDES } from "@/lib/cityGuides/data";
import { DESTINATIONS } from "@/lib/destinations/data";
import { LISTED_ROUTES } from "@/lib/routes/catalog";
import { BLOG_POSTS } from "@/lib/blog/posts";

/** Public pages worth listing for search engines. */
const PUBLIC_PATHS = ["/", "/privacy", "/terms"] as const;

/** sitemap.xml — only public, indexable pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl } = getAppConfig().app;
  const lastModified = new Date();

  const pages: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "yearly",
    priority: path === "/" ? 1 : 0.5,
  }));
  // Milestone 62: route pages (prices refresh every 12 h).
  pages.push({ url: `${siteUrl}/flights`, lastModified, changeFrequency: "weekly", priority: 0.8 });
  for (const route of LISTED_ROUTES) {
    pages.push({ url: `${siteUrl}/flights/${route.slug}`, lastModified, changeFrequency: "daily", priority: 0.7 });
  }
  // Milestone 74: content-first city pages.
  for (const guide of CITY_GUIDES) {
    pages.push({ url: `${siteUrl}/flights-from/${guide.slug}`, lastModified: new Date(`${guide.checked}T00:00:00Z`), changeFrequency: "monthly", priority: 0.7 });
  }
  // Milestone 75: destination pages.
  for (const d of DESTINATIONS) {
    pages.push({ url: `${siteUrl}/destinations/${d.slug}`, lastModified: new Date(`${d.checked}T00:00:00Z`), changeFrequency: "monthly", priority: 0.7 });
  }
  // Milestone 63: the blog.
  pages.push({ url: `${siteUrl}/blog`, lastModified, changeFrequency: "weekly", priority: 0.8 });
  for (const post of BLOG_POSTS) {
    pages.push({ url: `${siteUrl}/blog/${post.slug}`, lastModified: new Date(`${post.updated ?? post.published}T00:00:00Z`), changeFrequency: "weekly", priority: 0.7 });
  }
  return pages;
}
