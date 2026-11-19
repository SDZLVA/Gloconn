/**
 * POST /api/duffel/stays/bookings — Duffel branch: book a hotel room on Glooconn.
 * Body: { rateId, expectedTotal, guests: [{ givenName, familyName }], email, phone, requests? }.
 * The rate is quoted again first; if the hotel's price went up, nothing is booked
 * and the new price is returned (409). Only works with a TEST token for now.
 */

import { checkRateLimitCustom, getClientIp } from "@/lib/api/rateLimit";
import { DuffelError, bookingEnabled } from "@/features/duffel/client";
import { bookStay, quoteStayRate } from "@/features/duffel/staysClient";
import { EMAIL, NAME, PHONE } from "@/features/duffel/validate";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!bookingEnabled()) return json({ ok: false, message: "Booking on Glooconn is not open yet." }, 503);
  const rate = checkRateLimitCustom(getClientIp(request), 5, 30, "duffel-stays");
  if (!rate.allowed) return json({ ok: false, message: "Too many attempts. Please wait a minute." }, 429);
  if (Number(request.headers.get("content-length") ?? 0) > 20_000) return json({ ok: false, message: "Request too large." }, 400);

  let body: { rateId?: unknown; expectedTotal?: unknown; guests?: unknown; email?: unknown; phone?: unknown; requests?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ ok: false, message: "Invalid request." }, 400);
  }
  const rateId = typeof body.rateId === "string" ? body.rateId : "";
  const expected = Number(body.expectedTotal);
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.replace(/[\s()-]/g, "") : "";
  const requests = typeof body.requests === "string" ? body.requests.trim().slice(0, 500) : "";
  const guests = (Array.isArray(body.guests) ? body.guests.slice(0, 8) : []).map((g) => ({
    givenName: String((g as { givenName?: unknown })?.givenName ?? "").trim(),
    familyName: String((g as { familyName?: unknown })?.familyName ?? "").trim(),
  }));
  if (!/^rat_[A-Za-z0-9]+$/.test(rateId) || !Number.isFinite(expected) || expected <= 0) return json({ ok: false, message: "Please choose a room again." }, 400);
  if (guests.length === 0 || guests.some((g) => !NAME.test(g.givenName) || !NAME.test(g.familyName))) return json({ ok: false, message: "Enter each guest's first and last name (letters only)." }, 400);
  if (!EMAIL.test(email)) return json({ ok: false, message: "Enter a valid email address." }, 400);
  if (!PHONE.test(phone)) return json({ ok: false, message: "Enter the phone number with the country code, e.g. +39 340 123 4567." }, 400);

  try {
    const quote = await quoteStayRate(rateId);
    if (!quote) return json({ ok: false, message: "This room is no longer available. Please choose another." }, 410);
    if (quote.total > expected + 0.01) {
      return json({ ok: false, priceChanged: true, total: quote.total, currency: quote.currency, message: "The hotel's price has changed. Check the new total and book again." }, 409);
    }
    const booking = await bookStay(quote.id, guests, { email, phone }, requests);
    return json({ ok: true, reference: booking.reference, total: quote.total, currency: quote.currency });
  } catch (error) {
    const status = error instanceof DuffelError ? error.status : 0;
    console.error("[duffel-stays] booking failed", status, (error as Error)?.message);
    const message =
      error instanceof DuffelError && status >= 400 && status < 500 ? error.message : "The hotel could not confirm this booking. Please try again or choose another room.";
    return json({ ok: false, message }, status >= 400 && status < 500 ? 400 : 502);
  }
}
