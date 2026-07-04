/**
 * Destination domain types — shared between UI, services, and providers.
 */

export type Destination = {
  id: string;
  name: string;
  country: string;
  region: string;
  /** When true, shown in the Popular destinations section when the field is empty. */
  popular?: boolean;
};
