/**
 * Duffel Stays (hotels, test mode first) — pure helpers: search body,
 * search results → LiveHotel, all rooms and rates of one hotel.
 * Docs: https://duffel.com/docs/api/v2/search , /search-result/fetch-all-rates ,
 * /quotes/create-quote , /bookings/create-booking , guides/test-hotels
 */

import { distanceKm, propertyKindOf } from "@/features/liveHotels/propertyKind";
import type { LiveHotel } from "@/features/liveHotels/types";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const obj = (v: unknown): Json => (isObject(v) ? v : {});
const list = (v: unknown): Json[] => (Array.isArray(v) ? v.filter(isObject) : []);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

/** Duffel's test hotels exist only here (test mode). */
export const STAYS_TEST_LOCATION = { latitude: -24.38, longitude: -128.32, radiusKm: 2 };

export type StaysSearch = { checkin: string; checkout: string; adults: number; children: number; rooms: number };

export function staysSearchBody(search: StaysSearch, centre: { latitude: number; longitude: number }, radiusKm: number, freeCancellationOnly = false): Json {
  return {
    data: {
      check_in_date: search.checkin,
      check_out_date: search.checkout,
      rooms: Math.max(1, search.rooms),
      guests: [
        ...Array.from({ length: Math.max(1, search.adults) }, () => ({ type: "adult" })),
        ...Array.from({ length: Math.max(0, search.children) }, () => ({ type: "child", age: 8 })),
      ],
      location: { radius: radiusKm, geographic_coordinates: { latitude: centre.latitude, longitude: centre.longitude } },
      ...(freeCancellationOnly ? { free_cancellation_only: true } : {}),
    },
  };
}

/** Amenity codes → words travellers know (unknown codes are prettified). */
const AMENITY_LABELS: Record<string, string> = {
  wifi: "Free Wi-Fi",
  parking: "Parking",
  pool: "Swimming pool",
  gym: "Fitness centre",
  spa: "Spa",
  restaurant: "Restaurant",
  lounge: "Bar / lounge",
  pets_allowed: "Pets allowed",
  accessibility_mobility: "Wheelchair accessible",
  accessibility_hearing: "Hearing accessible",
  "24_hour_front_desk": "24-hour front desk",
  room_service: "Room service",
  laundry: "Laundry",
  concierge: "Concierge",
  business_centre: "Business centre",
  childcare_service: "Childcare",
  cash_machine: "Cash machine",
  adult_only: "Adults only",
};

