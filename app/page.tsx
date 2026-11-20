import { HomeSearchHero } from "@/components/home/HomeSearchHero";
import { TravelIdeas } from "@/components/home/TravelIdeas";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAppConfig } from "@/lib/config";
import { websiteJsonLd } from "@/lib/seo/jsonld";

/** Milestone 52: one canonical home page (?mode=… and other variants point here). */
export const metadata = { alternates: { canonical: "/" } };

/**
 * Home page — Milestone 28: mode tabs (Packages, Flights, Hotels, Mixed
 * Transport) with a one-row search bar for each. Milestone 64: "Travel ideas"
 * cards from the blog below it.
 */
export default function Home() {
  return (
    <>
      {/* Milestone 72: Organization + WebSite structured data (name and logo in search results). */}
      <JsonLd data={websiteJsonLd(getAppConfig().app.siteUrl)} />
      <HomeSearchHero />
      {/* Milestone 64: blog posts as photo cards. */}
      <TravelIdeas />
    </>
  );
}
