/**
 * Sprint 16.4 — package explainability tests.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assignPackageExplanations,
  getPackageExplanation,
  hasMeaningfulDurationAdvantage,
  hasMeaningfulPriceAdvantage,
  isHighlyRatedHotel,
  packageFitsBudget,
} from "@/lib/packages/explanations";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";
import type { TravelPackage } from "@/types/models/travel-package";

function flight(overrides: Partial<Flight> = {}): Flight {
  return {
    id: "f1",
    destinationId: "paris",
    price: 200,
    currency: "EUR",
    rating: 0,
    airline: "Air France",
    departureTime: "08:00",
    arrivalTime: "10:00",
    durationMinutes: 120,
    stops: 0,
    cabin: "Economy",
    ...overrides,
  };
}

function hotel(overrides: Partial<Hotel> = {}): Hotel {
  return {
    id: "h1",
    destinationId: "paris",
    price: 400,
    currency: "EUR",
    rating: 4.2,
    name: "Hotel Paris",
    stars: 4,
    amenities: ["Wi-Fi"],
    nights: 7,
    location: "Center",
    ...overrides,
  };
}

function pkg(
  flightId: string,
  hotelId: string,
  score: number,
  overrides: {
    totalPrice?: number;
    flight?: Partial<Flight>;
    hotel?: Partial<Hotel>;
    currency?: "EUR" | "USD";
  } = {},
): TravelPackage {
  const f = flight({ id: flightId, airline: `Airline-${flightId}`, ...overrides.flight });
  const h = hotel({ id: hotelId, name: `Hotel-${hotelId}`, ...overrides.hotel });
  const totalPrice =
    overrides.totalPrice ?? f.price + h.price;
  return {
    id: `pkg-${flightId}-${hotelId}`,
    flight: f,
    hotel: h,
    flightId,
    hotelId,
    totalPrice,
    currency: overrides.currency ?? "EUR",
    nights: 7,
    score,
  };
}

describe("assignPackageExplanations", () => {
  it("assigns exactly one Recommended package", () => {
    const packages = [
      pkg("f1", "h1", 90, { totalPrice: 1000 }),
      pkg("f2", "h2", 85, { totalPrice: 900 }),
      pkg("f3", "h3", 80, { totalPrice: 800 }),
    ];

    const explanations = assignPackageExplanations(packages);
    const recommended = [...explanations.values()].filter(
      (e) => e.role === "recommended",
    );

    assert.equal(recommended.length, 1);
    assert.equal(recommended[0]!.packageId, "pkg-f1-h1");
    assert.equal(recommended[0]!.label, "Recommended");
    assert.doesNotMatch(recommended[0]!.reason, /\d+\.\d+/); // no raw score
    assert.doesNotMatch(recommended[0]!.reason, /Match\s+\d/);
  });

  it("assigns lowest-price role", () => {
    const packages = [
      pkg("f1", "h1", 90, { totalPrice: 1200 }),
      pkg("f2", "h2", 80, { totalPrice: 700 }),
      pkg("f3", "h3", 75, { totalPrice: 900 }),
    ];

    const explanations = assignPackageExplanations(packages);
    const lowest = [...explanations.values()].find(
      (e) => e.role === "lowest_price",
    );

    assert.ok(lowest);
    assert.equal(lowest.packageId, "pkg-f2-h2");
    assert.equal(lowest.label, "Lowest price");
    assert.match(lowest.reason, /Lowest estimated package price/i);
  });

  it("assigns best-hotel role using stars then rating", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        hotel: { stars: 3, rating: 4.0 },
        flight: { durationMinutes: 200, stops: 1 },
      }),
      pkg("f2", "h2", 80, {
        totalPrice: 1100,
        hotel: { stars: 5, rating: 4.8 },
        flight: { durationMinutes: 180, stops: 1 },
      }),
      pkg("f3", "h3", 70, {
        totalPrice: 900,
        hotel: { stars: 4, rating: 4.5 },
        flight: { durationMinutes: 160, stops: 1 },
      }),
    ];

    const explanations = assignPackageExplanations(packages);
    const bestHotel = [...explanations.values()].find(
      (e) => e.role === "best_hotel",
    );

    assert.ok(bestHotel);
    assert.equal(bestHotel.packageId, "pkg-f2-h2");
    assert.match(bestHotel.reason, /5★/);
  });

  it("assigns fastest role", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        flight: { durationMinutes: 300, stops: 1 },
        hotel: { stars: 3, rating: 3.5 },
      }),
      pkg("f2", "h2", 80, {
        totalPrice: 1100,
        flight: { durationMinutes: 90, stops: 1 },
        hotel: { stars: 3, rating: 3.6 },
      }),
      pkg("f3", "h3", 70, {
        totalPrice: 1200,
        flight: { durationMinutes: 200, stops: 1 },
        hotel: { stars: 3, rating: 3.7 },
      }),
    ];

    const explanations = assignPackageExplanations(packages);
    const fastest = [...explanations.values()].find(
      (e) => e.role === "fastest",
    );

    assert.ok(fastest);
    assert.equal(fastest.packageId, "pkg-f2-h2");
    assert.equal(fastest.reason, "Shortest flight");
  });

  it("assigns direct-flight role when not all packages are direct", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        flight: { stops: 1, durationMinutes: 200 },
        hotel: { stars: 4, rating: 4.0 },
      }),
      pkg("f2", "h2", 70, {
        totalPrice: 1100,
        flight: { stops: 0, durationMinutes: 250 },
        hotel: { stars: 2, rating: 3.0 },
      }),
      pkg("f3", "h3", 80, {
        totalPrice: 900,
        flight: { stops: 1, durationMinutes: 100 },
        hotel: { stars: 3, rating: 3.5 },
      }),
    ];

    const explanations = assignPackageExplanations(packages);
    const direct = [...explanations.values()].find(
      (e) => e.role === "direct_flight",
    );

    assert.ok(direct);
    assert.equal(direct.packageId, "pkg-f2-h2");
  });

  it("assigns fits-budget role when some packages exceed budget", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 2000,
        flight: { stops: 1, durationMinutes: 100 },
        hotel: { stars: 5, rating: 4.8 },
      }),
      pkg("f2", "h2", 70, {
        totalPrice: 500,
        flight: { stops: 1, durationMinutes: 200 },
        hotel: { stars: 2, rating: 3.0 },
      }),
      pkg("f3", "h3", 80, {
        totalPrice: 900,
        flight: { stops: 1, durationMinutes: 180 },
        hotel: { stars: 2, rating: 3.2 },
      }),
      pkg("f4", "h4", 75, {
        totalPrice: 1800,
        flight: { stops: 1, durationMinutes: 160 },
        hotel: { stars: 3, rating: 3.5 },
      }),
    ];

    const explanations = assignPackageExplanations(packages, {
      budget: { amount: 1000, currency: "EUR" },
    });

    const fits = [...explanations.values()].find(
      (e) => e.role === "fits_budget",
    );
    assert.ok(fits);
    assert.equal(fits.packageId, "pkg-f3-h3");
    assert.equal(fits.reason, "Within your budget");
  });

  it("skips role when evidence is insufficient (single package)", () => {
    const packages = [pkg("f1", "h1", 90, { totalPrice: 1000 })];
    const explanations = assignPackageExplanations(packages);

    assert.equal(explanations.size, 1);
    assert.equal(explanations.get("pkg-f1-h1")!.role, "recommended");
  });

  it("never assigns duplicate or conflicting roles on a single card", () => {
    const packages = [
      pkg("f1", "h1", 95, {
        totalPrice: 500,
        flight: { stops: 0, durationMinutes: 60 },
        hotel: { stars: 5, rating: 4.9 },
      }),
      pkg("f2", "h2", 70, {
        totalPrice: 800,
        flight: { stops: 1, durationMinutes: 200 },
        hotel: { stars: 2, rating: 3.0 },
      }),
      pkg("f3", "h3", 65, {
        totalPrice: 900,
        flight: { stops: 2, durationMinutes: 300 },
        hotel: { stars: 2, rating: 3.1 },
      }),
    ];

    const explanations = assignPackageExplanations(packages, {
      budget: { amount: 600, currency: "EUR" },
    });

    const rolesByPackage = new Map<string, string[]>();
    for (const e of explanations.values()) {
      const list = rolesByPackage.get(e.packageId) ?? [];
      list.push(e.role);
      rolesByPackage.set(e.packageId, list);
    }

    for (const roles of rolesByPackage.values()) {
      assert.equal(roles.length, 1);
    }

    const roleCounts = new Map<string, number>();
    for (const e of explanations.values()) {
      roleCounts.set(e.role, (roleCounts.get(e.role) ?? 0) + 1);
    }
    for (const count of roleCounts.values()) {
      assert.equal(count, 1);
    }

    // Dominant package keeps Recommended; secondary roles go elsewhere when possible.
    assert.equal(explanations.get("pkg-f1-h1")!.role, "recommended");
  });

  it("produces stable role assignment for identical inputs", () => {
    const packages = [
      pkg("f1", "h1", 90, { totalPrice: 1000, flight: { durationMinutes: 200, stops: 1 } }),
      pkg("f2", "h2", 85, { totalPrice: 700, flight: { durationMinutes: 100, stops: 0 } }),
      pkg("f3", "h3", 80, {
        totalPrice: 900,
        flight: { durationMinutes: 150, stops: 1 },
        hotel: { stars: 5, rating: 4.9 },
      }),
    ];

    const first = assignPackageExplanations(packages, {
      budget: { amount: 950, currency: "EUR" },
    });
    const second = assignPackageExplanations(packages, {
      budget: { amount: 950, currency: "EUR" },
    });

    assert.deepEqual(
      [...first.entries()].map(([id, e]) => [id, e.role, e.reason]),
      [...second.entries()].map(([id, e]) => [id, e.role, e.reason]),
    );
  });

  it("is unaffected by package order randomness", () => {
    const a = pkg("f1", "h1", 90, { totalPrice: 1000, flight: { durationMinutes: 200, stops: 1 } });
    const b = pkg("f2", "h2", 85, { totalPrice: 700, flight: { durationMinutes: 100, stops: 0 } });
    const c = pkg("f3", "h3", 80, {
      totalPrice: 900,
      flight: { durationMinutes: 150, stops: 1 },
      hotel: { stars: 5, rating: 4.9 },
    });

    const forward = assignPackageExplanations([a, b, c]);
    const shuffled = assignPackageExplanations([c, a, b]);

    assert.equal(
      getPackageExplanation("pkg-f1-h1", forward)?.role,
      getPackageExplanation("pkg-f1-h1", shuffled)?.role,
    );
    assert.equal(
      getPackageExplanation("pkg-f2-h2", forward)?.role,
      getPackageExplanation("pkg-f2-h2", shuffled)?.role,
    );
    assert.equal(
      getPackageExplanation("pkg-f3-h3", forward)?.role,
      getPackageExplanation("pkg-f3-h3", shuffled)?.role,
    );
  });

  it("currency mismatch prevents budget role", () => {
    const packages = [
      pkg("f1", "h1", 90, { totalPrice: 2000, currency: "EUR" }),
      pkg("f2", "h2", 80, { totalPrice: 500, currency: "EUR" }),
    ];

    const explanations = assignPackageExplanations(packages, {
      budget: { amount: 1000, currency: "USD" },
    });

    const fits = [...explanations.values()].find(
      (e) => e.role === "fits_budget",
    );
    assert.equal(fits, undefined);
    assert.equal(packageFitsBudget(packages[1]!, { amount: 1000, currency: "USD" }), false);
  });

  it("skips direct-flight role when all packages are direct", () => {
    const packages = [
      pkg("f1", "h1", 90, { totalPrice: 1000, flight: { stops: 0, durationMinutes: 120 } }),
      pkg("f2", "h2", 80, { totalPrice: 900, flight: { stops: 0, durationMinutes: 130 } }),
    ];

    const explanations = assignPackageExplanations(packages);
    assert.equal(
      [...explanations.values()].some((e) => e.role === "direct_flight"),
      false,
    );
  });

  it("skips fits-budget when all packages fit", () => {
    const packages = [
      pkg("f1", "h1", 90, { totalPrice: 800 }),
      pkg("f2", "h2", 80, { totalPrice: 700 }),
    ];

    const explanations = assignPackageExplanations(packages, {
      budget: { amount: 2000, currency: "EUR" },
    });

    assert.equal(
      [...explanations.values()].some((e) => e.role === "fits_budget"),
      false,
    );
  });

  it("does not invent best-hotel for unrated hotels only", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        hotel: { stars: 0, rating: 4.9 },
        flight: { stops: 1, durationMinutes: 200 },
      }),
      pkg("f2", "h2", 80, {
        totalPrice: 900,
        hotel: { stars: 0, rating: 4.8 },
        flight: { stops: 1, durationMinutes: 180 },
      }),
    ];

    const explanations = assignPackageExplanations(packages);
    assert.equal(
      [...explanations.values()].some((e) => e.role === "best_hotel"),
      false,
    );
  });

  it("limits roles to the visible window", () => {
    const packages = [
      pkg("f1", "h1", 90, { totalPrice: 1000 }),
      pkg("f2", "h2", 85, { totalPrice: 900 }),
      pkg("f3", "h3", 80, { totalPrice: 800 }),
      pkg("f4", "h4", 75, { totalPrice: 100 }),
      pkg("f5", "h5", 70, { totalPrice: 1100 }),
      pkg("f6", "h6", 60, { totalPrice: 50 }),
    ];

    const explanations = assignPackageExplanations(packages, { limit: 5 });
    assert.equal(explanations.has("pkg-f6-h6"), false);
    assert.ok(explanations.has("pkg-f1-h1"));
  });
});

describe("Sprint 16.5.1 honesty gates", () => {
  it("Best hotel: 2★ candidate → no role", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        hotel: { stars: 2, rating: 4.9 },
        flight: { stops: 1, durationMinutes: 200 },
      }),
      pkg("f2", "h2", 80, {
        totalPrice: 900,
        hotel: { stars: 2, rating: 4.8 },
        flight: { stops: 1, durationMinutes: 180 },
      }),
    ];

    const explanations = assignPackageExplanations(packages);
    assert.equal(
      [...explanations.values()].some((e) => e.role === "best_hotel"),
      false,
    );
  });

  it("Best hotel: 3★ candidate → eligible", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        hotel: { stars: 2, rating: 4.9 },
        flight: { stops: 1, durationMinutes: 200 },
      }),
      pkg("f2", "h2", 80, {
        totalPrice: 1100,
        hotel: { stars: 3, rating: 4.0 },
        flight: { stops: 1, durationMinutes: 180 },
      }),
    ];

    const explanations = assignPackageExplanations(packages);
    const bestHotel = [...explanations.values()].find(
      (e) => e.role === "best_hotel",
    );
    assert.ok(bestHotel);
    assert.equal(bestHotel.packageId, "pkg-f2-h2");
    assert.doesNotMatch(bestHotel.reason, /highly rated/i);
  });

  it('Highly rated: 2★ + 5.0 → no "highly rated"', () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        hotel: { stars: 2, rating: 5.0 },
        flight: { stops: 0, durationMinutes: 120 },
      }),
    ];

    const explanations = assignPackageExplanations(packages);
    const recommended = explanations.get("pkg-f1-h1")!;
    assert.equal(recommended.role, "recommended");
    assert.doesNotMatch(recommended.reason, /highly rated/i);
    assert.match(recommended.reason, /2★ hotel/);
  });

  it("Highly rated: 3★ + 4.5 → eligible", () => {
    assert.equal(isHighlyRatedHotel({ stars: 3, rating: 4.5 }), true);

    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        hotel: { stars: 3, rating: 4.5 },
        flight: { stops: 0, durationMinutes: 120 },
      }),
    ];
    const reason = assignPackageExplanations(packages).get("pkg-f1-h1")!.reason;
    assert.match(reason, /highly rated/i);
  });

  it("Highly rated: 3★ + 4.4 → not eligible", () => {
    assert.equal(isHighlyRatedHotel({ stars: 3, rating: 4.4 }), false);

    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        hotel: { stars: 3, rating: 4.4 },
        flight: { stops: 0, durationMinutes: 120 },
      }),
    ];
    const reason = assignPackageExplanations(packages).get("pkg-f1-h1")!.reason;
    assert.doesNotMatch(reason, /highly rated/i);
    assert.match(reason, /3★ hotel/);
  });

  it("Fastest: 30-minute advantage → no role", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        flight: { durationMinutes: 200, stops: 1 },
        hotel: { stars: 3, rating: 3.5 },
      }),
      pkg("f2", "h2", 80, {
        totalPrice: 1100,
        flight: { durationMinutes: 170, stops: 1 },
        hotel: { stars: 3, rating: 3.6 },
      }),
    ];

    const explanations = assignPackageExplanations(packages);
    assert.equal(
      [...explanations.values()].some((e) => e.role === "fastest"),
      false,
    );
  });

  it("Fastest: 44-minute advantage → no role", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        flight: { durationMinutes: 200, stops: 1 },
        hotel: { stars: 3, rating: 3.5 },
      }),
      pkg("f2", "h2", 80, {
        totalPrice: 1100,
        flight: { durationMinutes: 156, stops: 1 },
        hotel: { stars: 3, rating: 3.6 },
      }),
    ];

    assert.equal(hasMeaningfulDurationAdvantage(156, 200), false);
    const explanations = assignPackageExplanations(packages);
    assert.equal(
      [...explanations.values()].some((e) => e.role === "fastest"),
      false,
    );
  });

  it("Fastest: 45-minute advantage → eligible", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        flight: { durationMinutes: 200, stops: 1 },
        hotel: { stars: 5, rating: 4.8 },
      }),
      pkg("f2", "h2", 80, {
        totalPrice: 1100,
        flight: { durationMinutes: 155, stops: 1 },
        hotel: { stars: 3, rating: 3.6 },
      }),
    ];

    assert.equal(hasMeaningfulDurationAdvantage(155, 200), true);
    const explanations = assignPackageExplanations(packages);
    const fastest = [...explanations.values()].find((e) => e.role === "fastest");
    assert.ok(fastest);
    assert.equal(fastest.packageId, "pkg-f2-h2");
  });

  it("Lowest price: 4% difference → no role", () => {
    // (1000 - 960) / 1000 = 4%
    assert.equal(hasMeaningfulPriceAdvantage(960, 1000), false);

    const packages = [
      pkg("f1", "h1", 90, { totalPrice: 1000 }),
      pkg("f2", "h2", 80, { totalPrice: 960 }),
    ];
    const explanations = assignPackageExplanations(packages);
    assert.equal(
      [...explanations.values()].some((e) => e.role === "lowest_price"),
      false,
    );
  });

  it("Lowest price: exactly 5% → eligible", () => {
    // (1000 - 950) / 1000 = 5%
    assert.equal(hasMeaningfulPriceAdvantage(950, 1000), true);

    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        flight: { durationMinutes: 200, stops: 1 },
        hotel: { stars: 3, rating: 3.5 },
      }),
      pkg("f2", "h2", 80, {
        totalPrice: 950,
        flight: { durationMinutes: 200, stops: 1 },
        hotel: { stars: 3, rating: 3.6 },
      }),
    ];
    const explanations = assignPackageExplanations(packages);
    const lowest = [...explanations.values()].find(
      (e) => e.role === "lowest_price",
    );
    assert.ok(lowest);
    assert.equal(lowest.packageId, "pkg-f2-h2");
  });

  it("Lowest price: >5% → eligible", () => {
    assert.equal(hasMeaningfulPriceAdvantage(900, 1000), true);

    const packages = [
      pkg("f1", "h1", 90, { totalPrice: 1000 }),
      pkg("f2", "h2", 80, { totalPrice: 900 }),
    ];
    const explanations = assignPackageExplanations(packages);
    assert.ok(
      [...explanations.values()].some((e) => e.role === "lowest_price"),
    );
  });

  it("keeps exactly one Recommended after honesty gates", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1000,
        hotel: { stars: 2, rating: 5.0 },
        flight: { durationMinutes: 120, stops: 0 },
      }),
      pkg("f2", "h2", 85, {
        totalPrice: 990,
        hotel: { stars: 2, rating: 4.0 },
        flight: { durationMinutes: 100, stops: 0 },
      }),
      pkg("f3", "h3", 80, {
        totalPrice: 980,
        hotel: { stars: 2, rating: 3.0 },
        flight: { durationMinutes: 90, stops: 0 },
      }),
    ];

    const explanations = assignPackageExplanations(packages);
    const recommended = [...explanations.values()].filter(
      (e) => e.role === "recommended",
    );
    assert.equal(recommended.length, 1);
    assert.equal(recommended[0]!.packageId, "pkg-f1-h1");
    // Trivial price/duration gaps and sub-3★ hotels → no secondary roles forced
    assert.equal(
      [...explanations.values()].some((e) => e.role === "best_hotel"),
      false,
    );
    assert.equal(
      [...explanations.values()].some((e) => e.role === "fastest"),
      false,
    );
    assert.equal(
      [...explanations.values()].some((e) => e.role === "lowest_price"),
      false,
    );
  });

  it("remains deterministic with honesty gates", () => {
    const packages = [
      pkg("f1", "h1", 90, {
        totalPrice: 1200,
        flight: { durationMinutes: 300, stops: 1 },
        hotel: { stars: 4, rating: 4.6 },
      }),
      pkg("f2", "h2", 80, {
        totalPrice: 900,
        flight: { durationMinutes: 200, stops: 0 },
        hotel: { stars: 3, rating: 4.0 },
      }),
      pkg("f3", "h3", 70, {
        totalPrice: 1000,
        flight: { durationMinutes: 250, stops: 1 },
        hotel: { stars: 5, rating: 4.8 },
      }),
    ];

    const a = assignPackageExplanations(packages);
    const b = assignPackageExplanations(packages);
    assert.deepEqual(
      [...a.entries()].map(([id, e]) => [id, e.role, e.reason]),
      [...b.entries()].map(([id, e]) => [id, e.role, e.reason]),
    );
  });

  it("currency safety unchanged for budget role", () => {
    const packages = [
      pkg("f1", "h1", 90, { totalPrice: 2000, currency: "EUR" }),
      pkg("f2", "h2", 80, { totalPrice: 500, currency: "EUR" }),
    ];
    const explanations = assignPackageExplanations(packages, {
      budget: { amount: 1000, currency: "USD" },
    });
    assert.equal(
      [...explanations.values()].some((e) => e.role === "fits_budget"),
      false,
    );
  });
});
