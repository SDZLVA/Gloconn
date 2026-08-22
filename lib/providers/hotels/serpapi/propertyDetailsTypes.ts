/**
 * Raw SerpAPI Google Hotels property-details shapes (vendor-only).
 * Never import from UI — map to HotelPropertyDetails before leaving the server.
 */

import type { SerpApiHotelGpsCoordinates } from "@/lib/providers/hotels/serpapi/types";

export type SerpApiHotelPriceOffer = {
  source?: string;
  link?: string;
  logo?: string;
};

/**
 * Property-details payload when `property_token` is set on google_hotels.
 * Field names match SerpAPI JSON (snake_case).
 */
export type SerpApiHotelPropertyDetailsResponse = {
  type?: string;
  name?: string;
  description?: string;
  link?: string;
  property_token?: string;
  address?: string;
  directions?: string;
  phone?: string;
  gps_coordinates?: SerpApiHotelGpsCoordinates;
  images?: Array<{
    thumbnail?: string;
    original_image?: string;
  }>;
  featured_prices?: SerpApiHotelPriceOffer[];
  prices?: SerpApiHotelPriceOffer[];
  error?: string;
};
