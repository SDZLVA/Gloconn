/**
 * Milestone 30: LiteAPI `POST /hotels/rates` response → LiveHotel[].
 * Written defensively: fields are read loosely so a small change in the
 * response doesn't break the page (missing data → null, not a crash).
 */

import type { LiveHotel } from "@/features/liveHotels/types";

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === "object" && value !== null && !Array.isArray(value);
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asString = (value: unknown): string | null => (typeof value === "string" && value.trim() ? value.trim() : null);
function asNumber(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

/** First { amount, currency } from a money field (object or array). */
function money(value: unknown): { amount: number; currency: string | null } | null {
  const item = Array.isArray(value) ? value[0] : value;
  if (!isObject(item)) return null;
  const amount = asNumber(item.amount);
  return amount === null ? null : { amount, currency: asString(item.currency) };
}

function address(value: unknown): string | null {
  if (typeof value === "string") return asString(value);
  if (isObject(value)) {
    return [value.line1, value.address, value.city].map(asString).filter(Boolean).join(", ") || null;
  }
  return null;
}

/** Cheapest offer of one hotel's room types. */
function cheapestOffer(roomTypes: unknown[]) {
  let best: { total: number; currency: string | null; offerId: string | null; roomName: string | null; boardName: string | null; refundable: boolean } | null = null;
  for (const roomType of roomTypes) {
    if (!isObject(roomType)) continue;
    const rates = asArray(roomType.rates).filter(isObject);
    const firstRate = rates[0];
    const offerTotal = money(roomType.offerRetailRate);
    // offerRetailRate covers the whole offer (all rooms); otherwise add up the rates.
    let total = offerTotal?.amount ?? null;
    let currency = offerTotal?.currency ?? null;
    if (total === null && rates.length > 0) {
      let sum = 0;
      for (const rate of rates) {
        const price = money(isObject(rate.retailRate) ? rate.retailRate.total : undefined);
        if (!price) {
          sum = NaN;
          break;
        }
        sum += price.amount;
        currency = currency ?? price.currency;
      }
      total = Number.isFinite(sum) ? sum : null;
    }
    if (total === null || total <= 0) continue;
    if (best && best.total <= total) continue;
    const policies = firstRate && isObject(firstRate.cancellationPolicies) ? firstRate.cancellationPolicies : null;
    best = {
      total,
      currency,
      offerId: asString(roomType.offerId),
      roomName: firstRate ? asString(firstRate.name) : null,
      boardName: firstRate ? asString(firstRate.boardName) : null,
      refundable: asString(policies?.refundableTag) === "RFN",
    };
  }
  return best;
}

export function mapLiteApiRates(body: unknown, fallbackCurrency: string): LiveHotel[] {
  if (!isObject(body)) return [];
  const details = new Map<string, Json>();
  for (const hotel of asArray(body.hotels)) {
    if (isObject(hotel)) {
      const id = asString(hotel.id) ?? asString(hotel.hotelId);
      if (id) details.set(id, hotel);
    }
  }

  const hotels: LiveHotel[] = [];
  for (const entry of asArray(body.data)) {
    if (!isObject(entry)) continue;
    const id = asString(entry.hotelId) ?? asString(entry.id);
    if (!id) continue;
    const offer = cheapestOffer(asArray(entry.roomTypes));
    if (!offer) continue;
    const info: Json = details.get(id) ?? (isObject(entry.hotel) ? entry.hotel : {});
    const location = isObject(info.location) ? info.location : info;
    const rating = asNumber(info.rating) ?? asNumber(info.guestRating);
    hotels.push({
      id,
      name: asString(info.name) ?? "Hotel",
      // The 400px thumbnail is plenty for a card; main_photo is ~3000px.
      photo: asString(info.thumbnail) ?? asString(info.main_photo) ?? asString(info.mainPhoto),
      address: address(info.address),
      stars: Math.max(0, Math.min(5, Math.round(asNumber(info.stars) ?? asNumber(info.starRating) ?? 0))),
      rating: rating !== null && rating > 0 ? Math.min(10, rating) : null,
      reviewCount: asNumber(info.review_count) ?? asNumber(info.reviewCount) ?? asNumber(info.reviews_count) ?? null,
      latitude: asNumber(location.latitude) ?? asNumber(location.lat),
      longitude: asNumber(location.longitude) ?? asNumber(location.lng),
      totalPrice: Math.round(offer.total * 100) / 100,
      currency: offer.currency ?? fallbackCurrency,
      roomName: offer.roomName,
      boardName: offer.boardName,
      refundable: offer.refundable,
      offerId: offer.offerId,
    });
  }
  return hotels;
}
