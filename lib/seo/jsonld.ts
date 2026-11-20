/**
 * Milestone 72 — structured data (schema.org JSON-LD) helpers.
 * Pure functions: they only build plain objects, so they are easy to test.
 */

export type JsonLdObject = Record<string, unknown>;

export type Crumb = { name: string; path: string };

export type FaqItem = { q: string; a: string };

const abs = (siteUrl: string, path: string) => `${siteUrl.replace(/\/$/, "")}${path === "/" ? "" : path}`;

export function breadcrumbJsonLd(siteUrl: string, crumbs: readonly Crumb[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(siteUrl, c.path),
    })),
  };
}

export function faqJsonLd(items: readonly FaqItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function articleJsonLd(
  siteUrl: string,
  post: { slug: string; title: string; description: string; published: string; updated?: string; image?: string },
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.published,
    dateModified: post.updated ?? post.published,
    mainEntityOfPage: abs(siteUrl, `/blog/${post.slug}`),
    ...(post.image ? { image: [post.image] } : {}),
    author: { "@type": "Organization", name: "Glooconn", url: abs(siteUrl, "/") },
    publisher: {
      "@type": "Organization",
      name: "Glooconn",
      url: abs(siteUrl, "/"),
      logo: { "@type": "ImageObject", url: abs(siteUrl, "/icon.png") },
    },
  };
}

export function websiteJsonLd(siteUrl: string): JsonLdObject[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Glooconn",
      url: abs(siteUrl, "/"),
      logo: abs(siteUrl, "/icon.png"),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Glooconn",
      url: abs(siteUrl, "/"),
    },
  ];
}

/** JSON for a <script type="application/ld+json">: "<" is escaped so text can never close the tag. */
export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
