import { buildAviasalesSearchUrl } from "@/lib/affiliate/aviasalesLink";
import { AVIASALES_OUT_PATH } from "@/lib/affiliate/exactFlightLinks";

/** Milestone 49: White Label is off by default; NEXT_PUBLIC_WHITELABEL=on brings the live box back. */
export const WHITE_LABEL_ON = process.env.NEXT_PUBLIC_WHITELABEL === "on";

type Props = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
  adults: number;
  kids: number;
  infants: number;
};

/**
 * Milestone 49 — shown instead of the White Label box when no source has a
 * price for these dates: a plain message and the same search on Aviasales.
 */
export function NoFlightPrices({ kids, ...rest }: Props) {
  const url = buildAviasalesSearchUrl({ ...rest, children: kids });
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-700">
      <p className="font-semibold text-slate-900">No flight prices found for these dates yet.</p>
      <p>Try a day earlier or later, or see today&apos;s prices for these exact dates on Aviasales.</p>
      {url && (
        <a
          href={`${AVIASALES_OUT_PATH}?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800"
        >
          Search these flights on Aviasales ↗
        </a>
      )}
    </div>
  );
}
