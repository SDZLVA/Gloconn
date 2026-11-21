import Link from "next/link";
import { hotDestinations } from "@/lib/destinations/data";
import { DestinationCard } from "@/components/destinations/DestinationCard";

/**
 * Milestone 75 — "Hot destinations" on the home page, under the search box and above
 * "Travel ideas". No live trend feed: the places in season this month come first
 * (see lib/destinations/data.ts). The page revalidates daily so the month moves on its own.
 */
export function HotDestinations() {
  const month = new Date().getUTCMonth() + 1;
  const today = new Date().toISOString().slice(0, 10);
  const list = hotDestinations(month, 4);
  return (
    <section aria-labelledby="hot-destinations" className="mt-14 sm:mt-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="hot-destinations" className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
            Hot destinations right now
          </h2>
          <p className="mt-1 text-slate-600">Places at their best this month. Open one for sights, the best time to go, flights and hotels.</p>
        </div>
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((d) => (
          <li key={d.slug}>
            <DestinationCard d={d} today={today} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">
        <Link href="/destinations" className="font-bold text-brand-700 hover:text-brand-900">
          See all destinations by region →
        </Link>
      </p>
    </section>
  );
}
