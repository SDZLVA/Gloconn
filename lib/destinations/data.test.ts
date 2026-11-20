import assert from "node:assert/strict";
import { test } from "node:test";
import { PHOTOS } from "@/lib/blog/photos";
import { DESTINATIONS, findDestination, hotDestinations } from "@/lib/destinations/data";
import { ROUTE_CITIES } from "@/lib/routes/catalog";

test("destinations: unique slugs, real cities and photos, content present", () => {
  assert.equal(new Set(DESTINATIONS.map((d) => d.slug)).size, DESTINATIONS.length);
  for (const d of DESTINATIONS) {
    assert.ok(ROUTE_CITIES[d.cityCode], d.slug);
    assert.ok(PHOTOS[d.photo], d.slug);
    assert.ok(d.attractions.length >= 5 && d.faq.length >= 3 && d.tips.length >= 4 && d.bestTime.length >= 1, d.slug);
    assert.ok(d.bestMonths.length > 0 && d.bestMonths.every((m) => m >= 1 && m <= 12), d.slug);
    assert.ok(d.description.length <= 160, `${d.slug} description too long (${d.description.length})`);
    assert.match(d.checked, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(findDestination("nowhere"), null);
});

test("hotDestinations: in-season first, always `count` items", () => {
  const nov = hotDestinations(11, 4);
  assert.equal(nov.length, 4);
  assert.ok(nov.slice(0, 3).every((d) => d.bestMonths.includes(11)));
  for (let m = 1; m <= 12; m++) assert.equal(hotDestinations(m, 4).length, 4);
});
