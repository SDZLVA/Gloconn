import Link from "next/link";
import { PHOTOS, Photo } from "@/components/blog/Photo";
import { weekendIn } from "@/lib/blog/dates";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { buildOmioResultsLink } from "@/lib/affiliate/omio";
import { ROUTE_CITIES, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";

/**
 * Blog post (2026-11-20): Vienna Christmas markets 2026. Facts checked
 * 2026-11-20 against the city's tourist board (wien.info: dates and hours),
 * austria.info, the City of Vienna history page (wien.gv.at), vienna.at
 * (market-office counts) and Omio (Milan → Vienna options). Where sources
 * disagreed (e.g. Belvedere closing time) the detail is left out. No prices are
 * written in the text: every price comes from the live search the buttons open.
 */

const route = (from: FlightRoute["from"]): FlightRoute => ({ slug: `${from.slug}-to-vienna`, from, to: ROUTE_CITIES.VIE });
const LONDON_ROUTE = route(ROUTE_CITIES.LON);
const PARIS_ROUTE = route(ROUTE_CITIES.PAR);
const ISTANBUL_ROUTE = route(ROUTE_CITIES.IST);
const MILAN_ROUTE = route(ROUTE_CITIES.MIL);

const FACTS = [
  { label: "Main market", value: "Rathausplatz, 13 Nov – 26 Dec" },
  { label: "Official markets", value: "15 in the city" },
  { label: "Rathausplatz hours", value: "10:00 – 22:00" },
  { label: "Longest season", value: "Schönbrunn, to 6 Jan 2027" },
  { label: "Budapest → Vienna train", value: "about 2 h 30" },
  { label: "Entry", value: "Walking in is not ticketed*" },
];

const MARKETS = [
  { name: "Rathausplatz (City Hall)", dates: "13 Nov – 26 Dec", hours: "Daily 10:00 – 22:00", note: "The big one, in front of the neo-Gothic City Hall." },
  { name: "Schönbrunn Palace", dates: "6 Nov – 6 Jan 2027", hours: "Daily 10:00 – 21:00", note: "Longest season. Vanillekipferl, hot punch and mulled wine." },
  { name: "Spittelberg", dates: "13 Nov – 23 Dec", hours: "Mon–Fri 14:00 – 21:30, weekends 11:00 – 21:30", note: "Crafts and gifts in old lanes. The most stalls of the 15." },
  { name: "Am Hof", dates: "13 Nov – 23 Dec", hours: "Mon–Thu 11:00 – 21:00, Fri–Sun 10:00 – 21:00", note: "Food is served an hour longer." },
  { name: "Freyung (old Viennese market)", dates: "14 Nov – 23 Dec", hours: "Daily 10:00 – 21:00", note: "Traditional, quieter, central." },
  { name: "Belvedere", dates: "20 Nov – 31 Dec", hours: "Opens 10:00 at weekends, 11:00 on weekdays", note: "Opens today. Check the closing time on site." },
  { name: "Karlsplatz Art Advent", dates: "13 Nov – 23 Dec", hours: "Daily 12:00 – 20:00", note: "Arts and crafts. Food on offer is certified organic." },
  { name: "Stephansplatz", dates: "6 Nov – 26 Dec", hours: "Daily 11:00 – 21:00", note: "Right at the cathedral." },
];

const SPECIAL = [
  { icon: "🍷", title: "Punch and mulled wine", text: "Hot punch and Glühwein are on offer at the big markets; the city's own site links a Glühwein recipe." },
  { icon: "🍪", title: "Vanillekipferl", text: "Crescent-shaped vanilla cookies. Austria's tourist board names them at the Schönbrunn market." },
  { icon: "🌰", title: "Toasted almonds", text: "The tourist board describes the smell of Christmas baking, hot punch and toasted almonds at Rathausplatz." },
  { icon: "🎨", title: "Crafts, not just food", text: "Spittelberg and Karlsplatz Art Advent are mostly about handmade gifts. Art Advent's food is organic-certified." },
  { icon: "🏛️", title: "The setting", text: "Rathausplatz sits in front of City Hall, Schönbrunn in front of a palace, Belvedere at another palace." },
];

const GOOD_TO_KNOW = [
  { icon: "🎄", title: "24 December: short hours", text: "Rathausplatz closes 18:30, Schönbrunn 16:00. Check the market before you plan the day." },
  { icon: "🗓️", title: "Many close on 23 Dec", text: "Spittelberg, Am Hof, Freyung and Karlsplatz end on 23 December. Rathausplatz, Stephansplatz and Maria-Theresien-Platz run to 26 December." },
  { icon: "🎡", title: "New this week", text: "Belvedere, Maria-Theresien-Platz and the Prater winter market open on 20 November. Markets are in full swing from now." },
  { icon: "🕑", title: "Hours differ by source", text: "A few markets show different closing times on different sites. Check the market's own page on the day." },
];

const linkRel = "noopener noreferrer sponsored nofollow";

function ButtonLink({ href, children, external = false, primary = false }: { href: string; children: React.ReactNode; external?: boolean; primary?: boolean }) {
  const cls = primary
    ? "inline-flex min-h-10 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"
    : "inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:border-brand-700 hover:text-brand-700";
  return external ? (
    <a href={href} target="_blank" rel={linkRel} className={cls}>
      {children} ↗
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function ViennaChristmasMarkets2026({ today }: { today: string }) {
  // First Friday–Sunday weekend from tomorrow, before the pre-Christmas rush.
  const weekend = weekendIn("2026-12", today) ?? weekendIn("2026-11", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} ${weekend.departureDate.slice(5, 7) === "12" ? "December" : "November"}` : null;

  const search = (r: FlightRoute, mode?: "flights" | "hotels") => (dates ? (mode ? routeSearchUrl(r, dates, mode) : routeSearchUrl(r, dates)) : `/?mode=${mode ?? "packages"}`);
  const trainFrom = (city: string) => (dates ? buildOmioResultsLink({ from: city, to: "Vienna", ...dates, travelMode: "TRAIN" }) : null);
  const packagesUrl = search(LONDON_ROUTE);
  const hotelsUrl = search(LONDON_ROUTE, "hotels");
  const flightCards = [
    { city: "London", r: LONDON_ROUTE, note: "Compare flights from London to Vienna." },
    { city: "Paris", r: PARIS_ROUTE, note: "Compare flights from Paris to Vienna." },
    { city: "Istanbul", r: ISTANBUL_ROUTE, note: "Compare flights from Istanbul to Vienna." },
    { city: "Milan", r: MILAN_ROUTE, note: "Omio shows about 9 direct flights a day from Milan, about 1 h 30." },
  ];
  const trains = [
    { city: "Budapest", time: "about 2 h 30" },
    { city: "Munich", time: "about 3 h 55" },
    { city: "Prague", time: "about 4 h 15" },
  ];
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Vienna, Austria", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">
        Vienna&apos;s Christmas markets are open <strong>right now</strong>, and the last big ones open today, 20 November. The main market on Rathausplatz runs to{" "}
        <strong>26 December</strong>. Budapest, Munich and Prague all have direct trains, and flights run from across Europe. Here are the facts, with live prices.
      </p>

      <section aria-label="Quick facts">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FACTS.map((f) => (
            <li key={f.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{f.label}</p>
              <p className="mt-1 font-extrabold text-slate-900">{f.value}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">
          Dates and hours from{" "}
          <a href="https://www.wien.info/en/now-on/christmas/christmas-markets-342664" target="_blank" rel="noopener noreferrer" className="underline">
            wien.info
          </a>{" "}
          and austria.info. *None of the official pages we read states an entrance fee. Check the official site before you go.
        </p>
      </section>

      <section id="about-the-event" aria-labelledby="about-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.viennaRathaus} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">About the event</p>
          <h2 id="about-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Vienna&apos;s Advent markets
          </h2>
          <ul className="mt-3 space-y-2">
            {[
              "Advent markets run all over the city, from early November. The city market office counts 15 official ones (about 814 stalls, 198 for food and drink), per vienna.at.",
              "History: the City of Vienna says the exact date of the first Christmas market is unknown. Chronicles from 1626 mention huts near St Stephen's. The market became permanent at Am Hof in 1843.",
              "The Rathausplatz market has stood in front of City Hall since 1975, per the city's history page.",
              "Highlights: the City Hall market, Schönbrunn Palace, the lanes of Spittelberg and the Belvedere palace market.",
            ].map((p) => (
              <li key={p} className="flex gap-2 text-slate-700">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="special" aria-labelledby="special-title" className="scroll-mt-24 space-y-4">
        <h2 id="special-title" className="text-2xl font-extrabold text-slate-900">
          What makes it special
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {SPECIAL.map((t) => (
            <li key={t.title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-bold text-slate-900">
                <span aria-hidden="true" className="mr-2">
                  {t.icon}
                </span>
                {t.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">{t.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="markets-title" className="space-y-4">
        <h2 id="markets-title" className="text-2xl font-extrabold text-slate-900">
          The markets to know
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {MARKETS.map((m) => (
            <li key={m.name} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-extrabold text-slate-900">{m.name}</p>
              <p className="mt-1 text-sm font-semibold text-brand-700">{m.dates}</p>
              <p className="text-sm text-slate-600">{m.hours}</p>
              <p className="mt-1 text-sm text-slate-700">{m.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="getting-there" aria-labelledby="getting-there-title" className="scroll-mt-24 space-y-4">
        <h2 id="getting-there-title" className="text-2xl font-extrabold text-slate-900">
          Getting there
        </h2>
        {when && <p className="text-sm text-slate-500">Buttons below are set for the weekend of {when}. Change the dates on the next page.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {flightCards.map((c) => (
            <div key={c.city} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">✈ From {c.city}</p>
              <p className="mt-2 flex-1 text-sm text-slate-700">{c.note}</p>
              <div className="mt-4">
                <ButtonLink href={search(c.r, "flights")} primary>
                  Compare flights
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">🚆 Direct trains from nearby cities</p>
          <p className="mt-1 text-sm text-slate-700">Average times from Omio. From Milan there is no direct train (about 9 h with changes).</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {trains.map((t) => {
              const url = trainFrom(t.city);
              return url ? (
                <ButtonLink key={t.city} href={url} external>
                  {t.city} → Vienna, {t.time}
                </ButtonLink>
              ) : null;
            })}
          </div>
        </div>
      </section>

      <section id="where-to-stay" aria-labelledby="stay-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.viennaChristkindlmarkt} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Where to stay</p>
          <h2 id="stay-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Stay in the inner city (1010)
          </h2>
          <ul className="mt-3 space-y-2">
            {[
              "Rathausplatz, Stephansplatz, Freyung and Am Hof are all in the 1st district (postcode 1010). You can walk between them.",
              "Spittelberg (1070), Karlsplatz (1040) and Belvedere (1030) are close to the centre.",
              "Schönbrunn is further out (1130), so plan a separate trip.",
              "December weekends fill up, so book with free cancellation.",
            ].map((p) => (
              <li key={p} className="flex gap-2 text-slate-700">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href={hotelsUrl} primary>
              Compare Vienna hotels
            </ButtonLink>
            {bookingUrl && (
              <ButtonLink href={bookingUrl} external>
                See on Booking.com
              </ButtonLink>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="good-title" className="space-y-4">
        <h2 id="good-title" className="text-2xl font-extrabold text-slate-900">
          Good to know
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {GOOD_TO_KNOW.map((t) => (
            <li key={t.title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-bold text-slate-900">
                <span aria-hidden="true" className="mr-2">
                  {t.icon}
                </span>
                {t.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">{t.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-brand-900 p-6 text-white sm:p-8">
        <h2 className="text-2xl font-extrabold">Flight + hotel in one search</h2>
        <p className="mt-2 text-brand-100">
          Glooconn shows flight + hotel packages for Vienna within your budget. Change your home city on the next page. You book each part directly with our partners.
        </p>
        <Link href={packagesUrl} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
