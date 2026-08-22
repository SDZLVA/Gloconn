/**
 * Sprint 17.3 — property details mapper.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapPropertyDetailsResponse } from "@/lib/providers/hotels/serpapi/propertyDetailsMapper";
import { HOTEL_THIRD_PARTY_DISCLOSURE } from "@/types/models/hotel-property-details";

describe("mapPropertyDetailsResponse", () => {
  it("maps address, maps directions, website, and offers safely", () => {
    const details = mapPropertyDetailsResponse("serpapi-hotel-1", {
      name: "Hilton Bali Resort",
      address: "Jl. Raya Nusa Dua Selatan, Bali",
      directions:
        "https://maps.google.com/maps?daddr=Hilton+Bali+Resort",
      link: "https://www.hilton.com/en/hotels/dpsbahi-hilton-bali-resort/",
      property_token: "ChcI9uq9hrWO2OtjGgsvZy8xMjJ0YzFteBAB",
      featured_prices: [
        {
          source: "Priceline",
          link: "https://www.google.com/aclk?sa=l&ai=example",
        },
      ],
    });

    assert.equal(details.hotelId, "serpapi-hotel-1");
    assert.equal(details.name, "Hilton Bali Resort");
    assert.equal(details.address, "Jl. Raya Nusa Dua Selatan, Bali");
    assert.ok(details.mapsUrl?.startsWith("https://maps.google.com/maps"));
    assert.ok(details.websiteUrl?.includes("hilton.com"));
    assert.equal(details.offers?.length, 1);
    assert.equal(details.offers?.[0]?.label, "View offer at Priceline");
    assert.equal(details.thirdPartyDisclosure, HOTEL_THIRD_PARTY_DISCLOSURE);
    assert.equal(
      JSON.stringify(details).includes("property_token"),
      false,
    );
    assert.equal(JSON.stringify(details).includes("ChcI9uq9"), false);
    assert.equal(JSON.stringify(details).includes("serpapi.com"), false);
  });

  it("drops unsafe links and incomplete payloads", () => {
    const details = mapPropertyDetailsResponse("h1", {
      link: "javascript:alert(1)",
      directions: "http://maps.google.com/maps?q=1,2",
      featured_prices: [
        { source: "Evil", link: "https://evil.example/deal" },
      ],
      prices: [{ source: "Serp", link: "https://serpapi.com/x" }],
    });

    assert.equal(details.websiteUrl, undefined);
    assert.equal(details.mapsUrl, undefined);
    assert.equal(details.offers, undefined);
    assert.equal(details.thirdPartyDisclosure, undefined);
  });
});
