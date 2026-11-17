/**
 * Milestone 61 — a Google Flights link that opens the EXACT flight, not the
 * route search. Google keeps the search in the `tfs` parameter (a small
 * protobuf, base64url). Adding the chosen flight's segments to the outbound
 * leg (field 4: from, date, to, airline, flight number) makes Google open
 * with that flight already selected: one-way → its booking options, round
 * trip → "Choose return" for that outbound flight. Checked by hand on
 * 2026-11-17 (LHR→AMS BA438 opened selected).
 */

export type GoogleSegment = { from: string; date: string; to: string; airline: string; number: string };

export type GoogleLinkSearch = {
  departureDate: string;
  returnDate: string | null;
  adults: number;
  children: number;
  infants: number;
  currency: string;
};

const enc = new TextEncoder();
const varint = (n: number): number[] => {
  const out: number[] = [];
  let v = n >>> 0;
  while (v > 127) {
    out.push((v & 127) | 128);
    v >>>= 7;
  }
  out.push(v);
  return out;
};
const key = (field: number, wire: number) => varint((field << 3) | wire);
const num = (field: number, n: number) => [...key(field, 0), ...varint(n)];
const bytes = (field: number, b: number[]) => [...key(field, 2), ...varint(b.length), ...b];
const str = (field: number, s: string) => bytes(field, [...enc.encode(s)]);
const airport = (field: number, code: string) => bytes(field, [...num(1, 1), ...str(2, code)]);

function leg(date: string, from: string, to: string, segments: GoogleSegment[]): number[] {
  return bytes(3, [
    ...str(2, date),
    ...segments.flatMap((s) => bytes(4, [...str(1, s.from), ...str(2, s.date), ...str(3, s.to), ...str(5, s.airline), ...str(6, s.number)])),
    ...airport(13, from),
    ...airport(14, to),
  ]);
}

function base64url(data: number[]): string {
  let binary = "";
  for (const b of data) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const IATA = /^[A-Z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** "BA 438" → { airline: "BA", number: "438" }; null when it can't be read. */
export function splitFlightNumber(value: string | null | undefined): { airline: string; number: string } | null {
  const m = /^\s*([A-Z0-9]{2})\s*0*(\d{1,4})\s*$/.exec((value ?? "").toUpperCase());
  return m ? { airline: m[1], number: m[2] } : null;
}

/** Google Flights link with the outbound flight selected; null if a segment can't be encoded. */
export function googleExactFlightUrl(search: GoogleLinkSearch, segments: GoogleSegment[]): string | null {
  if (segments.length === 0) return null;
  const ok = segments.every((s) => IATA.test(s.from) && IATA.test(s.to) && DATE.test(s.date) && /^[A-Z0-9]{2}$/.test(s.airline) && /^\d{1,4}$/.test(s.number));
  if (!ok || !DATE.test(search.departureDate)) return null;
  const from = segments[0].from;
  const to = segments[segments.length - 1].to;
  const data = [
    // Fields 1, 2 and 14 copied from Google's own links.
    ...num(1, 28),
    ...num(2, 2),
    ...leg(search.departureDate, from, to, segments),
    ...(search.returnDate && DATE.test(search.returnDate) ? leg(search.returnDate, to, from, []) : []),
    // Passengers: 1 adult, 2 child, 4 infant on lap.
    ...Array.from({ length: Math.max(1, search.adults) }, () => num(8, 1)).flat(),
    ...Array.from({ length: Math.max(0, search.children) }, () => num(8, 2)).flat(),
    ...Array.from({ length: Math.max(0, search.infants) }, () => num(8, 4)).flat(),
    ...num(9, 1), // economy
    ...num(14, 1),
    ...num(19, search.returnDate ? 1 : 2), // 1 round trip, 2 one-way
  ];
  const params = new URLSearchParams({ hl: "en", gl: "us", curr: search.currency, tfs: base64url(data), tfu: "EgIIAQ" });
  return `https://www.google.com/travel/flights?${params.toString()}`;
}
