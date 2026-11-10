/**
 * Milestone 56 — RapidAPI "Agoda com" (host agoda-com.p.rapidapi.com)
 * responses → LiveHotel[]. Unofficial API: read loosely, a missing field
 * becomes null and a hotel without a price is skipped.
 */

import type { LiveHotel, LiveHotelsSearch } from "@/features/liveHotels/types";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asString = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
function asNumber(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}
const obj = (v: unknown): Json => (isObject(v) ? v : {});

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/**
 * City id from /hotels/auto-complete for a label like "Paris, France".
 * Prefers a city in the label's country, then any city, then the first place.
 */
export function pickAgodaPlace(raw: unknown, label: string): string | null {
  const data = isObject(raw) ? raw.data : raw;
  const list = (Array.isArray(data) ? data : asArray(obj(data).places)).filter(isObject);
  const parts = label.split(",").map((p) => fold(p)).filter(Boolean);
  const country = parts.length > 1 ? parts[parts.length - 1] : null;
  const id = (item: Json) => asString(item.id);
  const isCity = (item: Json) => asNumber(item.typeId) === 1 || fold(asString(item.typeName) ?? "") === "city";
  const cities = list.filter((item) => isCity(item) && id(item));
  if (country) {
    const inCountry = cities.find((item) => fold(asString(obj(item.country).name) ?? "") === country);
    if (inCountry) return id(inCountry);
  }
  if (cities[0]) return id(cities[0]);
  const any = list.find((item) => id(item));
  return any ? id(any) : null;
}

/** The hotel's page on Agoda for the same dates and guests. */
export function agodaHotelUrl(propertyId: string, search: Omit<LiveHotelsSearch, "destination">, nights: number): string {
  const params = new URLSearchParams({
    hid: propertyId,
    checkin: search.checkin,
    los: String(Math.max(1, nights)),
    adults: String(Math.max(1, search.adults)),
    children: String(Math.max(0, search.children)),
    rooms: String(Math.max(1, search.rooms)),
    currency: search.currency,
  });
  return `https://www.agoda.com/partners/partnersearch.aspx?${params.toString()}`;
}

