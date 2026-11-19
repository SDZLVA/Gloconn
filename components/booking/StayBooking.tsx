"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { amenityLabel, type StayDetails, type StayRate } from "@/features/duffel/stays";
import { EMAIL, NAME, PHONE } from "@/features/duffel/validate";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const field = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100";
const label = "block text-sm font-semibold text-slate-800";

type Filters = { freeCancel: boolean; meals: boolean; payLater: boolean; sort: "price" | "room" };

const day = (iso: string) => {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};
const nightsOf = (a: string, b: string) => Math.max(1, Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000));

function cancelText(rate: StayRate): { text: string; good: boolean } {
  if (rate.refundable === "free" && rate.freeCancellationUntil) return { text: `Free cancellation until ${day(rate.freeCancellationUntil)}`, good: true };
  if (rate.refundable === "partial") return { text: "Partly refundable if you cancel", good: false };
  return { text: "Non-refundable", good: false };
}

/** Duffel branch — every room and rate of one hotel, Booking.com-style, then the guest form. */
export function StayBooking({ stay, testMode, canBook, eurPerUnit }: { stay: StayDetails; testMode: boolean; canBook: boolean; eurPerUnit: number | null }) {
  const [filters, setFilters] = useState<Filters>({ freeCancel: false, meals: false, payLater: false, sort: "price" });
  const [chosen, setChosen] = useState<{ room: string; rate: StayRate } | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const nights = nightsOf(stay.checkin, stay.checkout);
  const allRates = stay.roomTypes.flatMap((r) => r.rates);
  const counts = {
    freeCancel: allRates.filter((r) => r.refundable === "free").length,
    meals: allRates.filter((r) => r.board !== "room_only").length,
    payLater: allRates.filter((r) => r.payment !== "pay_now").length,
  };
  const rooms = useMemo(() => {
    const keep = (r: StayRate) => (!filters.freeCancel || r.refundable === "free") && (!filters.meals || r.board !== "room_only") && (!filters.payLater || r.payment !== "pay_now");
    const list = stay.roomTypes.map((room) => ({ ...room, rates: room.rates.filter(keep) })).filter((room) => room.rates.length > 0);
    return filters.sort === "price" ? list.sort((a, b) => a.rates[0].total - b.rates[0].total) : list.sort((a, b) => a.name.localeCompare(b.name));
  }, [stay, filters]);
  const h = stay.hotel;
  const euro = (amount: number) => (eurPerUnit ? `about ${formatMoney(amount * eurPerUnit, "EUR")}` : null);

  function choose(room: string, rate: StayRate) {
    setChosen({ room, rate });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {testMode && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Test mode.</strong> Duffel&apos;s test hotels are shown for every city, and bookings are practice only: no real room is booked and nothing is charged.
        </p>
      )}

      <header className="space-y-3">
        {h.photos.length > 0 && (
          <div className="grid h-56 gap-2 overflow-hidden rounded-3xl sm:h-72 sm:grid-cols-[2fr_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={h.photos[0]} alt={h.name} className="h-full w-full object-cover" />
            <div className="hidden grid-rows-2 gap-2 sm:grid">
              {h.photos.slice(1, 3).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-900">{h.name}</h1>
            {h.stars > 0 && <p className="text-amber-500">{"★".repeat(h.stars)}</p>}
            <p className="text-sm text-slate-600">{[h.address, h.chain].filter(Boolean).join(" · ")}</p>
          </div>
          {h.reviewScore !== null && h.reviewScore > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-right text-xs text-slate-600">{h.reviewCount ? `${h.reviewCount} reviews` : "Guest score"}</span>
              <span className="rounded-lg rounded-bl-none bg-brand-800 px-2 py-1.5 text-sm font-bold text-white">{h.reviewScore.toFixed(1)}</span>
            </div>
          )}
        </div>
        <ul className="grid gap-2 text-sm sm:grid-cols-4">
          <li className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Check-in</span><strong>{day(stay.checkin)}</strong>{h.checkInAfter && <span className="block text-xs text-slate-600">from {h.checkInAfter.slice(0, 5)}</span>}</li>
          <li className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Check-out</span><strong>{day(stay.checkout)}</strong>{h.checkOutBefore && <span className="block text-xs text-slate-600">until {h.checkOutBefore.slice(0, 5)}</span>}</li>
          <li className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Stay</span><strong>{nights} {nights === 1 ? "night" : "nights"}</strong></li>
          <li className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Guests</span><strong>{stay.guests} · {stay.rooms} {stay.rooms === 1 ? "room" : "rooms"}</strong></li>
        </ul>
        {h.amenities.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {h.amenities.map((a) => (
              <li key={a} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">✓ {amenityLabel(a)}</li>
            ))}
          </ul>
        )}
        {h.description && (
          <details className="text-sm text-slate-700">
            <summary className="cursor-pointer font-semibold text-brand-700">About this property</summary>
            <p className="mt-2 whitespace-pre-line">{h.description}</p>
          </details>
        )}
      </header>

      <section aria-labelledby="rooms-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="rooms-title" className="text-xl font-bold text-slate-900">
            Choose your room <span className="text-sm font-normal text-slate-500">({allRates.length} options)</span>
          </h2>
          <label className="text-sm text-slate-700">
            Sort{" "}
            <select className="rounded-lg border border-slate-300 px-2 py-1" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value as Filters["sort"] })}>
              <option value="price">Price (lowest first)</option>
              <option value="room">Room name</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filter rooms">
          {(
            [
              ["freeCancel", "Free cancellation", counts.freeCancel],
              ["meals", "Breakfast / meals included", counts.meals],
              ["payLater", "Pay at the property", counts.payLater],
            ] as const
          ).map(([key, text, n]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filters[key]}
              disabled={n === 0 && !filters[key]}
              onClick={() => setFilters({ ...filters, [key]: !filters[key] })}
              className={cn("rounded-full border px-3 py-1.5 text-sm font-semibold disabled:opacity-40", filters[key] ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300 bg-white text-slate-700")}
            >
              {text} ({n})
            </button>
          ))}
        </div>

        {rooms.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">No room matches these filters.</p>}
        {rooms.map((room) => (
          <article key={room.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex gap-3 border-b border-slate-100 p-4">
              {room.photos[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={room.photos[0]} alt="" loading="lazy" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
              )}
              <div>
                <h3 className="font-bold text-slate-900">{room.name}</h3>
                {room.beds && <p className="text-sm text-slate-600">{room.beds}</p>}
              </div>
            </div>
            <ul className="divide-y divide-slate-100">
              {room.rates.map((rate) => {
                const cancel = cancelText(rate);
                const picked = chosen?.rate.id === rate.id;
                return (
                  <li key={rate.id} className={cn("grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_200px]", picked && "bg-brand-50")}>
                    <div className="space-y-1 text-sm">
                      {rate.name && <p className="font-semibold text-slate-900">{rate.name}</p>}
                      <p className={rate.board !== "room_only" ? "font-semibold text-emerald-700" : "text-slate-700"}>{rate.board !== "room_only" ? "✓ " : ""}{rate.boardLabel}</p>
                      <p className={cancel.good ? "font-semibold text-emerald-700" : "text-slate-700"}>{cancel.good ? "✓ " : ""}{cancel.text}</p>
                      <p className="text-slate-700">{rate.paymentLabel}</p>
                      {rate.benefits.map((b) => <p key={b} className="text-emerald-700">✓ {b}</p>)}
                      {rate.left !== null && rate.left <= 3 && <p className="font-semibold text-red-600">Only {rate.left} left</p>}
                      {(rate.conditions.length > 0 || rate.cancellation.length > 0) && (
                        <details className="text-xs text-slate-600">
                          <summary className="cursor-pointer font-semibold text-brand-700">Rate rules</summary>
                          <ul className="mt-1 space-y-1">
                            {rate.cancellation.map((c) => (
                              <li key={c.before}>Cancel before {day(c.before)}: {formatMoney(c.refund, c.currency)} back</li>
                            ))}
                            {rate.conditions.map((c, i) => (
                              <li key={i}><strong>{c.title}</strong> {c.description}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                    <div className="flex flex-row items-end justify-between gap-2 sm:flex-col sm:items-end">
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-slate-900">{formatMoney(rate.total, rate.currency)}</p>
                        <p className="text-xs text-slate-500">{nights} {nights === 1 ? "night" : "nights"} · {formatMoney(rate.total / nights, rate.currency)}/night</p>
                        {euro(rate.total) && <p className="text-xs text-slate-500">{euro(rate.total)}</p>}
                        {rate.dueAtProperty ? <p className="text-xs text-amber-700">+ {formatMoney(rate.dueAtProperty, rate.currency)} paid at the property</p> : <p className="text-xs text-slate-500">incl. taxes and fees</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => choose(room.name, rate)}
                        className={cn("inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold", picked ? "bg-emerald-600 text-white" : "bg-brand-700 text-white hover:bg-brand-800")}
                      >
                        {picked ? "Selected ✓" : "Select"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </section>

      <div ref={formRef}>
        {chosen && (canBook ? <StayGuestForm stay={stay} room={chosen.room} rate={chosen.rate} testMode={testMode} nights={nights} /> : <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">Booking on Glooconn opens soon.</p>)}
      </div>
      <p className="text-center text-xs text-slate-500">Rooms are booked with the hotel through our partner Duffel. The price is checked again with the hotel before you book.</p>
    </div>
  );
}

function StayGuestForm({ stay, room, rate, testMode, nights }: { stay: StayDetails; room: string; rate: StayRate; testMode: boolean; nights: number }) {
  const [guests, setGuests] = useState(Array.from({ length: Math.max(1, stay.rooms) }, () => ({ givenName: "", familyName: "" })));
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");
  const [total, setTotal] = useState(rate.total);
  const [state, setState] = useState<{ status: "idle" | "sending" } | { status: "error"; message: string } | { status: "done"; ref: string }>({ status: "idle" });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (guests.some((g) => !NAME.test(g.givenName.trim()) || !NAME.test(g.familyName.trim()))) return setState({ status: "error", message: "Enter each guest's first and last name (letters only)." });
    if (!EMAIL.test(email.trim())) return setState({ status: "error", message: "Enter a valid email address." });
    const cleanPhone = phone.replace(/[\s()-]/g, "");
    if (!PHONE.test(cleanPhone)) return setState({ status: "error", message: "Enter the phone number with the country code, e.g. +39 340 123 4567." });
    setState({ status: "sending" });
    const response = await fetch("/api/duffel/stays/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rateId: rate.id, expectedTotal: total, guests, email: email.trim(), phone: cleanPhone, requests }),
    }).catch(() => null);
    const body = (await response?.json().catch(() => null)) as { ok?: boolean; reference?: string; message?: string; priceChanged?: boolean; total?: number } | null;
    if (body?.ok && body.reference) return setState({ status: "done", ref: body.reference });
    if (body?.priceChanged && typeof body.total === "number") setTotal(body.total);
    setState({ status: "error", message: body?.message ?? "Something went wrong. Please try again." });
  }

  if (state.status === "done") {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-sm font-semibold text-emerald-800">{testMode ? "Test booking confirmed" : "Booking confirmed"}</p>
        <p className="mt-2 text-4xl font-extrabold tracking-widest text-slate-900">{state.ref}</p>
        <p className="mt-2 text-sm text-slate-700">Booking reference{testMode ? " (test — no real room, nothing was charged)." : "."}</p>
        <Link href="/" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800">
          Back to Glooconn
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Your choice</p>
        <p className="font-bold text-slate-900">{room}</p>
        <p className="text-sm text-slate-600">{[rate.boardLabel, cancelText(rate).text, rate.paymentLabel].join(" · ")}</p>
      </div>
      {guests.map((g, i) => (
        <fieldset key={i} className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-1 text-sm font-bold text-slate-900">{guests.length > 1 ? `Main guest, room ${i + 1}` : "Main guest"}</legend>
          <label className={label}>
            First name
            <input className={field} autoComplete={i === 0 ? "given-name" : "off"} value={g.givenName} onChange={(e) => setGuests(guests.map((x, j) => (j === i ? { ...x, givenName: e.target.value } : x)))} />
          </label>
          <label className={label}>
            Last name
            <input className={field} autoComplete={i === 0 ? "family-name" : "off"} value={g.familyName} onChange={(e) => setGuests(guests.map((x, j) => (j === i ? { ...x, familyName: e.target.value } : x)))} />
          </label>
        </fieldset>
      ))}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>
          Email
          <input type="email" autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className={label}>
          Phone (with country code)
          <input type="tel" autoComplete="tel" placeholder="+39 340 123 4567" className={field} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
      </div>
      <label className={label}>
        Special requests <span className="font-normal text-slate-500">(optional — the hotel will try, not guaranteed)</span>
        <textarea className={field} rows={2} maxLength={500} value={requests} onChange={(e) => setRequests(e.target.value)} />
      </label>
      <div className="flex items-end justify-between gap-3 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm text-slate-700">
          {nights} {nights === 1 ? "night" : "nights"} · {stay.rooms} {stay.rooms === 1 ? "room" : "rooms"}
          {rate.dueAtProperty ? <span className="block text-xs text-amber-700">+ {formatMoney(rate.dueAtProperty, rate.currency)} paid at the property</span> : null}
        </p>
        <p className="text-3xl font-extrabold text-slate-900">{formatMoney(total, rate.currency)}</p>
      </div>
      {state.status === "error" && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={state.status === "sending"}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-700 px-5 text-base font-bold text-white shadow-md shadow-brand-700/20 hover:bg-brand-800 disabled:opacity-60"
      >
        {state.status === "sending" ? "Booking with the hotel…" : `${testMode ? "Make test booking" : "Book now"} · ${formatMoney(total, rate.currency)}`}
      </button>
    </form>
  );
}
