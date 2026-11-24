import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationSearch } from "@/components/destinations/DestinationSearch";
import { JsonLd } from "@/components/seo/JsonLd";
import { monthlyPrices } from "@/features/routePrices/client";
import { addDays, searchDatesFor } from "@/features/routePrices/parse";
import { photoUrl } from "@/lib/blog/photos";
import { getAppConfig } from "@/lib/config";
import { findDestination } from "@/lib/destinations/data";
import { IT_DESTINATIONS, atIt, findItDestination } from "@/lib/destinations/it/content";
import { REGION_NAMES_IT, monthCellsIt, monthLabelIt, monthsPhraseIt, seoTitleIt, shortDayIt } from "@/lib/destinations/it/ui";
import { destinationPhoto } from "@/lib/destinations/photos";
import { destinationJsonLd } from "@/lib/destinations/seo";
import { formatMoney } from "@/lib/money";
import { LISTED_ROUTES, ROUTE_CITIES, cityLabel, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";

/**
 * Milestone 90 — Italian destination page (/it/destinazioni/parigi). Same layout and facts as the
 * English page (app/destinations/[slug]), written in Italian. Content: lib/destinations/it/content.ts.
 */

export const revalidate = 43200;
export const dynamicParams = false;

export function generateStaticParams() {
  return IT_DESTINATIONS.map((d) => ({ slug: d.itSlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = findItDestination(slug);
  const en = it ? findDestination(it.slug) : null;
  if (!it || !en) return {};
  const photo = destinationPhoto(en.photo);
  const image = photo ? photoUrl(photo.id, 1200, 630) : null;
  const path = `/it/destinazioni/${it.itSlug}`;
  return {
    title: seoTitleIt(it.name),
    description: it.description,
    alternates: { canonical: path, languages: { it: path, en: `/destinations/${en.slug}`, "x-default": `/destinations/${en.slug}` } },
    openGraph: { type: "article", locale: "it_IT", title: it.title, description: it.description, url: path, modifiedTime: it.checked, ...(image && photo ? { images: [{ url: image, alt: photo.alt }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title: it.title, description: it.description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function ItalianDestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = findItDestination(slug);
  const en = it ? findDestination(it.slug) : null;
  if (!it || !en) notFound();
  const city = ROUTE_CITIES[en.cityCode];
  const photo = destinationPhoto(en.photo);
  const { siteUrl } = getAppConfig().app;
  const today = new Date().toISOString().slice(0, 10);
  const dates = { departureDate: addDays(today, 45), returnDate: addDays(today, 52) };
  const path = `/it/destinazioni/${it.itSlug}`;

  // Same "from Milan" price box as the English page (Travelpayouts cache, refreshed every 12 h).
  const fromCity = ROUTE_CITIES.MIL;
  const fromRoute: FlightRoute = { slug: `${fromCity.slug}-to-${city.slug}`, from: fromCity, to: city };
  const fromPrices = en.gatewayNote || city.code === fromCity.code ? [] : (await monthlyPrices(fromCity.code, city.code)).slice(0, 12);
  const fromCheapest = fromPrices.length > 0 ? fromPrices.reduce((a, b) => (b.price < a.price ? b : a)) : null;
  const fromDates = fromCheapest ? searchDatesFor(fromCheapest, today) : null;
  const fromListed = LISTED_ROUTES.some((r) => r.slug === fromRoute.slug);
  const isShortTrip =
    !!fromCheapest?.departureDate &&
    !!fromCheapest.returnDate &&
    (Date.parse(fromCheapest.returnDate) - Date.parse(fromCheapest.departureDate)) / 86_400_000 <= 3;
  const hotelsRoute: FlightRoute = { slug: `${city.slug}`, from: city, to: city };

  const best = monthsPhraseIt(en.bestMonths);
  const faq = [...it.faq, ...it.details.extraFaq];
  const link = "font-semibold text-brand-700 hover:text-brand-900";
  const regionName = REGION_NAMES_IT[en.region] ?? en.region;
  const others = IT_DESTINATIONS.filter((d) => d.slug !== it.slug).slice(0, 4);

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <JsonLd
        data={[
          breadcrumbJsonLd(siteUrl, [
            { name: "Home", path: "/" },
            { name: "Destinazioni", path: "/it/destinazioni" },
            { name: `Guida di viaggio ${atIt(it)}`, path },
          ]),
          faqJsonLd(faq),
          ...destinationJsonLd(siteUrl, { ...en, name: it.name, country: it.country, title: it.title, description: it.description, checked: it.checked }, photo ? photoUrl(photo.id, 1200, 630) : undefined, { path, lang: "it" }),
        ]}
      />
      <nav aria-label="Briciole di pane" className="text-sm text-slate-500">
        <Link href="/" className={link}>
          Home
        </Link>{" "}
        ›{" "}
        <Link href="/it/destinazioni" className={link}>
          Destinazioni
        </Link>{" "}
        › {it.name}
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">{it.title}</h1>
        <p className="text-sm">
          <Link href={`/destinations/${en.slug}`} hrefLang="en" className={link}>
            Read this guide in English →
          </Link>
        </p>
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
              Foto di{" "}
              <a href={photo.page} rel="noopener noreferrer" className="underline">
                {photo.by}
              </a>
              {photo.license ? (
                <>
                  ,{" "}
                  <a href={photo.license.url} rel="noopener noreferrer license" className="underline">
                    {photo.license.name}
                  </a>
                  , via Wikimedia Commons
                </>
              ) : (
                " su Unsplash"
              )}
            </figcaption>
          </figure>
        )}
        {fromCheapest && fromDates && (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-slate-800">
            <strong className="text-emerald-900">
              Voli da {fromCity.name} {atIt(it)}: da {formatMoney(fromCheapest.price, "EUR")}
            </strong>{" "}
            andata e ritorno
            {fromCheapest.departureDate && fromCheapest.returnDate
              ? ` (ad esempio dal ${shortDayIt(fromCheapest.departureDate)} al ${shortDayIt(fromCheapest.returnDate)}), il prezzo più basso trovato di recente per ${monthLabelIt(fromCheapest.month)}`
              : `, il prezzo più basso trovato di recente per ${monthLabelIt(fromCheapest.month)}`}
            . {isShortTrip ? "Tariffe così sono spesso per viaggi brevi e cambiano spesso, quindi" : "I prezzi cambiano spesso, quindi"}{" "}
            <Link href={routeSearchUrl(fromRoute, fromDates, "flights")} className="font-semibold text-brand-700 underline hover:text-brand-900">
              controlla i prezzi aggiornati
            </Link>
            {fromListed && (
              <>
                {" "}
                oppure guarda i{" "}
                <Link href={`/flights/${fromRoute.slug}`} className="font-semibold text-brand-700 underline hover:text-brand-900">
                  prezzi mese per mese
                </Link>{" "}
                (in inglese)
              </>
            )}
            .
          </p>
        )}
        <p className="rounded-2xl bg-brand-50 p-4 text-slate-800 ring-1 ring-brand-100">
          <strong className="text-brand-900">Quando andare {atIt(it)}:</strong> {best}. {it.tagline}.
        </p>
        {it.gatewayNote && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">{it.gatewayNote}</p>}
        {it.intro.map((p) => (
          <p key={p} className="text-slate-600">
            {p}
          </p>
        ))}
      </header>

      <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paese</dt>
          <dd className="font-semibold text-slate-900">{it.country}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mesi migliori</dt>
          <dd className="font-semibold text-slate-900">{best}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cerca voli per</dt>
          <dd className="font-semibold text-slate-900">
            {city.name} ({city.code})
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Area</dt>
          <dd className="font-semibold text-slate-900">{regionName}</dd>
        </div>
      </dl>

      <nav aria-label="In questa pagina" className="flex flex-wrap gap-2 text-sm">
        {[
          ["attractions", "Cosa vedere"],
          ["when", "Quando andare"],
          ["getting-around", "Come muoversi"],
          ["stay", "Dove dormire"],
          ["costs", "Costi"],
          ["book", "Voli e hotel"],
          ["tips", "Promemoria"],
          ["faq", "Domande"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700">
            {label}
          </a>
        ))}
      </nav>

      <section aria-labelledby="attractions" className="scroll-mt-24 space-y-3">
        <h2 id="attractions" className="text-xl font-bold text-slate-900">
          Cosa vedere {atIt(it)}
        </h2>
        <ul className="space-y-3">
          {it.attractions.map((a) => (
            <li key={a.name} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{a.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{a.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="when" className="scroll-mt-24 space-y-3">
        <h2 id="when" className="text-xl font-bold text-slate-900">
          Quando andare {atIt(it)}
        </h2>
        <div>
          <ol className="grid grid-cols-6 gap-1.5 sm:grid-cols-12" aria-label={`Mesi in cui ${it.name} è al meglio: ${best}`}>
            {monthCellsIt(en.bestMonths).map((c) => (
              <li
                key={c.name}
                title={c.best ? `${c.name}: periodo migliore` : c.name}
                className={`rounded-lg py-1.5 text-center text-xs font-bold ${c.best ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}
              >
                {c.short}
                <span className="sr-only">{c.best ? " (periodo migliore)" : ""}</span>
              </li>
            ))}
          </ol>
          <p className="mt-1.5 text-xs text-slate-500">I mesi blu sono il periodo migliore per andare.</p>
        </div>
        {it.bestTime.map((p) => (
          <p key={p} className="leading-relaxed text-slate-700">
            {p}
          </p>
        ))}
      </section>

      <section aria-labelledby="getting-around" className="scroll-mt-24 space-y-3">
        <h2 id="getting-around" className="text-xl font-bold text-slate-900">
          Come arrivare e muoversi {atIt(it)}
        </h2>
        {it.details.gettingAround.map((p) => (
          <p key={p} className="leading-relaxed text-slate-700">
            {p}
          </p>
        ))}
      </section>

      <section aria-labelledby="stay" className="scroll-mt-24 space-y-3">
        <h2 id="stay" className="text-xl font-bold text-slate-900">
          Dove dormire {atIt(it)}
        </h2>
        <ul className="space-y-3">
          {it.details.whereToStay.map((a) => (
            <li key={a.area} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{a.area}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{a.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="costs" className="scroll-mt-24 space-y-3">
        <h2 id="costs" className="text-xl font-bold text-slate-900">
          Quanto costa un viaggio {atIt(it)}
        </h2>
        {it.details.costs.map((p) => (
          <p key={p} className="leading-relaxed text-slate-700">
            {p}
          </p>
        ))}
      </section>

      <section aria-labelledby="book" className="scroll-mt-24 space-y-3">
        <h2 id="book" className="text-xl font-bold text-slate-900">
          Cerca voli e hotel per {it.name}
        </h2>
        <DestinationSearch destination={cityLabel(city)} destinationId={`city-${city.code}`} flightsTitle={`Voli per ${it.name}`} hotelsTitle={`Hotel ${atIt(it)}`} />
        <p className="text-sm text-slate-600">
          Link rapidi:{" "}
          <Link href={routeSearchUrl(hotelsRoute, dates, "hotels")} className={link}>
            hotel {atIt(it)} il mese prossimo
          </Link>
        </p>
      </section>

      <section aria-labelledby="tips" className="scroll-mt-24 rounded-2xl border border-brand-100 bg-brand-50 p-5">
        <h2 id="tips" className="text-lg font-bold text-brand-900">
          Promemoria veloce
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {it.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="scroll-mt-24 space-y-3">
        <h2 id="faq" className="text-xl font-bold text-slate-900">
          Domande su un viaggio {atIt(it)}
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

      {others.length > 0 && (
        <section aria-labelledby="more" className="space-y-2">
          <h2 id="more" className="text-xl font-bold text-slate-900">
            Altre mete da scoprire
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            {others.map((d) => (
              <li key={d.itSlug}>
                <Link href={`/it/destinazioni/${d.itSlug}`} className={link}>
                  Guida di viaggio {atIt(d)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-slate-500">
        Informazioni verificate il {it.checked.split("-").reverse().join("/")}. Stagioni, orari di apertura e prezzi cambiano, quindi controlla prima di prenotare.
      </p>
    </article>
  );
}
