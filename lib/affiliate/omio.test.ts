import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildOmioResultsLink, buildOmioUrl, omioSlug, withOmioTracking } from "@/lib/affiliate/omio";

describe("omio links (milestone 53)", () => {
  it("makes city slugs like Omio's route pages", () => {
    assert.equal(omioSlug("Milan, Italy"), "milan");
    assert.equal(omioSlug("São Paulo, Brazil"), "sao-paulo");
    assert.equal(omioSlug("Frankfurt am Main"), "frankfurt-am-main");
    assert.equal(omioSlug(""), "");
  });

  it("builds the route page with both dates", () => {
    assert.equal(
      buildOmioUrl({ from: "Rome, Italy", to: "Florence, Italy", mode: "trains", departureDate: "2026-11-20", returnDate: "2026-11-23" }),
      "https://www.omio.com/trains/rome/florence?departure_date=20/11/2026&return_date=23/11/2026",
    );
    assert.equal(
      buildOmioUrl({ from: "Milan", to: "Paris", mode: "buses", departureDate: "2026-11-13" }),
      "https://www.omio.com/buses/milan/paris?departure_date=13/11/2026",
    );
    assert.equal(buildOmioUrl({ from: "Milan", to: "Milan", mode: "trains", departureDate: "2026-11-13" }), null);
    assert.equal(buildOmioUrl({ from: "Milan", to: "Paris", mode: "trains", departureDate: "" }), null);
  });

  it("adds Impact tracking only with a valid tracking link", () => {
    const url = "https://www.omio.com/trains/milan/paris?departure_date=13/11/2026";
    assert.equal(withOmioTracking(url, "https://omio.sjv.io/c/123/456/7385"), `https://omio.sjv.io/c/123/456/7385?u=${encodeURIComponent(url)}`);
    assert.equal(withOmioTracking(url, "javascript:alert(1)"), url);
    assert.equal(withOmioTracking(url, ""), url);
  });

  it("builds Omio's tracked results link (milestone 54)", () => {
    const link = buildOmioResultsLink({ from: "Rome, Italy", to: "Florence, Italy", departureDate: "2026-11-20", returnDate: "2026-11-23", travelMode: "TRAIN", currency: "EUR" });
    assert.ok(link?.startsWith("https://omio.sjv.io/c/8134530/4057579/7385?u="));
    const inner = new URL(decodeURIComponent(link!.split("?u=")[1]));
    assert.equal(inner.origin + inner.pathname, "https://www.omio.com/links/626fa8a9-f982-43d0-ace9-9a13f6b14612");
    assert.equal(inner.searchParams.get("departurePosTerm"), "Rome");
    assert.equal(inner.searchParams.get("arrivalPosTerm"), "Florence");
    assert.equal(inner.searchParams.get("returnDate"), "2026-11-23");
    assert.equal(inner.searchParams.get("travelMode"), "TRAIN");
    assert.equal(buildOmioResultsLink({ from: "Rome", to: "", departureDate: "2026-11-20" }), null);
  });
});

