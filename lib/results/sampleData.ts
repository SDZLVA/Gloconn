/**
 * Wording for results built from sample (mock) data (Milestone 19).
 *
 * When live flights sit next to sample hotels, a package such as
 * "easyJet €117 + Montmartre Inn €95 = €212" reads as entirely real.
 * Every sample item is therefore labelled, and so is every package that
 * contains one. One helper keeps the wording identical everywhere.
 */

export const SAMPLE_HOTEL_NOTE = "Example hotel — real hotel prices coming soon.";
export const SAMPLE_FLIGHT_NOTE = "Example flight — sample data, not a real fare.";

/**
 * Note for a package, naming which part is sample data, or null when the
 * package is fully real.
 */
export function samplePackageNote(
  flightIsSample: boolean | undefined,
  hotelIsSample: boolean | undefined,
): string | null {
  if (flightIsSample && hotelIsSample) {
    return "Example flight and hotel — sample data, not real prices.";
  }
  if (hotelIsSample) {
    return "Includes an example hotel price — real hotel prices coming soon.";
  }
  if (flightIsSample) {
    return "Includes an example flight price — not a real fare.";
  }
  return null;
}
