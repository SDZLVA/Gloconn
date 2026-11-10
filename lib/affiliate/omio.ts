/**
 * Milestone 53 — Omio (trains, buses, flights, ferries) for the Mixed
 * Transport tab. Omio's route pages take the dates in the URL (checked in a
 * browser, 2026-11-09):
 *   https://www.omio.com/trains/rome/florence?departure_date=20/11/2026&return_date=23/11/2026
 * opens Rome → Florence with both dates filled in; the traveller clicks Search.
 * The route uses lower-case English city names ("milan", "paris").
 *
 * Commission: the link goes through Glooconn's Impact tracking link for the
 * Omio Travel Partner Program (created in Impact → Create a link, 2026-11-09).
 * NEXT_PUBLIC_OMIO_TRACKING_URL can override it.
 */

export type OmioMode = "trains" | "buses" | "flights";

export type OmioSearch = {
  from: string;
  to: string;
  mode: OmioMode;
  departureDate: string;
  returnDate?: string | null;
};

/** "Milan, Italy" → "milan"; "São Paulo" → "sao-paulo". Empty when unusable. */
export function omioSlug(label: string): string {
  return (label.split(",")[0] ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "2026-11-20" → "20/11/2026" (Omio's date format). */
function omioDate(iso: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}

/** The Omio route page with dates, or null when a city or date is missing. */
export function buildOmioUrl(search: OmioSearch): string | null {
  const from = omioSlug(search.from);
  const to = omioSlug(search.to);
  const out = omioDate(search.departureDate);
  if (!from || !to || from === to || !out) return null;
  const params = [`departure_date=${out}`];
  const back = omioDate(search.returnDate);
  if (back && (search.returnDate ?? "") >= search.departureDate) params.push(`return_date=${back}`);
  return `https://www.omio.com/${search.mode}/${from}/${to}?${params.join("&")}`;
}

/** Impact tracking link: partner 8134530, ad 409973, Omio program 7385 (public, not a secret). */
export const OMIO_TRACKING_URL = "https://omio.sjv.io/c/8134530/409973/7385";

/** Wraps an omio.com URL in the Impact tracking link (`?u=` destination). */
export function withOmioTracking(url: string, trackingBase: string | undefined = process.env.NEXT_PUBLIC_OMIO_TRACKING_URL || OMIO_TRACKING_URL): string {
  const base = trackingBase?.trim();
  if (!base || !/^https:\/\/[a-z0-9.-]+\/c\/\d+\/\d+\/\d+\/?$/i.test(base)) return url;
  return `${base.replace(/\/$/, "")}?u=${encodeURIComponent(url)}`;
}

/**
 * Milestone 54 — Omio's official tracked redirect link (Omio Affiliate Tools →
 * "Redirect link", 2026-11-10). It opens Omio's real search results for the
 * route, dates and travel mode — not just a route page:
 *   https://omio.sjv.io/c/{partner}/4057579/7385?u=<https://www.omio.com/links/626fa8a9-…?departurePosTerm=Rome&arrivalPosTerm=Florence&departureDate=2026-11-20>
 * Tested: Rome → Florence 20–23 Nov TRAIN landed on Omio's train results with tracking.
 */
export const OMIO_RESULTS_LINK = "https://www.omio.com/links/626fa8a9-f982-43d0-ace9-9a13f6b14612";
export const OMIO_RESULTS_TRACKING = "https://omio.sjv.io/c/8134530/4057579/7385";

export type OmioTravelMode = "TRAIN" | "BUS" | "FLIGHT" | "FERRY";

export type OmioResultsSearch = {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string | null;
  travelMode?: OmioTravelMode | null;
  currency?: string | null;
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Omio's results for a route and dates, through Glooconn's tracking. Null when a city or date is missing. */
export function buildOmioResultsLink(search: OmioResultsSearch): string | null {
  const from = (search.from.split(",")[0] ?? "").trim();
  const to = (search.to.split(",")[0] ?? "").trim();
  if (!from || !to || from.toLowerCase() === to.toLowerCase() || !ISO.test(search.departureDate)) return null;
  const params = new URLSearchParams({ departurePosTerm: from, arrivalPosTerm: to, departureDate: search.departureDate });
  if (search.returnDate && ISO.test(search.returnDate) && search.returnDate >= search.departureDate) params.set("returnDate", search.returnDate);
  if (search.travelMode) params.set("travelMode", search.travelMode);
  if (search.currency && /^[A-Z]{3}$/.test(search.currency)) params.set("currency", search.currency);
  params.set("locale", "en");
  return `${OMIO_RESULTS_TRACKING}?u=${encodeURIComponent(`${OMIO_RESULTS_LINK}?${params.toString()}`)}`;
}
