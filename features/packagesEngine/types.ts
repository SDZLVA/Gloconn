/**
 * Milestone 40 — packages engine contract. An engine turns one trip search
 * into flights, hotels and ready-made packages. Engines are swappable
 * (PACKAGES_ENGINE), so a new source can replace Travelpayouts + LiteAPI
 * without touching the results page.
 */

import type { Flight, Hotel, TravelPackage } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResponseWarning } from "@/types/models/search-response";

export type PackagesEngineContext = {
  /** ISO country of the visitor (hotel prices can depend on it). */
  guestNationality?: string;
};

export type PackagesEngineResult = {
  flights: Flight[];
  hotels: Hotel[];
  packages: TravelPackage[];
  warnings: SearchResponseWarning[];
};

export type PackagesEngine = {
  /** Value of PACKAGES_ENGINE that selects this engine. */
  id: string;
  search: (request: SearchRequest, context?: PackagesEngineContext) => Promise<PackagesEngineResult>;
};
