import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteSearchBox } from "@/components/routes/RouteSearchBox";
import { monthlyPrices } from "@/features/routePrices/client";
import { monthLabel, searchDatesFor, type MonthPrice } from "@/features/routePrices/parse";
import { formatMoney } from "@/lib/money";
import { airlineDisplayName } from "@/lib/providers/flights/aviasales/airlines";
import { FLIGHT_ROUTES, cityLabel, findRoute, relatedRoutes, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";

/**
 * Milestone 62 — a page per popular route (/flights/milan-to-colombo) that
 * search engines can index: cheapest recent fare per month (Travelpayouts
 * Data API, refreshed every 12 h), a prefilled search bar, links to the
 * full trip (packages, hotels) and related routes.
 */

export const revalidate = 43200;
export const dynamicParams = false;

export function generateStaticParams() {
  return FLIGHT_ROUTES.map((route) => ({ route: route.slug }));
}

const today = () => new Date().toISOString().slice(0, 10);
const euro = (n: number) => formatMoney(n, "EUR");
const stopsText = (n: number | null) => (n === null ? "" : n === 0 ? "Direct" : n === 1 ? "1 stop" : `${n} stops`);

export async function generateMetadata({ params }: { params: Promise<{ route: string }> }): Promise<Metadata> {
  const { route: slug } = await params;
  const route = findRoute(slug);
  if (!route) return {};
  const months = await monthlyPrices(route.from.code, route.to.code);
  const cheapest = months.length > 0 ? Math.min(...months.map((m) => m.price)) : null;
  const title = `Cheap flights from ${route.from.name} to ${route.to.name}${cheapest ? ` from ${euro(cheapest)}` : ""}`;
  return {
    title,
    description: `Compare flight prices from ${route.from.name} to ${route.to.name} by month${cheapest ? ` — round trips from ${euro(cheapest)}` : ""}. Find the cheapest month, then add a hotel and plan the whole trip within your budget on Glooconn.`,
    alternates: { canonical: `/flights/${route.slug}` },
  };
}

function Faq({ route, months }: { route: FlightRoute; months: MonthPrice[] }) {
  const from = route.from.name;
  const to = route.to.name;
  const cheapest = months.length > 0 ? months.reduce((a, b) => (b.price < a.price ? b : a)) : null;
  const direct = months.filter((m) => m.transfers === 0);
  const items = [
    {
      q: `What is the cheapest month to fly from ${from} to ${to}?`,
      a: cheapest
        ? `Right now the lowest round-trip fare travellers found is in ${monthLabel(cheapest.month)}, from ${euro(cheapest.price)}. Prices change every day, so search your dates to see today's price.`
        : `We don't have recent prices for this route yet. Search your dates above to see live prices.`,
    },
    {
      q: `Are there direct flights from ${from} to ${to}?`,
      a:
        direct.length > 0
          ? `Yes — direct round trips were found from ${euro(Math.min(...direct.map((m) => m.price)))}.`
          : months.length > 0
            ? `The cheapest fares we found all have at least one stop. Tick "Direct flights only" in the search bar to look for non-stop flights.`
            : `Tick "Direct flights only" in the search bar to see non-stop flights for your dates.`,
    },
    {
      q: `Can I book a flight and hotel in ${to} together?`,
      a: `Yes. Glooconn combines flights and hotels into packages within your budget. You then book each part directly on our partner sites.`,
    },
  ];
  return (
    <section aria-labelledby="faq" className="space-y-3">
      <h2 id="faq" className="text-xl font-bold text-slate-900">
        Questions about flying {from} – {to}
      </h2>
      <dl className="space-y-3">
        {items.map((item) => (
          <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-4">
            <dt className="font-semibold text-slate-900">{item.q}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-slate-700">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function FlightRoutePage({ params }: { params: Promise<{ route: string }> }) {
  const { route: slug } = await params;
  const route = findRoute(slug);
  if (!route) notFound();
  const months = (await monthlyPrices(route.from.code, route.to.code)).slice(0, 12);
  const now = today();
  const cheapest = months.length > 0 ? months.reduce((a, b) => (b.price < a.price ? b : a)) : null;
  const tripDates = cheapest ? searchDatesFor(cheapest, now) : searchDatesFor({ month: now.slice(0, 7), departureDate: null, returnDate: null }, now);
  const related = relatedRoutes(route);

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/flights" className="font-semibold text-brand-700 hover:text-brand-900">
          Flight routes
        </Link>{" "}
        › {route.from.name} to {route.to.name}
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          Cheap flights from {route.from.name} to {route.to.name}
        </h1>
        <p className="max-w-3xl text-slate-600">
          Compare flight prices from {route.from.name} ({route.from.country}) to {route.to.name} ({route.to.country}). Below are the
          cheapest round trips travellers found recently, month by month. Pick a month to see live prices for your dates — Glooconn can
          also add a hotel and build the whole trip within your budget.
        </p>
        {cheapest && (
          <p className="inline-flex flex-wrap items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
            Round trips from {euro(cheapest.price)} · cheapest in {monthLabel(cheapest.month)}
          </p>
        )}
      </header>

      <RouteSearchBox
        origin={cityLabel(route.from)}
        originId={`city-${route.from.code}`}
        destination={cityLabel(route.to)}
        destinationId={`city-${route.to.code}`}
      />

      <section aria-labelledby="by-month" className="space-y-3">
        <h2 id="by-month" className="text-xl font-bold text-slate-900">
          {route.from.name} to {route.to.name}: prices by month
        </h2>
        {months.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700">
            Recent prices for this route aren&apos;t available right now. Search your dates above to see live prices.
          </p>
        ) : (
          <>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {months.map((m) => {
                const dates = searchDatesFor(m, now);
                const airline = airlineDisplayName(m.airlineCode ?? undefined);
                return (
                  <li key={m.month} className={`rounded-2xl border bg-white p-4 shadow-sm ${m === cheapest ? "border-emerald-400 ring-1 ring-emerald-400" : "border-slate-200"}`}>
                    <p className="text-sm font-semibold text-slate-600">{monthLabel(m.month)}</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                      {euro(m.price)} <span className="text-xs font-semibold text-slate-500">round trip</span>
                    </p>
                    <p className="text-xs text-slate-600">{[airline, stopsText(m.transfers)].filter(Boolean).join(" · ")}</p>
                    <Link
                      href={routeSearchUrl(route, dates, "flights")}
                      className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"
                    >
                      See flights
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-slate-500">
              Prices are the lowest fares other travellers found in the last days, for one adult in euros. The price for your dates is
              confirmed when you search.
            </p>
          </>
        )}
      </section>

      <section aria-labelledby="whole-trip" className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
        <h2 id="whole-trip" className="text-lg font-bold text-brand-900">
          Plan the whole trip to {route.to.name}
        </h2>
        <p className="mt-1 text-sm text-slate-700">
          Glooconn combines flights and hotels into complete trips within your budget, so you see the real total before you book.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            href={routeSearchUrl(route, tripDates)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800"
          >
            See flight + hotel packages
          </Link>
          <Link
            href={routeSearchUrl(route, tripDates, "hotels")}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-700 px-5 text-sm font-bold text-brand-700 hover:bg-white"
          >
            Hotels in {route.to.name}
          </Link>
        </div>
      </section>

      <Faq route={route} months={months} />

      {related.length > 0 && (
        <section aria-labelledby="related" className="space-y-3">
          <h2 id="related" className="text-xl font-bold text-slate-900">
            More flight routes
          </h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/flights/${r.slug}`} className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-brand-700 hover:text-brand-700">
                  {r.from.name} → {r.to.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
