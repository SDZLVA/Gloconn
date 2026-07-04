/**
 * Provider registry — selects which implementation to use at runtime.
 */

export { getDestinationProvider } from "@/lib/providers/destinations";
export { getSearchProvider } from "@/lib/providers/search";
export type { DestinationProvider, SearchProvider } from "@/lib/providers/types";