export function amenityLabel(type: string): string {
  return AMENITY_LABELS[type] ?? type.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

/** The amenities shown as filters, most wanted first. */
export const AMENITY_FILTERS = ["wifi", "parking", "pool", "gym", "spa", "restaurant", "lounge", "room_service", "pets_allowed", "accessibility_mobility", "24_hour_front_desk", "laundry", "adult_only"];

function address(location: Json): string | null {
  const a = obj(location.address);
  return [str(a.line_one), str(a.city_name)].filter(Boolean).join(", ") || null;
}

/** POST /stays/search answer → LiveHotel[] (prices in Duffel's currency; the client converts). */
export function mapStaysResults(raw: unknown, centre: { latitude: number; longitude: number } | null, freeCancellationIds = new Set<string>()): LiveHotel[] {
  const hotels: LiveHotel[] = [];
  for (const r of list(obj(obj(raw).data).results)) {
    const id = str(r.id);
    const total = num(r.cheapest_rate_total_amount);
    const currency = str(r.cheapest_rate_currency);
    const acc = obj(r.accommodation);
    const name = str(acc.name);
    if (!id || !name || total === null || total <= 0 || !currency) continue;
    const location = obj(acc.location);
    const geo = obj(location.geographic_coordinates);
    const lat = num(geo.latitude);
    const lon = num(geo.longitude);
    const score = num(acc.review_score);
    const accId = str(acc.id) ?? id;
    hotels.push({
      id: `dst-${id}`,
      name,
      photo: str(list(acc.photos)[0]?.url),
      address: address(location),
      stars: Math.max(0, Math.min(5, Math.round(num(acc.rating) ?? 0))),
      rating: score !== null && score > 0 ? Math.round(score * 10) / 10 : null,
      reviewCount: num(acc.review_count),
      latitude: lat,
      longitude: lon,
      totalPrice: total,
      currency,
      roomName: null,
      boardName: null,
      refundable: freeCancellationIds.has(accId),
      offerId: id,
      externalUrl: `/book/stay/${encodeURIComponent(id)}`,
      propertyType: propertyKindOf(str(acc.type) ?? "hotel"),
      distanceKm: centre && lat !== null && lon !== null ? Math.round(distanceKm(centre.latitude, centre.longitude, lat, lon) * 10) / 10 : null,
      amenities: list(acc.amenities).map((a) => str(a.type)).filter((t): t is string => Boolean(t)),
      ...(str(obj(acc.chain).name) ? { chain: str(obj(acc.chain).name)! } : {}),
    });
  }
  return hotels;
}

/** Accommodation ids from a free-cancellation-only search (marks "Free cancellation" on the list). */
export function accommodationIds(raw: unknown): Set<string> {
  return new Set(list(obj(obj(raw).data).results).map((r) => str(obj(r.accommodation).id) ?? str(r.id) ?? "").filter(Boolean));
}

export type StayRate = {
  id: string;
  name: string | null;
  total: number;
  currency: string;
  /** Part of the total paid at the hotel (taxes/fees there). */
  dueAtProperty: number | null;
  taxes: number | null;
  fees: number | null;
  board: string;
  boardLabel: string;
  payment: string;
  paymentLabel: string;
  /** Last moment for a full refund (ISO), null when there is none. */
  freeCancellationUntil: string | null;
  refundable: "free" | "partial" | "none";
  cancellation: { before: string; refund: number; currency: string }[];
  conditions: { title: string; description: string }[];
  benefits: string[];
  left: number | null;
};

export type StayRoom = { name: string; photos: string[]; beds: string; rates: StayRate[] };

export type StayDetails = {
  searchResultId: string;
  expiresAt: string | null;
  checkin: string;
  checkout: string;
  rooms: number;
  guests: number;
  hotel: {
    name: string;
    photos: string[];
    description: string | null;
    address: string | null;
    stars: number;
    reviewScore: number | null;
    reviewCount: number | null;
    amenities: string[];
    checkInAfter: string | null;
    checkOutBefore: string | null;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    chain: string | null;
  };
  roomTypes: StayRoom[];
};

const BOARD: Record<string, string> = {
  room_only: "Room only",
  breakfast: "Breakfast included",
  half_board: "Half board (breakfast + dinner)",
  full_board: "Full board (all meals)",
  all_inclusive: "All inclusive",
};
const PAYMENT: Record<string, string> = {
  pay_now: "Pay now",
  deposit: "Pay a deposit now",
  guarantee: "Pay at the property",
};

export function mapStayRates(raw: unknown): StayDetails | null {
  const data = obj(obj(raw).data);
  const id = str(data.id);
  const acc = obj(data.accommodation);
  const name = str(acc.name);
  if (!id || !name) return null;
  const location = obj(acc.location);
  const geo = obj(location.geographic_coordinates);
  const checkInfo = obj(acc.check_in_information);
  const roomTypes: StayRoom[] = list(acc.rooms)
    .map((room) => {
      const rates = list(room.rates)
        .map((r): StayRate | null => {
          const rateId = str(r.id);
          const total = num(r.total_amount);
          const currency = str(r.total_currency);
          if (!rateId || total === null || !currency) return null;
          const cancellation = list(r.cancellation_timeline)
            .map((c) => ({ before: str(c.before) ?? "", refund: num(c.refund_amount) ?? 0, currency: str(c.currency) ?? currency }))
            .filter((c) => c.before);
          const full = cancellation.filter((c) => c.refund >= total - 0.01).sort((a, b) => b.before.localeCompare(a.before))[0];
          const board = str(r.board_type) ?? "room_only";
          const payment = str(r.payment_type) ?? "pay_now";
          return {
            id: rateId,
            name: str(r.name),
            total,
            currency,
            dueAtProperty: num(r.due_at_accommodation_amount),
            taxes: num(r.tax_amount),
            fees: num(r.fee_amount),
            board,
            boardLabel: BOARD[board] ?? board.replace(/_/g, " "),
            payment,
            paymentLabel: PAYMENT[payment] ?? payment.replace(/_/g, " "),
            freeCancellationUntil: full?.before ?? null,
            refundable: full ? "free" : cancellation.some((c) => c.refund > 0) ? "partial" : "none",
            cancellation,
            conditions: list(r.conditions)
              .map((c) => ({ title: str(c.title) ?? "", description: str(c.description) ?? "" }))
              .filter((c) => c.title || c.description),
            benefits: list(r.benefits).map((b) => str(b.title) ?? str(b.description) ?? "").filter(Boolean),
            left: num(r.quantity_available),
          };
        })
        .filter((r): r is StayRate => r !== null)
        .sort((a, b) => a.total - b.total);
      const beds = list(room.beds)
        .map((b) => `${num(b.count) ?? 1} ${str(b.type) ?? "bed"} bed${(num(b.count) ?? 1) > 1 ? "s" : ""}`)
        .join(", ");
      return { name: str(room.name) ?? "Room", photos: list(room.photos).map((p) => str(p.url)).filter((u): u is string => Boolean(u)), beds, rates };
    })
    .filter((room) => room.rates.length > 0)
    .sort((a, b) => a.rates[0].total - b.rates[0].total);
  return {
    searchResultId: id,
    expiresAt: str(data.expires_at),
    checkin: str(data.check_in_date) ?? "",
    checkout: str(data.check_out_date) ?? "",
    rooms: num(data.rooms) ?? 1,
    guests: list(data.guests).length || 1,
    hotel: {
      name,
      photos: list(acc.photos).map((p) => str(p.url)).filter((u): u is string => Boolean(u)),
      description: str(acc.description),
      address: [str(obj(location.address).line_one), str(obj(location.address).city_name), str(obj(location.address).postal_code)].filter(Boolean).join(", ") || null,
      stars: Math.max(0, Math.min(5, Math.round(num(acc.rating) ?? 0))),
      reviewScore: num(acc.review_score),
      reviewCount: num(acc.review_count),
      amenities: list(acc.amenities).map((a) => str(a.type)).filter((t): t is string => Boolean(t)),
      checkInAfter: str(checkInfo.check_in_after_time),
      checkOutBefore: str(checkInfo.check_out_before_time),
      latitude: num(geo.latitude),
      longitude: num(geo.longitude),
      phone: str(acc.phone_number),
      chain: str(obj(acc.chain).name),
    },
    roomTypes,
  };
}

/** Quote answer → the price to pay now. */
export function mapQuote(raw: unknown): { id: string; total: number; currency: string; dueAtProperty: number | null } | null {
  const q = obj(obj(raw).data);
  const id = str(q.id);
  const total = num(q.total_amount);
  const currency = str(q.total_currency);
  return id && total !== null && currency ? { id, total, currency, dueAtProperty: num(q.due_at_accommodation_amount) } : null;
}
