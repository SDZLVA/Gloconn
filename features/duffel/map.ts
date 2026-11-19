/**
 * Duffel (flights API, test mode first) — pure helpers: request body, offer
 * → Glooconn Flight, the booking-page summary, extra bags and seat maps.
 * Read loosely: a missing field becomes null and an offer without a price is
 * skipped.
 * Docs: https://duffel.com/docs/api/v2/offer-requests , /offers , /seat-maps , /orders
 */

import type { DataFlightsSearch } from "@/features/flightsData/map";
import type { Flight } from "@/types/models";
import type { FlightLeg } from "@/types/models/flight";

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

/** Minutes between two local times at the SAME airport (a stopover). */
function minutesBetween(arrive: unknown, depart: unknown): number | null {
  const a = Date.parse(`${localTime(arrive).replace(" ", "T")}:00Z`);
  const d = Date.parse(`${localTime(depart).replace(" ", "T")}:00Z`);
  return Number.isFinite(a) && Number.isFinite(d) && d >= a ? Math.round((d - a) / 60000) : null;
}

export type SegmentInfo = {
  id: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  minutes: number | null;
  flight: string;
  airline: string;
  /** Set only when another airline flies it. */
  operatedBy: string | null;
  aircraft: string | null;
  cabin: string | null;
};

export type SliceInfo = {
  departure: string;
  arrival: string;
  minutes: number;
  stops: number;
  from: string | null;
  to: string | null;
  segments: SegmentInfo[];
  layovers: { airport: string; minutes: number }[];
  fareBrand: string | null;
};

function segmentInfo(g: Json): SegmentInfo {
  const marketing = obj(g.marketing_carrier);
  const operating = obj(g.operating_carrier);
  const airline = str(marketing.name) ?? str(marketing.iata_code) ?? "";
  const operator = str(operating.name);
  return {
    id: str(g.id) ?? "",
    from: str(obj(g.origin).iata_code) ?? "",
    to: str(obj(g.destination).iata_code) ?? "",
    departure: localTime(g.departing_at),
    arrival: localTime(g.arriving_at),
    minutes: isoMinutes(g.duration),
    flight: `${str(marketing.iata_code) ?? ""}${str(g.marketing_carrier_flight_number) ?? ""}`,
    airline,
    operatedBy: operator && operator !== airline ? operator : null,
    aircraft: str(obj(g.aircraft).name),
    cabin: str(list(g.passengers)[0]?.cabin_class_marketing_name),
  };
}

export function sliceInfo(raw: Json): SliceInfo | null {
  const segments = list(raw.segments);
  const first = segments[0];
  const last = segments[segments.length - 1];
  if (!first || !last) return null;
  const departure = localTime(first.departing_at);
  if (!departure) return null;
  const elapsed = Math.round((Date.parse(str(last.arriving_at) ?? "") - Date.parse(str(first.departing_at) ?? "")) / 60000);
  const minutes = isoMinutes(raw.duration) ?? (Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0);
  const layovers: SliceInfo["layovers"] = [];
  for (let i = 1; i < segments.length; i++) {
    const wait = minutesBetween(segments[i - 1].arriving_at, segments[i].departing_at);
    const airport = str(obj(segments[i].origin).iata_code);
    if (airport && wait !== null) layovers.push({ airport, minutes: wait });
  }
  return {
    departure,
    arrival: localTime(last.arriving_at),
    minutes,
    stops: Math.max(0, segments.length - 1),
    from: str(obj(first.origin).iata_code),
    to: str(obj(last.destination).iata_code),
    segments: segments.map(segmentInfo),
    layovers,
    fareBrand: str(raw.fare_brand_name),
  };
}

function toLeg(s: SliceInfo): FlightLeg {
  const airports = [s.segments[0]?.from, ...s.segments.map((g) => g.to)].filter((a): a is string => Boolean(a));
  return {
    departureTime: s.departure,
    ...(s.arrival ? { arrivalTime: s.arrival } : {}),
    durationMinutes: s.minutes,
    airports: airports.length >= 2 ? airports : [s.from ?? "", s.to ?? ""],
    layovers: s.layovers,
    flightNumbers: s.segments.map((g) => g.flight).filter(Boolean),
    ...(s.fareBrand ? { fareBrand: s.fareBrand } : {}),
  };
}

