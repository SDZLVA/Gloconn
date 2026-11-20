import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteSearchBox } from "@/components/routes/RouteSearchBox";
import { JsonLd } from "@/components/seo/JsonLd";
import { addDays } from "@/features/routePrices/parse";
import { CITY_GUIDES, findGuide } from "@/lib/cityGuides/data";
import { getAppConfig } from "@/lib/config";
import { ROUTE_CITIES, LISTED_ROUTES, cityLabel, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";

/**
 * Milestone 74 — content-first city page (/flights-from/dubai). Advice that holds without
 * live prices (airports, seasons, booking windows) + a prefilled search + links to
 * destinations. Facts and sources: lib/cityGuides/data.ts.
 */

export const revalidate = 43200;
export const dynamicParams = false;

export function generateStaticParams() {
  return CITY_GUIDES.map((g) => ({ city: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const guide = findGuide(city);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/flights-from/${guide.slug}` },
    openGraph: { type: "article", title: guide.title, description: guide.description, url: `/flights-from/${guide.slug}` },
  };
}

export default async function CityGuidePage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const guide = findGuide(city);
  if (!guide) notFound();
  const from = ROUTE_CITIES[guide.cityCode];
  const { siteUrl } = getAppConfig().app;
  const today = new Date().toISOString().slice(0, 10);
  const dates = { departureDate: addDays(today, 45), returnDate: addDays(today, 52) };
  const destinations = guide.destinations.map((code): { route: FlightRoute; priced: boolean } => {
    const to = ROUTE_CITIES[code];
    const route: FlightRoute = { slug: `${from.slug}-to-${to.slug}`, from, to };
    return { route, priced: LISTED_ROUTES.some((r) => r.slug === route.slug) };
  });

  return (
    <article className="mx-auto max-w-5xl space-y-8">
      <JsonLd
        data={[
          breadcrumbJsonLd(siteUrl, [
            { name: "Home", path: "/" },
            { name: "Flight routes", path: "/flights" },
            { name: `Flights from ${from.name}`, path: `/flights-from/${guide.slug}` },
          ]),
          faqJsonLd(guide.faq),
        ]}
      />
      <nav aria-label="Breadcrumb" className="max-w-3xl text-sm text-slate-500">
        <Link href="/flights" className="font-semibold text-brand-700 hover:text-brand-900">
          Flight routes
        </Link>{" "}
        › Flights from {from.name}
      </nav>

      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">{guide.title}</h1>
        {guide.intro.map((p) => (
          <p key={p} className="text-slate-600">
            {p}
          </p>
        ))}
      </header>

      <RouteSearchBox origin={cityLabel(from)} originId={`city-${from.code}`} destination="" destinationId="" />

      {guide.sections.map((s) => (
        <section key={s.heading} className="max-w-3xl space-y-2">
          <h2 className="text-xl font-bold text-slate-900">{s.heading}</h2>
          {s.paragraphs.map((p) => (
            <p key={p} className="leading-relaxed text-slate-700">
              {p}
            </p>
          ))}
        </section>
      ))}

      <section aria-labelledby="tips" className="max-w-3xl rounded-2xl border border-brand-100 bg-brand-50 p-5">
        <h2 id="tips" className="text-lg font-bold text-brand-900">
          Quick checklist
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {guide.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="where" className="max-w-3xl space-y-3">
        <h2 id="where" className="text-xl font-bold text-slate-900">
          Popular flights from {from.name}
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {destinations.map(({ route, priced }) => (
            <li key={route.slug} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <Link href={routeSearchUrl(route, dates, "flights")} className="font-semibold text-slate-800 hover:text-brand-700">
                {from.name} → {route.to.name}
              </Link>
              {priced && (
                <Link href={`/flights/${route.slug}`} className="text-xs font-semibold text-brand-700 hover:text-brand-900">
                  Prices by month ›
                </Link>
              )}
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">Each link searches live prices for a trip about six weeks from today. Change the dates in the search bar.</p>
      </section>

      <section aria-labelledby="faq" className="max-w-3xl space-y-3">
        <h2 id="faq" className="text-xl font-bold text-slate-900">
          Questions about flights from {from.name}
        </h2>
        <dl className="space-y-3">
          {guide.faq.map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-4">
              <dt className="font-semibold text-slate-900">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-700">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="max-w-3xl text-xs text-slate-500">Information checked {guide.checked}. Airlines, terminals and prices change, so confirm on your booking.</p>
    </article>
  );
}
