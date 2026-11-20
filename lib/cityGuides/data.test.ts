import assert from "node:assert/strict";
import { test } from "node:test";
import { CITY_GUIDES, findGuide } from "@/lib/cityGuides/data";
import { ROUTE_CITIES } from "@/lib/routes/catalog";

test("guides: unique slugs, real cities, no self-destination, content present", () => {
  assert.equal(new Set(CITY_GUIDES.map((g) => g.slug)).size, CITY_GUIDES.length);
  for (const g of CITY_GUIDES) {
    assert.ok(ROUTE_CITIES[g.cityCode], g.slug);
    assert.ok(g.destinations.length >= 5, g.slug);
    assert.ok(g.destinations.every((d) => d !== g.cityCode && ROUTE_CITIES[d]), g.slug);
    assert.ok(g.sections.length >= 2 && g.faq.length >= 3 && g.tips.length >= 4, g.slug);
    assert.match(g.checked, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(g.description.length <= 160, `${g.slug} description too long (${g.description.length})`);
  }
  assert.equal(findGuide("nowhere"), null);
});
