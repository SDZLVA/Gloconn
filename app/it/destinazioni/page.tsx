import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { photoUrl } from "@/lib/blog/photos";
import { getAppConfig } from "@/lib/config";
import { findDestination } from "@/lib/destinations/data";
import { destinationPhoto } from "@/lib/destinations/photos";
import { IT_DESTINATIONS, IT_HUB_MIN_PAGES, atIt } from "@/lib/destinations/it/content";
import { itemListJsonLd } from "@/lib/destinations/seo";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

/**
 * Milestone 90 — Italian destinations hub (/it/destinazioni). Kept out of search results until at
 * least 5 Italian pages exist, so Google is not shown a nearly empty page.
 */

const TITLE = "Destinazioni: guide di viaggio, quando andare e voli";
const DESCRIPTION = "Guide di viaggio in italiano: cosa vedere, quando andare e una ricerca di voli e hotel per le mete più richieste.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/it/destinazioni", languages: { it: "/it/destinazioni", en: "/destinations" } },
  robots: IT_DESTINATIONS.length >= IT_HUB_MIN_PAGES ? { index: true, follow: true } : { index: false, follow: true },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: "/it/destinazioni" },
};

export default function ItalianHubPage() {
  const { siteUrl } = getAppConfig().app;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <JsonLd
        data={[
          breadcrumbJsonLd(siteUrl, [
            { name: "Home", path: "/" },
            { name: "Destinazioni", path: "/it/destinazioni" },
          ]),
          itemListJsonLd(siteUrl, IT_DESTINATIONS.map((d) => ({ name: `Guida di viaggio ${atIt(d)}`, path: `/it/destinazioni/${d.itSlug}` }))),
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">Destinazioni: guide di viaggio in italiano</h1>
        <p className="text-slate-600">Per ogni meta trovi cosa vedere, il periodo migliore, come muoverti, dove dormire, quanto costa e una ricerca di voli e hotel.</p>
        <p className="text-sm">
          <Link href="/destinations" className="font-semibold text-brand-700 hover:text-brand-900">
            Read the guides in English →
          </Link>
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {IT_DESTINATIONS.map((d) => {
          const en = findDestination(d.slug);
          const photo = en ? destinationPhoto(en.photo) : null;
          return (
            <li key={d.itSlug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Link href={`/it/destinazioni/${d.itSlug}`} className="block">
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl(photo.id, 600, 450)} alt={photo.alt} width={600} height={450} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
                )}
                <div className="space-y-1 p-4">
                  <h2 className="text-lg font-bold text-slate-900">{d.name}</h2>
                  <p className="text-sm text-slate-600">{d.tagline}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
