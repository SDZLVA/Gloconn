import { test } from "node:test";
import assert from "node:assert/strict";
import { mapLiteApiRates } from "@/features/liveHotels/liteapi/map";
import { placeFromLabel } from "@/features/liveHotels/liteapi/location";
import { buildOccupancies } from "@/features/liveHotels/liteapi/client";
import { filterHotels, nightsBetween } from "@/features/liveHotels/filters";
import { DEFAULT_HOTEL_FILTERS } from "@/features/liveHotels/types";

test("placeFromLabel turns a Glooconn label into city + country code", () => {
  assert.deepEqual(placeFromLabel("London, United Kingdom"), { cityName: "London", countryCode: "GB" });
  assert.deepEqual(placeFromLabel("Kandana, Sri Lanka"), { cityName: "Kandana", countryCode: "LK" });
  assert.deepEqual(placeFromLabel("Cancún, Mexico"), { cityName: "Cancún", countryCode: "MX" });
  assert.equal(placeFromLabel("Atlantis"), null);
});

test("buildOccupancies spreads guests over rooms", () => {
  assert.deepEqual(buildOccupancies(3, 0, 2), [
    { adults: 2, children: [] },
    { adults: 1, children: [] },
  ]);
  assert.deepEqual(buildOccupancies(2, 1, 1), [{ adults: 2, children: [8] }]);
});

test("mapLiteApiRates keeps the cheapest offer and joins hotel data", () => {
  const hotels = mapLiteApiRates(
    {
      data: [
        {
          hotelId: "lp1",
          roomTypes: [
            { offerId: "b", offerRetailRate: { amount: 900, currency: "EUR" }, rates: [{ name: "Double", cancellationPolicies: { refundableTag: "NRFN" } }] },
            { offerId: "a", offerRetailRate: { amount: 700, currency: "EUR" }, rates: [{ name: "Twin", boardName: "Breakfast", cancellationPolicies: { refundableTag: "RFN" } }] },
          ],
        },
        { hotelId: "lp2", roomTypes: [{ rates: [{ retailRate: { total: [{ amount: 300, currency: "EUR" }] } }] }] },
        { hotelId: "lp3", roomTypes: [] },
      ],
      hotels: [{ id: "lp1", name: "Serene Inn", main_photo: "https://x/y.jpg", stars: 3, rating: 9.2, latitude: 51.5, longitude: -0.1, address: "1 Road" }],
    },
    "EUR",
  );
  assert.equal(hotels.length, 2);
  assert.equal(hotels[0].name, "Serene Inn");
  assert.equal(hotels[0].totalPrice, 700);
  assert.equal(hotels[0].offerId, "a");
  assert.equal(hotels[0].refundable, true);
  assert.equal(hotels[0].boardName, "Breakfast");
  assert.equal(hotels[0].stars, 3);
  assert.equal(hotels[1].totalPrice, 300);
  assert.equal(hotels[1].name, "Hotel");
});

test("filterHotels applies budget per night, stars, rating and sort", () => {
  const base = mapLiteApiRates({ data: [], hotels: [] }, "EUR");
  assert.deepEqual(base, []);
  const make = (id: string, totalPrice: number, stars: number, rating: number | null) => ({
    id, name: id, photo: null, address: null, stars, rating, reviewCount: null, latitude: null, longitude: null,
    totalPrice, currency: "EUR", roomName: null, boardName: null, refundable: id === "b", offerId: null,
  });
  const list = [make("a", 800, 4, 8.5), make("b", 400, 3, 9.1), make("c", 1600, 5, 7)];
  const nights = nightsBetween("2026-12-03", "2026-12-11");
  assert.equal(nights, 8);
  assert.deepEqual(filterHotels(list, { ...DEFAULT_HOTEL_FILTERS, maxPerNight: 100 }, nights).map((h) => h.id), ["a", "b"]);
  assert.deepEqual(filterHotels(list, { ...DEFAULT_HOTEL_FILTERS, stars: [5] }, nights).map((h) => h.id), ["c"]);
  assert.deepEqual(filterHotels(list, { ...DEFAULT_HOTEL_FILTERS, minRating: 9 }, nights).map((h) => h.id), ["b"]);
  assert.deepEqual(filterHotels(list, { ...DEFAULT_HOTEL_FILTERS, sort: "price" }, nights).map((h) => h.id), ["b", "a", "c"]);
  assert.deepEqual(filterHotels(list, { ...DEFAULT_HOTEL_FILTERS, refundableOnly: true }, nights).map((h) => h.id), ["b"]);
});

test("whitelabelOccupancies is base64 of the rooms array", async () => {
  const { whitelabelOccupancies } = await import("@/features/liveHotels/occupancies");
  const decoded = JSON.parse(Buffer.from(whitelabelOccupancies(3, 0, 2), "base64").toString("utf8"));
  assert.deepEqual(decoded, [
    { adults: 2, children: [] },
    { adults: 1, children: [] },
  ]);
});
