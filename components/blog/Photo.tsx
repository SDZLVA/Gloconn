/**
 * Milestone 63c — real city photos from Unsplash (free under the Unsplash
 * License: commercial use allowed, no permission needed). Loaded from
 * Unsplash's image CDN in the right size (their CDN resizes on the fly), with
 * a small credit to the photographer.
 */

export type BlogPhoto = {
  /** "photo-1610016302534-6f67f1c968d8" */
  id: string;
  alt: string;
  by: string;
  /** The photo's Unsplash page, for the credit link. */
  page: string;
};

const src = (id: string, w: number) => `https://images.unsplash.com/${id}?w=${w}&h=${Math.round((w * 9) / 16)}&fit=crop&auto=format&q=75`;

export function Photo({ photo, priority = false, credit = true }: { photo: BlogPhoto; priority?: boolean; credit?: boolean }) {
  return (
    <figure className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src(photo.id, 1200)}
        srcSet={`${src(photo.id, 640)} 640w, ${src(photo.id, 960)} 960w, ${src(photo.id, 1200)} 1200w, ${src(photo.id, 1600)} 1600w`}
        sizes="(min-width: 768px) 768px, 100vw"
        alt={photo.alt}
        width={1200}
        height={675}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="aspect-video w-full bg-slate-200 object-cover"
      />
      {credit && (
        <figcaption className="absolute bottom-2 right-2 rounded-full bg-black/45 px-2.5 py-0.5 text-[11px] text-white">
          Photo:{" "}
          <a href={`${photo.page}?utm_source=glooconn&utm_medium=referral`} target="_blank" rel="noopener noreferrer nofollow" className="underline">
            {photo.by}
          </a>{" "}
          /{" "}
          <a href="https://unsplash.com/?utm_source=glooconn&utm_medium=referral" target="_blank" rel="noopener noreferrer nofollow" className="underline">
            Unsplash
          </a>
        </figcaption>
      )}
    </figure>
  );
}

const U = "https://unsplash.com/photos/";

/** Photos used on the blog (all checked: "Free to use under the Unsplash License", 2026-11-18). */
export const PHOTOS = {
  milan: { id: "photo-1610016302534-6f67f1c968d8", alt: "Milan Cathedral (Duomo di Milano) at sunset", by: "Ouael Ben Salah", page: `${U}0xe2FGo7Vc0` },
  budapest: { id: "photo-1698657792682-48f73d9d0b8c", alt: "The Hungarian Parliament in Budapest lit up at night on the Danube", by: "Leonhard Niederwimmer", page: `${U}KiUE0O5pVeI` },
  krakow: { id: "photo-1697821830112-665545013660", alt: "Kraków Main Market Square with the Cloth Hall", by: "Tomasz Anusiewicz", page: `${U}tT_lGiR7udY` },
  lisbon: { id: "photo-1590941761838-60179f0ed248", alt: "A yellow tram 28 in Lisbon", by: "Paulo Evangelista", page: `${U}2N0PVuB0byQ` },
  seville: { id: "photo-1605086944102-56c678d51c9a", alt: "Seville Cathedral and the Giralda tower at night", by: "Tom Podmore", page: `${U}2cEdlKdGEq4` },
  athens: { id: "photo-1603565816030-6b389eeb23cb", alt: "The Acropolis of Athens at golden hour", by: "Constantinos Kollias", page: `${U}yqBvJJ8jGBQ` },
} satisfies Record<string, BlogPhoto>;
