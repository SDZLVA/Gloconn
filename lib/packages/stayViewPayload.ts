/**
 * Milestone 40b — hand a hotel-led package from the results page to its own
 * page (/packages/stay/{id}), like viewPayload.ts does for flight + hotel
 * packages. Kept in sessionStorage for this tab.
 */

import type { LiveFlightsSearch } from "@/features/liveFlights/types";
import type { StayPackage } from "@/types/models/stay-package";

export type StayViewPayload = {
  stay: StayPackage;
  /** The live White Label search for the same trip; null if the route is unknown. */
  flights: LiveFlightsSearch | null;
  resultsUrl: string;
  savedAt: number;
};

const key = (id: string) => `glooconn:stay:${id}`;
const MAX_AGE_MS = 6 * 60 * 60_000;

export function saveStayView(payload: StayViewPayload): void {
  try {
    window.sessionStorage.setItem(key(payload.stay.id), JSON.stringify(payload));
  } catch {
    /* storage blocked — the page will say the package expired */
  }
}

export function loadStayView(id: string): StayViewPayload | null {
  try {
    const raw = window.sessionStorage.getItem(key(id));
    if (!raw) return null;
    const payload = JSON.parse(raw) as StayViewPayload;
    if (!payload?.stay?.id || Date.now() - payload.savedAt > MAX_AGE_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
