/**
 * Milestone 29 — live hotels via Stay22 (free; Booking.com, Expedia,
 * Hotels.com, Vrbo … prices on one map). Separate, removable engine like
 * features/liveFlights: delete this folder and the panel, and the Hotels
 * page falls back to its "coming soon" note.
 *
 * Docs: https://dev.stay22.com/docs/maps/parameters
 * The affiliate id is public (it is in every embed URL), not a secret.
 */

import type { SearchRequest } from "@/types/models/search-request";

export const DEFAULT_STAY22_AID = "glooconn";

/** Glooconn brand colours, hex without "#". */
const COLORS = {
  maincolor: "1d4ed8",
  hotelscolor: "1d4ed8",
  hotelsfontcolor: "ffffff",
  loadingbarcolor: "1d4ed8",
  bordercolor: "e2e8f0",
  fontcolor: "0f172a",
  fontcolorsub: "475569",
};

/** The Stay22 map URL for a hotels search, or null without destination + dates. */
export function stay22MapUrl(
  search: Partial<SearchRequest>,
  aid: string = process.env.NEXT_PUBLIC_STAY22_AID || DEFAULT_STAY22_AID,
): string | null {
  const destination = search.destination?.trim();
  if (!aid || !destination || !search.departureDate || !search.returnDate) return null;
  const params = new URLSearchParams({
    aid,
    address: destination,
    checkin: search.departureDate,
    checkout: search.returnDate,
    adults: String(Math.max(1, search.travelers?.adults ?? 1)),
    children: String(Math.max(0, search.travelers?.children ?? 0)),
    rooms: String(Math.max(1, search.travelers?.rooms ?? 1)),
    zoom: "12",
    viewmode: "all",
    ljs: "en",
    campaign: "glooconn_hotels",
    ...COLORS,
  });
  const budget = search.budget?.amount;
  if (search.budget?.currency) params.set("currency", search.budget.currency);
  if (budget && budget > 0) {
    // Glooconn's hotel budget is for the whole stay.
    params.set("max", String(budget));
    params.set("priceper", "total");
  }
  return `https://www.stay22.com/embed/gm?${params.toString()}`;
}
