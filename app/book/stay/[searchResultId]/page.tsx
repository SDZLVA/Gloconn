import Link from "next/link";
import { StayBooking } from "@/components/booking/StayBooking";
import { bookingEnabled, duffelConfigured, duffelMode } from "@/features/duffel/client";
import { getStayRates } from "@/features/duffel/staysClient";
import { convertAmount } from "@/features/fx/ecb";
import { eurRates } from "@/features/fx/rates";

/** Duffel branch — one hotel: every room and rate, then book on Glooconn. */

export const metadata = { title: "Choose your room", robots: { index: false } };
export const dynamic = "force-dynamic";

function Message({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
      <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
      <p className="text-slate-600">{text}</p>
      <Link href="/?mode=hotels" className="inline-flex rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white">
        Search hotels
      </Link>
    </div>
  );
}

export default async function BookStayPage({ params }: { params: Promise<{ searchResultId: string }> }) {
  const { searchResultId } = await params;
  if (!duffelConfigured()) return <Message title="Booking isn't open yet" text="Booking hotels on Glooconn is coming soon." />;
  const stay = await getStayRates(decodeURIComponent(searchResultId)).catch(() => undefined);
  if (stay === undefined) return <Message title="We couldn't reach the hotel" text="Please try again in a moment." />;
  if (!stay || stay.roomTypes.length === 0) return <Message title="These prices have expired" text="Hotel prices change quickly. Search again to see today's rooms and prices." />;
  const currency = stay.roomTypes[0].rates[0].currency;
  const rates = currency !== "EUR" ? await eurRates() : null;
  const eurPerUnit = rates ? convertAmount(1, currency, "EUR", rates) : null;
  return <StayBooking stay={stay} testMode={duffelMode() === "test"} canBook={bookingEnabled()} eurPerUnit={eurPerUnit} />;
}
