import Link from "next/link";
import { FlightBookingForm } from "@/components/booking/FlightBookingForm";
import { bookingEnabled, duffelConfigured, duffelMode, getOffer, getSeatMaps } from "@/features/duffel/client";
import { convertAmount } from "@/features/fx/ecb";
import { eurRates } from "@/features/fx/rates";
import { formatMoney } from "@/lib/money";

/** Duffel branch — book a flight on Glooconn: the offer at today's price + traveller details. */

export const metadata = { title: "Book your flight", robots: { index: false } };
export const dynamic = "force-dynamic";

const time = (v: string) => v.slice(11, 16);
const day = (v: string) => {
  const d = new Date(`${v.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
};
const hours = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? ` ${String(m % 60).padStart(2, "0")}m` : ""}`;
/** "+1" when the flight lands on a later day than it left. */
const plusDays = (from: string, to: string) => {
  const d = Math.round((Date.parse(`${to.slice(0, 10)}T00:00:00Z`) - Date.parse(`${from.slice(0, 10)}T00:00:00Z`)) / 86_400_000);
  return d > 0 ? `+${d}` : "";
};

function Message({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
      <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
      <p className="text-slate-600">{text}</p>
      <Link href="/?mode=flights" className="inline-flex rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white">
        Search flights
      </Link>
    </div>
  );
}

export default async function BookFlightPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  if (!duffelConfigured()) return <Message title="Booking isn't open yet" text="Booking flights on Glooconn is coming soon." />;
  const offer = await getOffer(decodeURIComponent(offerId)).catch(() => undefined);
  if (offer === undefined) return <Message title="We couldn't reach the airline" text="Please try again in a moment." />;
  if (!offer) return <Message title="This price has expired" text="Airline prices change quickly. Search again to see today's flights and prices." />;
  const testMode = duffelMode() === "test";
  const seatMaps = bookingEnabled() ? await getSeatMaps(offer) : [];
  // Airlines charge in their own currency; show euros next to it (the search list shows euros).
  const rates = offer.currency !== "EUR" ? await eurRates() : null;
  const inEuro = rates ? convertAmount(offer.total, offer.currency, "EUR", rates) : null;
  const counts = { adult: 0, child: 0, infant: 0 };
  for (const p of offer.passengers) counts[p.type] += 1;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {testMode && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Test mode.</strong> This is a practice booking with a test airline: no real ticket is issued and nothing is charged.
        </p>
      )}
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">Book your flight</h1>
        <p className="mt-1 text-sm text-slate-600">
          {[counts.adult && `${counts.adult} adult${counts.adult > 1 ? "s" : ""}`, counts.child && `${counts.child} child${counts.child > 1 ? "ren" : ""}`, counts.infant && `${counts.infant} infant${counts.infant > 1 ? "s" : ""}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      <section aria-label="Your flight" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {offer.slices.map((s, i) => (
          <div key={i} className="border-b border-slate-100 p-5 last:border-b-0">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{i === 0 ? "Outbound" : "Return"} · {day(s.departure)}</p>
            <div className="mt-2 flex items-center gap-4 text-slate-900">
              <p className="text-2xl font-extrabold">
                {time(s.departure)} <span className="text-sm font-semibold text-slate-500">{s.from}</span>
              </p>
              <p className="flex-1 text-center text-xs text-slate-500">
                {hours(s.minutes)}
                <span className="block border-t border-slate-300" />
                {s.stops === 0 ? "Direct" : `${s.stops} stop${s.stops > 1 ? "s" : ""}`}
              </p>
              <p className="text-2xl font-extrabold">
                {time(s.arrival)} <span className="text-sm font-semibold text-slate-500">{s.to}</span>
              </p>
            </div>
            <ol className="mt-3 space-y-2 border-l-2 border-slate-200 pl-4 text-sm">
              {s.segments.map((g, j) => (
                <li key={g.id || j} className="space-y-1">
                  {j > 0 && s.layovers[j - 1] && (
                    <p className="-ml-4 mb-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
                      Change planes in {s.layovers[j - 1].airport} · {hours(s.layovers[j - 1].minutes)} layover
                    </p>
                  )}
                  <p className="font-semibold text-slate-900">
                    {time(g.departure)} {g.from} → {time(g.arrival)}
                    {plusDays(g.departure, g.arrival) && <sup className="text-red-600"> {plusDays(g.departure, g.arrival)}</sup>} {g.to}
                    {g.minutes !== null && <span className="font-normal text-slate-500"> · {hours(g.minutes)}</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[g.airline, g.flight, g.operatedBy && `operated by ${g.operatedBy}`, g.aircraft, g.cabin].filter(Boolean).join(" · ")}
                  </p>
                </li>
              ))}
            </ol>
            {s.fareBrand && <p className="mt-2 text-xs font-semibold text-brand-700">Fare: {s.fareBrand}</p>}
          </div>
        ))}
        <div className="flex flex-wrap items-end justify-between gap-3 bg-slate-50 p-5">
          <ul className="space-y-0.5 text-sm text-slate-700">
            <li>
              {offer.checkedBags === null ? "Checked bag: see the airline's rules" : offer.checkedBags > 0 ? `✓ ${offer.checkedBags} checked bag per traveller included` : "No checked bag included (you can add one below)"}
            </li>
            {offer.carryOnBags !== null && <li>{offer.carryOnBags > 0 ? `✓ ${offer.carryOnBags} cabin bag included` : "Small personal item only"}</li>}
            {offer.refundable !== null && <li>{offer.refundable ? "✓ Refundable (fees may apply)" : "Non-refundable"}</li>}
            {offer.changeable !== null && <li>{offer.changeable ? "✓ Changes allowed (fees may apply)" : "No changes allowed"}</li>}
            <li>
              {offer.baggageRulesUrl ? (
                <a href={offer.baggageRulesUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:text-brand-900">
                  Bag size &amp; weight limits: {offer.airline} rules ↗
                </a>
              ) : (
                <span className="text-slate-500">Bag size &amp; weight limits: see {offer.airline}&apos;s website</span>
              )}
            </li>
            {offer.co2Kg !== null && <li className="text-slate-500">About {Math.round(offer.co2Kg)} kg CO₂ for this trip</li>}
          </ul>
          <div className="text-right">
            <p className="text-xs text-slate-500">Flights for all travellers (before extras)</p>
            <p className="text-3xl font-extrabold text-slate-900">{formatMoney(offer.total, offer.currency)}</p>
            {inEuro !== null && <p className="text-xs text-slate-500">about {formatMoney(inEuro, "EUR")} · charged in {offer.currency}</p>}
          </div>
        </div>
      </section>

      {bookingEnabled() ? (
        <FlightBookingForm offerId={offer.id} passengers={offer.passengers} total={offer.total} currency={offer.currency} testMode={testMode} bags={offer.bags} seatMaps={seatMaps} />
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">Booking on Glooconn opens soon.</p>
      )}
      <p className="text-center text-xs text-slate-500">Tickets are issued by the airline through our booking partner Duffel. Prices are checked again with the airline before you book.</p>
    </div>
  );
}
