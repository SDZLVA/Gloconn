/**
 * Raw SerpAPI Google Hotels response shapes.
 *
 * Internal to the SerpAPI hotels adapter — never import from UI, services,
 * or shared domain models. Only fields needed for Hotel mapping are typed.
 *
 * Field names match SerpAPI JSON (snake_case) as documented at:
 * https://serpapi.com/google-hotels-api
 */

/** GPS coordinates on a property (vendor-only — not on shared Hotel). */
export type SerpApiHotelGpsCoordinates = {
  latitude?: number;
  longitude?: number;
};

/** Nightly or stay rate block from Google Hotels. */
export type SerpApiHotelRate = {
  lowest?: string;
  extracted_lowest?: number;
};

/**
 * One priced property from `properties[]`.
 * Maps conceptually to a Glooconn `Hotel`.
 */
export type SerpApiHotelProperty = {
  type?: string;
  name?: string;
  description?: string;
  property_token?: string;

  overall_rating?: number;
  reviews?: number;

  /** Star class — sometimes a number, sometimes a label like "5-star hotel". */
  hotel_class?: number | string;
  extracted_hotel_class?: number;

  amenities?: string[];

  /** Display price string (often on ads; properties prefer total_rate). */
  price?: string;
  extracted_price?: number;

  rate_per_night?: SerpApiHotelRate;
  total_rate?: SerpApiHotelRate;

  gps_coordinates?: SerpApiHotelGpsCoordinates;
  thumbnail?: string;

  nearby_places?: Array<{ name?: string }>;
};

/**
 * Echo of request parameters useful for mapping (especially currency / dates).
 */
export type SerpApiHotelsSearchParameters = {
  engine?: string;
  q?: string;
  currency?: string;
  check_in_date?: string;
  check_out_date?: string;
  adults?: number | string;
  children?: number | string;
  gl?: string;
  hl?: string;
};

/** Lightweight search metadata from SerpAPI (status only — no secrets). */
export type SerpApiHotelsSearchMetadata = {
  status?: string;
  id?: string;
};

/**
 * Successful (or empty) Google Hotels JSON body from SerpAPI.
 * Arrays are optional so incomplete payloads can be handled safely.
 */
export type SerpApiGoogleHotelsResponse = {
  search_metadata?: SerpApiHotelsSearchMetadata;
  search_parameters?: SerpApiHotelsSearchParameters;
  properties?: SerpApiHotelProperty[];
  /** Sponsored results — ignored by the mapper. */
  ads?: SerpApiHotelProperty[];
  error?: string;
};
