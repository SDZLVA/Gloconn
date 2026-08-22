/**
 * Vendor-neutral hotel property details returned to the browser.
 * Sprint 17.3 — never includes provider tokens, SerpAPI URLs, or raw JSON.
 */

export type HotelOfferLink = {
  /** Display label, e.g. "View offer at Booking.com". */
  label: string;
  /** Validated HTTPS URL. */
  url: string;
  /** Partner / source name when known. */
  source?: string;
};

/**
 * Safe investigation payload for the hotel details drawer.
 * Complementary to shared Hotel — does not replace it.
 */
export type HotelPropertyDetails = {
  hotelId: string;
  /** Property name from details when present. */
  name?: string;
  /** Verified street/address when available. */
  address?: string;
  /**
   * Validated Google Maps URL (provider directions preferred,
   * otherwise omitted — UI falls back to coordinate Maps).
   */
  mapsUrl?: string;
  /** Validated hotel website URL. */
  websiteUrl?: string;
  /** Up to a few validated third-party offer links. */
  offers?: HotelOfferLink[];
  /**
   * Shown when offers are present — booking happens off-site.
   */
  thirdPartyDisclosure?: string;
};

export const HOTEL_THIRD_PARTY_DISCLOSURE =
  "Prices and booking are handled on third-party sites. Glooconn does not process payments.";
