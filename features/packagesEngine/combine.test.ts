import { test } from "node:test";
import assert from "node:assert/strict";
import { combinePackages, hotelQuality } from "@/features/packagesEngine/combine";
import type { Flight, Hotel } from "@/types/models";

const flight = (id: string, price: number, stops = 0, durationMinutes = 120): Flight =>
  ({
    id,
    destinationId: "par",
    price,
    currency: "EUR",
    rating: 0,
    airline: `Air ${id}`,
    departureTime: `2026-12-10T0${id.length}:00`,
    arrivalTime: "2026-12-10T10:00",
    durationMinutes,
    stops,
    cabin: "Economy",
  }) as Flight;

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

test("totals are for the whole group: flight × travelers + hotel stay", () => {
  const [pkg] = combinePackages([flight("f1", 100)], [hotel("h1", 300, 4, 3)], { ...base, budget: null });
  assert.equal(pkg.totalPrice, 500);
  assert.deepEqual(pkg.breakdown, { flightPerPerson: 100, flightTotal: 200, hotelTotal: 300, travelers: 2, rooms: 1 });
});

test("with a budget every package fits it", () => {
  const flights = [flight("f1", 100), flight("f22", 250)];
  const hotels = [hotel("h1", 200, 3, 2), hotel("h2", 450, 4.6, 4), hotel("h3", 900, 4.8, 5)];
  const packages = combinePackages(flights, hotels, { ...base, budget: 700 });
  assert.ok(packages.length > 0);
  for (const pkg of packages) assert.ok(pkg.totalPrice <= 700, `${pkg.totalPrice} over budget`);
  // The better hotel that still fits beats the cheapest one.
  assert.equal(packages[0].hotel.id, "h2");
});

test("no package fits: cheapest few, marked over budget", () => {
  const packages = combinePackages([flight("f1", 300)], [hotel("h1", 500, 4, 3), hotel("h2", 400, 3, 3)], { ...base, budget: 100 });
  assert.ok(packages.length > 0);
  assert.ok(packages.every((pkg) => pkg.overBudget));
  assert.equal(packages[0].hotel.id, "h2");
});

test("no budget: recommended mix, not the same hotel over and over", () => {
  const flights = ["a", "bb", "ccc", "dddd"].map((id, i) => flight(id, 100 + i * 10));
  const packages = combinePackages(flights, [hotel("h1", 300, 4.5, 4), hotel("h2", 320, 4.4, 4)], { ...base, budget: null });
  const perHotel = new Map<string, number>();
  for (const pkg of packages) perHotel.set(pkg.hotel.id, (perHotel.get(pkg.hotel.id) ?? 0) + 1);
  assert.ok([...perHotel.values()].every((n) => n <= 2));
});

test("hotelQuality reads 0–5 scores", () => {
  assert.ok(hotelQuality(hotel("a", 1, 4.5, 5)) > hotelQuality(hotel("b", 1, 3, 2)));
});

test("one saved fare still pairs with many hotels (milestone 47)", () => {
  const hotels = Array.from({ length: 12 }, (_, i) => hotel(`h${i}`, 200 + i * 20, 4, 3));
  const packages = combinePackages([flight("f1", 90)], hotels, { ...base, budget: null });
  assert.equal(packages.length, 12);
});
