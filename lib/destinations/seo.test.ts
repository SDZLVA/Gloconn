import assert from "node:assert/strict";
import { test } from "node:test";
import { DESTINATIONS, findDestination } from "@/lib/destinations/data";
import { destinationJsonLd, itemListJsonLd, monthCells, monthsPhrase, postsAbout, relatedDestinations, seoTitle } from "@/lib/destinations/seo";

test("seoTitle: every destination gets a title that fits in a search result", () => {
  for (const d of DESTINATIONS) {
    const t = seoTitle(d);
    assert.ok(t.length <= 49, `${d.slug}: ${t.length}`);
    assert.ok(t.startsWith(d.name), d.slug);
  }
  assert.equal(seoTitle({ name: "Marrakech" }), "Marrakech travel guide: best time and flights");
  assert.equal(seoTitle({ name: "Rome" }), "Rome travel guide: best time, sights, flights");
});

test("monthsPhrase: runs, pairs, single months and the December–January wrap", () => {
  assert.equal(monthsPhrase([3, 4, 5, 9, 10]), "March to May and September to October");
  assert.equal(monthsPhrase([4, 5]), "April to May");
  assert.equal(monthsPhrase([7]), "July");
  assert.equal(monthsPhrase([11, 12, 1, 2, 3]), "November to March");
  assert.equal(monthsPhrase([1, 5, 9]), "January, May and September");
  assert.equal(monthsPhrase([12, 11, 11]), "November to December");
});

test("monthCells: 12 cells, best months marked", () => {
  const cells = monthCells([1, 12]);
  assert.equal(cells.length, 12);
  assert.deepEqual(cells.filter((c) => c.best).map((c) => c.short), ["Jan", "Dec"]);
});

test("relatedDestinations: never itself, same region first, always the requested count", () => {
  for (const d of DESTINATIONS) {
    for (const month of [1, 6, 11]) {
      const rel = relatedDestinations(d, DESTINATIONS, month, 4);
      assert.equal(rel.length, 4, d.slug);
      assert.ok(rel.every((x) => x.slug !== d.slug), d.slug);
      assert.equal(new Set(rel.map((x) => x.slug)).size, 4, d.slug);
    }
  }
  const paris = findDestination("paris");
  assert.ok(paris);
  assert.ok(relatedDestinations(paris, DESTINATIONS, 11, 3).every((x) => x.region === "europe"));
});

test("postsAbout: matches by tag or title, case-insensitive", () => {
  const posts = [
    { slug: "a", title: "Tenerife winter sun 2026", tags: ["Beach"] },
    { slug: "b", title: "Weekend away", tags: ["Lisbon"] },
    { slug: "c", title: "Something else", tags: ["Rome"] },
  ];
  assert.deepEqual(postsAbout({ name: "Lisbon" }, posts).map((p) => p.slug), ["b"]);
  assert.deepEqual(postsAbout({ name: "tenerife" }, posts).map((p) => p.slug), ["a"]);
  assert.deepEqual(postsAbout({ name: "Paris" }, posts), []);
});

test("destinationJsonLd and itemListJsonLd: schema.org shape", () => {
  const d = findDestination("dubai");
  assert.ok(d);
  const [place, page] = destinationJsonLd("https://glooconn.com/", d, "https://img/x.jpg");
  assert.equal(place["@type"], "TouristDestination");
  assert.equal(place.url, "https://glooconn.com/destinations/dubai");
  assert.equal(place.image, "https://img/x.jpg");
  assert.equal(page["@type"], "WebPage");
  assert.equal(page.dateModified, d.checked);
  assert.deepEqual(page.about, { "@id": "https://glooconn.com/destinations/dubai#place" });
  const list = itemListJsonLd("https://glooconn.com", [{ name: "Dubai", path: "/destinations/dubai" }]) as { itemListElement: { position: number; url: string }[] };
  assert.equal(list.itemListElement[0].position, 1);
  assert.equal(list.itemListElement[0].url, "https://glooconn.com/destinations/dubai");
});
