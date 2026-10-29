/**
 * Readable flight date-times (Milestone 19).
 *
 * Providers deliver "YYYY-MM-DD HH:MM" in local airport time. Shown raw it
 * reads like a database ("2026-11-23 19:05"); this renders
 * "Mon 23 Nov · 19:05". Computed in UTC so the viewer's own time zone can
 * never shift the date. Anything else (e.g. mock "14:40") passes through.
 */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PATTERN = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;

export function formatFlightDateTime(value: string): string {
  const match = PATTERN.exec(value?.trim() ?? "");
  if (!match) {
    return value;
  }
  const [, y, m, d, hh, mm] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (Number.isNaN(date.getTime()) || date.getUTCDate() !== Number(d)) {
    return value;
  }
  return `${DAYS[date.getUTCDay()]} ${Number(d)} ${MONTHS[date.getUTCMonth()]} · ${hh}:${mm}`;
}