/** Bags included for the first traveller on the first flight: { checked, carryOn } (null = unknown). */
export function includedBags(offer: Json): { checked: number | null; carryOn: number | null } {
  const firstSegment = list(list(offer.slices)[0]?.segments)[0];
  const travellers = list(firstSegment?.passengers);
  if (travellers.length === 0) return { checked: null, carryOn: null };
  const bags = list(travellers[0]?.baggages);
  const count = (type: string) => bags.filter((b) => str(b.type) === type).reduce((n, b) => n + (num(b.quantity) ?? 0), 0);
  return { checked: count("checked"), carryOn: count("carry_on") };
}

function fareRules(offer: Json): { refundable: boolean | null; changeable: boolean | null } {
  const conditions = obj(offer.conditions);
  const allowed = (key: string) => {
    const c = conditions[key];
    return isObject(c) && typeof c.allowed === "boolean" ? c.allowed : null;
  };
  return { refundable: allowed("refund_before_departure"), changeable: allowed("change_before_departure") };
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
    const slices = list(offer.slices).map(sliceInfo);
    const out = slices[0];
    const back = slices[1];
    if (!id || total === null || total <= 0 || !currency || !out) continue;
    if (search.returnDate && !back) continue;
    const owner = obj(offer.owner);
    const code = str(owner.iata_code);
    const bags = includedBags(offer);
    const rules = fareRules(offer);
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
      cabin: out.segments[0]?.cabin ?? "Economy",
      originAirport: out.from ?? search.origin,
      destinationAirport: out.to ?? search.destination,
      ...(back ? { returnDepartureTime: back.departure, returnStops: back.stops, returnDurationMinutes: back.minutes, returnLeg: toLeg(back) } : {}),
      outboundLeg: toLeg(out),
      checkedBags: bags.checked,
      carryOnBags: bags.carryOn,
      refundable: rules.refundable,
      changeable: rules.changeable,
      co2Kg: num(offer.total_emissions_kg),
      source: "duffel",
      offerId: id,
    } as Flight);
  }
  return flights.sort((a, b) => a.price - b.price).slice(0, 40);
}

/** An extra bag the traveller can buy (Duffel "available service" of type baggage). */
export type BagOption = {
  id: string;
  passengerId: string;
  kind: "checked" | "carry_on";
  maxWeightKg: number | null;
  maxQuantity: number;
  amount: number;
  currency: string;
  /** Which flights it covers: "Outbound", "Return" or "Whole trip". */
  covers: string;
};

/** Everything the booking page shows about one offer. */
export type OfferSummary = {
  id: string;
  total: number;
  currency: string;
  expiresAt: string | null;
  airline: string;
  airlineCode: string | null;
  slices: (SliceInfo & { from: string; to: string; flights: string[] })[];
  passengers: { id: string; type: "adult" | "child" | "infant" }[];
  checkedBags: number | null;
  carryOnBags: number | null;
  refundable: boolean | null;
  changeable: boolean | null;
  co2Kg: number | null;
  bags: BagOption[];
};

function bagOptions(offer: Json, sliceSegments: string[][]): BagOption[] {
  const out: BagOption[] = [];
  for (const s of list(offer.available_services)) {
    if (str(s.type) !== "baggage") continue;
    const id = str(s.id);
    const amount = num(s.total_amount);
    const currency = str(s.total_currency);
    const meta = obj(s.metadata);
    const kind = str(meta.type) === "carry_on" ? "carry_on" : "checked";
    const passengers = Array.isArray(s.passenger_ids) ? s.passenger_ids.filter((x): x is string => typeof x === "string") : [];
    const segments = Array.isArray(s.segment_ids) ? s.segment_ids.filter((x): x is string => typeof x === "string") : [];
    if (!id || amount === null || amount < 0 || !currency || passengers.length === 0) continue;
    const touched = sliceSegments.map((ids) => ids.some((x) => segments.includes(x)));
    const covers = sliceSegments.length > 1 && touched.every(Boolean) ? "Whole trip" : touched[1] && !touched[0] ? "Return" : sliceSegments.length > 1 ? "Outbound" : "Whole trip";
    // Normally one traveller per service; a shared one is shown once ("*").
    for (const passengerId of passengers.length === 1 ? passengers : ["*"]) {
      out.push({ id, passengerId, kind, maxWeightKg: num(meta.maximum_weight_kg), maxQuantity: Math.max(1, Math.min(9, num(s.maximum_quantity) ?? 1)), amount, currency, covers });
    }
  }
  return out;
}

