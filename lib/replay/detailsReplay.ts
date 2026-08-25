/**
 * Replay hotel details lookup (Sprint 17.6).
 *
 * After unseal, serves fixture details by hotelId — never SerpAPI.
 */

import "server-only";

import { createNotFoundError } from "@/lib/api/errors";
import {
  HOTEL_REPLAY_SNAPSHOT_NOTICE,
  type HotelPropertyDetails,
} from "@/types/models/hotel-property-details";
import {
  findReplayDetailsDirForHotel,
  loadReplayDetailsForHotel,
} from "@/lib/replay/load";

/**
 * Loads captured hotel details for a replay-sealed hotel.
 * Returns null when no fixture exists (caller should not fall back to SerpAPI).
 */
export function getReplayHotelPropertyDetails(
  hotelId: string,
): HotelPropertyDetails | null {
  const dir = findReplayDetailsDirForHotel(hotelId);
  if (!dir) {
    return null;
  }

  const details = loadReplayDetailsForHotel(dir, hotelId);
  if (!details) {
    return null;
  }

  return {
    ...details,
    hotelId,
    snapshotNotice:
      details.snapshotNotice?.trim() || HOTEL_REPLAY_SNAPSHOT_NOTICE,
  };
}

export function requireReplayHotelPropertyDetails(
  hotelId: string,
): HotelPropertyDetails {
  const details = getReplayHotelPropertyDetails(hotelId);
  if (!details) {
    throw createNotFoundError(
      "Hotel details are unavailable for this replay result.",
    );
  }
  return details;
}
