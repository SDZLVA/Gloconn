import Link from "next/link";
import { CITY_GUIDES } from "@/lib/cityGuides/data";
import { LISTED_ROUTES, ROUTE_CITIES, type FlightRoute } from "@/lib/routes/catalog";

export const metadata = {
  title: "Popular flight routes",
  description: "Cheap flights on popular routes from cities around the world — Milan, London, New York, Dubai, Singapore and more. Prices by month, and complete trips with hotels on Glooconn.",
  alternates: { canonical: "/flights" },
};

/** Milestone 62 — index of the route pages, grouped by departure city. */
export default function FlightRoutesIndex() {
  const groups = new Map<string, FlightRoute[]>();
  for (const route of LISTED_ROUTES) groups.set(route.from.name, [...(groups.get(route.from.name) ?? []), route]);
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">Popular flight routes</h1>
        <p className="max-w-3xl text-slate-600">
          See the cheapest month to fly on each route, then turn it into a complete trip with a hotel, within your budget.
        </p>
      </header>
      <section aria-labelledby="guides" className="space-y-3">
        <h2 id="guides" className="text-xl font-bold text-slate-900">
          City flight guides
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CITY_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/flights-from/${g.slug}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:border-brand-700 hover:text-brand-700"
              >
                Flights from {ROUTE_CITIES[g.cityCode].name}: airports and when to fly
                <span aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {[...groups.entries()].map(([city, routes]) => (
        <section key={city} aria-labelledby={`from-${city}`} className="space-y-3">
          <h2 id={`from-${city}`} className="text-xl font-bold text-slate-900">
            Flights from {city}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/flights/${r.slug}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:border-brand-700 hover:text-brand-700"
                >
                  {r.from.name} → {r.to.name}
                  <span aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
