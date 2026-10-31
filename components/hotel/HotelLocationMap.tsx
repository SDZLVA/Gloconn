"use client";

import { HotelsTileMap } from "@/components/live/hotels/HotelsTileMap";
import type { LiveHotel } from "@/features/liveHotels/types";

/** Milestone 33 — small map with the hotel's pin and "View larger map". */
export function HotelLocationMap({ hotel, nights }: { hotel: LiveHotel; nights: number }) {
  if (hotel.latitude === null || hotel.longitude === null) return null;
  const osm = `https://www.openstreetmap.org/?mlat=${hotel.latitude}&mlon=${hotel.longitude}#map=16/${hotel.latitude}/${hotel.longitude}`;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <HotelsTileMap hotels={[hotel]} nights={nights} height={220} selectedId={hotel.id} />
      <a
        href={osm}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-6 right-3 z-30 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow hover:bg-brand-50"
      >
        View larger map
      </a>
    </div>
  );
}
