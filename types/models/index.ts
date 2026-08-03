/**
 * Glooconn shared domain models.
 *
 * Provider-independent types used by the UI, services, and provider mappers.
 * Import from `@/types/models` or the `@/types` barrel.
 */

export type { CurrencyCode, Currency } from "@/types/models/currency";

export type { Budget } from "@/types/models/budget";

export type { Traveler } from "@/types/models/traveler";

export type { Destination } from "@/types/models/destination";

export type { Hotel } from "@/types/models/hotel";

export type { Flight } from "@/types/models/flight";

export type { TravelPackage } from "@/types/models/travel-package";

export type { Bus } from "@/types/models/bus";

export type { Train } from "@/types/models/train";

export type { Restaurant } from "@/types/models/restaurant";

export type { Attraction } from "@/types/models/attraction";

export type {
  SearchRequest,
  SearchProductType,
  TravelStyle,
  TripType,
} from "@/types/models/search-request";

export { DEFAULT_SEARCH_PRODUCT_TYPES } from "@/types/models/search-request";

export type {
  SearchResponse,
  SearchResponseDomain,
  SearchResponseWarning,
} from "@/types/models/search-response";
