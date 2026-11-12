/**
 * Milestone 40 — packages engine contract. An engine turns one trip search
 * into flights, hotels and ready-made packages. Engines are swappable
 * (PACKAGES_ENGINE), so a new source can replace Travelpayouts + LiteAPI
 * without touching the results page.
 */

import type { Flight, Hotel, TravelPackage } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";
import type { StayPackage } from "@/types/models/stay-package";
import type { SearchResponseWarning } from "@/types/models/search-response";

export type PackagesEngineContext = {
  /** ISO country of the visitor (hotel prices can depend on it). */
  guestNationality?: string;
  /** Milestone 49: hashed visitor id — limits paid live-flight lookups per visitor. */
  visitor?: string;
  /**
   * Milestone 57: quick first answer — free/fast sources only (saved fares,
   * Booking.com). The page then asks again without it for the full answer.
   */
  quick?: boolean;
};

export type PackagesEngineResult = {
  flights: Flight[];
  hotels: Hotel[];
  packages: TravelPackage[];
  /** Milestone 40b: hotel-led packages (flights are the live White Label results). */
  stayPackages?: StayPackage[];
  warnings: SearchResponseWarning[];
  /** Milestone 57: a quick answer that a full search can still improve. */
  partial?: boolean;
};

export type PackagesEngine = {
  /** Value of PACKAGES_ENGINE that selects this engine. */
  id: string;
  search: (request: SearchRequest, context?: PackagesEngineContext) => Promise<PackagesEngineResult>;
};
