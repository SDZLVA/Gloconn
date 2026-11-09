/**
 * Milestone 53 — Omio (trains, buses, flights, ferries) for the Mixed
 * Transport tab. Omio's route pages take the dates in the URL (checked in a
 * browser, 2026-11-09):
 *   https://www.omio.com/trains/rome/florence?departure_date=20/11/2026&return_date=23/11/2026
 * opens Rome → Florence with both dates filled in; the traveller clicks Search.
 * The route uses lower-case English city names ("milan", "paris").
 *
 * Commission: the link goes through the Impact tracking link from the Omio
 * programme (NEXT_PUBLIC_OMIO_TRACKING_URL, e.g. https://omio.sjv.io/c/…/…/7385).
 * Without it, the plain Omio link is used (no commission, still works).
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

/** Wraps an omio.com URL in the Impact tracking link (`?u=` destination), when one is set. */
export function withOmioTracking(url: string, trackingBase: string | undefined = process.env.NEXT_PUBLIC_OMIO_TRACKING_URL): string {
  const base = trackingBase?.trim();
  if (!base || !/^https:\/\/[a-z0-9.-]+\/c\/\d+\/\d+\/\d+\/?$/i.test(base)) return url;
  return `${base.replace(/\/$/, "")}?u=${encodeURIComponent(url)}`;
}
