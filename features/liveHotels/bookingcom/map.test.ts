import { test } from "node:test";
import assert from "node:assert/strict";
import { biggerPhoto, mapBookingProperties, pickDestination } from "@/features/liveHotels/bookingcom/map";

test("pickDestination prefers a city", () => {
  assert.deepEqual(
    pickDestination([
      { dest_id: "900", dest_type: "region" },
      { dest_id: "-126693", dest_type: "city" },
    ]),
    { destId: "-126693", destType: "city" },
  );
  assert.equal(pickDestination([]), null);
});

test("mapBookingProperties reads price, score, photo and link", () => {
  const [hotel] = mapBookingProperties(
    {
      result: [
        {
          hotel_id: 123,
          hotel_name: "Hotel Roma",
          class: 4,
          review_score: 8.6,
          review_nr: 512,
          price_breakdown: { gross_price: 420.5, currency: "EUR" },
          main_photo_url: "https://cf.bstatic.com/xdata/images/hotel/square60/1.jpg",
          url: "https://www.booking.com/hotel/it/roma.html",
          latitude: 41.9,
          longitude: 12.5,
          address: "Via Roma 1",
          city: "Rome",
          is_free_cancellable: 1,
        },
        { hotel_id: 2, hotel_name: "No price" },
      ],
    },
    "EUR",
  );
  assert.equal(hotel.id, "bk-123");
  assert.equal(hotel.totalPrice, 420.5);
  assert.equal(hotel.rating, 8.6);
  assert.equal(hotel.stars, 4);
  assert.equal(hotel.refundable, true);
  assert.equal(hotel.photo, "https://cf.bstatic.com/xdata/images/hotel/max500/1.jpg");
  assert.equal(hotel.externalUrl, "https://www.booking.com/hotel/it/roma.html");
});

test("biggerPhoto upsizes list photos", () => {
  assert.equal(biggerPhoto(null), null);
});
