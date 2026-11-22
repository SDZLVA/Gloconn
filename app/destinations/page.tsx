import type { Metadata } from "next";
import Link from "next/link";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAppConfig } from "@/lib/config";
import { DESTINATIONS, TOP_PER_REGION, destinationsInRegion, hotDestinations } from "@/lib/destinations/data";
import { itemListJsonLd } from "@/lib/destinations/seo";
import { REGIONS } from "@/lib/destinations/types";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

/**
 * Milestone 78 — /destinations: every destination page, grouped by the 7 continents. It is built
 * from lib/destinations/data.ts, so a new destination appears here by itself.
 */

export const revalidate = 43200;

const TITLE = "Top travel destinations by continent";
const DESCRIPTION = "Browse the most-visited travel destinations on every continent. Open a place for sights, the best time to go, and a live search for flights and hotels.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/destinations" },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: "/destinations" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function DestinationsPage() {
  const { siteUrl } = getAppConfig().app;
  const today = new Date().toISOString().slice(0, 10);
  const month = new Date().getUTCMonth() + 1;
  const hot = hotDestinations(month, 4);

  return (
    <div className="space-y-12">
      <JsonLd
        data={[
          breadcrumbJsonLd(siteUrl, [
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/destinations" },
          ]),
          itemListJsonLd(
            siteUrl,
            DESTINATIONS.map((d) => ({ name: `${d.name} travel guide`, path: `/destinations/${d.slug}` })),
          ),
        ]}
      />
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">Destinations around the world</h1>
        <p className="max-w-2xl text-slate-600">
          The most-visited places on all seven continents. Open one for sights, the best time to go, and a live search for flights and hotels.
        </p>
        <nav aria-label="Regions" className="flex flex-wrap gap-2 pt-1">
          {REGIONS.map((r) => (
            <a key={r.id} href={`#${r.id}`} className="rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100">
              {r.name}
            </a>
          ))}
        </nav>
      </header>

      <section aria-labelledby="hot-now" className="space-y-4">
        <h2 id="hot-now" className="text-2xl font-extrabold text-brand-900">
          At their best this month
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hot.map((d) => (
            <li key={d.slug}>
              <DestinationCard d={d} today={today} />
            </li>
          ))}
        </ul>
      </section>

      {REGIONS.map((region) => {
        const list = destinationsInRegion(region.id);
        if (list.length === 0) return null;
        const top = list.slice(0, TOP_PER_REGION);
        const more = list.slice(TOP_PER_REGION);
        return (
          <section key={region.id} id={region.id} aria-labelledby={`h-${region.id}`} className="scroll-mt-24 space-y-4">
            <h2 id={`h-${region.id}`} className="text-2xl font-extrabold text-brand-900">
              {region.name}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {top.map((d) => (
                <li key={d.slug}>
                  <DestinationCard d={d} today={today} />
                </li>
              ))}
            </ul>
            {more.length > 0 && (
              <p className="text-sm text-slate-600">
                More in {region.name}:{" "}
                {more.map((d, i) => (
                  <span key={d.slug}>
                    {i > 0 && " · "}
                    <Link href={`/destinations/${d.slug}`} className="font-semibold text-brand-700 hover:text-brand-900">
                      {d.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </section>
        );
      })}
      <p className="text-xs text-slate-500">{DESTINATIONS.length} destinations. New places are added as they become popular, and the guides are re-checked every week.</p>
    </div>
  );
}
