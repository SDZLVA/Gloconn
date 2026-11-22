import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { DestinationSearch } from "@/components/destinations/DestinationSearch";
import { JsonLd } from "@/components/seo/JsonLd";
import { addDays } from "@/features/routePrices/parse";
import { findGuide } from "@/lib/cityGuides/data";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { photoUrl } from "@/lib/blog/photos";
import { destinationDetails } from "@/lib/destinations/details";
import { destinationPhoto } from "@/lib/destinations/photos";
import { getAppConfig } from "@/lib/config";
import { DESTINATIONS, findDestination } from "@/lib/destinations/data";
import { destinationJsonLd, monthCells, monthsPhrase, postsAbout, relatedDestinations, seoTitle } from "@/lib/destinations/seo";
import { REGIONS } from "@/lib/destinations/types";
import { LISTED_ROUTES, ROUTE_CITIES, cityLabel, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";

/**
 * Destination page (/destinations/dubai): what to see, when to go, then a flight and a hotel
 * search for that city. Facts and sources: lib/destinations/data.ts and lib/destinations/regions.
 * Milestone 79: short search title, quick answer, at-a-glance box, month grid, contents list,
 * links to related places / the city flight guide / blog posts, TouristDestination markup.
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
    title: seoTitle(d),
    description: d.description,
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: { type: "article", title: d.title, description: d.description, url: `/destinations/${d.slug}`, modifiedTime: d.checked, ...(image && photo ? { images: [{ url: image, width: 1200, height: 630, alt: photo.alt }] } : {}) },
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
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const month = now.getUTCMonth() + 1;
  const dates = { departureDate: addDays(today, 45), returnDate: addDays(today, 52) };
  const priced = LISTED_ROUTES.filter((r) => r.to.code === d.cityCode).slice(0, 6);
  const hotelsRoute: FlightRoute = { slug: `${city.slug}`, from: city, to: city };
  const region = REGIONS.find((r) => r.id === d.region);
  const best = monthsPhrase(d.bestMonths);
  const details = destinationDetails(d.slug);
  const faq = [...d.faq, ...(details?.extraFaq ?? [])];
  const guide = findGuide(d.slug);
  const posts = postsAbout(d, BLOG_POSTS);
  const related = relatedDestinations(d, DESTINATIONS, month, 4);
  const link = "font-semibold text-brand-700 hover:text-brand-900";

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <JsonLd
        data={[
          breadcrumbJsonLd(siteUrl, [
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/destinations" },
            { name: `${d.name} travel guide`, path: `/destinations/${d.slug}` },
          ]),
          faqJsonLd(faq),
          ...destinationJsonLd(siteUrl, d, photo ? photoUrl(photo.id, 1200, 630) : undefined),
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/" className={link}>
          Home
        </Link>{" "}
        ›{" "}
        <Link href="/destinations" className={link}>
          Destinations
        </Link>{" "}
        {region && (
          <>
            ›{" "}
            <Link href={`/destinations#${region.id}`} className={link}>
              {region.name}
            </Link>{" "}
          </>
        )}
        › {d.name}
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">{d.title}</h1>
        {photo && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl(photo.id, 960, 540)}
              srcSet={`${photoUrl(photo.id, 640, 360)} 640w, ${photoUrl(photo.id, 960, 540)} 960w, ${photoUrl(photo.id, 1440, 810)} 1440w`}
              sizes="(min-width: 768px) 768px, 100vw"
              alt={photo.alt}
              width={960}
              height={540}
              fetchPriority="high"
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
        <p className="rounded-2xl bg-brand-50 p-4 text-slate-800 ring-1 ring-brand-100">
          <strong className="text-brand-900">Best time to visit {d.name}:</strong> {best}. {d.tagline}.
        </p>
        {d.intro.map((p) => (
          <p key={p} className="text-slate-600">
            {p}
          </p>
        ))}
      </header>

      <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Country</dt>
          <dd className="font-semibold text-slate-900">{d.country}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Best months</dt>
          <dd className="font-semibold text-slate-900">{best}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{d.gatewayNote ? "Fly to" : "Search flights to"}</dt>
          <dd className="font-semibold text-slate-900">
            {city.name} ({city.code})
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Region</dt>
          <dd className="font-semibold text-slate-900">{region?.name}</dd>
        </div>
      </dl>

      <nav aria-label="On this page" className="flex flex-wrap gap-2 text-sm">
        {[
          ["attractions", "Things to see"],
          ["when", "Best time to go"],
          ...(details ? [["getting-around", "Getting around"], ["stay", "Where to stay"], ["costs", "Costs"]] : []),
          ["book", "Flights and hotels"],
          ["tips", "Checklist"],
          ["faq", "Questions"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700">
            {label}
          </a>
        ))}
      </nav>

      <section aria-labelledby="attractions" className="scroll-mt-24 space-y-3">
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

      <section aria-labelledby="when" className="scroll-mt-24 space-y-3">
        <h2 id="when" className="text-xl font-bold text-slate-900">
          Best time to visit {d.name}
        </h2>
        <div>
          <ol className="grid grid-cols-6 gap-1.5 sm:grid-cols-12" aria-label={`Months when ${d.name} is at its best: ${best}`}>
            {monthCells(d.bestMonths).map((c) => (
              <li
                key={c.name}
                title={c.best ? `${c.name}: at its best` : c.name}
                className={`rounded-lg py-1.5 text-center text-xs font-bold ${c.best ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}
              >
                {c.short}
                <span className="sr-only">{c.best ? " (best)" : ""}</span>
              </li>
            ))}
          </ol>
          <p className="mt-1.5 text-xs text-slate-500">Blue months are the best time to go.</p>
        </div>
        {d.bestTime.map((p) => (
          <p key={p} className="leading-relaxed text-slate-700">
            {p}
          </p>
        ))}
      </section>

      {details && (
        <>
          <section aria-labelledby="getting-around" className="scroll-mt-24 space-y-3">
            <h2 id="getting-around" className="text-xl font-bold text-slate-900">
              Getting to and around {d.name}
            </h2>
            {details.gettingAround.map((p) => (
              <p key={p} className="leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
          </section>

          <section aria-labelledby="stay" className="scroll-mt-24 space-y-3">
            <h2 id="stay" className="text-xl font-bold text-slate-900">
              Where to stay in {d.name}
            </h2>
            <ul className="space-y-3">
              {details.whereToStay.map((a) => (
                <li key={a.area} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold text-slate-900">{a.area}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{a.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="costs" className="scroll-mt-24 space-y-3">
            <h2 id="costs" className="text-xl font-bold text-slate-900">
              What a trip to {d.name} costs
            </h2>
            {details.costs.map((p) => (
              <p key={p} className="leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
          </section>
        </>
      )}

      <section aria-labelledby="book" className="scroll-mt-24 space-y-3">
        <h2 id="book" className="text-xl font-bold text-slate-900">
          Find flights and hotels for {d.name}
        </h2>
        <DestinationSearch destination={cityLabel(city)} destinationId={`city-${city.code}`} />
        <p className="text-sm text-slate-600">
          Quick links:{" "}
          <Link href={routeSearchUrl(hotelsRoute, dates, "hotels")} className={link}>
            hotels in {city.name} next month
          </Link>
          {priced.map((r) => (
            <span key={r.slug}>
              {" · "}
              <Link href={`/flights/${r.slug}`} className={link}>
                {r.from.name} → {city.name} prices by month
              </Link>
            </span>
          ))}
          {guide && (
            <span>
              {" · "}
              <Link href={`/flights-from/${guide.slug}`} className={link}>
                flights from {city.name}: airports and cheapest months
              </Link>
            </span>
          )}
        </p>
      </section>

      <section aria-labelledby="tips" className="scroll-mt-24 rounded-2xl border border-brand-100 bg-brand-50 p-5">
        <h2 id="tips" className="text-lg font-bold text-brand-900">
          Quick checklist
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {d.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="scroll-mt-24 space-y-3">
        <h2 id="faq" className="text-xl font-bold text-slate-900">
          Questions about visiting {d.name}
        </h2>
        <dl className="space-y-3">
          {faq.map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-4">
              <dt className="font-semibold text-slate-900">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-700">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {posts.length > 0 && (
        <section aria-labelledby="read" className="space-y-2">
          <h2 id="read" className="text-xl font-bold text-slate-900">
            Read more about {d.name}
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className={link}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="more" className="space-y-3">
        <h2 id="more" className="text-xl font-bold text-slate-900">
          More places to explore
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {related.map((r) => (
            <li key={r.slug}>
              <DestinationCard d={r} today={today} />
            </li>
          ))}
        </ul>
        <p className="text-sm">
          <Link href="/destinations" className={link}>
            See all {DESTINATIONS.length} destinations →
          </Link>
        </p>
      </section>

      <p className="text-xs text-slate-500">Information checked {details && details.checked > d.checked ? details.checked : d.checked}. Seasons, opening hours and prices change, so confirm before you book.</p>
    </article>
  );
}
