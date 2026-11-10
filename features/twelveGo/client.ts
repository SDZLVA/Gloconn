import "server-only";

/**
 * Milestone 55 — 12Go partner timetable (agent.12go.asia → Timetable).
 * Same request as 12Go's own get12GoTimetable() PHP library:
 *   https://12go.asia/en/timetable/{COUNTRY}/{From}/{To}?embedded&css=no&z={agent}&lang=en&currency=EUR
 * 12Go's library caches answers for 24 h; so do we.
 */

import { parseTwelveGoTimetable, type TwelveGoRoute } from "@/features/twelveGo/parse";

/** Glooconn's 12Go affiliate (agent) id — public, it is in every partner link. */
export const TWELVEGO_AGENT = "17465383";
const TTL_MS = 24 * 60 * 60_000;
const cache = new Map<string, { at: number; routes: TwelveGoRoute[] }>();

const slug = (city: string) => city.trim().replace(/\s+/g, "-");

export async function getTwelveGoTimetable(input: {
  country: string;
  from: string;
  to: string;
  currency: string;
}): Promise<TwelveGoRoute[]> {
  const url =
    `https://12go.asia/en/timetable/${encodeURIComponent(input.country)}/${encodeURIComponent(slug(input.from))}/${encodeURIComponent(slug(input.to))}` +
    `?embedded&css=no&z=${TWELVEGO_AGENT}&lang=en&currency=${encodeURIComponent(input.currency)}`;
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.routes;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, { signal: controller.signal, next: { revalidate: 86_400 } });
    if (!response.ok) return [];
    const routes = parseTwelveGoTimetable(await response.text());
    cache.set(url, { at: Date.now(), routes });
    if (cache.size > 500) cache.delete(cache.keys().next().value!);
    return routes;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