function photo(content: Json): string | null {
  for (const image of asArray(obj(content.images).hotelImages)) {
    for (const url of asArray(obj(image).urls)) {
      const value = asString(obj(url).value);
      if (!value) continue;
      const full = value.startsWith("//") ? `https:${value}` : value;
      if (!/^https:\/\//.test(full)) continue;
      // Agoda's own images take a size: ask for a bigger one than the 300px thumbnail.
      return full.replace(/([?&]s=)\d+x\d+/, "$1600x450");
    }
  }
  return null;
}

/** Whole-stay price (all rooms, all nights, taxes in) of the cheapest room. */
function stayPrice(pricing: Json, nights: number, rooms: number): { amount: number; currency: string } | null {
  for (const offer of asArray(pricing.offers)) {
    for (const roomOffer of asArray(obj(offer).roomOffers)) {
      for (const entry of asArray(obj(obj(roomOffer).room).pricing)) {
        const price = obj(obj(entry).price);
        const currency = asString(obj(entry).currency);
        const perBook = asNumber(obj(obj(price.perBook).inclusive).display);
        const perRoomNight = asNumber(obj(obj(price.perRoomPerNight).inclusive).display);
        const amount = perBook ?? (perRoomNight !== null ? perRoomNight * Math.max(1, nights) * Math.max(1, rooms) : null);
        if (amount !== null && amount > 0 && currency) return { amount: Math.round(amount * 100) / 100, currency };
      }
    }
  }
  return null;
}

/** /hotels/search-overnight → LiveHotel[]. */
export function mapAgodaProperties(raw: unknown, search: Omit<LiveHotelsSearch, "destination">, nights: number): LiveHotel[] {
  const data = isObject(raw) ? obj(raw.data) : {};
  const hotels: LiveHotel[] = [];
  for (const entry of asArray(data.properties)) {
    if (!isObject(entry)) continue;
    const content = obj(entry.content);
    const info = obj(content.informationSummary);
    const pricing = obj(entry.pricing);
    const idNumber = asNumber(entry.propertyId) ?? asNumber(content.propertyId);
    const name = asString(info.localeName) ?? asString(info.defaultName);
    if (idNumber === null || !name || pricing.isAvailable === false) continue;
    const cost = stayPrice(pricing, nights, search.rooms);
    if (!cost) continue;
    const address = obj(info.address);
    const geo = obj(info.geoInfo);
    const reviews = obj(obj(content.reviews).cumulative);
    const score = asNumber(reviews.score);
    const cancellation = fold(asString(obj(obj(pricing.payment).cancellation).cancellationType) ?? "");
    const id = String(idNumber);
    hotels.push({
      id: `ag-${id}`,
      name,
      photo: photo(content),
      address: [asString(obj(address.area).name), asString(obj(address.city).name)].filter(Boolean).join(", ") || null,
      stars: Math.min(5, Math.max(0, Math.round(asNumber(info.rating) ?? 0))),
      rating: score !== null && score > 0 ? score : null,
      reviewCount: asNumber(reviews.reviewCount),
      latitude: asNumber(geo.latitude),
      longitude: asNumber(geo.longitude),
      totalPrice: cost.amount,
      currency: cost.currency,
      roomName: asString(obj(obj(entry.enrichment).roomInformation).cheapestRoomName),
      boardName: null,
      refundable: cancellation.startsWith("freecancel"),
      offerId: null,
      externalUrl: agodaHotelUrl(id, search, nights),
    });
  }
  return hotels;
}

/** Same hotel on two sites → same key ("Hôtel Le Six" = "Hotel Le Six Paris"). */
export function hotelNameKey(name: string): string {
  return fold(name)
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\b(hotel|hostel|the|and|by|a|an|de|la|le|el|il)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Booking.com + Agoda in one list: a hotel found on both keeps the cheaper
 * offer (same currency only); hotels only on Agoda are slotted in after
 * every second Booking.com hotel so neither site fills the top alone.
 */
export function mergeHotels(primary: LiveHotel[], extra: LiveHotel[]): LiveHotel[] {
  const byKey = new Map<string, LiveHotel>();
  for (const hotel of extra) {
    const key = hotelNameKey(hotel.name);
    const seen = key ? byKey.get(key) : undefined;
    if (key && (!seen || hotel.totalPrice < seen.totalPrice)) byKey.set(key, hotel);
  }
  const used = new Set<string>();
  const merged = primary.map((hotel) => {
    const key = hotelNameKey(hotel.name);
    const other = key ? byKey.get(key) : undefined;
    if (!other) return hotel;
    used.add(key);
    const cheaper = other.currency === hotel.currency && other.totalPrice < hotel.totalPrice;
    if (!cheaper) return hotel;
    // Keep the richer details (photo, score) when the cheaper offer lacks them.
    return { ...other, photo: other.photo ?? hotel.photo, rating: other.rating ?? hotel.rating, reviewCount: other.reviewCount ?? hotel.reviewCount, stars: other.stars || hotel.stars };
  });
  const rest = [...byKey.entries()].filter(([key]) => !used.has(key)).map(([, hotel]) => hotel);
  if (merged.length === 0) return rest;
  const out: LiveHotel[] = [];
  let next = 0;
  merged.forEach((hotel, index) => {
    out.push(hotel);
    if (index % 2 === 1 && next < rest.length) out.push(rest[next++]);
  });
  return out.concat(rest.slice(next));
}

/** "Agoda" / "Booking.com" for a hotel link, for the button text. */
export function hotelSiteName(url: string | null | undefined): string {
  return url && /^https:\/\/(www\.)?agoda\.com\//i.test(url) ? "Agoda" : "Booking.com";
}
