/**
 * Milestone 44 — RapidAPI "Booking" by Api Dojo (apidojo-booking-v1)
 * responses → LiveHotel[]. Read loosely: a missing field becomes null.
 */

import type { LiveHotel } from "@/features/liveHotels/types";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asString = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
function asNumber(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

/** First city match from /locations/auto-complete. */
export function pickDestination(raw: unknown): { destId: string; destType: string } | null {
  for (const item of asArray(raw)) {
    if (!isObject(item)) continue;
    const destId = asString(item.dest_id) ?? (asNumber(item.dest_id) !== null ? String(item.dest_id) : null);
    const destType = asString(item.dest_type);
    if (destId && destType === "city") return { destId, destType };
  }
  for (const item of asArray(raw)) {
    if (!isObject(item)) continue;
    const destId = asString(item.dest_id) ?? (asNumber(item.dest_id) !== null ? String(item.dest_id) : null);
    const destType = asString(item.dest_type);
    if (destId && destType) return { destId, destType };
  }
  return null;
}

/** Bigger photo than the 60px square Booking.com lists return. */
export function biggerPhoto(url: string | null): string | null {
  if (!url) return null;
  return url.replace(/\/(square|max)\d+\//, "/max500/");
}

function price(item: Json, currency: string): { amount: number; currency: string } | null {
  const breakdown = isObject(item.price_breakdown) ? item.price_breakdown : null;
  const gross = breakdown ? (asNumber(breakdown.all_inclusive_price) ?? asNumber(breakdown.gross_price)) : null;
  const amount = gross ?? asNumber(item.min_total_price);
  if (amount === null || amount <= 0) return null;
  const code = (breakdown && asString(breakdown.currency)) ?? asString(item.currencycode) ?? asString(item.currency_code) ?? currency;
  return { amount: Math.round(amount * 100) / 100, currency: code };
}

/** /properties/list → LiveHotel[] (hotels without a price are skipped). */
export function mapBookingProperties(raw: unknown, currency: string): LiveHotel[] {
  const list = isObject(raw) ? asArray(raw.result) : asArray(raw);
  const hotels: LiveHotel[] = [];
  for (const entry of list) {
    if (!isObject(entry)) continue;
    const id = asString(entry.hotel_id) ?? (asNumber(entry.hotel_id) !== null ? String(entry.hotel_id) : null);
    const name = asString(entry.hotel_name) ?? asString(entry.hotel_name_trans);
    const cost = price(entry, currency);
    if (!id || !name || !cost) continue;
    const url = asString(entry.url);
    hotels.push({
      id: `bk-${id}`,
      name,
      photo: biggerPhoto(asString(entry.max_photo_url) ?? asString(entry.main_photo_url)),
      address: [asString(entry.address), asString(entry.city)].filter(Boolean).join(", ") || null,
      stars: Math.round(asNumber(entry.class) ?? 0),
      rating: asNumber(entry.review_score),
      reviewCount: asNumber(entry.review_nr),
      latitude: asNumber(entry.latitude),
      longitude: asNumber(entry.longitude),
      totalPrice: cost.amount,
      currency: cost.currency,
      roomName: asString(entry.unit_configuration_label)?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? null,
      boardName: asNumber(entry.hotel_include_breakfast) === 1 ? "Breakfast included" : null,
      refundable: asNumber(entry.is_free_cancellable) === 1,
      offerId: null,
      externalUrl: url ? (url.startsWith("http") ? url : `https://www.booking.com${url}`) : null,
    });
  }
  return hotels;
}
