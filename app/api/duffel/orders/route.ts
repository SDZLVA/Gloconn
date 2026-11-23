/**
 * POST /api/duffel/orders — Duffel branch: book a flight offer on Glooconn.
 * Body: { offerId, passengers: [{ id, title, gender, givenName, familyName, bornOn }], email, phone, services?: [{ id, quantity }] }.
 * Extras (bags, seats) are re-priced from the airline's current offer and seat map.
 * Only works with a TEST token for now (no customer payment flow yet).
 */

import { checkRateLimitCustom, getClientIp } from "@/lib/api/rateLimit";
import { DuffelError, bookingEnabled, createOrder, getOffer, getSeatMaps, type BookingPassenger } from "@/features/duffel/client";
import { priceExtras, type ServicePick } from "@/features/duffel/extras";
import { EMAIL, PHONE, passengerProblems, type PassengerInput } from "@/features/duffel/validate";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!bookingEnabled()) return json({ ok: false, message: "Booking on Glooconn is not open yet." }, 503);
  const rate = checkRateLimitCustom(getClientIp(request), 5, 30, "duffel-orders");
  if (!rate.allowed) return json({ ok: false, message: "Too many attempts. Please wait a minute." }, 429);
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 20_000) return json({ ok: false, message: "Request too large." }, 400);

  let body: { offerId?: unknown; passengers?: unknown; email?: unknown; phone?: unknown; services?: unknown };
  try {
    // The header can be missing (chunked uploads) or wrong, so also cap the real body size.
    const text = await request.text();
    if (text.length > 20_000) return json({ ok: false, message: "Request too large." }, 400);
    body = JSON.parse(text) as typeof body;
  } catch {
    return json({ ok: false, message: "Invalid request." }, 400);
  }
  const offerId = typeof body.offerId === "string" ? body.offerId : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.replace(/[\s()-]/g, "") : "";
  const raw = Array.isArray(body.passengers) ? body.passengers.slice(0, 9) : [];
  if (!EMAIL.test(email)) return json({ ok: false, message: "Enter a valid email address." }, 400);
  if (!PHONE.test(phone)) return json({ ok: false, message: "Enter the phone number with the country code, e.g. +39 340 123 4567." }, 400);

  try {
    // Always the airline's current price, never the one shown earlier.
    const offer = await getOffer(offerId);
    if (!offer) return json({ ok: false, message: "This price has expired. Please search again." }, 410);
    const today = new Date().toISOString().slice(0, 10);
    const passengers: BookingPassenger[] = [];
    for (const expected of offer.passengers) {
      const p = raw.find((x) => (x as PassengerInput)?.id === expected.id) as PassengerInput | undefined;
      if (!p) return json({ ok: false, message: "Please fill in every traveller." }, 400);
      const input: PassengerInput = {
        id: expected.id,
        title: String(p.title ?? ""),
        gender: String(p.gender ?? ""),
        givenName: String(p.givenName ?? "").trim(),
        familyName: String(p.familyName ?? "").trim(),
        bornOn: String(p.bornOn ?? ""),
      };
      const problems = passengerProblems(input, expected.type, today);
      if (problems.length > 0) return json({ ok: false, message: problems[0] }, 400);
      passengers.push(input as BookingPassenger);
    }
    const picks: ServicePick[] = (Array.isArray(body.services) ? body.services.slice(0, 60) : []).map((x) => ({
      id: typeof (x as ServicePick)?.id === "string" ? (x as ServicePick).id : "",
      quantity: Number((x as ServicePick)?.quantity),
    }));
    const wantsSeats = picks.some((p) => p.quantity > 0 && !offer.bags.some((b) => b.id === p.id));
    const priced = priceExtras(picks, offer, wantsSeats ? await getSeatMaps(offer) : []);
    if (!priced.ok) return json({ ok: false, message: priced.message }, 400);
    const order = await createOrder(offer, passengers, { email, phone }, { services: priced.services, total: priced.total });
    return json({ ok: true, bookingReference: order.bookingReference, total: priced.total, currency: offer.currency });
  } catch (error) {
    const status = error instanceof DuffelError ? error.status : 0;
    console.error("[duffel] order failed", status, (error as Error)?.message);
    const message = error instanceof DuffelError && status >= 400 && status < 500 ? error.message : "The airline could not confirm this booking. Please try again.";
    return json({ ok: false, message }, status >= 400 && status < 500 ? 400 : 502);
  }
}
