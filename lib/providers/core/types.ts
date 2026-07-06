/**
 * Provider interfaces — contracts for all travel data adapters.
 *
 * Each external API (Amadeus, Booking, Omio, Google Maps, etc.) implements
 * these interfaces and maps responses to Glooconn shared models in `types/models/`.
 *
 * UI and services import from `@/lib/providers` — never provider-specific types.
 */

import type { BaseProvider } from "@/lib/providers/core/base";
import type { Attraction } from "@/types/models/attraction";
import type { Bus } from "@/types/models/bus";
import type { Currency } from "@/types/models/currency";
import type { Destination } from "@/types/models/destination";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";
import type { Restaurant } from "@/types/models/restaurant";
import type { SearchRequest } from "@/types/models/search-request";
import type { Train } from "@/types/models/train";

/**
 * Destination lookup and autocomplete.
 * Used by the search form and future destinations browse page.
 */
export interface DestinationProvider extends BaseProvider {
  /**
   * Returns destinations matching a free-text query.
   * Empty query may return all or none — caller decides when to invoke.
   */
  searchDestinations(query: string): Promise<Destination[]>;

  /** Curated list for the autocomplete empty state. */
  getPopularDestinations(): Promise<Destination[]>;

  /** Looks up one destination by Glooconn canonical id. */
  getDestinationById(id: string): Promise<Destination | null>;

  /**
   * Maps a display label (e.g. "Paris, France") to a canonical destination id.
   * Used before hotel/flight/transport searches run.
   */
  resolveDestinationId(destinationLabel: string): Promise<string>;
}

/**
 * Supported currencies for budgets and price display.
 * Used by the budget slider and future payments features.
 */
export interface CurrencyProvider extends BaseProvider {
  /** Returns all currencies the user can select. */
  getCurrencies(): Promise<Currency[]>;
}

/**
 * Hotel and accommodation search for a trip.
 */
export interface HotelsProvider extends BaseProvider {
  /** Returns hotels matching the trip criteria. */
  search(request: SearchRequest): Promise<Hotel[]>;
}

/**
 * Flight search for a trip.
 */
export interface FlightsProvider extends BaseProvider {
  /** Returns flights matching the trip criteria. */
  search(request: SearchRequest): Promise<Flight[]>;
}

/** Combined bus and train results from a single ground-transport search. */
export type TransportSearchResult = {
  /** Coach and bus journeys. */
  buses: Bus[];

  /** Rail journeys. */
  trains: Train[];
};

/**
 * Ground transport (buses and trains) for a trip.
 * One adapter may cover both (e.g. Omio) or buses/trains may use separate internal clients.
 */
export interface TransportProvider extends BaseProvider {
  /** Returns bus and train options matching the trip criteria. */
  search(request: SearchRequest): Promise<TransportSearchResult>;
}

/**
 * Restaurant discovery at the trip destination.
 * Not used by the UI yet — ready for future discovery features.
 */
export interface RestaurantsProvider extends BaseProvider {
  /** Returns restaurants at or near the trip destination. */
  search(request: SearchRequest): Promise<Restaurant[]>;
}

/**
 * Attraction and POI discovery at the trip destination.
 * Not used by the UI yet — ready for future discovery features.
 */
export interface AttractionsProvider extends BaseProvider {
  /** Returns attractions at or near the trip destination. */
  search(request: SearchRequest): Promise<Attraction[]>;
}
