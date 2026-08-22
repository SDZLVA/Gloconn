/**
 * Maps SerpAPI property-details JSON → vendor-neutral HotelPropertyDetails.
 * Pure — no HTTP. Applies URL allowlists; never copies tokens or SerpAPI links.
 */

import {
  validateGoogleMapsDirectionsUrl,
  validateHotelOfferUrl,
  validateHotelWebsiteUrl,
} from "@/lib/hotels/safeExternalUrls";
import type { SerpApiHotelPropertyDetailsResponse } from "@/lib/providers/hotels/serpapi/propertyDetailsTypes";
import {
  HOTEL_THIRD_PARTY_DISCLOSURE,
  type HotelOfferLink,
  type HotelPropertyDetails,
} from "@/types/models/hotel-property-details";

/** Max partner offers shown in the drawer. */
export const MAX_HOTEL_OFFER_LINKS = 2;

function sanitizeSourceLabel(source: string | undefined): string | undefined {
  const trimmed = source?.trim();
  if (!trimmed || trimmed.length > 80) {
    return undefined;
  }
  // Block anything that looks like a URL or token.
  if (/https?:|serpapi|property_token|gpref-/i.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

function collectOfferLinks(
  raw: SerpApiHotelPropertyDetailsResponse,
): HotelOfferLink[] {
  const pools = [
    ...(Array.isArray(raw.featured_prices) ? raw.featured_prices : []),
    ...(Array.isArray(raw.prices) ? raw.prices : []),
  ];

  const results: HotelOfferLink[] = [];
  const seenUrls = new Set<string>();

  for (const offer of pools) {
    if (results.length >= MAX_HOTEL_OFFER_LINKS) {
      break;
    }
    const url = validateHotelOfferUrl(offer?.link);
    if (!url || seenUrls.has(url)) {
      continue;
    }
    const source = sanitizeSourceLabel(offer?.source);
    seenUrls.add(url);
    results.push({
      url,
      source,
      label: source ? `View offer at ${source}` : "Check prices",
    });
  }

  return results;
}

/**
 * Maps a property-details response into a safe client payload.
 * Returns a minimal object with hotelId even when the body is sparse.
 */
export function mapPropertyDetailsResponse(
  hotelId: string,
  raw: SerpApiHotelPropertyDetailsResponse,
): HotelPropertyDetails {
  const id = hotelId.trim();
  const name = raw.name?.trim() || undefined;
  const address = raw.address?.trim() || undefined;
  const mapsUrl = validateGoogleMapsDirectionsUrl(raw.directions) ?? undefined;
  const websiteUrl = validateHotelWebsiteUrl(raw.link) ?? undefined;
  const offers = collectOfferLinks(raw);

  const details: HotelPropertyDetails = {
    hotelId: id,
  };

  if (name) {
    details.name = name;
  }
  if (address) {
    details.address = address;
  }
  if (mapsUrl) {
    details.mapsUrl = mapsUrl;
  }
  if (websiteUrl) {
    details.websiteUrl = websiteUrl;
  }
  if (offers.length > 0) {
    details.offers = offers;
    details.thirdPartyDisclosure = HOTEL_THIRD_PARTY_DISCLOSURE;
  }

  return details;
}
