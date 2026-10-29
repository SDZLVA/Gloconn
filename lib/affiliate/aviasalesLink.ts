/**
 * Aviasales search links (Milestone 19).
 *
 * Format verified in a browser on 2026-10-29, since the Travelpayouts
 * article on Aviasales links leaves the domain blank:
 *   https://www.aviasales.com/search/MIL2311PAR28111 → "MIL ⇄ PAR, 23.11 – 28.11", 1 pax
 *   …/MIL2311PAR281121 → 3 pax (2 adults + 1 child)
 *   …/MIL2311PAR1      → one-way "MIL → PAR, 23.11"
 * i.e. ORIGIN + DDMM + DESTINATION + [DDMM] + adults [+ children [+ infants]].
 * City codes (MIL, PAR) search every airport in the city.
 *
 * This is a plain brand link. Travelpayouts documents that a partner ID
 * cannot simply be appended to these links, so attribution goes through
 * the link-creation API (partnerLinksApi.ts).
 */

const IATA = /^[A-Z]{3}$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export type AviasalesSearch = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string | null;
  adults: number;
  children?: number;
  infants?: number;
};

function ddmm(iso: string): string | null {
  const match = ISO_DATE.exec(iso);
  if (!match) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return null;
  return `${match[3]}${match[2]}`;
}

function count(value: number | undefined, min: number): number | null {
  const n = value ?? 0;
  return Number.isInteger(n) && n >= min && n <= 9 ? n : null;
}

/** Builds an aviasales.com search link, or null when any input is unusable. */
export function buildAviasalesSearchUrl(search: AviasalesSearch): string | null {
  const origin = search.origin?.trim().toUpperCase() ?? "";
  const destination = search.destination?.trim().toUpperCase() ?? "";
  if (!IATA.test(origin) || !IATA.test(destination) || origin === destination) return null;

  const out = ddmm(search.departureDate ?? "");
  if (!out) return null;

  let back = "";
  if (search.returnDate) {
    const parsed = ddmm(search.returnDate);
    if (!parsed || search.returnDate < search.departureDate) return null;
    back = parsed;
  }

  const pax = paxSegment(search);
  if (pax === null) return null;

  return `${AVIASALES_ORIGIN}/search/${origin}${out}${destination}${back}${pax}`;
}

const AVIASALES_ORIGIN = "https://www.aviasales.com";

type Passengers = Pick<AviasalesSearch, "adults" | "children" | "infants">;

/** adults [+ children [+ infants]], e.g. "1", "21", "201". Null when invalid. */
function paxSegment(passengers: Passengers): string | null {
  const adults = count(passengers.adults, 1);
  const children = count(passengers.children, 0);
  const infants = count(passengers.infants, 0);
  if (adults === null || children === null || infants === null) return null;
  if (infants > adults || adults + children > 9) return null;

  let pax = String(adults);
  if (children > 0 || infants > 0) pax += String(children);
  if (infants > 0) pax += String(infants);
  return pax;
}

/** "/search/MIL2311PAR28111" → route + dates, and the passenger digits. */
const TICKET_PATH = /^\/search\/([A-Z]{3}\d{4}[A-Z]{3}(?:\d{4})?)(\d{1,3})$/;

/**
 * Milestone 20: the page for ONE exact ticket on aviasales.com.
 *
 * Each Data API ticket carries `link`, e.g.
 *   /search/MIL2311PAR28111?t=FR1795…&search_date=…&expected_price=…
 * The `t` code identifies that exact flight (or flight pair), so the page
 * opens on it instead of the general results. The cached search behind the
 * link was for one passenger, so the passenger digits are replaced with the
 * traveller's own; the ticket code and everything else are kept unchanged.
 *
 * Returns null for anything that is not an aviasales.com ticket path — the
 * value is external input and becomes a link on our page.
 */
export function buildAviasalesTicketUrl(
  link: string | undefined,
  passengers: Passengers,
): string | null {
  const raw = typeof link === "string" ? link.trim() : "";
  const queryStart = raw.indexOf("?");
  if (queryStart <= 0) return null;

  const path = raw.slice(0, queryStart);
  const query = raw.slice(queryStart + 1);
  const match = TICKET_PATH.exec(path);
  if (!match) return null;

  const params = new URLSearchParams(query);
  const ticket = params.get("t") ?? "";
  if (!/^[A-Za-z0-9_-]{8,600}$/.test(ticket)) return null;

  const pax = paxSegment(passengers);
  if (pax === null) return null;

  return `${AVIASALES_ORIGIN}/search/${match[1]}${pax}?${params.toString()}`;
}

/** True for an exact-ticket URL produced by buildAviasalesTicketUrl. */
export function isAviasalesTicketUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return (
    url.protocol === "https:" &&
    url.hostname === "www.aviasales.com" &&
    url.port === "" &&
    url.username === "" &&
    url.password === "" &&
    TICKET_PATH.test(url.pathname) &&
    /^[A-Za-z0-9_-]{8,600}$/.test(url.searchParams.get("t") ?? "")
  );
}
