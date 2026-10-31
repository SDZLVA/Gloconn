import type { FlightLinksResolver } from "@/lib/affiliate/exactFlightLinks";
import { memo } from "react";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { SampleDataBadge } from "@/components/results/SampleDataBadge";
import { ViewPackageLink } from "@/components/results/ViewPackageLink";
import { samplePackageNote } from "@/lib/results/sampleData";
import { formatPackagePriceBreakdownLabel, formatPackageStopsLabel } from "@/lib/results/packagesUi";
import { cn } from "@/lib/utils";
import type { PackageExplanation } from "@/lib/packages/explanations";
import type { TravelPackage } from "@/types/models/travel-package";

type TravelPackageCardProps = {
  package: TravelPackage;
  originIata?: string | null;
  destinationIata?: string | null;
  getFlightLinks?: FlightLinksResolver;
  explanation?: PackageExplanation | null;
  tripType?: "round-trip" | "one-way" | null;
  /** City shown on the picture tile (e.g. "Berlin"). */
  destinationName?: string;
};

/** "2026-11-10 06:55" or "06:55" → "06:55". */
function clock(value?: string): string {
  const match = /(\d{1,2}):(\d{2})/.exec(value ?? "");
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "";
}

function duration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}

function scoreWord(score: number): string {
  if (score >= 9) return "Superb";
  if (score >= 8.5) return "Excellent";
  if (score >= 8) return "Very good";
  if (score >= 7) return "Good";
  return "Pleasant";
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

/** Badge colours per role (Recommended, Best value / Fits your budget, Fastest …). */
function badgeTone(role?: string): string {
  if (role === "recommended") return "bg-emerald-600";
  if (role === "fastest") return "bg-violet-600";
  return "bg-brand-700";
}

/**
 * Milestone 32 — package card from the redesign: picture tile with the role
 * badge, the flight (logo, times, route · stops · duration), the hotel
 * (stars, review score) and a tinted price panel with "View package".
 */
function TravelPackageCardComponent({
  package: travelPackage,
  originIata,
  destinationIata,
  getFlightLinks,
  explanation = null,
  tripType = "round-trip",
  destinationName,
}: TravelPackageCardProps) {
  const { flight, hotel, totalPrice, currency, nights, id } = travelPackage;
  const from = flight.originAirport ?? originIata ?? "";
  const to = flight.destinationAirport ?? destinationIata ?? "";
  const depart = clock(flight.departureTime);
  const arrive = clock(flight.arrivalTime);
  const routeBits = [from && to ? `${from} → ${to}` : "", formatPackageStopsLabel(flight.stops), duration(flight.durationMinutes)].filter(Boolean);
  const sampleNote = samplePackageNote(flight.isSample, hotel.isSample);
  const headingId = `${id}-title`;
  // Glooconn hotel ratings are out of 5; the redesign shows guest scores out of 10.
  const score = hotel.rating > 0 ? (hotel.rating <= 5 ? hotel.rating * 2 : hotel.rating) : 0;

  return (
    <article
      aria-labelledby={headingId}
      className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm motion-safe:transition-shadow hover:shadow-md md:grid-cols-[170px_minmax(0,1fr)_200px]"
    >
      <div className="relative min-h-[140px] bg-gradient-to-br from-brand-700 via-brand-600 to-sky-400">
        <svg viewBox="0 0 120 80" className="absolute inset-x-0 bottom-0 h-3/4 w-full text-white/25" fill="currentColor" aria-hidden="true">
          <path d="M0 80V52h10V38h8v14h8V30h12v22h6V20l8-8 8 8v32h6V36h10v16h8V44h10v36Z" />
        </svg>
        {explanation && (
          <span className={cn("absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-bold text-white shadow", badgeTone(explanation.role))}>
            {explanation.label}
          </span>
        )}
        {destinationName && (
          <span className="absolute bottom-3 left-3 text-sm font-bold text-white drop-shadow">{destinationName}</span>
        )}
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <AirlineLogo code={flight.airlineCode} name={flight.airline} className="h-8 w-8 rounded-lg" />
            <h3 id={headingId} className="truncate text-sm font-semibold text-slate-800">
              {flight.airline}
            </h3>
          </div>
          {depart && (
            <p className="text-xl font-extrabold text-slate-900">
              {depart}
              {arrive && <span className="text-slate-400"> → </span>}
              {arrive}
            </p>
          )}
          <p className="text-xs text-slate-500">{routeBits.join(" · ")}</p>
          {tripType === "round-trip" && flight.returnDepartureTime && (
            <p className="text-xs text-slate-500">Return {clock(flight.returnDepartureTime)}</p>
          )}
        </div>

        <div className="flex min-w-0 gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 20V9l9-5 9 5v11M9 20v-6h6v6" />
            </svg>
          </span>
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-bold text-slate-900">{hotel.name}</p>
            {hotel.stars > 0 ? (
              <p className="text-sm leading-none text-amber-500" aria-label={`${hotel.stars} stars`}>
                {"★".repeat(Math.round(hotel.stars))}
              </p>
            ) : (
              <p className="text-xs text-slate-500">Unrated</p>
            )}
            {score > 0 && (
              <p className="flex items-center gap-1.5 text-xs">
                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">{score.toFixed(1)}</span>
                <span className="font-semibold text-emerald-700">{scoreWord(score)}</span>
              </p>
            )}
            <p className="truncate text-xs text-slate-500">{hotel.location}</p>
            {explanation?.reason?.trim() && <p className="text-xs font-medium text-brand-700">{explanation.reason.trim()}</p>}
          </div>
        </div>
        {sampleNote && (
          <div className="sm:col-span-2">
            <SampleDataBadge />
          </div>
        )}
      </div>

      <div className="flex flex-row items-center justify-between gap-3 border-t border-slate-100 bg-brand-50/70 p-4 md:flex-col md:items-stretch md:justify-center md:border-l md:border-t-0">
        <div>
          <p className="text-2xl font-extrabold text-slate-900">{formatMoney(totalPrice, currency)}</p>
          <p className="text-xs font-semibold text-slate-600">est. total</p>
          <p className="text-[11px] leading-snug text-slate-500">{formatPackagePriceBreakdownLabel(nights)}</p>
        </div>
        <ViewPackageLink
          package={travelPackage}
          explanation={explanation}
          originIata={originIata}
          destinationIata={destinationIata}
          getFlightLinks={getFlightLinks}
          tripType={tripType}
          className="w-auto md:w-full"
        />
      </div>
    </article>
  );
}

export const TravelPackageCard = memo(TravelPackageCardComponent);
