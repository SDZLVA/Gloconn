/**
 * Duffel branch — extras chosen on the booking page (extra bags, seats).
 * Browser and server use the same rules; the server re-checks everything
 * against the airline's current offer and seat map before booking.
 */

import type { OfferSummary, SeatMap } from "@/features/duffel/map";

export type ServicePick = { id: string; quantity: number };

export type PricedExtras =
  | { ok: true; services: ServicePick[]; extras: number; total: number; lines: { label: string; amount: number }[] }
  | { ok: false; message: string };

const round = (n: number) => Math.round(n * 100) / 100;

/** Seat service id → where it is and who it is for. */
export function seatIndex(maps: SeatMap[]): Map<string, { segmentId: string; designator: string; passengerId: string; amount: number; currency: string; label: string }> {
  const index = new Map<string, { segmentId: string; designator: string; passengerId: string; amount: number; currency: string; label: string }>();
  for (const map of maps)
    for (const row of map.rows)
      for (const section of row.sections)
        for (const el of section)
          if (el.kind === "seat")
            for (const p of el.seat.prices) index.set(p.serviceId, { segmentId: map.segmentId, designator: el.seat.designator, passengerId: p.passengerId, amount: p.amount, currency: p.currency, label: map.label });
  return index;
}

/** Checks the picks and returns the price to pay (offer + extras), all in the offer's currency. */
export function priceExtras(picks: ServicePick[], offer: Pick<OfferSummary, "total" | "currency" | "bags">, maps: SeatMap[]): PricedExtras {
  const merged = new Map<string, number>();
  for (const p of picks.slice(0, 60)) {
    if (!p || typeof p.id !== "string" || !Number.isInteger(p.quantity) || p.quantity < 0) return { ok: false, message: "Invalid extras." };
    if (p.quantity > 0) merged.set(p.id, (merged.get(p.id) ?? 0) + p.quantity);
  }
  const seats = seatIndex(maps);
  const seatTaken = new Set<string>();
  const seatPerPassenger = new Set<string>();
  const lines: { label: string; amount: number }[] = [];
  const services: ServicePick[] = [];
  let extras = 0;
  for (const [id, quantity] of merged) {
    const bag = offer.bags.find((b) => b.id === id);
    if (bag) {
      if (quantity > bag.maxQuantity) return { ok: false, message: "Too many bags for one traveller." };
      if (bag.currency !== offer.currency) return { ok: false, message: "This extra can't be added online." };
      extras += bag.amount * quantity;
      lines.push({ label: `${quantity} × ${bag.kind === "checked" ? "checked bag" : "cabin bag"}${bag.maxWeightKg ? ` (${bag.maxWeightKg} kg)` : ""} · ${bag.covers}`, amount: round(bag.amount * quantity) });
      services.push({ id, quantity });
      continue;
    }
    const seat = seats.get(id);
    if (seat) {
      if (quantity !== 1) return { ok: false, message: "A seat can only be booked once." };
      if (seat.currency !== offer.currency) return { ok: false, message: "This seat can't be added online." };
      const place = `${seat.segmentId}:${seat.designator}`;
      const who = `${seat.segmentId}:${seat.passengerId}`;
      if (seatTaken.has(place)) return { ok: false, message: `Seat ${seat.designator} was picked twice.` };
      if (seatPerPassenger.has(who)) return { ok: false, message: "Each traveller can have one seat per flight." };
      seatTaken.add(place);
      seatPerPassenger.add(who);
      extras += seat.amount;
      lines.push({ label: `Seat ${seat.designator} · ${seat.label}`, amount: round(seat.amount) });
      services.push({ id, quantity: 1 });
      continue;
    }
    return { ok: false, message: "An extra is no longer available. Please choose again." };
  }
  return { ok: true, services, extras: round(extras), total: round(offer.total + extras), lines };
}
