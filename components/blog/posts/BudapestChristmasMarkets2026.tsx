import Link from "next/link";
import { PHOTOS, Photo } from "@/components/blog/Photo";
import { weekendIn } from "@/lib/blog/dates";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { buildOmioResultsLink } from "@/lib/affiliate/omio";
import { ROUTE_CITIES, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";

/**
 * Blog post (buffer, written 2026-11-21): Budapest Christmas markets 2026. Facts checked 2026-11-21 against In Your Pocket, Daily News Hungary (market organisers), Kempinski, Accor, Time Out Budapest, Meininger and Kirker Holidays.
 * No prices are written in the text: every price comes from the live search the buttons open.
 */


const route = (from: FlightRoute["from"], to: FlightRoute["to"] = ROUTE_CITIES.BUD): FlightRoute => ({ slug: `${from.slug}-to-${to.slug}`, from, to });
const LONDON_ROUTE = route(ROUTE_CITIES.LON);
const PARIS_ROUTE = route(ROUTE_CITIES.PAR);
const ISTANBUL_ROUTE = route(ROUTE_CITIES.IST);
const AMSTERDAM_ROUTE = route(ROUTE_CITIES.AMS);

const FACTS = [
  { label: "Basilica market", value: "13 Nov – 1 Jan 2027" },
  { label: "Vörösmarty tér", value: "13 Nov – 31 Dec" },
  { label: "Basilica hours", value: "Mon–Thu 11–22, Fri–Sat 11–23" },
  { label: "Entry", value: "Free*" },
  { label: "Óbuda market", value: "From 27 Nov" },
  { label: "Vienna → Budapest train", value: "About 2 h 30" },
];

const EVENT = [
  "Advent Bazilika runs from 13 November 2026 to 1 January 2027. In Your Pocket says a light show is projected onto the Basilica facade every evening, with a small ice rink around the Christmas tree.",
  "The organisers say the Basilica market has been voted Europe's most beautiful Christmas market four times. One food guide says it launched in 2011.",
  "Vörösmarty Classic Xmas runs from 13 November to 31 December 2026. Kempinski says the fair has stood in the heart of the city since 1998. Expect craft stalls and a free children's train (In Your Pocket).",
  "Both markets stay open over Christmas and New Year's Eve, but hours vary on certain holidays (Daily News Hungary).",
];

const SPECIAL = [
  { icon: "🥖", title: "Kürtőskalács (chimney cake)", text: "Sweet yeast dough wrapped round a wooden spit and roasted over embers, then rolled in sugar, cinnamon or chocolate. Accor calls it the star of the markets." },
  { icon: "🍷", title: "Forralt bor", text: "Hungarian mulled wine, plus hot fruit punch, is on offer at the stalls (Accor, Kirker Holidays)." },
  { icon: "🥙", title: "Lángos and sausages", text: "Fried lángos and grilled sausages are market classics. Kirker Holidays names Mangalica sausages, from a Hungarian pig breed." },
  { icon: "🍲", title: "Goulash and fisherman's soup", text: "Meininger lists goulash soup, fisherman's soup (halászlé), stuffed cabbage and roast pork as must-try Hungarian dishes." },
  { icon: "🍰", title: "Flódni and bejgli", text: "Flódni is a layered pastry (Celebrity Cruises). Bejgli are rolls filled with poppy seeds or walnuts (Urban Adventures)." },
  { icon: "💡", title: "The Basilica light show", text: "A projection show on the Basilica facade runs each evening, per In Your Pocket." },
];

const PLACES = [
  { name: "Advent Bazilika", line1: "13 Nov – 1 Jan 2027", line2: "Mon–Thu 11:00–22:00, Fri–Sat 11:00–23:00", note: "In front of St Stephen's Basilica (Szent István tér). Light show, ice rink and food stalls." },
  { name: "Vörösmarty Classic Xmas", line1: "13 Nov – 31 Dec", line2: "Check the organiser's page for daily hours", note: "The traditional market. Take the M1 metro to Vörösmarty tér. Crafts, food and a children's train." },
  { name: "Óbuda Fő tér", line1: "From 27 Nov", line2: "District III, across the river from Pest", note: "Smaller, with a neighbourhood feel among low old houses. One local guide says prices are lower than in the centre." },
  { name: "Fashion Street (Deák Ferenc utca)", line1: "Leads into Vörösmarty tér", line2: "Pedestrian street", note: "Time Out says stalls line this pedestrian street on the way to the main market." },
];

const STAY = [
  "Both big markets are in District V, a short walk apart. You can visit both in one evening.",
  "The M1 metro stops at Vörösmarty tér, and Deák Ferenc tér is close.",
  "Óbuda is further north, so plan a separate trip there.",
  "December weekends fill up, so book a room with free cancellation.",
];

const GOOD_TO_KNOW = [
  { icon: "🎄", title: "Holiday hours change", text: "Opening hours vary on certain holidays, say the organisers. Check the market page before you go on 24, 25, 26 or 31 December." },
  { icon: "🚇", title: "Easy by metro", text: "Vörösmarty tér is at the end of the M1 metro line, right at the market." },
  { icon: "💶", title: "Centre vs Óbuda", text: "The centre markets are the busiest and priciest. A local guide says Óbuda is cheaper for mulled wine and lángos." },
  { icon: "🧣", title: "Dress warm", text: "The markets are outdoors and the evenings are cold, so wear layers." },
];

const TRAINS: { city: string; time?: string }[] = [
  { city: "Vienna", time: "about 2 h 30" },
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

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((p) => (
        <li key={p} className="flex gap-2 text-slate-700">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

export function BudapestChristmasMarkets2026({ today }: { today: string }) {
  // First Friday–Sunday weekend from tomorrow, before the pre-Christmas rush.
  const weekend = weekendIn("2026-12", today) ?? weekendIn("2026-11", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} ${weekend.departureDate.slice(5, 7) === "12" ? "December" : "November"}` : null;

  const search = (r: FlightRoute, mode?: "flights" | "hotels") => (dates ? (mode ? routeSearchUrl(r, dates, mode) : routeSearchUrl(r, dates)) : `/?mode=${mode ?? "packages"}`);
  const trainFrom = (city: string) => (dates ? buildOmioResultsLink({ from: city, to: "Budapest", ...dates, travelMode: "TRAIN" }) : null);
  const packagesUrl = search(LONDON_ROUTE);
  const hotelsUrl = search(LONDON_ROUTE, "hotels");
  const flightCards = [
    { title: "From London", r: LONDON_ROUTE, note: "Compare flights from London to Budapest." },
    { title: "From Paris", r: PARIS_ROUTE, note: "Compare flights from Paris to Budapest." },
    { title: "From Istanbul", r: ISTANBUL_ROUTE, note: "Compare flights from Istanbul to Budapest." },
    { title: "From Amsterdam", r: AMSTERDAM_ROUTE, note: "Compare flights from Amsterdam to Budapest." },
  ];
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Budapest, Hungary", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">{"Budapest's two big Christmas markets opened on 13 November and they sit a short walk apart in the city centre. One is in front of St Stephen's Basilica, with a light show on the facade every evening. The other is the classic market on Vörösmarty tér. Here are the dates, what to eat and how to get there, with live prices."}</p>

      <section aria-label="Quick facts">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FACTS.map((f) => (
            <li key={f.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{f.label}</p>
              <p className="mt-1 font-extrabold text-slate-900">{f.value}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">{"Dates and hours from the market organisers (via Daily News Hungary) and In Your Pocket. *Entry to the market is free; the ice rink and food cost extra. Hours change on holidays, so check the market's own page."}</p>
      </section>

      <section id="about-the-event" aria-labelledby="about-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.budapest} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">About the event</p>
          <h2 id="about-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Budapest&apos;s Advent markets
          </h2>
          <Bullets items={EVENT} />
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

      <section aria-labelledby="places-title" className="space-y-4">
        <h2 id="places-title" className="text-2xl font-extrabold text-slate-900">
          The markets to know
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PLACES.map((m) => (
            <li key={m.name} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-extrabold text-slate-900">{m.name}</p>
              <p className="mt-1 text-sm font-semibold text-brand-700">{m.line1}</p>
              <p className="text-sm text-slate-600">{m.line2}</p>
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
            <div key={c.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">✈ {c.title}</p>
              <p className="mt-2 flex-1 text-sm text-slate-700">{c.note}</p>
              <div className="mt-4">
                <ButtonLink href={search(c.r, "flights")} primary>
                  Compare flights
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
        {TRAINS.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">🚆 By train</p>
            <p className="mt-1 text-sm text-slate-700">Average time from Omio. Compare the train and the flight before you book.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TRAINS.map((t) => {
                const url = trainFrom(t.city);
                return url ? (
                  <ButtonLink key={t.city} href={url} external>
                    {t.city} → Budapest{t.time ? `, ${t.time}` : ""}
                  </ButtonLink>
                ) : null;
              })}
            </div>
          </div>
        )}
      </section>

      <section id="where-to-stay" aria-labelledby="stay-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.budapestBastion} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Where to stay</p>
          <h2 id="stay-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Stay in District V (Belváros-Lipótváros)
          </h2>
          <Bullets items={STAY} />
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href={hotelsUrl} primary>
              Compare Budapest hotels
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
        <p className="mt-2 text-brand-100">{"Glooconn shows flight + hotel packages for Budapest within your budget. Change your home city on the next page. You book each part directly with our partners."}</p>
        <Link href={packagesUrl} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
