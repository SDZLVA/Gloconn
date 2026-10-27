import type { MetadataRoute } from "next";
import { getAppConfig } from "@/lib/config";

/**
 * robots.txt — allows crawling of public pages, keeps private and
 * API routes out of search results.
 */
export default function robots(): MetadataRoute.Robots {
  const { siteUrl } = getAppConfig().app;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/my-trips", "/profile", "/auth/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
