import type { MetadataRoute } from "next";
import { getAppConfig } from "@/lib/config";
import { CITY_GUIDES } from "@/lib/cityGuides/data";
import { DESTINATIONS } from "@/lib/destinations/data";
import { IT_DESTINATIONS, IT_HUB_MIN_PAGES, italianFor } from "@/lib/destinations/it/content";
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
  // Milestones 75/78: destinations hub and destination pages.
  pages.push({ url: `${siteUrl}/destinations`, lastModified, changeFrequency: "weekly", priority: 0.8 });
  for (const d of DESTINATIONS) {
    const it = italianFor(d.slug);
    pages.push({
      url: `${siteUrl}/destinations/${d.slug}`,
      lastModified: new Date(`${d.checked}T00:00:00Z`),
      changeFrequency: "monthly",
      priority: 0.7,
      // Milestone 90: link the English and Italian versions of the same page.
      ...(it ? { alternates: { languages: { en: `${siteUrl}/destinations/${d.slug}`, it: `${siteUrl}/it/destinazioni/${it.itSlug}` } } } : {}),
    });
  }
  // Milestone 90: Italian destination pages (the hub is listed once there are enough pages).
  if (IT_DESTINATIONS.length >= IT_HUB_MIN_PAGES) {
    pages.push({ url: `${siteUrl}/it/destinazioni`, lastModified, changeFrequency: "weekly", priority: 0.7 });
  }
  for (const it of IT_DESTINATIONS) {
    pages.push({
      url: `${siteUrl}/it/destinazioni/${it.itSlug}`,
      lastModified: new Date(`${it.checked}T00:00:00Z`),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: { en: `${siteUrl}/destinations/${it.slug}`, it: `${siteUrl}/it/destinazioni/${it.itSlug}` } },
    });
  }
  // Milestone 63: the blog.
  pages.push({ url: `${siteUrl}/blog`, lastModified, changeFrequency: "weekly", priority: 0.8 });
  for (const post of BLOG_POSTS) {
    pages.push({ url: `${siteUrl}/blog/${post.slug}`, lastModified: new Date(`${post.updated ?? post.published}T00:00:00Z`), changeFrequency: "weekly", priority: 0.7 });
  }
  return pages;
}
