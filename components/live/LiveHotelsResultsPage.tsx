import { LiveResultsBand } from "@/components/live/LiveResultsBand";
import { LiveHotelsResults } from "@/components/live/hotels/LiveHotelsResults";
import { stay22MapUrl } from "@/features/liveHotels/stay22";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { formatShortDate } from "@/lib/calendar/dates";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchFormState } from "@/types/search-form";

type LiveHotelsResultsPageProps = {
  search: Partial<SearchRequest>;
  initialForm: SearchFormState;
};

/**
 * Milestone 28 — Hotels tab results. Glooconn's own hotel data (sample
 * hotels) is switched off for this page. Travelpayouts has no live hotel
 * source for Glooconn yet: Hotellook (the White Label's hotel search)
 * closed on 2025-10-20, and the hotel brands (Booking.com, Trip.com, Agoda,
 * Expedia, Hotels.com, Hostelworld, Vio.com) are locked until the site has
 * steady traffic. Until one unlocks, this page says so honestly and offers
 * the same search on Booking.com (plain link — no commission yet).
 */
export function LiveHotelsResultsPage({ search, initialForm }: LiveHotelsResultsPageProps) {
  const destination = (search.destination ?? "").split(",")[0]?.trim() || "your destination";
  const guests = (search.travelers?.adults ?? 1) + (search.travelers?.children ?? 0);
  const rooms = search.travelers?.rooms ?? 1;
  const dates = [search.departureDate, search.returnDate]
    .filter((value): value is string => Boolean(value))
    .map(formatShortDate)
    .join(" – ");
  const bookingUrl = buildBookingSearchUrl(search);
  // Hotel engine (NEXT_PUBLIC_HOTELS_ENGINE): "liteapi" (default, M30),
  // "stay22" (M29 map — muted for now), "off" (coming-soon note).
  const engine = process.env.NEXT_PUBLIC_HOTELS_ENGINE || "liteapi";
  const mapUrl = engine === "stay22" ? stay22MapUrl(search) : null;
  const liteSearch =
    engine === "liteapi" && search.destination && search.departureDate && search.returnDate
      ? {
          destination: search.destination,
          checkin: search.departureDate,
          checkout: search.returnDate,
          adults: Math.max(1, search.travelers?.adults ?? 1),
          children: Math.max(0, search.travelers?.children ?? 0),
          rooms: Math.max(1, rooms),
          currency: search.budget?.currency ?? "EUR",
        }
      : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <LiveResultsBand mode="hotels" initialForm={initialForm} />

      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Stays in {destination}</h1>
        <p className="text-sm text-slate-600">
          {dates} · {guests} {guests === 1 ? "guest" : "guests"} · {rooms} {rooms === 1 ? "room" : "rooms"}
          {search.budget?.amount ? ` · budget ${search.budget.currency} ${search.budget.amount}` : ""}
        </p>
      </header>

      {liteSearch ? (
        <LiveHotelsResults search={liteSearch} stayBudget={search.budget?.amount ?? null} cityName={destination} />
      ) : mapUrl ? (
        <section className="space-y-2" aria-labelledby="live-hotels-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="live-hotels-heading" className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Live hotel prices
            </h2>
            <p className="text-xs text-slate-500">
              Prices from Booking.com, Expedia, Vrbo and more via Stay22 · Glooconn may earn a commission
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <iframe
              src={mapUrl}
              title={`Hotels in ${destination} with live prices`}
              className="block h-[70vh] min-h-[520px] w-full border-0"
              allow="geolocation"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </section>
      ) : (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="hotels-soon">
        <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
          Live hotel prices · coming soon
        </p>
        <h2 id="hotels-soon" className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
          We&apos;re connecting live hotel prices
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Glooconn will show live hotel prices here, filtered to your budget. Until then, you can see stays for the
          same dates on Booking.com.
        </p>
        {bookingUrl && (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-6 text-sm font-bold text-white shadow-md shadow-brand-700/20 hover:bg-brand-800"
          >
            See stays on Booking.com
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </section>
      )}
    </div>
  );
}
