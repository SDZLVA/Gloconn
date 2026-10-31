"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Milestone 33 — big photo with arrows + a row of thumbnails. */
export function HotelGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) {
    return <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-slate-100 text-slate-400">No photos yet</div>;
  }
  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);
  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[index]} alt={`${name} — photo ${index + 1} of ${images.length}`} className="h-full w-full object-cover" />
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-800 shadow hover:bg-white">
              ‹
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-800 shadow hover:bg-white">
              ›
            </button>
            <span className="absolute bottom-3 right-3 rounded-lg bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.slice(0, 12).map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              className={cn("h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2", i === index ? "ring-brand-700" : "ring-transparent opacity-80 hover:opacity-100")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
