/**
 * Sprint 16.4 — deterministic package explainability.
 * Sprint 16.5.1 — honesty gates for Best hotel / highly rated / Fastest / Lowest price.
 *
 * Assigns at most one evidence-based role per package among a visible set
 * (typically the UI top 5 after diversity). Pure: no AI, no model changes.
 */

import type { Budget } from "@/types/models/budget";
import type { Hotel } from "@/types/models/hotel";
import type { TravelPackage } from "@/types/models/travel-package";

/** Role labels shown on package cards. */
export type PackageRole =
  | "recommended"
  | "best_value"
  | "lowest_price"
  | "best_hotel"
  | "fastest"
  | "direct_flight"
  | "fits_budget";

export type PackageExplanation = {
  packageId: string;
  role: PackageRole;
  /** Short badge label (e.g. "Recommended"). */
  label: string;
  /** One-line evidence-based reason. Never includes raw score. */
  reason: string;
};

export type AssignPackageExplanationsOptions = {
  /** User budget for "Fits your budget". Currency mismatch → role skipped. */
  budget?: Budget | null;
  /** Visible window size (default 5). Roles assigned only within this window. */
  limit?: number;
};

/** Sprint 16.5.1 — Best hotel requires at least 3 stars. */
export const BEST_HOTEL_MIN_STARS = 3;

/** Sprint 16.5.1 — "highly rated" requires stars ≥ 3. */
export const HIGHLY_RATED_MIN_STARS = 3;

/** Sprint 16.5.1 — "highly rated" requires guest rating ≥ 4.5. */
export const HIGHLY_RATED_MIN_RATING = 4.5;

/** Sprint 16.5.1 — Fastest requires ≥ 45 minutes advantage vs next duration. */
export const FASTEST_MIN_DURATION_DELTA_MINUTES = 45;

/**
 * Sprint 16.5.1 — Lowest price requires ≥ 5% relative advantage vs next price.
 * Relative to the next relevant (2nd-cheapest) price:
 * `(nextPrice - lowestPrice) / nextPrice >= 0.05`.
 */
export const LOWEST_PRICE_MIN_RELATIVE_DELTA = 0.05;

const ROLE_LABELS: Record<PackageRole, string> = {
  recommended: "Recommended",
  best_value: "Best value",
  lowest_price: "Lowest price",
  best_hotel: "Best hotel",
  fastest: "Fastest",
  direct_flight: "Direct flight",
  fits_budget: "Fits your budget",
};

/**
 * Assignment priority (highest first).
 * Each package receives at most one role; each role is assigned at most once.
 *
 * 1. Recommended — highest score
 * 2. Lowest price — lowest totalPrice when ≥5% cheaper than next
 * 3. Best hotel — highest stars then guest rating (stars ≥ 3 required)
 * 4. Best value — highest score/price among remaining (distinctive from Recommended)
 * 5. Fastest — shortest flight when ≥45 minutes faster than next
 * 6. Direct flight — stops === 0, only when not all packages are direct
 * 7. Fits your budget — in-budget, only when not all packages fit
 */
const ROLE_PRIORITY: PackageRole[] = [
  "recommended",
  "lowest_price",
  "best_hotel",
  "best_value",
  "fastest",
  "direct_flight",
  "fits_budget",
];

/**
 * Assigns roles/reasons for the first `limit` packages.
 * Output is keyed by package id. Packages outside the window are omitted.
 */
export function assignPackageExplanations(
  packages: readonly TravelPackage[],
  options: AssignPackageExplanationsOptions = {},
): Map<string, PackageExplanation> {
  const limit = options.limit ?? 5;
  const visible = packages.slice(0, Math.max(0, limit));
  const result = new Map<string, PackageExplanation>();

  if (visible.length === 0) {
    return result;
  }

  const winners = resolveRoleWinners(visible, options.budget ?? null);
  const claimedPackages = new Set<string>();

  for (const role of ROLE_PRIORITY) {
    const winnerId = winners.get(role);
    if (!winnerId || claimedPackages.has(winnerId)) {
      continue;
    }

    const pkg = visible.find((p) => p.id === winnerId);
    if (!pkg) {
      continue;
    }

    claimedPackages.add(winnerId);
    result.set(winnerId, {
      packageId: winnerId,
      role,
      label: ROLE_LABELS[role],
      reason: buildReason(role, pkg, options.budget ?? null),
    });
  }

  return result;
}

