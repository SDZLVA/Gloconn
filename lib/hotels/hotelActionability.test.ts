/**
 * Sprint 17.2 — hotel actionability helpers and UI smoke tests.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HotelDetailsPanel } from "@/components/results/HotelDetailsPanel";
import { HotelResultCard } from "@/components/results/HotelResultCard";
import { TravelPackageCard } from "@/components/results/TravelPackageCard";
import { ViewHotelAction } from "@/components/results/ViewHotelAction";
import {
  HOTEL_CARD_AMENITY_LIMIT,
  formatHotelAmenitiesSummary,
  selectHotelAmenitiesForDisplay,
} from "@/lib/hotels/amenitiesUi";
import {
  buildGoogleMapsUrl,
  hasValidHotelCoordinates,
  isSafeExternalHttpsUrl,
} from "@/lib/hotels/googleMapsUrl";
import {
  getHotelPublicFields,
  looksLikeRawSerpApiPropertyToken,
} from "@/lib/hotels/publicHotel";
import type { Hotel } from "@/types/models/hotel";
import type { TravelPackage } from "@/types/models/travel-package";
import type { HotelResult } from "@/types/results";

const RAW_TOKEN = "ChkIv_HyiNKHpf6yARoML2cvMXozdGJnZ3BzEAE";

function hotel(overrides: Partial<Hotel> = {}): Hotel {
  return {
    id: "h1",
    destinationId: "paris",
    price: 400,
    currency: "EUR",
    rating: 4.5,
    name: "Hotel Paris",
    stars: 4,
    amenities: ["Wi-Fi", "Breakfast", "Spa", "Gym", "Pool", "Bar", "Parking"],
    nights: 3,
    location: "Marais",
    latitude: 48.8566,
    longitude: 2.3522,
    providerPropertyRef: "gpref1.mock-test-sealed-ref-for-ui-only",
    ...overrides,
  };
}

function hotelResult(overrides: Partial<HotelResult> = {}): HotelResult {
  return { ...hotel(), type: "hotel", ...overrides };
}

function travelPackage(): TravelPackage {
  const h = hotel();
  return {
    id: "pkg-f1-h1",
    flight: {
      id: "f1",
      destinationId: "paris",
      price: 200,
      currency: "EUR",
      rating: 4,
      airline: "Air France",
      departureTime: "08:00",
      arrivalTime: "10:00",
      durationMinutes: 120,
      stops: 0,
      cabin: "Economy",
    },
    hotel: h,
    flightId: "f1",
    hotelId: h.id,
    totalPrice: 600,
    currency: "EUR",
    nights: 3,
    score: 88,
  };
}

describe("googleMapsUrl", () => {
  it("builds an HTTPS Google Maps URL from valid coordinates", () => {
    const url = buildGoogleMapsUrl(48.8566, 2.3522);
    assert.ok(url);
    assert.ok(url!.startsWith("https://www.google.com/maps?q="));
    assert.ok(isSafeExternalHttpsUrl(url!));
    assert.match(url!, /48\.8566/);
    assert.match(url!, /2\.3522/);
  });

  it("returns null when coordinates are missing or invalid", () => {
    assert.equal(buildGoogleMapsUrl(undefined, 2), null);
    assert.equal(buildGoogleMapsUrl(48, undefined), null);
    assert.equal(buildGoogleMapsUrl(91, 2), null);
    assert.equal(buildGoogleMapsUrl(48, 200), null);
    assert.equal(hasValidHotelCoordinates(NaN, 2), false);
  });

  it("rejects non-HTTPS URLs in the safety helper", () => {
    assert.equal(isSafeExternalHttpsUrl("http://www.google.com/maps"), false);
    assert.equal(isSafeExternalHttpsUrl("javascript:alert(1)"), false);
    assert.equal(isSafeExternalHttpsUrl("data:text/html,hi"), false);
    assert.equal(
      isSafeExternalHttpsUrl("https://www.google.com/maps?q=1,2"),
      true,
    );
  });
});

describe("amenitiesUi", () => {
  it("caps amenities for compact cards", () => {
    const selected = selectHotelAmenitiesForDisplay(hotel().amenities);
    assert.equal(selected.length, HOTEL_CARD_AMENITY_LIMIT);
    assert.deepEqual(selected, ["Wi-Fi", "Breakfast", "Spa"]);
  });

  it("formats a single-line amenities summary", () => {
    assert.equal(
      formatHotelAmenitiesSummary(["Wi-Fi", "Breakfast", "Spa", "Gym"]),
      "Wi-Fi · Breakfast · Spa",
    );
    assert.equal(formatHotelAmenitiesSummary([]), null);
  });
});

describe("publicHotel", () => {
  it("strips providerPropertyRef from public fields", () => {
    const publicFields = getHotelPublicFields(hotel());
    assert.equal("providerPropertyRef" in publicFields, false);
    assert.equal(publicFields.name, "Hotel Paris");
  });

  it("detects raw SerpAPI-looking tokens", () => {
    assert.equal(looksLikeRawSerpApiPropertyToken(RAW_TOKEN), true);
    assert.equal(
      looksLikeRawSerpApiPropertyToken("gpref1.mock-test-sealed-ref-for-ui-only"),
      false,
    );
  });
});

describe("View hotel CTA", () => {
  it("renders View hotel on hotel and package cards when sealed ref exists", () => {
    const hotelHtml = renderToStaticMarkup(
      createElement(HotelResultCard, { result: hotelResult() }),
    );
    const packageHtml = renderToStaticMarkup(
      createElement(TravelPackageCard, { package: travelPackage() }),
    );
    const actionHtml = renderToStaticMarkup(
      createElement(ViewHotelAction, { hotel: hotel() }),
    );

    assert.match(hotelHtml, /View hotel/);
    assert.match(packageHtml, /View hotel/);
    assert.match(actionHtml, /View hotel/);
    assert.match(actionHtml, /min-h-11/);
    assert.doesNotMatch(hotelHtml, /View deal|Book |Check prices|View map/i);
    assert.doesNotMatch(packageHtml, /View deal|Book |Check prices|View map/i);
  });

  it("hides View hotel when sealed providerPropertyRef is absent", () => {
    const withoutRef = hotel({ providerPropertyRef: undefined });
    const legacyHash = hotel({
      providerPropertyRef: "gpref-abcdef0123456789abcdef0123456789",
    });
    assert.equal(
      renderToStaticMarkup(createElement(ViewHotelAction, { hotel: withoutRef })),
      "",
    );
    assert.equal(
      renderToStaticMarkup(createElement(ViewHotelAction, { hotel: legacyHash })),
      "",
    );
    const cardHtml = renderToStaticMarkup(
      createElement(HotelResultCard, {
        result: hotelResult({ providerPropertyRef: undefined }),
      }),
    );
    assert.doesNotMatch(cardHtml, /View hotel/);
    assert.match(cardHtml, /Hotel Paris/);
  });

  it("keeps hotel browse cards compact with an amenities summary", () => {
    const html = renderToStaticMarkup(
      createElement(HotelResultCard, {
        result: hotelResult({
          amenities: [
            "Wi-Fi",
            "Breakfast",
            "Spa",
            "Gym",
            "Pool",
            "Bar",
            "Parking",
          ],
        }),
      }),
    );

    assert.match(html, /Wi-Fi · Breakfast · Spa/);
    assert.doesNotMatch(html, /Parking/);
    assert.doesNotMatch(html, /<ul[\s>]/);
  });

  it("keeps package cards compact without amenity dumps or flight timetable", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage(),
        explanation: {
          packageId: "pkg-f1-h1",
          role: "recommended",
          label: "Recommended",
          reason: "Direct flight · 4★ hotel",
        },
      }),
    );

    assert.match(html, /Recommended/);
    assert.match(html, /Air France/);
    assert.match(html, /Hotel Paris/);
    assert.match(html, /Marais/);
    assert.match(html, /View hotel/);
    assert.match(html, /est\. total/);
    assert.doesNotMatch(html, /Departure|Arrive|Amenities|Free Wi-Fi/i);
    assert.doesNotMatch(html, /iframe|google\.com\/maps/i);
  });
});

describe("HotelDetailsPanel", () => {
  it("shows trusted facts and Maps link when coordinates exist", () => {
    const html = renderToStaticMarkup(
      createElement(HotelDetailsPanel, {
        hotel: hotel(),
        onClose: () => {},
        titleId: "hotel-title",
      }),
    );

    assert.match(html, /role="dialog"/);
    assert.match(html, /aria-modal="true"/);
    assert.match(html, /Hotel Paris/);
    assert.match(html, /Marais/);
    assert.match(html, /3 nights · 1 room/);
    assert.match(html, /View on Google Maps/);
    assert.match(html, /https:\/\/www\.google\.com\/maps\?q=/);
    assert.match(html, /target="_blank"/);
    assert.match(html, /rel="noopener noreferrer"/);
    assert.match(html, /aria-label="Close"/);
    assert.doesNotMatch(html, /View deal|Book /i);
    assert.doesNotMatch(html, /gpref-/);
    assert.doesNotMatch(html, /gpref1/);
    assert.doesNotMatch(html, new RegExp(RAW_TOKEN));
    assert.doesNotMatch(html, /serpapi\.com/i);
    assert.doesNotMatch(html, /property_token/i);
  });

  it("shows loading and error copy without hiding base facts", () => {
    const loading = renderToStaticMarkup(
      createElement(HotelDetailsPanel, {
        hotel: hotel(),
        onClose: () => {},
        titleId: "hotel-title",
        detailsStatus: "loading",
      }),
    );
    assert.match(loading, /Hotel Paris/);
    assert.match(loading, /Loading hotel details/);

    const failed = renderToStaticMarkup(
      createElement(HotelDetailsPanel, {
        hotel: hotel(),
        onClose: () => {},
        titleId: "hotel-title",
        detailsStatus: "error",
      }),
    );
    assert.match(failed, /Hotel Paris/);
    assert.match(failed, /Some hotel details are unavailable right now/);
  });

  it("prefers details address and external actions when provided", () => {
    const html = renderToStaticMarkup(
      createElement(HotelDetailsPanel, {
        hotel: hotel(),
        onClose: () => {},
        titleId: "hotel-title",
        detailsStatus: "success",
        details: {
          hotelId: "h1",
          address: "10 Rue de Rivoli, 75001 Paris",
          mapsUrl: "https://www.google.com/maps?q=48.8%2C2.3",
          websiteUrl: "https://www.hotel-paris.example/",
          offers: [
            {
              label: "View offer at Expedia",
              url: "https://www.google.com/aclk?sa=l&ai=x",
              source: "Expedia",
            },
          ],
          thirdPartyDisclosure:
            "Prices and booking are handled on third-party sites. Glooconn does not process payments.",
        },
      }),
    );

    assert.match(html, /10 Rue de Rivoli/);
    assert.match(html, /Hotel website/);
    assert.match(html, /View offer at Expedia/);
    assert.match(html, /third-party sites/);
    assert.match(html, /rel="noopener noreferrer"/);
    assert.match(html, /opens in a new tab/);
    assert.match(html, /min-h-11/);
    assert.doesNotMatch(html, /Book with Glooconn|Guaranteed price|Best price/i);
  });

  it("hides Maps action when coordinates are missing", () => {
    const html = renderToStaticMarkup(
      createElement(HotelDetailsPanel, {
        hotel: hotel({
          latitude: undefined,
          longitude: undefined,
        }),
        onClose: () => {},
        titleId: "hotel-title",
      }),
    );

    assert.doesNotMatch(html, /View on Google Maps/);
    assert.doesNotMatch(html, /google\.com\/maps/);
  });

  it("never renders opaque provider refs even when present on the model", () => {
    const ref = "gpref1.should-never-appear-in-markup-123456";
    const html = renderToStaticMarkup(
      createElement(HotelDetailsPanel, {
        hotel: hotel({ providerPropertyRef: ref }),
        onClose: () => {},
        titleId: "hotel-title",
      }),
    );

    assert.doesNotMatch(html, /gpref1\.should-never-appear/);
    assert.doesNotMatch(html, /providerPropertyRef/);
  });
});
