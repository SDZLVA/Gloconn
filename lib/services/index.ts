/**
 * Service layer — the only entry point UI should use for travel data.
 */

export {
  getDestinationById,
  getPopularDestinations,
  resolveDestinationId,
  searchDestinations,
} from "@/lib/services/destinationService";

export {
  getAllSearchResults,
  searchByDestination,
  searchTrips,
} from "@/lib/services/searchService";
