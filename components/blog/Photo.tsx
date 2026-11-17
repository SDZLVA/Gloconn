/**
 * Milestone 63c — real city photos from Unsplash (free under the Unsplash
 * License: commercial use allowed, no permission needed). Loaded from
 * Unsplash's image CDN in the right size (their CDN resizes on the fly), with
 * a small credit to the photographer.
 */

import { photoUrl, type BlogPhoto } from "@/lib/blog/photos";

export { PHOTOS, type BlogPhoto } from "@/lib/blog/photos";

const src = (id: string, w: number) => photoUrl(id, w);

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
