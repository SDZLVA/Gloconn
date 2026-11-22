import assert from "node:assert/strict";
import { test } from "node:test";
import { DESTINATIONS } from "@/lib/destinations/data";
import { DETAILS, destinationDetails } from "@/lib/destinations/details";

test("details: every entry belongs to a real destination and is complete", () => {
  const slugs = new Set(DESTINATIONS.map((d) => d.slug));
  for (const [slug, det] of Object.entries(DETAILS)) {
    assert.ok(slugs.has(slug), `${slug} is not a destination`);
    assert.ok(det.gettingAround.length >= 2, `${slug} getting around`);
    assert.ok(det.whereToStay.length >= 4, `${slug} where to stay`);
    assert.ok(det.whereToStay.every((a) => a.area.length > 2 && a.text.length > 20), `${slug} stay text`);
    assert.ok(det.costs.length >= 2, `${slug} costs`);
    assert.ok(det.extraFaq.length >= 2, `${slug} extra faq`);
    assert.match(det.checked, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("details: extra questions do not repeat the main FAQ", () => {
  for (const d of DESTINATIONS) {
    const det = destinationDetails(d.slug);
    if (!det) continue;
    const main = new Set(d.faq.map((f) => f.q.toLowerCase()));
    for (const f of det.extraFaq) assert.ok(!main.has(f.q.toLowerCase()), `${d.slug}: duplicate question ${f.q}`);
  }
});

test("destinationDetails: unknown slug gives null", () => {
  assert.equal(destinationDetails("nowhere"), null);
  assert.ok(destinationDetails("paris"));
});
