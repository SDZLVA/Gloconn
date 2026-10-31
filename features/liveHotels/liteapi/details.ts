import "server-only";

/**
 * Milestone 33 — one hotel's facts for the hotel page, from LiteAPI's free
 * `GET /v3.0/data/hotel?hotelId=…` (photos, description, facilities,
 * location). Cached in memory for an hour; read loosely like map.ts.
 */

import { liteApiKey } from "@/features/liveHotels/liteapi/client";

export type LiveHotelDetails = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  stars: number;
  rating: number | null;
  reviewCount: number | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  facilities: string[];
  checkin: string | null;
  checkout: string | null;
};

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
function num(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

/** LiteAPI descriptions are HTML; keep plain text paragraphs only. */
export function htmlToText(html: string | null): string | null {
  if (!html) return null;
  const text = html
    .replace(/<\s*(br|\/p|\/li|\/h\d)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
  return text || null;
}

export function mapLiteApiHotelDetails(body: unknown): LiveHotelDetails | null {
  const data = isObject(body) && isObject(body.data) ? body.data : null;
  if (!data) return null;
  const id = str(data.id) ?? str(data.hotelId);
  if (!id) return null;
  const location = isObject(data.location) ? data.location : data;
  const images = (Array.isArray(data.hotelImages) ? data.hotelImages : [])
    .map((image) => (isObject(image) ? str(image.urlHd) ?? str(image.url) : str(image)))
    .filter((url): url is string => Boolean(url));
  const main = str(data.main_photo);
  if (main && !images.includes(main)) images.unshift(main);
  const facilities = (Array.isArray(data.hotelFacilities) ? data.hotelFacilities : Array.isArray(data.facilities) ? data.facilities : [])
    .map((f) => (isObject(f) ? str(f.name) ?? str(f.facility) : str(f)))
    .filter((f): f is string => Boolean(f));
  const times = isObject(data.checkinCheckoutTimes) ? data.checkinCheckoutTimes : {};
  const rating = num(data.rating);
  return {
    id,
    name: str(data.name) ?? "Hotel",
    description: htmlToText(str(data.hotelDescription) ?? str(data.description)),
    images: [...new Set(images)].slice(0, 30),
    stars: Math.max(0, Math.min(5, Math.round(num(data.starRating) ?? num(data.stars) ?? 0))),
    rating: rating !== null && rating > 0 ? Math.min(10, rating) : null,
    reviewCount: num(data.reviewCount) ?? num(data.review_count),
    address: str(data.address),
    city: str(data.city),
    country: str(data.country),
    latitude: num(location.latitude) ?? num(location.lat),
    longitude: num(location.longitude) ?? num(location.lng),
    facilities: [...new Set(facilities)],
    checkin: str(times.checkin) ?? str(times.checkin_start),
    checkout: str(times.checkout),
  };
}

const cache = new Map<string, { at: number; value: { details: LiveHotelDetails | null; raw: unknown } }>();
const HOUR = 60 * 60_000;

export async function getLiteApiHotelDetails(hotelId: string): Promise<{ details: LiveHotelDetails | null; raw: unknown }> {
  const key = liteApiKey();
  if (!key || !/^[A-Za-z0-9_-]{2,40}$/.test(hotelId)) return { details: null, raw: null };
  const hit = cache.get(hotelId);
  if (hit && Date.now() - hit.at < HOUR) return hit.value;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(`https://api.liteapi.travel/v3.0/data/hotel?hotelId=${encodeURIComponent(hotelId)}&timeout=4`, {
      headers: { "X-API-Key": key, accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    const raw: unknown = await response.json().catch(() => null);
    const value = { details: response.ok ? mapLiteApiHotelDetails(raw) : null, raw };
    if (value.details) {
      cache.set(hotelId, { at: Date.now(), value });
      if (cache.size > 300) cache.delete(cache.keys().next().value!);
    }
    return value;
  } catch {
    return { details: null, raw: null };
  } finally {
    clearTimeout(timer);
  }
}
