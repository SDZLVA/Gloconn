/**
 * Sprint 17.7 — package details panel / CTA tests.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PackageDetailsPanel } from "@/components/results/PackageDetailsPanel";
import { TravelPackageCard } from "@/components/results/TravelPackageCard";
import { HotelResultCard } from "@/components/results/HotelResultCard";
import { HOTEL_THIRD_PARTY_DISCLOSURE } from "@/types/models/hotel-property-details";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";
import type { TravelPackage } from "@/types/models/travel-package";
import type { HotelResult } from "@/types/results";

function flight(overrides: Partial<Flight> = {}): Flight {
  return {
    id: "f1",
    destinationId: "tokyo",
    price: 650,
    currency: "EUR",
    rating: 4.2,
    airline: "Japan Airlines",
    departureTime: "10:15",
    arrivalTime: "06:40",
    durationMinutes: 745,
    stops: 1,
    cabin: "Economy",
    ...overrides,
  };
}

function hotel(overrides: Partial<Hotel> = {}): Hotel {
  return {
    id: "h1",
    destinationId: "tokyo",
    price: 480,
    currency: "EUR",
    rating: 4.6,
    name: "Park Hotel Tokyo",
    stars: 4,
    amenities: ["Wi-Fi"],
    nights: 3,
    location: "Shiodome",
    latitude: 35.66,
    longitude: 139.76,
    providerPropertyRef: "gpref1.mock-sealed-for-tests",
    ...overrides,
  };
}

function travelPackage(
  overrides: Partial<TravelPackage> = {},
): TravelPackage {
  const f = overrides.flight ?? flight();
  const h = overrides.hotel ?? hotel();
  return {
    id: "pkg-f1-h1",
    flightId: f.id,
    hotelId: h.id,
    totalPrice: f.price + h.price,
    currency: "EUR",
    nights: h.nights,
    score: 80,
    ...overrides,
    flight: f,
    hotel: h,
  };
}

describe("Sprint 17.7 — package details", () => {
  it("package CTA says View package details", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage(),
        originIata: "MXP",
        destinationIata: "HND",
      }),
    );
    assert.match(html, /View package details/);
    assert.doesNotMatch(html, /View hotel/);
    assert.doesNotMatch(html, /Book with Glooconn/i);
  });

  it("hotel browse CTA remains View hotel", () => {
    const result: HotelResult = {
      ...hotel(),
      type: "hotel",
    };
    const html = renderToStaticMarkup(
      createElement(HotelResultCard, { result }),
    );
    assert.match(html, /View hotel/);
    assert.doesNotMatch(html, /View package details/);
  });

  it("package panel renders flight + hotel sections", () => {
    const html = renderToStaticMarkup(
      createElement(PackageDetailsPanel, {
        package: travelPackage(),
        onClose: () => undefined,
        titleId: "pkg-title",
        originIata: "MXP",
        destinationIata: "HND",
      }),
    );

    assert.match(html, /Package details/);
    assert.match(html, />Flight</);
    assert.match(html, />Hotel</);
    assert.match(html, /Japan Airlines/);
    assert.match(html, /MXP → HND/);
    assert.match(html, /10:15/);
    assert.match(html, /06:40/);
    assert.match(html, /1 stop/);
    assert.match(html, /12h 25m/);
    assert.match(html, /per person/i);
    assert.match(html, /Park Hotel Tokyo/);
    assert.match(html, /Shiodome/);
    assert.match(html, /3 nights · 1 room/);
    assert.match(html, /est\. total/);
    assert.doesNotMatch(html, /Book with Glooconn/i);
    assert.doesNotMatch(html, /property_token|api_key|serpapi/i);
  });

  it("renders Maps / website / offers only when available", () => {
    const withLinks = renderToStaticMarkup(
      createElement(PackageDetailsPanel, {
        package: travelPackage(),
        onClose: () => undefined,
        titleId: "pkg-title",
        detailsStatus: "success",
        details: {
          hotelId: "h1",
          mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=35.66,139.76",
          websiteUrl: "https://www.example-hotel.com/",
          offers: [
            {
              label: "View offer at Booking.com",
              url: "https://www.google.com/aclk?sa=l&ai=example",
            },
          ],
          thirdPartyDisclosure: HOTEL_THIRD_PARTY_DISCLOSURE,
        },
      }),
    );

    assert.match(withLinks, /View on Google Maps/);
    assert.match(withLinks, /Hotel website/);
    assert.match(withLinks, /View offer at Booking\.com/);
    assert.match(withLinks, /third-party sites/i);
    // No flight booking link invented.
    assert.doesNotMatch(withLinks, /View flight|Book flight|Airline website/i);

    const withoutLinks = renderToStaticMarkup(
      createElement(PackageDetailsPanel, {
        package: travelPackage({
          hotel: hotel({ latitude: undefined, longitude: undefined }),
        }),
        onClose: () => undefined,
        titleId: "pkg-title-2",
        detailsStatus: "success",
        details: { hotelId: "h1" },
      }),
    );
    assert.doesNotMatch(withoutLinks, /Hotel website/);
    assert.doesNotMatch(withoutLinks, /View offer/);
  });

  it("does not invent a flight booking link", () => {
    const html = renderToStaticMarkup(
      createElement(PackageDetailsPanel, {
        package: travelPackage(),
        onClose: () => undefined,
        titleId: "pkg-title",
      }),
    );
    assert.doesNotMatch(html, /Book flight|Flight deal|Airline booking/i);
  });
});
