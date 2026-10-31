"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LiveHotel } from "@/features/liveHotels/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

/**
 * Milestone 30 — a small, dependency-free map: OpenStreetMap tiles plus
 * Glooconn price pins. Drag to move, +/− to zoom.
 */

const TILE = 256;
const MAX_ZOOM = 17;

function project(lat: number, lng: number, zoom: number) {
  const scale = TILE * 2 ** zoom;
  const sin = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

type Pin = { hotel: LiveHotel; lat: number; lng: number };

type HotelsTileMapProps = {
  hotels: LiveHotel[];
  nights: number;
  height: number;
  /** Small preview: no dragging, no zoom buttons, no pins' labels. */
  preview?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
};

export function HotelsTileMap({ hotels, nights, height, preview = false, selectedId, onSelect, className }: HotelsTileMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);
    setWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);

  const pins: Pin[] = useMemo(
    () =>
      hotels
        .filter((hotel) => hotel.latitude !== null && hotel.longitude !== null)
        .map((hotel) => ({ hotel, lat: hotel.latitude!, lng: hotel.longitude! })),
    [hotels],
  );

  // Fit all pins.
  const fit = useMemo(() => {
    if (pins.length === 0 || width === 0) return null;
    const lats = pins.map((p) => p.lat);
    const lngs = pins.map((p) => p.lng);
    const center = { lat: (Math.min(...lats) + Math.max(...lats)) / 2, lng: (Math.min(...lngs) + Math.max(...lngs)) / 2 };
    let zoom = MAX_ZOOM - 2;
    for (; zoom > 2; zoom -= 1) {
      const a = project(Math.max(...lats), Math.min(...lngs), zoom);
      const b = project(Math.min(...lats), Math.max(...lngs), zoom);
      if (b.x - a.x < width - 60 && b.y - a.y < height - 50) break;
    }
    return { center, zoom };
  }, [pins, width, height]);

  const [view, setView] = useState<{ zoom: number; cx: number; cy: number } | null>(null);
  useEffect(() => {
    if (!fit) return;
    const c = project(fit.center.lat, fit.center.lng, fit.zoom);
    setView({ zoom: fit.zoom, cx: c.x, cy: c.y });
  }, [fit]);

  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);

  function zoomBy(delta: number) {
    setView((v) => {
      if (!v) return v;
      const zoom = Math.max(3, Math.min(MAX_ZOOM, v.zoom + delta));
      const factor = 2 ** (zoom - v.zoom);
      return { zoom, cx: v.cx * factor, cy: v.cy * factor };
    });
  }

  const tiles: { key: string; src: string; left: number; top: number }[] = [];
  if (view && width > 0) {
    const left = view.cx - width / 2;
    const top = view.cy - height / 2;
    const count = 2 ** view.zoom;
    for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + width) / TILE); tx += 1) {
      for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + height) / TILE); ty += 1) {
        if (ty < 0 || ty >= count) continue;
        const wrapped = ((tx % count) + count) % count;
        tiles.push({
          key: `${view.zoom}/${tx}/${ty}`,
          src: `https://tile.openstreetmap.org/${view.zoom}/${wrapped}/${ty}.png`,
          left: tx * TILE - left,
          top: ty * TILE - top,
        });
      }
    }
  }

  return (
    <div
      ref={ref}
      style={{ height }}
      className={cn("relative select-none overflow-hidden bg-slate-100", !preview && "cursor-grab active:cursor-grabbing", className)}
      onPointerDown={(event) => {
        if (preview || !view) return;
        drag.current = { x: event.clientX, y: event.clientY, cx: view.cx, cy: view.cy };
        (event.target as Element).setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (!start) return;
        setView((v) => (v ? { ...v, cx: start.cx - (event.clientX - start.x), cy: start.cy - (event.clientY - start.y) } : v));
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
    >
      {tiles.map((tile) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={tile.key}
          src={tile.src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute h-64 w-64 max-w-none"
          style={{ left: tile.left, top: tile.top }}
        />
      ))}

      {view &&
        pins.map(({ hotel, lat, lng }) => {
          const p = project(lat, lng, view.zoom);
          const x = p.x - (view.cx - width / 2);
          const y = p.y - (view.cy - height / 2);
          if (x < -40 || y < -20 || x > width + 40 || y > height + 20) return null;
          const active = hotel.id === selectedId;
          if (preview) {
            return (
              <span
                key={hotel.id}
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-700 shadow"
                style={{ left: x, top: y }}
              />
            );
          }
          return (
            <button
              key={hotel.id}
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onSelect?.(hotel.id)}
              title={hotel.name}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg px-2 py-1 text-xs font-bold shadow-md motion-safe:transition-transform",
                active ? "z-20 scale-110 bg-slate-900 text-white" : "z-10 bg-brand-700 text-white hover:bg-brand-800",
              )}
              style={{ left: x, top: y }}
            >
              {formatMoney(hotel.totalPrice / nights, hotel.currency)}
            </button>
          );
        })}

      {!preview && view && (
        <div className="absolute right-3 top-3 z-30 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
          <button type="button" onClick={() => zoomBy(1)} aria-label="Zoom in" className="h-9 w-9 text-lg font-bold text-slate-700 hover:bg-slate-50">
            +
          </button>
          <button type="button" onClick={() => zoomBy(-1)} aria-label="Zoom out" className="h-9 w-9 border-t border-slate-200 text-lg font-bold text-slate-700 hover:bg-slate-50">
            −
          </button>
        </div>
      )}

      {pins.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">Map not available</p>
      )}
      <span className="absolute bottom-0 right-0 z-30 bg-white/80 px-1.5 text-[10px] text-slate-600">© OpenStreetMap contributors</span>
    </div>
  );
}
