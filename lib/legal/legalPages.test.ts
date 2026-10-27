/**
 * Legal pages contract — the footer must expose the privacy policy and terms,
 * because affiliate programmes and data protection law both require them to be
 * reachable from every page.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FOOTER_SECTIONS, LEGAL_LINKS } from "@/lib/navigation";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_LAST_UPDATED,
  formatLegalDate,
} from "@/lib/legal/constants";

describe("legal links", () => {
  it("exposes privacy and terms", () => {
    assert.deepEqual(
      LEGAL_LINKS.map((link) => link.href),
      ["/privacy", "/terms"],
    );
  });

  it("links both pages from the footer", () => {
    const hrefs = FOOTER_SECTIONS.flatMap((section) =>
      section.links.map((link) => link.href),
    );
    assert.ok(hrefs.includes("/privacy"), "footer must link the privacy policy");
    assert.ok(hrefs.includes("/terms"), "footer must link the terms");
  });

  it("keeps the existing Explore column", () => {
    const titles = FOOTER_SECTIONS.map((section) => section.title);
    assert.deepEqual(titles, ["Explore", "Legal"]);
  });
});

describe("legal constants", () => {
  it("uses a contact address on the Glooconn domain", () => {
    assert.match(LEGAL_CONTACT_EMAIL, /@glooconn\.com$/);
  });

  it("stores the last-updated date as ISO and formats it for readers", () => {
    assert.match(LEGAL_LAST_UPDATED, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(formatLegalDate("2026-10-27"), "27 October 2026");
  });
});
