import assert from "node:assert/strict";
import { test } from "node:test";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, serializeJsonLd } from "@/lib/seo/jsonld";

test("breadcrumb: positions start at 1 and urls are absolute", () => {
  const b = breadcrumbJsonLd("https://glooconn.com/", [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ]) as { itemListElement: { position: number; item: string }[] };
  assert.equal(b.itemListElement[0].position, 1);
  assert.equal(b.itemListElement[0].item, "https://glooconn.com");
  assert.equal(b.itemListElement[1].item, "https://glooconn.com/blog");
});

test("faq: one Question per item", () => {
  const f = faqJsonLd([{ q: "Q1?", a: "A1" }]) as { mainEntity: { name: string }[] };
  assert.equal(f.mainEntity.length, 1);
  assert.equal(f.mainEntity[0].name, "Q1?");
});

test("article: dateModified falls back to published; image optional", () => {
  const a = articleJsonLd("https://glooconn.com", { slug: "x", title: "T", description: "D", published: "2026-11-20" });
  assert.equal(a.dateModified, "2026-11-20");
  assert.equal("image" in a, false);
});

test("serialize: escapes < so </script> cannot break out", () => {
  assert.equal(serializeJsonLd({ a: "</script>" }).includes("</script>"), false);
});
