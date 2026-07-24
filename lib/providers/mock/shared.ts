/**
 * Shared helpers for mock provider adapters.
 * Single place for destination filtering and travel-style pricing logic.
 */

import { CATALOG_SEARCH_DESTINATION } from "@/lib/api/searchMappers";
import { mergeSearchResults } from "@/lib/api/searchMappers";
import { resolveDestinationIdFromLabel } from "@/lib/providers/destinations/mock/helpers";
import { MOCK_BUSES } from "@/lib/results/mockBuses";
import { MOCK_FLIGHTS } from "@/lib/results/mockFlights";
import { MOCK_HOTELS } from "@/lib/results/mockHotels";
import { MOCK_TRAINS } from "@/lib/results/mockTrains";
import type { Bus, Flight, Hotel, Train } from "@/types/models";
import type { SearchRequest, TravelStyle } from "@/types/models/search-request";
import type {
  BusResult,
  FlightResult,
  HotelResult,
  SearchResult,
  TrainResult,
} from "@/types/results";

/** Items returned per category when no destination-specific results exist. */
const FALLBACK_PER_CATEGORY = 2;

/** Optional artificial delay for testing loading states (0 = instant). */
export const MOCK_PROVIDER_DELAY_MS = 0;

export const ALL_MOCK_HOTEL_RESULTS = MOCK_HOTELS;
export const ALL_MOCK_FLIGHT_RESULTS = MOCK_FLIGHTS;
export const ALL_MOCK_BUS_RESULTS = MOCK_BUSES;
export const ALL_MOCK_TRAIN_RESULTS = MOCK_TRAINS;

export const ALL_MOCK_SEARCH_RESULTS: SearchResult[] = [
  ...MOCK_HOTELS,
  ...MOCK_FLIGHTS,
  ...MOCK_BUSES,
  ...MOCK_TRAINS,
];

/** Resolves a promise after MOCK_PROVIDER_DELAY_MS when configured. */
export function mockDelay<T>(value: T): Promise<T> {
  if (MOCK_PROVIDER_DELAY_MS === 0) {
    return Promise.resolve(value);
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_PROVIDER_DELAY_MS);
  });
}

export { mergeSearchResults, toSearchRequest } from "@/lib/api/searchMappers";

/** Adjusts prices based on budget / standard / luxury preference. */
export function applyTravelStyleMultiplier<T extends { price: number }>(
  items: T[],
  travelStyle: TravelStyle,
): T[] {
  const multiplier =
    travelStyle === "budget" ? 0.85 : travelStyle === "luxury" ? 1.25 : 1;

  if (multiplier === 1) {
    return items;
  }

  return items.map((item) => ({
    ...item,
    price: Math.round(item.price * multiplier),
  }));
}

/** Filters items by destination with a per-category fallback pool. */
export function filterByDestination<T extends { destinationId: string }>(
  items: T[],
  destinationLabel: string,
): T[] {
  if (destinationLabel === CATALOG_SEARCH_DESTINATION) {
    return items;
  }

  const destinationId = resolveDestinationIdFromLabel(destinationLabel);
  const matched = items.filter((item) => item.destinationId === destinationId);

  if (matched.length > 0) {
    return matched;
  }

  return items.slice(0, FALLBACK_PER_CATEGORY);
}

export function toHotel(result: HotelResult): Hotel {
  const { type, ...hotel } = result;
  void type;
  return hotel;
}

export function toFlight(result: FlightResult): Flight {
  const { type, ...flight } = result;
  void type;
  return flight;
}

export function toBus(result: BusResult): Bus {
  const { type, ...bus } = result;
  void type;
  return bus;
}

export function toTrain(result: TrainResult): Train {
  const { type, ...train } = result;
  void type;
  return train;
}

/** Shared mock hotel search logic (sync). */
export function searchMockHotels(request: SearchRequest): Hotel[] {
  const filtered = filterByDestination(ALL_MOCK_HOTEL_RESULTS, request.destination);
  const priced = applyTravelStyleMultiplier(
    filtered.map(toHotel),
    request.travelStyle,
  );
  return priced;
}

/** Shared mock flight search logic (sync). */
export function searchMockFlights(request: SearchRequest): Flight[] {
  const filtered = filterByDestination(ALL_MOCK_FLIGHT_RESULTS, request.destination);
  const priced = applyTravelStyleMultiplier(
    filtered.map(toFlight),
    request.travelStyle,
  );
  return priced;
}

/** Shared mock ground transport search logic (sync). */
export function searchMockTransport(request: SearchRequest): {
  buses: Bus[];
  trains: Train[];
} {
  const buses = applyTravelStyleMultiplier(
    filterByDestination(ALL_MOCK_BUS_RESULTS, request.destination).map(toBus),
    request.travelStyle,
  );
  const trains = applyTravelStyleMultiplier(
    filterByDestination(ALL_MOCK_TRAIN_RESULTS, request.destination).map(toTrain),
    request.travelStyle,
  );
  return { buses, trains };
}

/** Legacy combined mock search — used by sync helpers in lib/results. */
export function searchMockResults(
  destination: string,
  travelStyle: TravelStyle = "standard",
): SearchResult[] {
  const request: SearchRequest = {
    origin: "",
    destination,
    tripType: "round-trip",
    departureDate: new Date().toISOString().slice(0, 10),
    returnDate: null,
    budget: null,
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle,
  };

  const { buses, trains } = searchMockTransport(request);
  return mergeSearchResults(
    searchMockHotels(request),
    searchMockFlights(request),
    buses,
    trains,
  );
}
