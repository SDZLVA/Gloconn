import { test } from "node:test";
import assert from "node:assert/strict";
import { FLIGHT_ROUTES, LISTED_ROUTES, UNPRICED_ROUTE_SLUGS, findRoute, relatedRoutes, routeSearchUrl } from "@/lib/routes/catalog";

test("route slugs are unique and readable", () => {
  const slugs = FLIGHT_ROUTES.map((r) => r.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(slugs.includes("milan-to-colombo"));
  for (const s of slugs) assert.match(s, /^[a-z-]+-to-[a-z-]+$/);
  assert.equal(findRoute("nowhere-to-x"), null);
});

test("related routes start with the way back", () => {
  const route = findRoute("milan-to-colombo")!;
  const related = relatedRoutes(route);
  assert.equal(related[0].slug, "colombo-to-milan");
  assert.ok(related.every((r) => r.slug !== route.slug));
});

test("routeSearchUrl builds the results link", () => {
  const route = findRoute("milan-to-colombo")!;
  const url = routeSearchUrl(route, { departureDate: "2026-12-10", returnDate: "2026-12-30" }, "flights");
  const q = new URL(url, "https://glooconn.com").searchParams;
  assert.equal(q.get("origin"), "Milan, Italy");
  assert.equal(q.get("originId"), "city-MIL");
  assert.equal(q.get("destinationId"), "city-CMB");
  assert.equal(q.get("tripType"), "round-trip");
  assert.equal(q.get("productTypes"), "flights");
  const hotels = new URL(routeSearchUrl(route, { departureDate: "2026-12-10", returnDate: "2026-12-30" }, "hotels"), "https://x").searchParams;
  assert.equal(hotels.get("origin"), null);
  assert.equal(hotels.get("destination"), "Colombo, Sri Lanka");
});

test("listed routes exclude the unpriced ones, and every unpriced slug is a real route", () => {
  assert.ok(UNPRICED_ROUTE_SLUGS.size > 0);
  for (const s of UNPRICED_ROUTE_SLUGS) assert.ok(findRoute(s), `unknown slug ${s}`);
  assert.equal(LISTED_ROUTES.length, FLIGHT_ROUTES.length - UNPRICED_ROUTE_SLUGS.size);
  assert.ok(LISTED_ROUTES.every((r) => !UNPRICED_ROUTE_SLUGS.has(r.slug)));
});
