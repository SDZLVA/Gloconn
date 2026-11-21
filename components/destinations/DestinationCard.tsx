import Link from "next/link";
import type { Destination } from "@/lib/destinations/types";
import { photoUrl } from "@/lib/blog/photos";
import { destinationPhoto } from "@/lib/destinations/photos";

const NEW_DAYS = 30;

/** Milestone 78 — one destination card (photo, name, one line). Falls back to a coloured block with no photo. */
export function DestinationCard({ d, today }: { d: Destination; today: string }) {
  const photo = destinationPhoto(d.photo);
  const isNew = (Date.parse(today) - Date.parse(d.added)) / 86_400_000 <= NEW_DAYS && d.added !== "2026-11-20";
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className="group block h-full overflow-hidden rounded-2xl bg-white shadow-md shadow-slate-900/10 ring-1 ring-slate-200"
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-700 to-sky-400">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl(photo.id, 600, 450)}
            srcSet={`${photoUrl(photo.id, 400, 300)} 400w, ${photoUrl(photo.id, 600, 450)} 600w, ${photoUrl(photo.id, 900, 675)} 900w`}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
        )}
        {isNew && <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-slate-900">New</span>}
      </span>
      <span className="block p-4">
        <span className="block text-lg font-extrabold text-brand-900">{d.name}</span>
        <span className="block text-sm text-slate-500">{d.country}</span>
        <span className="mt-2 block text-sm text-slate-700">{d.tagline}</span>
        <span className="mt-3 block text-sm font-bold text-brand-700 group-hover:text-brand-900">Sights, flights &amp; hotels →</span>
      </span>
    </Link>
  );
}
