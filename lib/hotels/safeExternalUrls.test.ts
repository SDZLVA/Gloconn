/**
 * Sprint 17.3 — safe external URL validation.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isRejectedExternalUrl,
  validateGoogleMapsDirectionsUrl,
  validateHotelOfferUrl,
  validateHotelWebsiteUrl,
} from "@/lib/hotels/safeExternalUrls";

describe("validateGoogleMapsDirectionsUrl", () => {
  it("accepts HTTPS Google Maps directions", () => {
    const url =
      "https://maps.google.com/maps?hl=en&daddr=Hilton+Bali+Resort";
    assert.equal(validateGoogleMapsDirectionsUrl(url), url);
  });

  it("accepts www.google.com/maps paths", () => {
    const url = "https://www.google.com/maps?q=48.8,2.3";
    assert.equal(validateGoogleMapsDirectionsUrl(url), url);
  });

  it("rejects non-maps Google URLs", () => {
    assert.equal(
      validateGoogleMapsDirectionsUrl("https://www.google.com/search?q=hotel"),
      null,
    );
  });
});

describe("validateHotelWebsiteUrl", () => {
  it("accepts HTTPS hotel websites", () => {
    const url =
      "https://www.hilton.com/en/hotels/dpsbahi-hilton-bali-resort/";
    assert.equal(validateHotelWebsiteUrl(url), url);
  });

  it("rejects http, javascript, data, and SerpAPI hosts", () => {
    assert.equal(validateHotelWebsiteUrl("http://hilton.com"), null);
    assert.equal(validateHotelWebsiteUrl("javascript:alert(1)"), null);
    assert.equal(validateHotelWebsiteUrl("data:text/html,hi"), null);
    assert.equal(
      validateHotelWebsiteUrl("https://serpapi.com/search.json?x=1"),
      null,
    );
  });

  it("rejects Google click wrappers as websites", () => {
    assert.equal(
      validateHotelWebsiteUrl(
        "https://www.google.com/aclk?sa=l&ai=example",
      ),
      null,
    );
  });
});

describe("validateHotelOfferUrl", () => {
  it("accepts Google aclk / travel clk offer wrappers", () => {
    const aclk = "https://www.google.com/aclk?sa=l&ai=example";
    const clk = "https://www.google.com/travel/clk?pc=AA80";
    assert.equal(validateHotelOfferUrl(aclk), aclk);
    assert.equal(validateHotelOfferUrl(clk), clk);
  });

  it("rejects arbitrary OTA domains without allowlisting", () => {
    assert.equal(
      validateHotelOfferUrl("https://www.booking.com/hotel/fr/example.html"),
      null,
    );
    assert.equal(validateHotelOfferUrl("https://evil.example/phish"), null);
  });
});

describe("isRejectedExternalUrl", () => {
  it("flags unsafe schemes", () => {
    assert.equal(isRejectedExternalUrl("javascript:alert(1)"), true);
    assert.equal(isRejectedExternalUrl("data:text/html,x"), true);
    assert.equal(isRejectedExternalUrl("http://example.com"), true);
  });
});