/** Returns the explanation for one package, or null if none. */
export function getPackageExplanation(
  packageId: string,
  explanations: ReadonlyMap<string, PackageExplanation>,
): PackageExplanation | null {
  return explanations.get(packageId) ?? null;
}

/** True when "highly rated" copy is honest (Sprint 16.5.1). */
export function isHighlyRatedHotel(
  hotel: Pick<Hotel, "stars" | "rating">,
): boolean {
  return (
    hotel.stars >= HIGHLY_RATED_MIN_STARS &&
    hotel.rating >= HIGHLY_RATED_MIN_RATING
  );
}

/** True when lowest price has a meaningful edge vs the next price. */
export function hasMeaningfulPriceAdvantage(
  lowestPrice: number,
  nextPrice: number,
): boolean {
  if (
    !Number.isFinite(lowestPrice) ||
    !Number.isFinite(nextPrice) ||
    nextPrice <= 0 ||
    lowestPrice < 0 ||
    lowestPrice >= nextPrice
  ) {
    return false;
  }
  return (
    (nextPrice - lowestPrice) / nextPrice >= LOWEST_PRICE_MIN_RELATIVE_DELTA
  );
}

/** True when fastest duration has a meaningful edge vs the next duration. */
export function hasMeaningfulDurationAdvantage(
  fastestMinutes: number,
  nextMinutes: number,
): boolean {
  if (
    !Number.isFinite(fastestMinutes) ||
    !Number.isFinite(nextMinutes) ||
    nextMinutes <= fastestMinutes
  ) {
    return false;
  }
  return nextMinutes - fastestMinutes >= FASTEST_MIN_DURATION_DELTA_MINUTES;
}

function resolveRoleWinners(
  visible: readonly TravelPackage[],
  budget: Budget | null,
): Map<PackageRole, string> {
  const winners = new Map<PackageRole, string>();

  const recommended = pickBest(visible, compareByScoreDesc);
  winners.set("recommended", recommended.id);

  if (visible.length >= 2) {
    const byPrice = [...visible].sort(compareByPriceAsc);
    const cheapest = byPrice[0]!;
    const nextPrice = byPrice[1]!;
    if (
      hasMeaningfulPriceAdvantage(cheapest.totalPrice, nextPrice.totalPrice)
    ) {
      winners.set("lowest_price", cheapest.id);
    }
  }

  const hotelCandidates = visible.filter(
    (p) => p.hotel.stars >= BEST_HOTEL_MIN_STARS,
  );
  if (hotelCandidates.length >= 1) {
    const bestHotel = pickBest(hotelCandidates, compareByHotelQualityDesc);
    winners.set("best_hotel", bestHotel.id);
  }

  if (visible.length >= 2) {
    const byValue = pickBest(visible, compareByValueDesc);
    if (byValue.id !== recommended.id) {
      winners.set("best_value", byValue.id);
    }
  }

  if (visible.length >= 2) {
    const byDuration = [...visible].sort(compareByDurationAsc);
    const fastest = byDuration[0]!;
    const nextDistinct = byDuration.find(
      (p) => p.flight.durationMinutes > fastest.flight.durationMinutes,
    );
    if (
      nextDistinct &&
      hasMeaningfulDurationAdvantage(
        fastest.flight.durationMinutes,
        nextDistinct.flight.durationMinutes,
      )
    ) {
      winners.set("fastest", fastest.id);
    }
  }

  const directs = visible.filter((p) => p.flight.stops === 0);
  if (directs.length > 0 && directs.length < visible.length) {
    const direct = pickBest(directs, compareByScoreDesc);
    winners.set("direct_flight", direct.id);
  }

  const inBudget = visible.filter((p) => packageFitsBudget(p, budget));
  if (inBudget.length > 0 && inBudget.length < visible.length) {
    const budgetPick = pickBest(inBudget, compareByScoreDesc);
    winners.set("fits_budget", budgetPick.id);
  }

  return winners;
}

