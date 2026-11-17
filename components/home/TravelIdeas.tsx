import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { PHOTOS, photoUrl, type PhotoKey } from "@/lib/blog/photos";

/**
 * Milestone 64 — "Travel ideas" on the home page: blog posts (and the cities
 * inside them) as photo cards with the title on the image, linking to the
 * blog. Newest post first; up to 6 cards.
 */

type Card = { href: string; title: string; label: string; photo: PhotoKey };

function cards(): Card[] {
  const out: Card[] = [];
  for (const post of BLOG_POSTS) {
    out.push({ href: `/blog/${post.slug}`, title: post.title, label: "Travel blog", photo: post.photo });
    for (const h of post.highlights ?? []) {
      out.push({ href: `/blog/${post.slug}#${h.anchor}`, title: h.title, label: "Weekend idea", photo: h.photo });
    }
  }
  return out.slice(0, 6);
}

export function TravelIdeas() {
  const list = cards();
  if (list.length === 0) return null;
  return (
    <section aria-labelledby="travel-ideas" className="mt-14 sm:mt-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="travel-ideas" className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
            Travel ideas
          </h2>
          <p className="mt-1 text-slate-600">Cheap trips with live prices — pick one and we&apos;ll build it within your budget.</p>
        </div>
        <Link href="/blog" className="text-sm font-bold text-brand-700 hover:text-brand-900">
          All travel ideas →
        </Link>
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((card) => {
          const photo = PHOTOS[card.photo];
          return (
            <li key={card.href}>
              <Link
                href={card.href}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 shadow-md shadow-slate-900/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl(photo.id, 800, 600)}
                  srcSet={`${photoUrl(photo.id, 480, 360)} 480w, ${photoUrl(photo.id, 800, 600)} 800w, ${photoUrl(photo.id, 1200, 900)} 1200w`}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-800">{card.label}</span>
                <span className="absolute inset-x-5 bottom-5 text-xl font-extrabold leading-tight text-white drop-shadow sm:text-2xl">
                  {card.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
