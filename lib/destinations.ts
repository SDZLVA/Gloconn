/**
 * Destination helpers — backward-compatible re-exports.
 * New code should import services from `@/lib/services` and types from `@/types/destination`.
 */

export type { Destination } from "@/types/destination";

export { MOCK_DESTINATIONS } from "@/lib/providers/destinations/mock/data";

export {
  destinationToAutocompleteOption,
  filterDestinations,
  findDestinationById,
  findDestinationByLabel,
  formatDestinationLabel,
  getPopularDestinationsList as getPopularDestinations,
  resolveDestinationIdFromLabel as resolveDestinationId,
} from "@/lib/providers/destinations/mock/helpers";
