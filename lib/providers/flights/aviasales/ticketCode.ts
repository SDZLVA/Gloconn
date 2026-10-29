/**
 * Aviasales ticket code → flight legs (Milestone 21).
 *
 * The Data API gives departure times but no arrival times, no return
 * airports and no stopover airports. Each ticket's `link` carries a `t`
 * code that does — observed on 47 real tickets (MIL⇄PAR, 2026-10-29),
 * not documented by Travelpayouts:
 *
 *   FR 1795448700 1795454400 000095 MXPBVA  1795872300 1795877700 000090 BVABGY _<hash>_<n>
 *   └┬┘└────┬───┘ └────┬───┘ └─┬──┘ └─┬──┘  (return leg, same layout)
 *  carrier  depart      arrive   minutes  airports: origin [stops…] destination
 *           LOCAL wall-clock time written as Unix seconds; minutes = door to door
 *
 * The numbers are NOT real UTC instants: 1795448700 read as UTC is
 * 2026-11-23 15:45, and that Ryanair flight leaves MXP at 15:45 local
 * (aviasales.com, 2026-10-29), while departure_at says 15:45+01:00. So each
 * time is the local clock at its own airport, and the gap between them
 * differs from `minutes` by the time-zone difference on routes that cross
 * zones. The departure is cross-checked against departure_at's local time.
 *
 * The leading carrier is NOT reliably either leg's airline (an easyJet
 * outbound + Ryanair return is coded "U2…" or "FR…"), so it is ignored
 * here. Because the format is undocumented, every parsed leg is
 * cross-checked against the documented fields (departure instant, airports,
 * stop count); any mismatch discards the parse and the card shows only the
 * documented data, as before.
 */

export type TicketCodeLeg = {
  departUnix: number;
  arriveUnix: number;
  /** Door-to-door minutes, including any stopover. */
  minutes: number;
  /** Origin, stopovers…, destination (IATA). */
  airports: string[];
};

const LEG = /(\d{10})(\d{10})(\d{6})((?:[A-Z]{3}){2,6})/g;
const CODE = /^[A-Z0-9]{2}((?:\d{26}(?:[A-Z]{3}){2,6}){1,2})_/;

/** Splits a ticket code into legs, or null when it does not fit the format. */
export function parseTicketCode(code: string | null | undefined): TicketCodeLeg[] | null {
  const match = CODE.exec(code ?? "");
  if (!match) return null;

  const legs: TicketCodeLeg[] = [];
  for (const leg of match[1].matchAll(LEG)) {
    const departUnix = Number(leg[1]);
    const arriveUnix = Number(leg[2]);
    const minutes = Number(leg[3]);
    // Local clocks: the gap may differ from the real duration by the
    // time-zone difference — a whole number of quarter hours, at most 14 h.
    const zoneShift = (arriveUnix - departUnix) / 60 - minutes;
    if (!(minutes > 0) || zoneShift % 15 !== 0 || Math.abs(zoneShift) > 14 * 60) {
      return null;
    }
    legs.push({ departUnix, arriveUnix, minutes, airports: leg[4].match(/[A-Z]{3}/g) ?? [] });
  }
  return legs.length > 0 ? legs : null;
}

/** A ticket-code wall-clock time → "YYYY-MM-DD HH:MM" (no zone maths). */
export function formatWallClock(seconds: number): string {
  const iso = new Date(seconds * 1000).toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}
