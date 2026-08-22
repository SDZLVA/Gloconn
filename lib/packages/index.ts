/**
 * Travel package composition — pure product-layer helpers.
 * Not wired into SearchOrchestrator in Sprint 13.2.
 */

export {
  MAX_FLIGHT_CANDIDATES,
  MAX_HOTEL_CANDIDATES,
  MAX_PACKAGES,
  PACKAGE_SCORE_WEIGHTS,
} from "@/lib/packages/constants";

export {
  buildPackageId,
  composePackages,
  type ComposePackagesOptions,
} from "@/lib/packages/composer";

export {
  computeNightsBetween,
  resolvePackageNights,
} from "@/lib/packages/nights";

export {
  budgetFitScore,
  buildPackageScoreContext,
  convenienceScore,
  flightQualityScore,
  hotelQualityScore,
  scorePackage,
  totalPriceScore,
  type PackageScoreContext,
  type PackageScoreInput,
} from "@/lib/packages/score";

export {
  assignPackageExplanations,
  getPackageExplanation,
  hasMeaningfulDurationAdvantage,
  hasMeaningfulPriceAdvantage,
  isHighlyRatedHotel,
  packageFitsBudget,
  BEST_HOTEL_MIN_STARS,
  FASTEST_MIN_DURATION_DELTA_MINUTES,
  HIGHLY_RATED_MIN_RATING,
  HIGHLY_RATED_MIN_STARS,
  LOWEST_PRICE_MIN_RELATIVE_DELTA,
  type AssignPackageExplanationsOptions,
  type PackageExplanation,
  type PackageRole,
} from "@/lib/packages/explanations";
