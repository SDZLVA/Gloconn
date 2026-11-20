import Link from "next/link";
import { hotDestinations } from "@/lib/destinations/data";
import { PHOTOS, photoUrl } from "@/lib/blog/photos";

/**
 * Milestone 75 — "Hot destinations" on the home page, under the search box and above
 * "Travel ideas". No live trend feed: the places in season this month come first
 * (see lib/destinations/data.ts). The page revalidates daily so the month moves on its own.
 */
export function HotDestinations() {
  const month = new Date().getUTCMonth() + 1;
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
        {list.map((d) => {
          const photo = PHOTOS[d.photo];
          return (
            <li key={d.slug}>
              <Link
                href={`/destinations/${d.slug}`}
                className="group block overflow-hidden rounded-2xl bg-white shadow-md shadow-slate-900/10 ring-1 ring-slate-200"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl(photo.id, 600, 450)}
                    srcSet={`${photoUrl(photo.id, 400, 300)} 400w, ${photoUrl(photo.id, 600, 450)} 600w, ${photoUrl(photo.id, 900, 675)} 900w`}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                </span>
                <span className="block p-4">
                  <span className="block text-lg font-extrabold text-brand-900">{d.name}</span>
                  <span className="block text-sm text-slate-500">{d.country}</span>
                  <span className="mt-2 block text-sm text-slate-700">{d.tagline}</span>
                  <span className="mt-3 block text-sm font-bold text-brand-700 group-hover:text-brand-900">Sights, flights &amp; hotels →</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
