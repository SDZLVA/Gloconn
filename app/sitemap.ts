import type { MetadataRoute } from "next";
import { getAppConfig } from "@/lib/config";

/** Public pages worth listing for search engines. */
const PUBLIC_PATHS = ["/", "/login", "/signup", "/privacy", "/terms"] as const;

/** sitemap.xml — only public, indexable pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl } = getAppConfig().app;
  const lastModified = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "yearly",
    priority: path === "/" ? 1 : 0.5,
  }));
}
