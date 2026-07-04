/**
 * Destination model — a place travelers can search for or browse.
 */

/**
 * A destination city or region in the Glooconn catalog.
 * IDs are Glooconn canonical strings (e.g. "paris") — not provider place IDs.
 */
export type Destination = {
  /** Glooconn canonical destination identifier. */
  id: string;

  /** Primary place name (e.g. "Paris"). */
  name: string;

  /** Country name in English (e.g. "France"). */
  country: string;

  /** Geographic region for grouping (e.g. "Europe", "Asia"). */
  region: string;

  /** Short marketing or travel description for browse cards. */
  description?: string;

  /** Public URL of a hero or thumbnail image. */
  imageUrl?: string;

  /**
   * When true, the destination appears in the "Popular destinations"
   * section of the autocomplete empty state.
   */
  popular?: boolean;

  /**
   * Primary airport IATA code (e.g. "CDG" for Paris).
   * Used by flight providers such as Amadeus.
   */
  iataCode?: string;
};
