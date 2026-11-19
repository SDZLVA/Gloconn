/**
 * Duffel (flights API, test mode first) — pure helpers: request body, offer
 * → Glooconn Flight, and the booking-page summary. Read loosely: a missing
 * field becomes null and an offer without a price is skipped.
 * Docs: https://duffel.com/docs/api/v2/offer-requests , /offers , /orders
 */

import type { DataFlightsSearch } from "@/features/flightsData/map";
import type { Flight } from "@/types/models";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const obj = (v: unknown): Json => (isObject(v) ? v : {});
const list = (v: unknown): Json[] => (Array.isArray(v) ? v.filter(isObject) : []);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

/** Passengers for an offer request: adults by type, children and infants by age. */
export function duffelPassengers(adults: number, children: number, infants: number): Json[] {
  return [
    ...Array.from({ length: Math.max(1, adults) }, () => ({ type: "adult" })),
    ...Array.from({ length: Math.max(0, children) }, () => ({ age: 10 })),
    ...Array.from({ length: Math.max(0, Math.min(infants, Math.max(1, adults))) }, () => ({ age: 1 })),
  ];
}

export function offerRequestBody(search: DataFlightsSearch): Json {
  const slices = [{ origin: search.origin, destination: search.destination, departure_date: search.departureDate }];
  if (search.returnDate) slices.push({ origin: search.destination, destination: search.origin, departure_date: search.returnDate });
  return { data: { slices, passengers: duffelPassengers(search.adults, search.children, search.infants), cabin_class: "economy" } };
}

/** "PT2H30M" / "P1DT3H5M" → minutes. */
export function isoMinutes(value: unknown): number | null {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/.exec(typeof value === "string" ? value : "");
  if (!m) return null;
  return Number(m[1] ?? 0) * 1440 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

/** "2026-12-01T07:35:00" → "2026-12-01 07:35" (local time at that airport). */
export function localTime(value: unknown): string {
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(typeof value === "string" ? value : "");
  return m ? `${m[1]} ${m[2]}` : "";
}

type SliceInfo = { departure: string; arrival: string; minutes: number; stops: number; from: string | null; to: string | null };

function slice(raw: Json): SliceInfo | null {
  const segments = list(raw.segments);
  const first = segments[0];
  const last = segments[segments.length - 1];
  if (!first || !last) return null;
  const departure = localTime(first.departing_at);
  if (!departure) return null;
  const minutes =
    isoMinutes(raw.duration) ??
    Math.max(0, Math.round((Date.parse(str(last.arriving_at) ?? "") - Date.parse(str(first.departing_at) ?? "")) / 60000)) ??
    0;
  return {
    departure,
    arrival: localTime(last.arriving_at),
    minutes: Number.isFinite(minutes) ? minutes : 0,
    stops: Math.max(0, segments.length - 1),
    from: str(obj(first.origin).iata_code),
    to: str(obj(last.destination).iata_code),
  };
}

/**
 * Offer request answer → Flight[] (price per paying traveller, in the
 * offer's own currency — the client converts it). Cheapest first, max 40.
 */
export function mapDuffelOffers(raw: unknown, search: DataFlightsSearch, destinationId = ""): Flight[] {
  const data = obj(obj(raw).data);
  const payers = Math.max(1, search.adults + search.children);
  const flights: Flight[] = [];
  for (const offer of list(data.offers)) {
    const id = str(offer.id);
    const total = num(offer.total_amount);
    const currency = str(offer.total_currency);
    const slices = list(offer.slices).map(slice);
    const out = slices[0];
    const back = slices[1];
    if (!id || total === null || total <= 0 || !currency || !out) continue;
    if (search.returnDate && !back) continue;
    const owner = obj(offer.owner);
    const code = str(owner.iata_code);
    flights.push({
      id: `duf-${id}`,
      destinationId,
      price: Math.round((total / payers) * 100) / 100,
      currency: currency as Flight["currency"],
      rating: 0,
      airline: str(owner.name) ?? code ?? "Airline",
      ...(code && /^[A-Z0-9]{2}$/.test(code) ? { airlineCode: code } : {}),
      departureTime: out.departure,
      arrivalTime: out.arrival,
      durationMinutes: out.minutes,
      stops: out.stops,
      cabin: "Economy",
      originAirport: out.from ?? search.origin,
      destinationAirport: out.to ?? search.destination,
      ...(back ? { returnDepartureTime: back.departure, returnStops: back.stops, returnDurationMinutes: back.minutes } : {}),
      source: "duffel",
      offerId: id,
    } as Flight);
  }
  return flights.sort((a, b) => a.price - b.price).slice(0, 40);
}

/** Everything the booking page shows about one offer. */
export type OfferSummary = {
  id: string;
  total: number;
  currency: string;
  expiresAt: string | null;
  airline: string;
  airlineCode: string | null;
  slices: { from: string; to: string; departure: string; arrival: string; minutes: number; stops: number; flights: string[] }[];
  passengers: { id: string; type: "adult" | "child" | "infant" }[];
  checkedBags: number | null;
  refundable: boolean | null;
  changeable: boolean | null;
};

export function summarizeOffer(raw: unknown): OfferSummary | null {
  const offer = obj(obj(raw).data);
  const id = str(offer.id);
  const total = num(offer.total_amount);
  const currency = str(offer.total_currency);
  if (!id || total === null || !currency) return null;
  const slices = list(offer.slices)
    .map((s) => {
      const info = slice(s);
      if (!info) return null;
      return {
        from: info.from ?? "",
        to: info.to ?? "",
        departure: info.departure,
        arrival: info.arrival,
        minutes: info.minutes,
        stops: info.stops,
        flights: list(s.segments).map((g) => `${str(obj(g.marketing_carrier).iata_code) ?? ""}${str(g.marketing_carrier_flight_number) ?? ""}`).filter(Boolean),
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);
  const passengers = list(offer.passengers).map((p) => {
    const age = num(p.age);
    const type: "adult" | "child" | "infant" =
      str(p.type) === "adult" || (age !== null && age >= 18) || (age === null && !str(p.type)) ? "adult" : age !== null && age < 2 ? "infant" : str(p.type)?.startsWith("infant") ? "infant" : "child";
    return { id: str(p.id) ?? "", type };
  });
  // Checked bags included for the first passenger on the first segment.
  const firstSegment = list(list(offer.slices)[0]?.segments)[0];
  const bags = list(list(firstSegment?.passengers)[0]?.baggages);
  const checked = bags.find((b) => str(b.type) === "checked");
  const conditions = obj(offer.conditions);
  const allowed = (key: string) => {
    const c = conditions[key];
    return isObject(c) && typeof c.allowed === "boolean" ? c.allowed : null;
  };
  const owner = obj(offer.owner);
  return {
    id,
    total,
    currency,
    expiresAt: str(offer.expires_at),
    airline: str(owner.name) ?? "Airline",
    airlineCode: str(owner.iata_code),
    slices,
    passengers: passengers.filter((p) => p.id),
    checkedBags: checked ? (num(checked.quantity) ?? 0) : bags.length > 0 ? 0 : null,
    refundable: allowed("refund_before_departure"),
    changeable: allowed("change_before_departure"),
  };
}

/** First readable message from a Duffel error answer. */
export function duffelErrorMessage(raw: unknown): string | null {
  const first = list(obj(raw).errors)[0];
  return first ? (str(first.message) ?? str(first.title)) : null;
}
