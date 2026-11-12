/**
 * Milestone 30 — live hotels engine types (LiteAPI). Engine-neutral, so
 * another hotel source can replace LiteAPI behind the same shape.
 */

import type { PropertyKind } from "@/types/models/hotel";

export type LiveHotel = {
  id: string;
  name: string;
  photo: string | null;
  address: string | null;
  /** Hotel class, 0–5 (0 = unknown). */
  stars: number;
  /** Guest score 0–10, null = no reviews. */
  rating: number | null;
  reviewCount: number | null;
  latitude: number | null;
  longitude: number | null;
  /** Cheapest offer for the whole stay (all rooms, all nights). */
  totalPrice: number;
  currency: string;
  roomName: string | null;
  boardName: string | null;
  refundable: boolean;
  offerId: string | null;
  /** Milestone 44: the hotel on another site (Booking.com engine); opened in a new tab. */
  externalUrl?: string | null;
  /** Milestone 58: hotel, hostel, apartment… */
  propertyType?: PropertyKind;
  /** Milestone 58: distance from the city centre (km). */
  distanceKm?: number | null;
};

export type LiveHotelsSearch = {
  destination: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  rooms: number;
  currency: string;
};

export type LiveHotelsResponse =
  | { ok: true; hotels: LiveHotel[]; nights: number; currency: string; location: string }
  | { ok: false; code: "NOT_CONFIGURED" | "BAD_REQUEST" | "UNKNOWN_PLACE" | "PROVIDER_ERROR" | "RATE_LIMITED"; message: string };

export type LiveHotelsFilters = {
  /** Max price per night; null = any. */
  maxPerNight: number | null;
  /** Star classes to keep; empty = any. */
  stars: number[];
  /** Minimum guest score (0–10); 0 = any. */
  minRating: number;
  refundableOnly: boolean;
  /** Milestone 58: kinds of stay to keep; empty = any. */
  types: PropertyKind[];
  sort: "recommended" | "price" | "rating" | "stars" | "distance";
};

export const DEFAULT_HOTEL_FILTERS: LiveHotelsFilters = {
  maxPerNight: null,
  stars: [],
  minRating: 0,
  refundableOnly: false,
  types: [],
  sort: "recommended",
};
