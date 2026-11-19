"use client";

import Link from "next/link";
import { useState } from "react";
import { EMAIL, PHONE, passengerProblems, type PassengerInput } from "@/features/duffel/validate";
import { formatMoney } from "@/lib/money";

type Pax = { id: string; type: "adult" | "child" | "infant" };

const field = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100";
const label = "block text-sm font-semibold text-slate-800";
const TYPE_LABEL = { adult: "Adult", child: "Child (2–17)", infant: "Infant (under 2)" } as const;

/** Duffel branch — traveller details and "Book now" (test bookings only for now). */
export function FlightBookingForm({ offerId, passengers, total, currency, testMode }: { offerId: string; passengers: Pax[]; total: number; currency: string; testMode: boolean }) {
  const [list, setList] = useState<PassengerInput[]>(passengers.map((p) => ({ id: p.id, title: "", gender: "", givenName: "", familyName: "", bornOn: "" })));
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<{ status: "idle" | "sending" } | { status: "error"; message: string } | { status: "done"; ref: string }>({ status: "idle" });

  const set = (i: number, patch: Partial<PassengerInput>) => setList((all) => all.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < list.length; i++) {
      const problems = passengerProblems(list[i], passengers[i].type, today);
      if (problems.length > 0) return setState({ status: "error", message: `Traveller ${i + 1}: ${problems[0]}` });
    }
    if (!EMAIL.test(email.trim())) return setState({ status: "error", message: "Enter a valid email address." });
    const cleanPhone = phone.replace(/[\s()-]/g, "");
    if (!PHONE.test(cleanPhone)) return setState({ status: "error", message: "Enter the phone number with the country code, e.g. +39 340 123 4567." });
    setState({ status: "sending" });
    const response = await fetch("/api/duffel/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, passengers: list, email: email.trim(), phone: cleanPhone }),
    }).catch(() => null);
    const body = (await response?.json().catch(() => null)) as { ok?: boolean; message?: string; bookingReference?: string } | null;
    if (body?.ok && body.bookingReference) setState({ status: "done", ref: body.bookingReference });
    else setState({ status: "error", message: body?.message ?? "Something went wrong. Please try again." });
  }

  if (state.status === "done") {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-sm font-semibold text-emerald-800">{testMode ? "Test booking confirmed" : "Booking confirmed"}</p>
        <p className="mt-2 text-4xl font-extrabold tracking-widest text-slate-900">{state.ref}</p>
        <p className="mt-2 text-sm text-slate-700">
          Booking reference{testMode ? " (test — no real ticket, nothing was charged)." : ". We also sent the details by email."}
        </p>
        <Link href="/" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800">
          Back to Glooconn
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {list.map((p, i) => (
        <fieldset key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <legend className="px-1 text-sm font-bold text-slate-900">
            Traveller {i + 1} · {TYPE_LABEL[passengers[i].type]}
          </legend>
          <p className="text-xs text-slate-500">Names exactly as on the passport or ID card.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={label}>
              Title
              <select className={field} value={p.title} onChange={(e) => set(i, { title: e.target.value, gender: e.target.value === "mr" ? "m" : e.target.value ? "f" : "" })}>
                <option value="">Choose</option>
                <option value="mr">Mr</option>
                <option value="ms">Ms</option>
                <option value="mrs">Mrs</option>
                <option value="miss">Miss</option>
              </select>
            </label>
            <label className={label}>
              Gender
              <select className={field} value={p.gender} onChange={(e) => set(i, { gender: e.target.value })}>
                <option value="">Choose</option>
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
            </label>
            <label className={label}>
              First name
              <input className={field} autoComplete={i === 0 ? "given-name" : "off"} value={p.givenName} onChange={(e) => set(i, { givenName: e.target.value })} />
            </label>
            <label className={label}>
              Last name
              <input className={field} autoComplete={i === 0 ? "family-name" : "off"} value={p.familyName} onChange={(e) => set(i, { familyName: e.target.value })} />
            </label>
            <label className={label}>
              Date of birth
              <input type="date" className={field} value={p.bornOn} onChange={(e) => set(i, { bornOn: e.target.value })} />
            </label>
          </div>
        </fieldset>
      ))}

      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-bold text-slate-900">Contact details</legend>
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          <label className={label}>
            Email
            <input type="email" autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className={label}>
            Phone (with country code)
            <input type="tel" autoComplete="tel" placeholder="+39 340 123 4567" className={field} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
        </div>
      </fieldset>

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
        {state.status === "sending" ? "Booking with the airline…" : `${testMode ? "Make test booking" : "Book now"} · ${formatMoney(total, currency)}`}
      </button>
    </form>
  );
}
