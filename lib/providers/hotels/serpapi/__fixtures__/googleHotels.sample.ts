/**
 * Checked-in SerpAPI Google Hotels fixtures for structural tests.
 *
 * Source: SerpAPI Google Hotels API documentation examples
 * (https://serpapi.com/google-hotels-api), simplified to fields Glooconn needs.
 * No API keys or personal data.
 */

import type {
  SerpApiGoogleHotelsResponse,
  SerpApiHotelProperty,
} from "@/lib/providers/hotels/serpapi/types";

/** Hotel property with total_rate, stars, amenities, nearby place. */
export const ritzCarltonBaliProperty: SerpApiHotelProperty = {
  type: "hotel",
  name: "The Ritz-Carlton, Bali",
  description:
    "Zen-like quarters, some with butler service, in an upscale property offering refined dining & a spa.",
  property_token: "ChkIv_HyiNKHpf6yARoML2cvMXozdGJnZ3BzEAE",
  gps_coordinates: {
    latitude: -8.8306709,
    longitude: 115.2153312,
  },
  rate_per_night: {
    lowest: "$332",
    extracted_lowest: 332,
  },
  total_rate: {
    lowest: "$332",
    extracted_lowest: 332,
  },
  nearby_places: [
    {
      name: "I Gusti Ngurah Rai International Airport",
    },
    {
      name: "Nusa By/Suka - Nusa Dua",
    },
  ],
  hotel_class: "5-star hotel",
  extracted_hotel_class: 5,
  overall_rating: 4.6,
  reviews: 4272,
  amenities: ["Pool", "Spa", "Free Wi-Fi", "Restaurant"],
};

/** Property missing price — mapper should drop. */
export const propertyMissingPrice: SerpApiHotelProperty = {
  type: "hotel",
  name: "Unpriced Resort",
  property_token: "token-no-price",
  overall_rating: 4.0,
  hotel_class: 3,
  amenities: ["Pool"],
};

/** Property with numeric hotel_class only and extracted_price fallback. */
export const midRangeWithExtractedPrice: SerpApiHotelProperty = {
  type: "hotel",
  name: "Puri Mangga Sea View Resort & Spa",
  property_token: "CgoI98f037uZvrIsEAE",
  hotel_class: 4,
  overall_rating: 4.6,
  extracted_price: 44,
  amenities: ["Hot tub", "Spa", "Pool"],
};

/**
 * Realistic successful search response shape based on SerpAPI docs.
 */
export const successfulGoogleHotelsResponse: SerpApiGoogleHotelsResponse = {
  search_metadata: {
    status: "Success",
    id: "fixture-serpapi-google-hotels-001",
  },
  search_parameters: {
    engine: "google_hotels",
    q: "Bali Resorts",
    currency: "EUR",
    check_in_date: "2026-04-08",
    check_out_date: "2026-04-10",
    adults: 2,
    children: 0,
  },
  properties: [ritzCarltonBaliProperty, midRangeWithExtractedPrice],
  ads: [
    {
      name: "Sponsored Beach Bungalows",
      property_token: "ad-token-ignored",
      extracted_price: 70,
      overall_rating: 4.8,
      amenities: ["Beach access"],
    },
  ],
};

/** Empty successful response. */
export const emptyGoogleHotelsResponse: SerpApiGoogleHotelsResponse = {
  search_metadata: {
    status: "Success",
    id: "fixture-serpapi-google-hotels-empty",
  },
  search_parameters: {
    engine: "google_hotels",
    q: "Nowhere",
    currency: "EUR",
    check_in_date: "2026-04-08",
    check_out_date: "2026-04-09",
  },
  properties: [],
};

/** Response with incomplete properties that should be dropped. */
export const incompletePropertiesResponse: SerpApiGoogleHotelsResponse = {
  search_metadata: {
    status: "Success",
    id: "fixture-serpapi-google-hotels-incomplete",
  },
  search_parameters: {
    engine: "google_hotels",
    q: "Bali",
    currency: "USD",
    check_in_date: "2026-04-08",
    check_out_date: "2026-04-09",
  },
  properties: [
    propertyMissingPrice,
    {
      // nameless — drop
      property_token: "no-name",
      extracted_price: 50,
    },
    ritzCarltonBaliProperty,
  ],
};
