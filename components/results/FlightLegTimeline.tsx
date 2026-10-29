import { AirlineLogo, PlaneMark } from "@/components/results/AirlineLogo";
import { ResultDuration } from "@/components/results/ResultDuration";
import {
  arrivalDayOffset,
  legStopovers,
  legStops,
  type AirportNote,
} from "@/lib/results/flightLegs";
import { cn } from "@/lib/utils";
import type { FlightLeg } from "@/types/models/flight";

type FlightLegTimelineProps = {
  leg: FlightLeg;
  /** "Outbound" / "Return". */
  label: string;
  /** Stop count to use when the leg's airports are unknown. */
  fallbackStops?: number;
  /** Airport changes to flag on this leg. */
  notes?: readonly AirportNote[];
  className?: string;
};

const WEEKDAY_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function dayLabel(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? "" : WEEKDAY_DATE.format(date);
}

function clock(value: string | undefined): string | null {
  const match = /\d{2}:\d{2}$/.exec(value?.trim() ?? "");
  return match ? match[0] : null;
}

/**
 * One direction of a trip (Milestone 21): airline with logo, departure and
 * arrival times with airports, a route line showing door-to-door time and
 * each stopover, and any airport change the traveller must notice.
 * Anything unknown is left out — never filled with a guess.
 */
export function FlightLegTimeline({
  leg,
  label,
  fallbackStops,
  notes = [],
  className,
}: FlightLegTimelineProps) {
  const stops = legStops(leg, fallbackStops);
  const stopovers = legStopovers(leg);
  const departs = clock(leg.departureTime);
  const arrives = clock(leg.arrivalTime);
  const extraDays = arrivalDayOffset(leg);
  const from = leg.airports[0] || null;
  const to = leg.airports.at(-1) || null;

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
        <p className="flex items-center gap-2 text-xs">
          <span className="rounded-md bg-brand-50 px-2 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            {label}
          </span>
          <span className="font-medium text-slate-600">{dayLabel(leg.departureTime)}</span>
        </p>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            stops === 0 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900",
          )}
        >
          {stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="flex items-start gap-3 px-4 pb-3 pt-2">
        <AirlineLogo code={leg.airlineCode} name={leg.airline} />

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <div>
              <p className="text-xl font-bold tabular-nums text-slate-900">{departs ?? "—"}</p>
              <p className="text-sm font-semibold tracking-wide text-slate-600">{from ?? ""}</p>
            </div>

            {/* Route line: duration above, stopovers as marked points. */}
            <div className="flex min-w-0 flex-col items-center gap-1" aria-hidden="true">
              <ResultDuration
                minutes={leg.durationMinutes}
                className="text-xs font-medium text-slate-500"
              />
              <div className="relative flex w-full items-center">
                <span className="h-2 w-2 shrink-0 rounded-full border-2 border-brand-600 bg-white" />
                <span className="h-0.5 flex-1 rounded bg-gradient-to-r from-brand-200 to-brand-600" />
                <PlaneMark className="h-4 w-4 shrink-0 rotate-90 text-brand-700" />
                {stopovers.map((code, index) => (
                  <span
                    key={`${code}-${index}`}
                    className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500 ring-2 ring-white"
                    style={{ left: `${((index + 1) / (stopovers.length + 1)) * 100}%` }}
                  />
                ))}
              </div>
              <p className="truncate text-xs text-slate-500">
                {stopovers.length > 0 ? `via ${stopovers.join(", ")}` : stops === 0 ? "Non-stop" : " "}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold tabular-nums text-slate-900">
                {arrives ?? <span className="text-slate-300" title="Arrival time is shown on the partner site">—</span>}
                {arrives && extraDays > 0 && (
                  <sup className="ml-0.5 text-xs font-bold text-amber-700">+{extraDays}</sup>
                )}
              </p>
              <p className="text-sm font-semibold tracking-wide text-slate-600">{to ?? ""}</p>
            </div>
          </div>

          <p className="mt-1 truncate text-xs font-medium text-slate-500">
            {leg.airline ?? "Airline shown on the partner site"}
          </p>
          <p className="sr-only">
            {label}: {leg.airline ?? "airline not known"}, departs {departs ?? "unknown time"}
            {from ? ` from ${from}` : ""}, arrives {arrives ?? "at a time shown on the partner site"}
            {to ? ` at ${to}` : ""}
            {stopovers.length > 0 ? `, via ${stopovers.join(", ")}` : stops === 0 ? ", non-stop" : ""}.
          </p>
        </div>
      </div>

      {notes.length > 0 && (
        <ul className="space-y-1 border-t border-amber-100 bg-amber-50/70 px-4 py-2 text-xs font-medium text-amber-950">
          {notes.map((note) => (
            <li key={note.text} className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white"
              >
                !
              </span>
              {note.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