function buildReason(
  role: PackageRole,
  pkg: TravelPackage,
  budget: Budget | null,
): string {
  switch (role) {
    case "recommended":
      return buildRecommendedReason(pkg, budget);
    case "lowest_price":
      return "Lowest estimated package price";
    case "best_hotel":
      return buildBestHotelReason(pkg);
    case "best_value":
      return "Best balance of quality and price";
    case "fastest":
      return "Shortest flight";
    case "direct_flight":
      return "Nonstop flight";
    case "fits_budget":
      return "Within your budget";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

function buildRecommendedReason(
  pkg: TravelPackage,
  budget: Budget | null,
): string {
  const parts: string[] = [];

  if (pkg.flight.stops === 0) {
    parts.push("Direct flight");
  } else if (pkg.flight.stops === 1) {
    parts.push("1-stop flight");
  }

  if (pkg.hotel.stars >= 1) {
    parts.push(`${pkg.hotel.stars}★ hotel`);
  }

  if (isHighlyRatedHotel(pkg.hotel)) {
    parts.push("highly rated");
  }

  if (parts.length === 0 && packageFitsBudget(pkg, budget)) {
    parts.push("Within your budget");
  }

  if (parts.length === 0) {
    return "Best overall combination";
  }

  return parts.slice(0, 3).join(" · ");
}

function buildBestHotelReason(pkg: TravelPackage): string {
  const stars = pkg.hotel.stars;
  if (isHighlyRatedHotel(pkg.hotel)) {
    return `${stars}★ hotel · highly rated`;
  }
  if (stars >= BEST_HOTEL_MIN_STARS) {
    return `${stars}★ hotel`;
  }
  // Should not be reached when Best hotel role is gated to stars ≥ 3.
  return `${stars}★ hotel`;
}

export function packageFitsBudget(
  pkg: TravelPackage,
  budget: Budget | null | undefined,
): boolean {
  if (!budget || !Number.isFinite(budget.amount) || budget.amount < 0) {
    return false;
  }
  if (pkg.currency !== budget.currency) {
    return false;
  }
  return Number.isFinite(pkg.totalPrice) && pkg.totalPrice <= budget.amount;
}

function pickBest(
  packages: readonly TravelPackage[],
  compare: (a: TravelPackage, b: TravelPackage) => number,
): TravelPackage {
  let best = packages[0]!;
  for (let i = 1; i < packages.length; i++) {
    const candidate = packages[i]!;
    if (compare(candidate, best) < 0) {
      best = candidate;
    }
  }
  return best;
}

/** Higher score first; then lower price; then id. */
function compareByScoreDesc(a: TravelPackage, b: TravelPackage): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
  return a.id.localeCompare(b.id);
}

function compareByPriceAsc(a: TravelPackage, b: TravelPackage): number {
  if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
  if (a.score !== b.score) return b.score - a.score;
  return a.id.localeCompare(b.id);
}

/** Stars desc → rating desc → price asc → id (aligned with Sprint 16.2). */
function compareByHotelQualityDesc(a: TravelPackage, b: TravelPackage): number {
  if (a.hotel.stars !== b.hotel.stars) return b.hotel.stars - a.hotel.stars;
  if (a.hotel.rating !== b.hotel.rating) return b.hotel.rating - a.hotel.rating;
  if (a.hotel.price !== b.hotel.price) return a.hotel.price - b.hotel.price;
  return a.id.localeCompare(b.id);
}

function compareByDurationAsc(a: TravelPackage, b: TravelPackage): number {
  if (a.flight.durationMinutes !== b.flight.durationMinutes) {
    return a.flight.durationMinutes - b.flight.durationMinutes;
  }
  if (a.score !== b.score) return b.score - a.score;
  return a.id.localeCompare(b.id);
}

/** Higher score per currency unit of price. */
function compareByValueDesc(a: TravelPackage, b: TravelPackage): number {
  const aValue = valueRatio(a);
  const bValue = valueRatio(b);
  if (aValue !== bValue) return bValue - aValue;
  return compareByScoreDesc(a, b);
}

function valueRatio(pkg: TravelPackage): number {
  if (!Number.isFinite(pkg.totalPrice) || pkg.totalPrice <= 0) {
    return 0;
  }
  return pkg.score / pkg.totalPrice;
}
