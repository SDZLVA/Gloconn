/**
 * Milestone 55 — 12Go partner timetable (official: agent.12go.asia → Timetable,
 * the "get12GoTimetable" service) → Glooconn data. Pure, tested.
 *
 * The service answers HTML like:
 *   <table class="one2go-timetable">
 *     <td class="one2go-route-name"><a href="https://12go.asia/en/bus/bangkok/chiang-mai?z=…&curr=EUR">Bus Bangkok - Chiang Mai</a>
 *       <span class="one2go-route-price">€ 17.37–27.12</span><span class="one2go-route-duration">8h 55m – 17h 21m</span>
 *     <td class="one2go-trips"><ul><li><span class="one2go-class">VIP</span><span class="one2go-departures">16:00, 18:30</span></li>…
 * Each city pair sits in <div class="one2go-route-container"> with a
 * <div class="one2go-route-header"> ("Bangkok - Chiang Mai") above its table.
 */

export type TwelveGoMode = "train" | "bus" | "avia" | "ferry" | "van" | "charter" | "other";

export type TwelveGoClass = { name: string; departures: string[] };

export type TwelveGoOption = {
  mode: TwelveGoMode;
  title: string;
  /** 12Go page for this mode and route (with the affiliate id). */
  link: string;
  priceMin: number | null;
  priceMax: number | null;
  durationMin: number | null;
  durationMax: number | null;
  classes: TwelveGoClass[];
};

export type TwelveGoRoute = { name: string; link: string | null; options: TwelveGoOption[] };

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;|&#8211;|&mdash;|&#8212;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

/** "8h 55m" → 535, "1h" → 60, "45m" → 45. */
export function minutesOf(text: string): number | null {
  const h = /(\d+)\s*h/.exec(text);
  const m = /(\d+)\s*m(?!o)/.exec(text);
  if (!h && !m) return null;
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

/** "€ 17.37–27.12" → [17.37, 27.12]; "€ 7" → [7, 7]. */
export function pricesOf(text: string): [number | null, number | null] {
  const nums = (text.replace(/,(?=\d{3}\b)/g, "").match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (nums.length === 0) return [null, null];
  return [Math.min(...nums), Math.max(...nums)];
}

function modeOf(link: string): TwelveGoMode {
  const m = /12go\.asia\/[a-z-]+\/(train|bus|avia|ferry|van|charter)\//.exec(link);
  return (m?.[1] as TwelveGoMode) ?? "other";
}

/** Only 12Go links are kept (the HTML is external input). */
function safeLink(href: string): string | null {
  const url = href.replace(/&amp;/g, "&");
  try {
    const u = new URL(url);
    return u.protocol === "https:" && (u.hostname === "12go.asia" || u.hostname.endsWith(".12go.asia")) ? u.toString() : null;
  } catch {
    return null;
  }
}

export function parseTwelveGoTimetable(html: string): TwelveGoRoute[] {
  // Each city pair is <div class="one2go-route-container"><div class="one2go-route-header"><a …>Bangkok - Chiang Mai</a>…</div><table>…</table></div>.
  const blocks = html.split(/class="one2go-route-container"/i);
  const parts = blocks.length > 1 ? blocks.slice(1) : [html];
  const routes: TwelveGoRoute[] = [];
  for (const block of parts) {
    const header = /class="one2go-route-header"[^>]*>([\s\S]*?)<\/div>/i.exec(block)?.[1] ?? "";
    const headerLink = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(header);
    const route: TwelveGoRoute = { name: headerLink ? decode(headerLink[2]) : "", link: headerLink ? safeLink(headerLink[1]) : null, options: [] };
    let option: TwelveGoOption | null = null;
    for (const row of block.split(/<tr[\s>]/i).slice(1)) {
      const nameCell = /class="one2go-route-name"[^>]*>([\s\S]*?)<\/td>/i.exec(row);
      if (nameCell) {
        const a = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(nameCell[1]);
        const link = a ? safeLink(a[1]) : null;
        option = null;
        if (!a || !link) continue;
        const title = decode(a[2]);
        const priceText = decode(/class="one2go-route-price"[^>]*>([\s\S]*?)<\/span>/i.exec(nameCell[1])?.[1] ?? "");
        const durText = decode(/class="one2go-route-duration"[^>]*>([\s\S]*?)<\/span>/i.exec(nameCell[1])?.[1] ?? "");
        const [priceMin, priceMax] = pricesOf(priceText);
        const durations = durText.split(/[–-]/).map((p) => minutesOf(p)).filter((n): n is number => n !== null);
        option = {
          mode: modeOf(link),
          title,
          link,
          priceMin,
          priceMax,
          durationMin: durations.length ? Math.min(...durations) : null,
          durationMax: durations.length ? Math.max(...durations) : null,
          classes: [],
        };
        route.options.push(option);
        if (!route.name) route.name = title.replace(/^(Flight|Bus|Train|Ferry|Van|Taxi|Charter)\s+/i, "");
        continue;
      }
      if (option && /class="one2go-trips"/i.test(row)) {
        for (const li of row.split(/<li[\s>]/i).slice(1)) {
          const name = decode(/class="one2go-class"[^>]*>([\s\S]*?)<\/span>/i.exec(li)?.[1] ?? "");
          const deps = decode(/class="one2go-departures"[^>]*>([\s\S]*?)<\/span>/i.exec(li)?.[1] ?? "")
            .split(",")
            .map((d) => d.trim())
            .filter((d) => /^\d{1,2}:\d{2}$/.test(d));
          if (name) option.classes.push({ name, departures: deps });
        }
      }
    }
    if (route.options.length > 0) routes.push(route);
  }
  return routes;
}

/** 12Go page for one mode and date, keeping the affiliate id. */
export function twelveGoDateLink(link: string, date: string | null | undefined): string {
  try {
    const u = new URL(link);
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) u.searchParams.set("date", date);
    return u.toString();
  } catch {
    return link;
  }
}