export function summarizeOffer(raw: unknown): OfferSummary | null {
  const offer = obj(obj(raw).data);
  const id = str(offer.id);
  const total = num(offer.total_amount);
  const currency = str(offer.total_currency);
  if (!id || total === null || !currency) return null;
  const rawSlices = list(offer.slices);
  const slices = rawSlices
    .map((s) => {
      const info = sliceInfo(s);
      return info ? { ...info, from: info.from ?? "", to: info.to ?? "", flights: info.segments.map((g) => g.flight).filter(Boolean) } : null;
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);
  const passengers = list(offer.passengers).map((p) => {
    const age = num(p.age);
    const type: "adult" | "child" | "infant" =
      str(p.type) === "adult" || (age !== null && age >= 18) || (age === null && !str(p.type)) ? "adult" : age !== null && age < 2 ? "infant" : str(p.type)?.startsWith("infant") ? "infant" : "child";
    return { id: str(p.id) ?? "", type };
  });
  const bags = includedBags(offer);
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
    checkedBags: bags.checked,
    carryOnBags: bags.carryOn,
    ...fareRules(offer),
    co2Kg: num(offer.total_emissions_kg),
    bags: bagOptions(offer, rawSlices.map((s) => list(s.segments).map((g) => str(g.id) ?? ""))),
  };
}

/** One seat on a seat map. Unavailable seats have no prices. */
export type Seat = { designator: string; prices: { serviceId: string; passengerId: string; amount: number; currency: string }[]; extraLegroom: boolean };
export type SeatRow = { number: string; sections: ({ kind: "seat"; seat: Seat } | { kind: "gap" | "exit" | "facility" })[][]; exit: boolean };
export type SeatMap = { segmentId: string; label: string; aisles: number; rows: SeatRow[] };

/** GET /air/seat_maps answer → one map per flight (first cabin only; usually economy). */
export function mapSeatMaps(raw: unknown, offer: OfferSummary): SeatMap[] {
  const segments = offer.slices.flatMap((s) => s.segments);
  const maps: SeatMap[] = [];
  for (const m of list(obj(raw).data)) {
    const segmentId = str(m.segment_id) ?? "";
    const segment = segments.find((g) => g.id === segmentId);
    const cabin = list(m.cabins)[0];
    if (!segment || !cabin) continue;
    const rows: SeatRow[] = [];
    let exitNext = false;
    for (const r of list(cabin.rows)) {
      let number = "";
      let exit: boolean = exitNext;
      const sections = list(r.sections).map((section) =>
        list(section.elements).map((e) => {
          const type = str(e.type);
          if (type === "exit_row") exit = true;
          if (type !== "seat") return { kind: type === "exit_row" ? "exit" : type === "empty" ? "gap" : "facility" } as const;
          const designator = str(e.designator) ?? "";
          if (!number) number = designator.replace(/[A-Z]+$/, "");
          const prices = list(e.available_services)
            .map((x) => ({ serviceId: str(x.id) ?? "", passengerId: str(x.passenger_id) ?? "", amount: num(x.total_amount) ?? -1, currency: str(x.total_currency) ?? "" }))
            .filter((x) => x.serviceId && x.passengerId && x.amount >= 0 && x.currency);
          const disclosures = Array.isArray(e.disclosures) ? e.disclosures.join(" ") : "";
          return { kind: "seat", seat: { designator, prices, extraLegroom: /leg ?room/i.test(disclosures) } } as const;
        }),
      );
      // A row of only exit markers flags the next row of seats.
      if (number) rows.push({ number, sections, exit });
      exitNext = !number && exit;
    }
    if (rows.length > 0) maps.push({ segmentId, label: `${segment.from} → ${segment.to} · ${segment.flight}`, aisles: num(cabin.aisles) ?? 1, rows });
  }
  return maps;
}

/** First readable message from a Duffel error answer. */
export function duffelErrorMessage(raw: unknown): string | null {
  const first = list(obj(raw).errors)[0];
  return first ? (str(first.message) ?? str(first.title)) : null;
}
