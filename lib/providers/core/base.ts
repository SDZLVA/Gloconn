/**
 * Base provider contract shared by all travel data adapters.
 */

/** Identifies which adapter implementation is active (e.g. "mock", "amadeus"). */
export interface BaseProvider {
  /** Short provider identifier used for logging — never shown in the UI. */
  readonly name: string;
}
