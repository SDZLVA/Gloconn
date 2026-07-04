/**
 * Multi-provider search orchestration — service-layer entry point.
 */

export {
  getAllTripSearchResults as getAllOrchestratedResults,
  orchestrateTripSearch as orchestrateSearch,
} from "@/lib/providers/orchestrate";
