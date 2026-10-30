import { formatMoney } from "@/components/live/hotels/HotelsTileMap";
import { ratingLabel } from "@/features/liveHotels/filters";
import type { LiveHotel } from "@/features/liveHotels/types";
import { cn } from "@/lib/utils";

type LiveHotelCardProps = {
  hotel: LiveHotel;
  nights: number;
  guestsLabel: string;
  bookingUrl: string | null;
  onShowOnMap?: () => void;
  highlighted?: boolean;
};

/** Milestone 30 — one hotel, Booking.com-style layout in Glooconn's look. */
export function LiveHotelCard({ hotel, nights, guestsLabel, bookingUrl, onShowOnMap, highlighted }: LiveHotelCardProps) {
  return (
    <article
      id={`hotel-${hotel.id}`}
      className={cn(
        "grid gap-4 rounded-2xl border bg-white p-3 shadow-sm motion-safe:transition-shadow hover:shadow-md sm:grid-cols-[220px_minmax(0,1fr)] sm:p-4",
        highlighted ? "border-brand-700 ring-2 ring-brand-100" : "border-slate-200",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 sm:aspect-auto sm:h-full sm:min-h-[200px]">
        {hotel.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hotel.photo} alt={hotel.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">No photo</div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h3 className="text-lg font-bold leading-snug text-brand-800">
            {hotel.name}
            {hotel.stars > 0 && (
              <span className="ml-2 align-middle text-sm tracking-tight text-amber-500" aria-label={`${hotel.stars} stars`}>
                {"★".repeat(hotel.stars)}
              </span>
            )}
          </h3>
          {hotel.address && <p className="text-sm text-slate-600">{hotel.address}</p>}
          {onShowOnMap && hotel.latitude !== null && (
            <button type="button" onClick={onShowOnMap} className="text-sm font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-900">
              Show on map
            </button>
          )}
          {hotel.roomName && <p className="pt-1 text-sm font-semibold text-slate-900">{hotel.roomName}</p>}
          {hotel.boardName && <p className="text-sm text-slate-600">{hotel.boardName}</p>}
          {hotel.refundable && <p className="text-sm font-semibold text-emerald-700">✓ Free cancellation</p>}
        </div>

        <div className="flex shrink-0 flex-row items-end justify-between gap-3 sm:w-48 sm:flex-col sm:items-end">
          {hotel.rating !== null ? (
            <div className="flex items-center gap-2 sm:order-none">
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-slate-900">{ratingLabel(hotel.rating)}</p>
                {hotel.reviewCount ? <p className="text-xs text-slate-500">{hotel.reviewCount} reviews</p> : null}
              </div>
              <span className="rounded-lg rounded-bl-none bg-brand-800 px-2 py-1.5 text-sm font-bold text-white">
                {hotel.rating.toFixed(1)}
              </span>
            </div>
          ) : (
            <span />
          )}
          <div className="text-right">
            <p className="text-xs text-slate-500">
              {nights} {nights === 1 ? "night" : "nights"}, {guestsLabel}
            </p>
            <p className="text-2xl font-extrabold text-slate-900">{formatMoney(hotel.totalPrice, hotel.currency)}</p>
            <p className="text-xs text-slate-500">{formatMoney(hotel.totalPrice / nights, hotel.currency)} per night · incl. taxes</p>
            {bookingUrl ? (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-800"
              >
                See availability ›<span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">Online booking coming soon</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
