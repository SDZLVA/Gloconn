import { test } from "node:test";
import assert from "node:assert/strict";
import { buildStayPackages, flightReserve } from "@/features/packagesEngine/stays";
import type { Hotel } from "@/types/models";

const hotel = (id: string, price: number, rating: number, stars: number): Hotel => ({
  id,
  destinationId: "par",
  price,
  currency: "EUR",
  rating,
  name: `Hotel ${id}`,
  stars,
  amenities: [],
  nights: 3,
  location: "Paris",
});

const base = { travelers: 2, rooms: 1, nights: 3 };

test("sets aside the flight estimate (+15%) or 40% of the budget", () => {
  assert.equal(flightReserve(1000, 200), 230);
  assert.equal(flightReserve(1000, null), 400);
});

test("with a budget, every hotel leaves room for flights", () => {
  const hotels = [hotel("a", 300, 3.5, 3), hotel("b", 700, 4.6, 4), hotel("c", 900, 4.8, 5)];
  const stays = buildStayPackages(hotels, { ...base, budget: 1000, flightEstimate: 200 });
  assert.deepEqual(stays.map((s) => s.hotel.id).sort(), ["a", "b"]);
  const b = stays.find((s) => s.hotel.id === "b")!;
  assert.equal(b.flightBudget, 300);
  assert.equal(stays[0].label, "Best match");
});

test("nothing fits: cheapest hotels, marked over budget", () => {
  const stays = buildStayPackages([hotel("a", 500, 4, 3), hotel("b", 400, 3, 3)], { ...base, budget: 300, flightEstimate: 200 });
  assert.ok(stays.every((s) => s.overBudget));
  assert.equal(stays[0].hotel.id, "b");
});

test("no budget: no flight limit", () => {
  const stays = buildStayPackages([hotel("a", 500, 4, 3)], { ...base, budget: null, flightEstimate: null });
  assert.equal(stays[0].flightBudget, null);
});
