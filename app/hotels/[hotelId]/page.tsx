import Link from "next/link";
import { headers } from "next/headers";
import { AmenityIcon, topAmenities } from "@/components/hotel/AmenityIcon";
import { HotelGallery } from "@/components/hotel/HotelGallery";
import { HotelLocationMap } from "@/components/hotel/HotelLocationMap";
import { formatMoney } from "@/lib/money";
import { nightsBetween, ratingLabel } from "@/features/liveHotels/filters";
import { searchLiteApiHotels } from "@/features/liveHotels/liteapi/client";
import { getLiteApiHotelDetails } from "@/features/liveHotels/liteapi/details";
import { whitelabelOccupancies } from "@/features/liveHotels/occupancies";
import type { LiveHotel } from "@/features/liveHotels/types";
import { formatShortDate } from "@/lib/calendar/dates";

type HotelPageProps = {
  params: Promise<{ hotelId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const int = (v: string, d: number, min: number, max: number) => {
  const n = Number(v || d);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : d;
};

export const metadata = { robots: { index: false } };

/**
 * Milestone 33 — hotel page from the redesign: gallery, name, stars and
 * score, address, small map, price box with the booking button (LiteAPI
 * white-label), top amenities and the description. Data: LiteAPI hotel
 * details + a rates search for this one hotel (both free).
 */
export default async function HotelPage({ params, searchParams }: HotelPageProps) {
  const { hotelId } = await params;
  const q = await searchParams;
  const checkin = one(q.checkin);
  const checkout = one(q.checkout);
  const hasDates = ISO.test(checkin) && ISO.test(checkout) && checkout > checkin;
  const adults = int(one(q.adults), 2, 1, 16);
  const children = int(one(q.children), 0, 0, 10);
  const rooms = int(one(q.rooms), 1, 1, 8);
  const currency = /^[A-Z]{3}$/.test(one(q.currency)) ? one(q.currency) : "EUR";
  const back = one(q.back);
  const backHref = back.startsWith("/search/results") ? back : null;

  const country = (await headers()).get("x-vercel-ip-country") ?? "";
  const nationality = /^[A-Z]{2}$/.test(country) ? country : "US";

  const [{ details, raw }, rateResult] = await Promise.all([
    getLiteApiHotelDetails(hotelId),
    hasDates
      ? searchLiteApiHotels({ checkin, checkout, adults, children, rooms, currency }, { hotelIds: [hotelId] }, nationality).catch(() => null)
      : Promise.resolve(null),
  ]);
  const offer: LiveHotel | null = rateResult?.hotels[0] ?? null;
  const nights = hasDates ? nightsBetween(checkin, checkout) : 1;

  if (process.env.VERCEL_ENV === "preview" && one(q.debug) === "1") {
    const data = (raw as { data?: Record<string, unknown> } | null)?.data ?? {};
    return <pre className="whitespace-pre-wrap text-xs">{JSON.stringify({ keys: Object.keys(data), sample: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, JSON.stringify(v)?.slice(0, 300)])), mapped: details, offer }, null, 2)}</pre>;
  }

  if (!details) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">We couldn&apos;t load this hotel</h1>
        <p className="text-slate-600">It may be temporarily unavailable. Please go back and choose another stay.</p>
        <Link href={backHref ?? "/?mode=hotels"} className="inline-flex rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white">
          Back to results
        </Link>
      </div>
    );
  }

  const whitelabel = process.env.NEXT_PUBLIC_LITEAPI_WHITELABEL_URL?.trim().replace(/\/$/, "");
  const bookingUrl =
    whitelabel && hasDates
      ? `${whitelabel}/hotels/${encodeURIComponent(hotelId)}?${new URLSearchParams({
          checkin,
          checkout,
          occupancies: whitelabelOccupancies(adults, children, rooms),
          currency,
          language: "en",
        }).toString()}`
      : null;

  const pin: LiveHotel = offer ?? {
    id: details.id,
    name: details.name,
    photo: null,
    address: details.address,
    stars: details.stars,
    rating: details.rating,
    reviewCount: details.reviewCount,
    latitude: details.latitude,
    longitude: details.longitude,
    totalPrice: 0,
    currency,
    roomName: null,
    boardName: null,
    refundable: false,
    offerId: null,
  };
  const mapHotel: LiveHotel = { ...pin, latitude: details.latitude ?? pin.latitude, longitude: details.longitude ?? pin.longitude };
  const rating = details.rating ?? offer?.rating ?? null;
  const reviews = details.reviewCount ?? offer?.reviewCount ?? null;
  const address = [details.address, details.city, details.country].filter(Boolean).join(", ");
  const amenities = topAmenities(details.facilities);
  const paragraphs = (details.description ?? "").split(/\n\n+/).filter(Boolean).slice(0, 6);

  return (
    <div className="space-y-6">
      {backHref && (
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900">
          ← Back to results
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <HotelGallery images={details.images} name={details.name} />

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-900">{details.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {details.stars > 0 && <span className="text-amber-500" aria-label={`${details.stars} stars`}>{"★".repeat(details.stars)}</span>}
              {rating !== null && (
                <span className="flex items-center gap-1.5">
                  <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">{rating.toFixed(1)}</span>
                  <span className="font-semibold text-emerald-700">{ratingLabel(rating)}</span>
                  {reviews ? <span className="text-slate-500">({reviews.toLocaleString("en-US")} reviews)</span> : null}
                </span>
              )}
            </div>
            {address && <p className="text-sm text-slate-600">📍 {address}</p>}
          </div>

          {amenities.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Top amenities</h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-slate-700 sm:grid-cols-3">
                {amenities.map((name) => (
                  <li key={name} className="flex items-center gap-2">
                    <AmenityIcon name={name} className="h-5 w-5 shrink-0 text-slate-500" />
                    {name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {paragraphs.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">About this stay</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <HotelLocationMap hotel={mapHotel} nights={nights} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {offer ? (
              <>
                <p className="text-3xl font-extrabold text-slate-900">{formatMoney(offer.totalPrice / nights, offer.currency)}</p>
                <p className="text-sm text-slate-500">per night · {rooms} {rooms === 1 ? "room" : "rooms"}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {formatMoney(offer.totalPrice, offer.currency)} total for {nights} {nights === 1 ? "night" : "nights"}
                  {hasDates ? ` (${formatShortDate(checkin)} – ${formatShortDate(checkout)})` : ""}
                </p>
                {offer.roomName && <p className="mt-1 text-sm text-slate-600">{offer.roomName}{offer.boardName ? ` · ${offer.boardName}` : ""}</p>}
                {offer.refundable && <p className="mt-1 text-sm font-semibold text-emerald-700">✓ Free cancellation</p>}
              </>
            ) : (
              <p className="text-sm text-slate-600">
                {hasDates ? "No rooms available for these dates." : "Choose your dates to see prices."}
              </p>
            )}
            {bookingUrl && offer && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-bold text-white shadow-md shadow-brand-700/20 hover:bg-brand-800"
              >
                Check availability & book ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            <p className="mt-3 text-xs text-slate-500">You&apos;ll book on our partner&apos;s secure site. Prices and availability may change.</p>
          </div>

          {(details.checkin || details.checkout) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
              {details.checkin && <p>Check-in from <strong>{details.checkin}</strong></p>}
              {details.checkout && <p>Check-out until <strong>{details.checkout}</strong></p>}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
