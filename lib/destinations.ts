/**
 * Destination helpers — backward-compatible re-exports.
 *
 * @deprecated New code should use:
 * - `@/lib/services` for data fetching
 * - `@/types/destination` for types
 * - `destinationToAutocompleteOption` below for UI formatting only
 */

export type { Destination } from "@/types/destination";

export { MOCK_DESTINATIONS } from "@/lib/providers/destinations/mock/data";

export {
  destinationToAutocompleteOption,
  filterDestinations,
  findDestinationById,
  findDestinationByLabel,
  formatDestinationLabel,
  getDestinationsByIds,
  getPopularDestinationsList,
  resolveDestinationIdFromLabel as resolveDestinationId,
} from "@/lib/providers/destinations/mock/helpers";

export {
  getPopularDestinations,
  POPULAR_DESTINATIONS_HEADING,
} from "@/lib/destinations/popularDestinations";
