import { test } from "node:test";
import assert from "node:assert/strict";
import { agodaHotelUrl, hotelNameKey, hotelSiteName, mapAgodaProperties, mergeHotels, pickAgodaPlace } from "@/features/liveHotels/agoda/map";
import type { LiveHotel } from "@/features/liveHotels/types";

const search = { checkin: "2026-12-10", checkout: "2026-12-13", adults: 2, children: 0, rooms: 1, currency: "EUR" };

test("pickAgodaPlace prefers the city in the label's country", () => {
  const raw = {
    data: [
      { id: "5_1", name: "Florence area", typeId: 5, typeName: "Region", country: { name: "Italy" } },
      { id: "1_100", name: "Florence (SC)", typeId: 1, typeName: "City", country: { name: "United States" } },
      { id: "1_200", name: "Florence", typeId: 1, typeName: "City", country: { name: "Italy" } },
    ],
  };
  assert.equal(pickAgodaPlace(raw, "Florence, Italy"), "1_200");
  assert.equal(pickAgodaPlace(raw, "Florence"), "1_100");
  assert.equal(pickAgodaPlace({ data: { places: [{ id: "1_9", typeId: 1 }] } }, "X"), "1_9");
  assert.equal(pickAgodaPlace({ data: [] }, "X"), null);
});

const property = (over: Record<string, unknown> = {}) => ({
  propertyId: 42,
  content: {
    informationSummary: {
      localeName: "Hôtel Le Six",
      rating: 4,
      address: { city: { name: "Paris" }, area: { name: "Montparnasse" } },
      geoInfo: { latitude: 48.84, longitude: 2.32 },
    },
    reviews: { cumulative: { reviewCount: 172, score: 8.6 } },
    images: { hotelImages: [{ urls: [{ key: "thumbnail", value: "//pix7.agoda.net/hotelImages/42/a.jpg?ce=0&s=300x300" }] }] },
  },
  enrichment: { roomInformation: { cheapestRoomName: "Classic Double" } },
  pricing: {
    isAvailable: true,
    payment: { cancellation: { cancellationType: "FreeCancellation" } },
    offers: [{ roomOffers: [{ room: { pricing: [{ currency: "EUR", price: { perBook: { inclusive: { display: 300.456 } }, perRoomPerNight: { inclusive: { display: 100.15 } } } }] } }] }],
  },
  ...over,
});

test("mapAgodaProperties reads the stay price, score, photo and link", () => {
  const [hotel] = mapAgodaProperties({ data: { properties: [property()] } }, search, 3);
  assert.equal(hotel.id, "ag-42");
  assert.equal(hotel.name, "Hôtel Le Six");
  assert.equal(hotel.totalPrice, 300.46);
  assert.equal(hotel.currency, "EUR");
  assert.equal(hotel.stars, 4);
  assert.equal(hotel.rating, 8.6);
  assert.equal(hotel.reviewCount, 172);
  assert.equal(hotel.address, "Montparnasse, Paris");
  assert.equal(hotel.refundable, true);
  assert.equal(hotel.roomName, "Classic Double");
  assert.equal(hotel.photo, "https://pix7.agoda.net/hotelImages/42/a.jpg?ce=0&s=600x450");
  assert.equal(hotel.externalUrl, "https://www.agoda.com/partners/partnersearch.aspx?hid=42&checkin=2026-12-10&los=3&adults=2&children=0&rooms=1&currency=EUR");
});

test("mapAgodaProperties skips sold-out and unpriced hotels, and falls back to per-night", () => {
  const soldOut = property({ propertyId: 1, pricing: { isAvailable: false, offers: [] } });
  const noPrice = property({ propertyId: 2, pricing: { isAvailable: true, offers: [] } });
  const perNight = property({
    propertyId: 3,
    pricing: { isAvailable: true, offers: [{ roomOffers: [{ room: { pricing: [{ currency: "EUR", price: { perRoomPerNight: { inclusive: { display: 50 } } } }] } }] }] },
  });
  const hotels = mapAgodaProperties({ data: { properties: [soldOut, noPrice, perNight] } }, { ...search, rooms: 2 }, 3);
  assert.equal(hotels.length, 1);
  assert.equal(hotels[0].totalPrice, 300);
  assert.equal(hotels[0].refundable, false);
  assert.deepEqual(mapAgodaProperties(null, search, 3), []);
});

const h = (id: string, name: string, totalPrice: number, more: Partial<LiveHotel> = {}): LiveHotel => ({
  id, name, totalPrice, currency: "EUR", photo: null, address: null, stars: 0, rating: null, reviewCount: null,
  latitude: null, longitude: null, roomName: null, boardName: null, refundable: false, offerId: null, ...more,
});

test("mergeHotels keeps the cheaper offer for the same hotel and adds Agoda-only hotels", () => {
  const booking = [h("bk-1", "Hotel Le Six", 320, { photo: "p", rating: 8.4 }), h("bk-2", "Ibis Paris", 200), h("bk-3", "Ritz", 900)];
  const agoda = [h("ag-1", "Hôtel Le Six", 300), h("ag-2", "The Ibis Paris", 240), h("ag-9", "Generator Paris", 90)];
  const merged = mergeHotels(booking, agoda);
  assert.deepEqual(merged.map((x) => x.id), ["ag-1", "bk-2", "ag-9", "bk-3"]);
  assert.equal(merged[0].photo, "p");
  assert.equal(merged[0].rating, 8.4);
  assert.deepEqual(mergeHotels([], agoda).map((x) => x.id), ["ag-1", "ag-2", "ag-9"]);
  assert.deepEqual(mergeHotels(booking, []).map((x) => x.id), ["bk-1", "bk-2", "bk-3"]);
  // Different currencies are never compared.
  assert.equal(mergeHotels([h("bk-1", "Ritz", 900)], [h("ag-1", "Ritz", 100, { currency: "USD" })])[0].id, "bk-1");
});

test("hotelNameKey, hotelSiteName and agodaHotelUrl", () => {
  assert.equal(hotelNameKey("Hôtel & Spa Le Six"), "spa six");
  assert.equal(hotelSiteName("https://www.agoda.com/partners/partnersearch.aspx?hid=1"), "Agoda");
  assert.equal(hotelSiteName("https://www.booking.com/hotel/fr/x.html"), "Booking.com");
  assert.equal(hotelSiteName(null), "Booking.com");
  assert.match(agodaHotelUrl("7", { ...search, children: 1 }, 0), /los=1&adults=2&children=1/);
});
