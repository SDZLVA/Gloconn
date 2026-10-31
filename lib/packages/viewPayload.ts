/**
 * Milestone 33 — hand a package from the results page to its own page
 * (/packages/{id}). Packages are built per search and have no server-side
 * address, so the results page keeps the package for this browser tab in
 * sessionStorage; the package page reads it back.
 */

import type { FlightPartnerLink } from "@/lib/affiliate/flightPartnerLink";
import type { PackageExplanation } from "@/lib/packages/explanations";
import type { TravelPackage } from "@/types/models/travel-package";

export type PackageViewPayload = {
  package: TravelPackage;
  explanation: PackageExplanation | null;
  /** Partner buttons for this package's flights, worked out on the results page. */
  flightLinks: FlightPartnerLink[];
  /** The results page URL (path + query), for "Back to results" and the search details. */
  resultsUrl: string;
  originIata: string | null;
  destinationIata: string | null;
  tripType: "round-trip" | "one-way";
  savedAt: number;
};

const key = (id: string) => `glooconn:package:${id}`;
const MAX_AGE_MS = 6 * 60 * 60_000;

export function savePackageView(payload: PackageViewPayload): void {
  try {
    window.sessionStorage.setItem(key(payload.package.id), JSON.stringify(payload));
  } catch {
    /* storage full or blocked — the page will say the package expired */
  }
}

export function loadPackageView(id: string): PackageViewPayload | null {
  try {
    const raw = window.sessionStorage.getItem(key(id));
    if (!raw) return null;
    const payload = JSON.parse(raw) as PackageViewPayload;
    if (!payload?.package?.id || Date.now() - payload.savedAt > MAX_AGE_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
