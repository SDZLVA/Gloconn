/**
 * Milestone 58 — kind of stay (hotel, hostel, apartment…) and distance from
 * the city centre, shared by the Hotels tab and Packages. Pure: safe in the
 * browser and on the server.
 */

import type { PropertyKind } from "@/types/models/hotel";

export type { PropertyKind };

export const PROPERTY_KINDS: { kind: PropertyKind; label: string }[] = [
  { kind: "hotel", label: "Hotels" },
  { kind: "hostel", label: "Hostels" },
  { kind: "apartment", label: "Apartments & homes" },
  { kind: "guesthouse", label: "Guesthouses & B&Bs" },
  { kind: "other", label: "Other stays" },
];

/** Booking.com "Hostels", Agoda "Entire apartment", "Guesthouse / Bed and Breakfast"… → one kind. */
export function propertyKindOf(text: string | null | undefined): PropertyKind {
  const t = (text ?? "").toLowerCase();
  if (!t.trim()) return "other";
  if (/hostel|capsule/.test(t)) return "hostel";
  if (/guest|b&b|bed and breakfast|\binns?\b|homestay|pension|lodge|ryokan|riad/.test(t)) return "guesthouse";
  if (/apart|flat|home|house|villa|condo|holiday|chalet|cottage|bungalow|residence|studio/.test(t)) return "apartment";
  if (/hotel|resort|motel/.test(t)) return "hotel";
  return "other";
}

/** Straight-line distance in km between two points (haversine). */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** "350 m from centre", "2.1 km from centre", "14 km from centre"; null when unknown. */
export function distanceLabel(km: number | null | undefined): string | null {
  if (typeof km !== "number" || !Number.isFinite(km) || km < 0 || km > 300) return null;
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m from centre`;
  if (km < 10) return `${(Math.round(km * 10) / 10).toFixed(1)} km from centre`;
  return `${Math.round(km)} km from centre`;
}
