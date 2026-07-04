/**
 * Service layer — the only entry point UI should use for travel data.
 */

export {
  getDestinationById,
  getDestinationsByIds,
  getPopularDestinations,
  resolveDestinationId,
  searchDestinations,
} from "@/lib/services/destinationService";

export {
  getAllSearchResults,
  searchByDestination,
  searchTrips,
} from "@/lib/services/searchService";

export {
  getServiceProviders,
  resetServiceProviders,
  setServiceProviders,
} from "@/lib/services/context";

export type { ServiceProviders } from "@/lib/services/types";
