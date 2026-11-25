import Link from "next/link";
import { PHOTOS, Photo } from "@/components/blog/Photo";
import { weekendIn } from "@/lib/blog/dates";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { buildOmioResultsLink } from "@/lib/affiliate/omio";
import { ROUTE_CITIES, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";

/**
 * Blog post (2026-11-18): Strasbourg Christmas market 2026 — dates, how to get
 * there from Milan, where to stay. Facts checked 2026-11-18 against the city's
 * official site (noel.strasbourg.eu: 27 Nov – 24 Dec 2026, eight markets) and
 * regional press (hours, late nights, chalet count). No prices are written in
 * the text: every price comes from the live search the buttons open.
 */

const STRASBOURG = { code: "SXB", name: "Strasbourg", country: "France", slug: "strasbourg" } as const;
const FRANKFURT = { code: "FRA", name: "Frankfurt", country: "Germany", slug: "frankfurt" } as const;
const route = (from: FlightRoute["from"]): FlightRoute => ({ slug: `${from.slug}-to-strasbourg`, from, to: STRASBOURG });
const LONDON_ROUTE = route(ROUTE_CITIES.LON);
const FRANKFURT_ROUTE = route(FRANKFURT);
const AMSTERDAM_ROUTE = route(ROUTE_CITIES.AMS);
const MILAN_ROUTE = route(ROUTE_CITIES.MIL);

const FACTS = [
  { label: "Dates", value: "27 Nov – 24 Dec 2026" },
  { label: "Markets", value: "8 across the old town" },
  { label: "Chalets", value: "about 300" },
  { label: "Running since", value: "1570" },
  { label: "Usual hours", value: "11:30 – 21:00" },
  { label: "Grand Sapin", value: "30 m tree, Place Kléber" },
];

const MARKETS = [
  "Christkindelsmärik (Place Broglie)",
  "At the foot of the Grand Sapin",
  "Around the Cathedral",
  "Little France",
  "Carré d'Or Market",
  "The Wharf of Flavors and Craftsmanship",
  "The Unyielding Small Producers of Alsace",
  "The OFF Market",
];

const EVENT = [
  "The market is called the Christkindelsmärik, Alsatian for \"market of the Christ Child\". The city says it began in 1570.",
  "It was for a long time the only Christmas market in France, and is one of the oldest in Europe.",
  "Today it is spread over several squares of the old town: the original market on Place Broglie, stalls around the cathedral, Little France and Place Kléber.",
  "The centrepiece is the Grand Sapin, a giant fir on Place Kléber. Two Kiwanis club members had the idea for it in 1994.",
];

const SPECIAL = [
  { title: "White mulled wine", text: "Vin chaud is usually red at Christmas markets. In Strasbourg, look for the white version made with Alsace wine, citrus and spices." },
  { title: "Tarte flambée", text: "A very thin flatbread with crème fraîche, onions and bacon pieces (lardons). Also called flammekueche. Watch it being baked to order." },
  { title: "Bredele", text: "Small Alsatian Christmas biscuits in many shapes. The Bas-Rhin bakers' federation has run a big bredele chalet on Place du Marché-aux-Poissons." },
  { title: "Pain d'épices", text: "Alsatian gingerbread: soft, honey-sweet and spiced. Mireille Oster's shop in Little France is a name food writers often mention." },
  { title: "Choucroute and bretzels", text: "Choucroute garnie (sauerkraut with sausages and pork) is the regional staple, usually served in a winstub. Bretzels are sold at the stalls." },
];

const GOOD_TO_KNOW = [
  { icon: "🕑", title: "Opening day starts at 14:00", text: "Friday 27 November opens in the afternoon; after that the chalets run from 11:30." },
  { icon: "🌙", title: "Late nights until 22:00", text: "Fridays 11 and 18 December and Saturdays 12 and 19 December stay open an hour longer." },
  { icon: "🎄", title: "24 December closes at 18:00", text: "Nothing is open on 25 December — plan to leave or eat elsewhere." },
  { icon: "📅", title: "Go midweek", text: "Weekdays and early December are calmer than the weekends before Christmas." },
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

const TRANSPORT = [
  { icon: "✈️", title: "From Strasbourg airport", text: "The airport is at Entzheim, about 10 km from the centre. A TER train links it to Strasbourg station in about 9 minutes, up to 4 times an hour. From the station you walk or take a tram." },
  { icon: "🚆", title: "From the main station", text: "The old centre is about a 10-minute walk from the station along rue du Maire Kuss. Trams A and D leave from the underground level of the station, and tram C from the north hall. Get off at Ancienne Synagogue–Les Halles or Faubourg de Saverne for the markets." },
  { icon: "🚌", title: "From the coach station", text: "International coaches stop at Parc de l'Étoile. The Étoile-Bourse tram stop is right next to it, with trams A and D into the centre. Petite France is also reachable on foot over the Pont Émile Matthis and the Ponts Couverts." },
  { icon: "🚗", title: "By car", text: "The city asks drivers to have a Crit'Air sticker, which you can order online before you travel. Cars are not welcome on the Grande-Île, and the shared CITIZ cars are banned there during the market." },
  { icon: "🅿️", title: "Where to park", text: "Use the park-and-ride (P+R) car parks beside the tram lines, which have more than 15,000 spaces. On weekends the Zénith P+R includes a shuttle to the Hôtel d'Alsace–Petite France stop, a 2-minute walk from the Ponts Couverts. From the Rhéna Clinic car park you take tram D from Port du Rhin." },
  { icon: "⚠️", title: "Limits for private vehicles", text: "Motorhomes can use all car parks except those with a height limit, and the city suggests the Elsau tram P+R in the daytime. Without a Crit'Air sticker you risk a fine if pollution rules are active." },
];

export function StrasbourgChristmasMarket2026({ today }: { today: string }) {
  // First Friday–Sunday weekend from tomorrow, before the pre-Christmas rush.
  const weekend = weekendIn("2026-12", today) ?? weekendIn("2026-11", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} ${weekend.departureDate.slice(5, 7) === "12" ? "December" : "November"}` : null;

  const search = (r: FlightRoute, mode?: "flights" | "hotels") => (dates ? (mode ? routeSearchUrl(r, dates, mode) : routeSearchUrl(r, dates)) : `/?mode=${mode ?? "packages"}`);
  const trainFrom = (city: string) => (dates ? buildOmioResultsLink({ from: city, to: "Strasbourg", ...dates, travelMode: "TRAIN" }) : null);
  const packagesUrl = search(LONDON_ROUTE);
  const hotelsUrl = search(LONDON_ROUTE, "hotels");
  const flightCards = [
    { city: "London", r: LONDON_ROUTE, note: "Compare flights from London to Strasbourg." },
    { city: "Frankfurt", r: FRANKFURT_ROUTE, note: "Compare flights from Frankfurt to Strasbourg." },
    { city: "Amsterdam", r: AMSTERDAM_ROUTE, note: "Compare flights from Amsterdam to Strasbourg." },
    { city: "Milan", r: MILAN_ROUTE, note: "easyJet flies Malpensa to Strasbourg direct, about 1 h 10, but only a few days a week." },
  ];
  const trains = ["Paris", "Frankfurt", "Basel"];
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Strasbourg, France", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">
        France&apos;s oldest Christmas market opens on <strong>Friday 27 November</strong>. Paris is a direct train away (the fastest TGV takes about 1 h 46 min),
        and flights run from across Europe. Here is everything you need, with live prices.
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
          Dates from the city&apos;s official site,{" "}
          <a href="https://noel.strasbourg.eu/en/" target="_blank" rel="noopener noreferrer" className="underline">
            noel.strasbourg.eu
          </a>
          . Hours and chalet count from regional press — check the official site before you go.
        </p>
      </section>

      <section aria-labelledby="event-title" className="space-y-1">
        <h2 id="event-title" className="text-2xl font-extrabold text-slate-900">
          About the event
        </h2>
        <Bullets items={EVENT} />
        <p className="mt-2 text-xs text-slate-500">
          History from the city&apos;s pages on{" "}
          <a href="https://noel.strasbourg.eu/en/our-history" target="_blank" rel="noopener noreferrer" className="underline">
            noel.strasbourg.eu
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="special-title" className="space-y-4">
        <h2 id="special-title" className="text-2xl font-extrabold text-slate-900">
          What makes it special
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {SPECIAL.map((s) => (
            <li key={s.title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-bold text-slate-900">{s.title}</p>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">Food and drink notes are from several travel and food guides; stalls change every year.</p>
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
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">🚆 By train</p>
          <p className="mt-1 text-sm text-slate-700">
            Paris → Strasbourg has direct TGVs; the fastest takes about 1 h 46 min. From Milan there is no direct train: change in Basel (Milan → Basel SBB about 4 h 10 min – 4 h 30 min, then about 1 h 20 min).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {trains.map((city) => {
              const url = trainFrom(city);
              return url ? (
                <ButtonLink key={city} href={url} external>
                  {city} → Strasbourg
                </ButtonLink>
              ) : null;
            })}
          </div>
        </div>
      </section>

      <section id="getting-around" aria-labelledby="around-title" className="scroll-mt-24 space-y-4">
        <h2 id="around-title" className="text-2xl font-extrabold text-slate-900">
          {"Getting around in Strasbourg: how to reach the markets"}
        </h2>
        <p className="text-sm text-slate-600">{"The markets sit on the Grande-Île, the historic island in the centre, so the last part is on foot or by tram. Prices are indicative, so check them on the day."}</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {TRANSPORT.map((t) => (
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
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Easiest way</p>
          <p className="mt-1 text-sm text-slate-800">{"Easiest overall: arrive by train and walk the 10 minutes to the centre, or take the airport TER and then tram A or D. By car, park at a tram P+R and ride in. It avoids the closed centre and the limited parking."}</p>
          <p className="mt-3 text-xs text-slate-500">{"Indicative costs: the weekend P+R rate with shuttle was €4.20 per car in recent years, covering everyone in the car. The airport train and the tram are on the local CTS and TER fares, so check the current price at the machine or in the CTS app."}</p>
        </div>
      </section>

      <section id="where-to-stay" aria-labelledby="stay-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.strasbourgCathedral} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Where to stay</p>
          <h2 id="stay-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Sleep in the old town, book early
          </h2>
          <ul className="mt-3 space-y-2">
            {[
              "Stay on or next to the Grande Île, the island where the markets are — you can walk everywhere.",
              "Best-placed hotels sell out months ahead, so book with free cancellation.",
              "One night is enough to see the markets; two lets you add the cathedral and Little France.",
            ].map((p) => (
              <li key={p} className="flex gap-2 text-slate-700">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href={hotelsUrl} primary>
              Compare Strasbourg hotels
            </ButtonLink>
            {bookingUrl && (
              <ButtonLink href={bookingUrl} external>
                See on Booking.com
              </ButtonLink>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="markets-title" className="space-y-4">
        <h2 id="markets-title" className="text-2xl font-extrabold text-slate-900">
          The 8 markets
        </h2>
        <ul className="flex flex-wrap gap-2">
          {MARKETS.map((m) => (
            <li key={m} className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700">
              {m}
            </li>
          ))}
        </ul>
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

      <section aria-labelledby="colmar-title" className="rounded-2xl bg-slate-50 p-5">
        <h2 id="colmar-title" className="text-lg font-extrabold text-slate-900">
          Want a longer season? Add Colmar
        </h2>
        <p className="mt-1 text-slate-700">Colmar&apos;s markets run 23 November – 29 December 2026, so they are open after Strasbourg closes on 24 December.</p>
      </section>

      <section className="rounded-3xl bg-brand-900 p-6 text-white sm:p-8">
        <h2 className="text-2xl font-extrabold">Flight + hotel in one search</h2>
        <p className="mt-2 text-brand-100">
          Glooconn shows flight + hotel packages for Strasbourg within your budget. Change your home city on the next page. You book each part directly with our partners.
        </p>
        <Link href={packagesUrl} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
