import { test } from "node:test";
import assert from "node:assert/strict";
import { buildWorldIndex, isWorldPlaceId, searchWorld, worldPlaceToDestination } from "@/lib/places/world";

const idx = buildWorldIndex(
  [
    { code: "PAR", name: "Paris", country_code: "FR" },
    { code: "PRX", name: "Paris", country_code: "US" },
    { code: "CMB", name: "Colombo", country_code: "LK" },
    { code: "XXX", name: "Nowhere", country_code: "FR" },
  ],
  [
    { code: "CDG", name: "Charles de Gaulle Airport", city_code: "PAR", country_code: "FR", iata_type: "airport", flightable: true },
    { code: "ORY", name: "Orly Airport", city_code: "PAR", country_code: "FR", iata_type: "airport", flightable: true },
    { code: "PRX", name: "Cox Field", city_code: "PRX", country_code: "US", iata_type: "airport", flightable: true },
    { code: "CMB", name: "Bandaranaike International Airport", city_code: "CMB", country_code: "LK", iata_type: "airport", flightable: true },
    { code: "XPG", name: "Gare du Nord", city_code: "PAR", country_code: "FR", iata_type: "railway", flightable: false },
  ],
  [
    { code: "FR", name: "France" },
    { code: "US", name: "United States" },
    { code: "LK", name: "Sri Lanka" },
  ],
);

test("cities without airports are left out; railway stations too", () => {
  assert.equal(idx.byId.has("city-XXX"), false);
  assert.equal(idx.byId.has("airport-XPG"), false);
  assert.equal(idx.byId.get("city-CMB")?.label, "Colombo, Sri Lanka");
});

test("bigger hubs rank first; airports only when asked", () => {
  const cities = searchWorld(idx, "par", ["city"]);
  assert.equal(cities[0].id, "city-PAR");
  assert.ok(cities.every((p) => p.kind === "city"));
  const all = searchWorld(idx, "cdg", ["city", "airport"]);
  assert.equal(all[0].id, "airport-CDG");
  assert.equal(all[0].label, "Charles de Gaulle Airport (CDG), France");
});

test("world places become Glooconn destinations", () => {
  assert.equal(isWorldPlaceId("airport-LHR"), true);
  assert.equal(isWorldPlaceId("london"), false);
  const d = worldPlaceToDestination(idx.byId.get("airport-ORY")!);
  assert.deepEqual([d.iataCode, d.cityIataCode, d.country], ["ORY", "PAR", "France"]);
});
