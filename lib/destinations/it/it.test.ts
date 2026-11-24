import assert from "node:assert/strict";
import { test } from "node:test";
import { findDestination } from "@/lib/destinations/data";
import { IT_DESTINATIONS, findItDestination, italianFor } from "@/lib/destinations/it/content";
import { monthsPhraseIt, seoTitleIt } from "@/lib/destinations/it/ui";

test("italian pages: each one belongs to a real English destination and is complete", () => {
  const seen = new Set<string>();
  for (const it of IT_DESTINATIONS) {
    const en = findDestination(it.slug);
    assert.ok(en, `${it.slug} is not a destination`);
    assert.ok(!seen.has(it.itSlug), `duplicate itSlug ${it.itSlug}`);
    seen.add(it.itSlug);
    assert.match(it.itSlug, /^[a-z0-9-]+$/);
    assert.ok(it.description.length <= 160, `${it.slug} description too long`);
    assert.ok(seoTitleIt(it.name).length <= 49, `${it.slug} seo title`);
    assert.equal(it.intro.length, en.intro.length, `${it.slug} intro`);
    assert.equal(it.attractions.length, en.attractions.length, `${it.slug} attractions`);
    assert.ok(it.bestTime.length >= 1 && it.tips.length >= 4, `${it.slug} bestTime/tips`);
    assert.equal(it.faq.length, en.faq.length, `${it.slug} faq`);
    assert.ok(it.details.gettingAround.length >= 2, `${it.slug} getting around`);
    assert.ok(it.details.whereToStay.length >= 4, `${it.slug} where to stay`);
    assert.ok(it.details.costs.length >= 2, `${it.slug} costs`);
    assert.ok(it.details.extraFaq.length >= 2, `${it.slug} extra faq`);
    assert.match(it.checked, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("italian pages: no em or en dashes in the text", () => {
  for (const it of IT_DESTINATIONS) {
    const all = JSON.stringify(it);
    assert.ok(!/[—–]/.test(all), `${it.slug} has a dash`);
  }
});

test("italian pages: questions are unique inside a page", () => {
  for (const it of IT_DESTINATIONS) {
    const qs = [...it.faq, ...it.details.extraFaq].map((f) => f.q.toLowerCase());
    assert.equal(new Set(qs).size, qs.length, `${it.slug} duplicate question`);
  }
});

test("italian lookups and month phrase", () => {
  assert.equal(findItDestination("parigi")?.slug, "paris");
  assert.equal(italianFor("paris")?.itSlug, "parigi");
  assert.equal(findItDestination("nowhere"), null);
  assert.equal(monthsPhraseIt([4, 5, 6, 9, 10]), "da aprile a giugno e da settembre a ottobre");
  assert.equal(monthsPhraseIt([7]), "luglio");
});
