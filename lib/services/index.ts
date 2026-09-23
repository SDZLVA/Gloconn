/**
 * Service layer — the only entry point UI should use for travel data.
 */

export {
  getCurrencies,
} from "@/lib/services/currencyService";

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
  DATE_OPTIONS_CONCURRENCY,
  DATE_OPTIONS_TIME_BUDGET_MS,
  findCheapestPackage,
  packageTotalFitsBudget,
  searchDateOptions,
  type DateOptionResult,
  type DateOptionStatus,
  type SearchDateOptionsParams,
  type SearchDateOptionsResult,
} from "@/lib/services/dateOptionsService";

export {
  getServiceProviders,
  resetServiceProviders,
  setServiceProviders,
} from "@/lib/services/context";

export type { ServiceProviders } from "@/lib/services/types";
