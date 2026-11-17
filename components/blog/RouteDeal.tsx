import Link from "next/link";
import { monthlyPrices } from "@/features/routePrices/client";
import { monthLabel } from "@/features/routePrices/parse";
import { weekendIn } from "@/lib/blog/dates";
import { formatMoney } from "@/lib/money";
import { airlineDisplayName } from "@/lib/providers/flights/aviasales/airlines";
import { findRoute, routeSearchUrl } from "@/lib/routes/catalog";

/**
 * Milestone 63 — live price box inside a blog post: the cheapest recent
 * round trip on a route in the given months (Travelpayouts, refreshed every
 * 12 h), a link to the route page and a flight + hotel weekend search.
 */
export async function RouteDeal({ route: slug, months, today }: { route: string; months: string[]; today: string }) {
  const route = findRoute(slug);
  if (!route) return null;
  const prices = (await monthlyPrices(route.from.code, route.to.code)).filter((m) => months.includes(m.month));
  const best = prices.length > 0 ? prices.reduce((a, b) => (b.price < a.price ? b : a)) : null;
  const weekendMonth = best?.month ?? months[0];
  const weekend = weekendMonth ? weekendIn(weekendMonth, today) ?? months.map((m) => weekendIn(m, today)).find(Boolean) ?? null : null;
  const airline = best?.airlineCode ? airlineDisplayName(best.airlineCode) : null;
  const stops = best?.transfers === 0 ? "direct" : best?.transfers === 1 ? "1 stop" : best?.transfers ? `${best.transfers} stops` : null;

  return (
    <aside className="my-5 rounded-2xl border border-brand-100 bg-brand-50 p-4 sm:p-5">
      {best ? (
        <p className="text-sm text-slate-700">
          Cheapest recent round trip from {route.from.name}:{" "}
          <span className="text-xl font-extrabold text-slate-900">{formatMoney(best.price, "EUR")}</span> in {monthLabel(best.month)}
          {[airline, stops].filter(Boolean).length > 0 ? ` · ${[airline, stops].filter(Boolean).join(", ")}` : ""}
        </p>
      ) : (
        <p className="text-sm text-slate-700">Check today&apos;s prices from {route.from.name} to {route.to.name} for your dates.</p>
      )}
      <p className="mt-1 text-xs text-slate-500">Lowest fare other travellers found recently, per person — your dates may cost more or less.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/flights/${route.slug}`}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"
        >
          {route.from.name} → {route.to.name} prices by month
        </Link>
        {weekend && (
          <Link
            href={routeSearchUrl(route, weekend)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-700 bg-white px-4 text-sm font-bold text-brand-700 hover:bg-brand-50"
          >
            Plan a weekend: flight + hotel
          </Link>
        )}
      </div>
    </aside>
  );
}
