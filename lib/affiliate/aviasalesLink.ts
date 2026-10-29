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

  const adults = count(search.adults, 1);
  const children = count(search.children, 0);
  const infants = count(search.infants, 0);
  if (adults === null || children === null || infants === null) return null;
  if (infants > adults || adults + children > 9) return null;

  let pax = String(adults);
  if (children > 0 || infants > 0) pax += String(children);
  if (infants > 0) pax += String(infants);

  return `https://www.aviasales.com/search/${origin}${out}${destination}${back}${pax}`;
}
