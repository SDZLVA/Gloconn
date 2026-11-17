import Link from "next/link";
import { monthlyPrices } from "@/features/routePrices/client";
import { monthLabel } from "@/features/routePrices/parse";
import { weekendIn } from "@/lib/blog/dates";
import { formatMoney } from "@/lib/money";
import { airlineDisplayName } from "@/lib/providers/flights/aviasales/airlines";
import { findRoute, routeSearchUrl } from "@/lib/routes/catalog";

/**
 * Milestone 63 — live price row inside a blog post: the cheapest recent
 * round trip on a route in the given months (Travelpayouts, refreshed every
 * 12 h), a link to the route page and a Fri–Sun flight + hotel search.
 */
export async function RouteDeal({ route: slug, months, today }: { route: string; months: string[]; today: string }) {
  const route = findRoute(slug);
  if (!route) return null;
  const prices = (await monthlyPrices(route.from.code, route.to.code)).filter((m) => months.includes(m.month));
  const best = prices.length > 0 ? prices.reduce((a, b) => (b.price < a.price ? b : a)) : null;
  const weekend = [best?.month, ...months].filter((m): m is string => Boolean(m)).map((m) => weekendIn(m, today)).find(Boolean) ?? null;
  const airline = best?.airlineCode ? airlineDisplayName(best.airlineCode) : null;
  const stops = best?.transfers === 0 ? "direct" : best?.transfers === 1 ? "1 stop" : best?.transfers ? `${best.transfers} stops` : null;

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {best ? (
          <>
            <p className="text-sm text-slate-600">
              Return flights from <span className="text-2xl font-extrabold text-slate-900">{formatMoney(best.price, "EUR")}</span>
            </p>
            <p className="text-xs text-slate-500">
              {[monthLabel(best.month), airline, stops].filter(Boolean).join(" · ")} · recent fare, per person
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-600">See today&apos;s prices from {route.from.name}.</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {weekend && (
          <Link
            href={routeSearchUrl(route, weekend)}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"
          >
            Plan a weekend
          </Link>
        )}
        <Link
          href={`/flights/${route.slug}`}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:border-brand-700 hover:text-brand-700"
        >
          Prices by month
        </Link>
      </div>
    </div>
  );
}
