import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationSearch } from "@/components/destinations/DestinationSearch";
import { JsonLd } from "@/components/seo/JsonLd";
import { addDays } from "@/features/routePrices/parse";
import { photoUrl } from "@/lib/blog/photos";
import { destinationPhoto } from "@/lib/destinations/photos";
import { getAppConfig } from "@/lib/config";
import { DESTINATIONS, findDestination } from "@/lib/destinations/data";
import { LISTED_ROUTES, ROUTE_CITIES, cityLabel, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";

/**
 * Milestone 75 — destination page (/destinations/dubai): what to see, when to go, then a flight
 * and a hotel search for that city. Facts and sources: lib/destinations/data.ts.
 */

export const revalidate = 43200;
export const dynamicParams = false;

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = findDestination(slug);
  if (!d) return {};
  const photo = destinationPhoto(d.photo);
  const image = photo ? photoUrl(photo.id, 1200, 630) : null;
  return {
    title: d.title,
    description: d.description,
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: { type: "article", title: d.title, description: d.description, url: `/destinations/${d.slug}`, ...(image && photo ? { images: [{ url: image, width: 1200, height: 630, alt: photo.alt }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title: d.title, description: d.description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = findDestination(slug);
  if (!d) notFound();
  const city = ROUTE_CITIES[d.cityCode];
  const photo = destinationPhoto(d.photo);
  const { siteUrl } = getAppConfig().app;
  const today = new Date().toISOString().slice(0, 10);
  const dates = { departureDate: addDays(today, 45), returnDate: addDays(today, 52) };
  const priced = LISTED_ROUTES.filter((r) => r.to.code === d.cityCode).slice(0, 6);
  const hotelsRoute: FlightRoute = { slug: `${city.slug}`, from: city, to: city };

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <JsonLd
        data={[
          breadcrumbJsonLd(siteUrl, [
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/destinations" },
            { name: `${d.name} travel guide`, path: `/destinations/${d.slug}` },
          ]),
          faqJsonLd(d.faq),
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/" className="font-semibold text-brand-700 hover:text-brand-900">
          Home
        </Link>{" "}
        ›{" "}
        <Link href="/destinations" className="font-semibold text-brand-700 hover:text-brand-900">
          Destinations
        </Link>{" "}
        › {d.name}
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">{d.title}</h1>
        {photo && (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl(photo.id, 960, 540)}
            alt={photo.alt}
            width={960}
            height={540}
            decoding="async"
            className="aspect-video w-full rounded-2xl object-cover"
          />
          <figcaption className="mt-1 text-xs text-slate-500">
            Photo by{" "}
            <a href={photo.page} rel="noopener noreferrer" className="underline">
              {photo.by}
            </a>{" "}
            on Unsplash
          </figcaption>
        </figure>
        )}
        {d.gatewayNote && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">{d.gatewayNote}</p>}
        {d.intro.map((p) => (
          <p key={p} className="text-slate-600">
            {p}
          </p>
        ))}
      </header>

      <section aria-labelledby="attractions" className="space-y-3">
        <h2 id="attractions" className="text-xl font-bold text-slate-900">
          Top things to see in {d.name}
        </h2>
        <ul className="space-y-3">
          {d.attractions.map((a) => (
            <li key={a.name} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{a.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{a.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="when" className="space-y-2">
        <h2 id="when" className="text-xl font-bold text-slate-900">
          Best time to visit {d.name}
        </h2>
        {d.bestTime.map((p) => (
          <p key={p} className="leading-relaxed text-slate-700">
            {p}
          </p>
        ))}
      </section>

      <section aria-labelledby="book" className="space-y-3">
        <h2 id="book" className="text-xl font-bold text-slate-900">
          Find flights and hotels for {d.name}
        </h2>
        <DestinationSearch destination={cityLabel(city)} destinationId={`city-${city.code}`} />
        <p className="text-sm text-slate-600">
          Quick links:{" "}
          <Link href={routeSearchUrl(hotelsRoute, dates, "hotels")} className="font-semibold text-brand-700 hover:text-brand-900">
            hotels in {city.name} next month
          </Link>
          {priced.map((r) => (
            <span key={r.slug}>
              {" · "}
              <Link href={`/flights/${r.slug}`} className="font-semibold text-brand-700 hover:text-brand-900">
                {r.from.name} → {city.name} prices by month
              </Link>
            </span>
          ))}
        </p>
      </section>

      <section aria-labelledby="tips" className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
        <h2 id="tips" className="text-lg font-bold text-brand-900">
          Quick checklist
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {d.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="space-y-3">
        <h2 id="faq" className="text-xl font-bold text-slate-900">
          Questions about visiting {d.name}
        </h2>
        <dl className="space-y-3">
          {d.faq.map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-4">
              <dt className="font-semibold text-slate-900">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-700">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="text-xs text-slate-500">Information checked {d.checked}. Seasons, opening hours and prices change, so confirm before you book.</p>
    </article>
  );
}
