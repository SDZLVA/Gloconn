import Link from "next/link";
import { PHOTOS, Photo } from "@/components/blog/Photo";
import { weekendIn } from "@/lib/blog/dates";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { buildOmioResultsLink } from "@/lib/affiliate/omio";
import { ROUTE_CITIES, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";

/**
 * Blog post (2026-11-19): Prague Christmas markets 2026. Facts checked 2026-11-19:
 * - Old Town Square + Wenceslas Square 28 Nov 2026 – 6 Jan 2027, 10:00–22:00
 *   (visitczechia.com, prague.eu, expats.cz, viewfromprague.com, bestpragueguide.com).
 * - Náměstí Míru 20 Nov – 24 Dec; Náměstí Republiky 25 Nov – 24 Dec; Tylovo náměstí 26 Nov – 24 Dec
 *   (visitczechia.com + expats.cz).
 * - Food/drink and traditions: Time Out Prague, viewfromprague.com, expats.cz.
 * No prices are written in the text except the mulled-wine range quoted by two guides.
 */

const PRAGUE = ROUTE_CITIES.PRG;
const route = (from: FlightRoute["from"]): FlightRoute => ({ slug: `${from.slug}-to-prague`, from, to: PRAGUE });
const MILAN_ROUTE = route(ROUTE_CITIES.MIL);
const LONDON_ROUTE = route(ROUTE_CITIES.LON);
const PARIS_ROUTE = route(ROUTE_CITIES.PAR);
const AMSTERDAM_ROUTE = route(ROUTE_CITIES.AMS);

const FACTS = [
  { label: "Main markets open", value: "28 Nov 2026" },
  { label: "Main markets close", value: "6 Jan 2027" },
  { label: "Hours", value: "10:00 – 22:00" },
  { label: "Main spots", value: "Old Town + Wenceslas Sq." },
  { label: "Smaller markets", value: "Open from 20 Nov" },
  { label: "Warm drink", value: "Svařák (mulled wine)" },
];

const EVENT = [
  "The big markets fill Old Town Square (Staroměstské náměstí) and Wenceslas Square (Václavské náměstí) with wooden stalls, lights and a decorated tree.",
  "The Christmas tree itself is a Bohemian custom: one local guide dates the first decorated tree to 1812, at a dinner in the Estates Theatre.",
  "Expect a daily stage programme of music and folklore, carols, and craft stalls selling glass and straw ornaments, wooden toys and nativity scenes.",
  "Smaller local markets open earlier: Náměstí Míru from 20 November, Náměstí Republiky from 25 November, Tylovo náměstí from 26 November.",
];

const SPECIAL = [
  { title: "Svařák and hot mead", text: "Svařák is Czech mulled wine; medovina is honey mead. Both are sold hot in cups at the stalls. Two local guides quote roughly 75–130 CZK a cup, with Old Town at the top end." },
  { title: "Klobása and ham", text: "Grilled klobása sausage comes with bread and mustard. Smoked Prague ham and halušky (potato dumplings) are sold mainly on Old Town and Wenceslas Squares. Ham is priced per 100 g, so say how much you want." },
  { title: "Gingerbread and cookies", text: "Perník (gingerbread) and Czech Christmas cookies such as vanilla crescents and \"beehive\" cookies are everywhere. Vánočka, a braided sweet bread, is the traditional Christmas loaf." },
  { title: "Hand-blown glass", text: "Glass ornaments are the classic souvenir. Wooden toys, painted ceramics and embroidered textiles are also common." },
  { title: "Careful with trdelník", text: "Trdelník, the chimney cake sold all over the centre, is not a traditional Czech Christmas pastry. Try klobása, perník or chestnuts first." },
];

const GOOD_TO_KNOW = [
  { icon: "🕑", title: "Open every day", text: "The two big markets run 10:00–22:00, including Christmas and New Year, according to the organiser's guides. Check shorter hours on 24 December." },
  { icon: "💳", title: "Bring cash too", text: "Big stalls take cards, but small food and drink stalls often don't. Pay in crowns (CZK)." },
  { icon: "👥", title: "Go early in the season", text: "Late November and the days after Christmas are calmer. The weekends before Christmas are the busiest." },
  { icon: "👜", title: "Watch your pockets", text: "Crowded evenings on Old Town Square and rush-hour metro are the usual pickpocket places. Keep phone and wallet in front pockets." },
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
  { icon: "✈️", title: "From Prague airport", text: "Bus 119 runs from outside arrivals to Nádraží Veleslavín, the end of metro line A, in about 15 minutes. From there, metro A goes to Malostranská, Staroměstská (Old Town Square), Můstek and Muzeum (Wenceslas Square). The whole trip takes about 30 to 40 minutes." },
  { icon: "🚆", title: "From the main station (Hlavní nádraží)", text: "The station has metro line C underneath. Wenceslas Square is a short walk from the station, and the Old Town Square is about 15 minutes on foot, or one change to metro A or B." },
  { icon: "🚌", title: "From the long-distance bus station (Florenc)", text: "Most international and long-distance coaches stop at Florenc, which is on metro lines B and C. Take line B to Můstek for the squares, or walk about 15 to 20 minutes." },
  { icon: "🚗", title: "By car", text: "The Old Town is almost entirely pedestrianised, and many hotels have no parking. Plan to leave the car in a paid car park outside the centre or at a hotel that offers a space." },
  { icon: "🅿️", title: "Where to park", text: "The simplest idea is a park-and-ride at the edge of the city, then metro in. If your hotel is in the Old Town, ask it for a garage space or a nearby paid car park before you arrive." },
  { icon: "⚠️", title: "Limits for private vehicles", text: "Streets around the squares are closed to normal traffic and have narrow, cobbled lanes. Large vans and coaches cannot drive into the pedestrian area." },
];

export function PragueChristmasMarkets2026({ today }: { today: string }) {
  // First Friday–Sunday weekend of December (inside the market dates, before the Christmas rush).
  const weekend = weekendIn("2026-12", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} December` : null;

  const search = (r: FlightRoute, mode?: "flights" | "hotels") => (dates ? (mode ? routeSearchUrl(r, dates, mode) : routeSearchUrl(r, dates)) : `/?mode=${mode ?? "packages"}`);
  const trainFrom = (city: string) => (dates ? buildOmioResultsLink({ from: city, to: "Prague", ...dates, travelMode: "TRAIN" }) : null);
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Prague, Czechia", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  const flightCards = [
    { city: "London", r: LONDON_ROUTE, note: "Compare flights from London to Prague." },
    { city: "Paris", r: PARIS_ROUTE, note: "Compare flights from Paris to Prague." },
    { city: "Amsterdam", r: AMSTERDAM_ROUTE, note: "Compare flights from Amsterdam to Prague." },
    { city: "Milan", r: MILAN_ROUTE, note: "Compare flights from Milan to Prague." },
  ];
  const trains = ["Vienna", "Berlin", "Munich"];

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">
        Prague&apos;s big Christmas markets open on <strong>Saturday 28 November</strong> and run into January. Smaller local markets start as early as 20 November.
        Short facts, then live prices.
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
          Dates from{" "}
          <a href="https://www.visitczechia.com/en-us/things-to-do/events/2026/11/e-christmas-markets-prague" target="_blank" rel="noopener noreferrer" className="underline">
            VisitCzechia
          </a>{" "}
          and{" "}
          <a href="https://prague.eu/en/akce/old-town-square-christmas-market" target="_blank" rel="noopener noreferrer" className="underline">
            prague.eu
          </a>
          , matched with local press. Check the organiser&apos;s site (trhypraha.cz) before you go.
        </p>
      </section>

      <section aria-labelledby="event-title" className="space-y-1">
        <h2 id="event-title" className="text-2xl font-extrabold text-slate-900">
          About the event
        </h2>
        <Bullets items={EVENT} />
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
      </section>

      <section id="getting-there" aria-labelledby="getting-there-title" className="scroll-mt-24 space-y-4">
        <h2 id="getting-there-title" className="text-2xl font-extrabold text-slate-900">
          Getting there
        </h2>
        {when && <p className="text-sm text-slate-500">Buttons are set for the weekend of {when} — change the dates on the next page.</p>}
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
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">🚆 By train from nearby cities</p>
          <p className="mt-1 text-sm text-slate-700">Check times and prices on Omio for the day you want.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {trains.map((city) => {
              const url = trainFrom(city);
              return url ? (
                <ButtonLink key={city} href={url} external>
                  {city} → Prague
                </ButtonLink>
              ) : null;
            })}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="font-bold text-slate-900">From Prague airport to the centre</p>
          <Bullets
            items={[
              "Public transport: an airport bus runs to Veleslavín metro, then Line A takes you into the centre. About 35 minutes in total.",
              "The Airport Express bus goes direct to the main train station (Praha hlavní nádraží), roughly every 30 minutes.",
              "Bus numbers and fares changed recently and local guides disagree — read the sign and the ticket machine at the stop.",
            ]}
          />
        </div>
      </section>

      <section id="getting-around" aria-labelledby="around-title" className="scroll-mt-24 space-y-4">
        <h2 id="around-title" className="text-2xl font-extrabold text-slate-900">
          {"Getting around in Prague: how to reach the Old Town markets"}
        </h2>
        <p className="text-sm text-slate-600">{"The Old Town Square and Wenceslas Square are in a mostly pedestrian area, so the best way in is by metro. Prices are indicative, so check them on the day."}</p>
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
          <p className="mt-1 text-sm text-slate-800">{"Easiest overall: bus 119 and metro A from the airport, or metro C or B from the train and coach stations. By car, park outside the centre and use the metro. You will avoid the pedestrian streets and the search for a space."}</p>
          <p className="mt-3 text-xs text-slate-500">{"Indicative costs: a 90-minute public-transport ticket (bus, tram and metro) is from about 40 CZK, and a 30-minute ticket is from about 30 CZK. Airport tickets can cost a little more, so check the machine or the PID site."}</p>
        </div>
      </section>

      <section id="where-to-stay" aria-labelledby="stay-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.pragueRoofs} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Where to stay</p>
          <h2 id="stay-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Old Town for atmosphere, Vinohrady for value
          </h2>
          <Bullets
            items={[
              "Staré Město (Old Town) and Malá Strana are the most atmospheric and the most expensive.",
              "Vinohrady is usually better value, has its own market at Náměstí Míru, and is about 10 minutes by metro from Old Town.",
              "December weekends fill up early — book with free cancellation.",
            ]}
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href={search(LONDON_ROUTE, "hotels")} primary>
              Compare Prague hotels
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

      <section aria-labelledby="nicholas-title" className="rounded-2xl bg-slate-50 p-5">
        <h2 id="nicholas-title" className="text-lg font-extrabold text-slate-900">
          Czech Christmas in one line
        </h2>
        <p className="mt-1 text-slate-700">
          The main day is Christmas Eve, 24 December, with fish soup and fried carp for dinner. Before that, on the evening of 5 December, St Nicholas walks
          the streets with an angel and a devil.
        </p>
      </section>

      <section className="rounded-3xl bg-brand-900 p-6 text-white sm:p-8">
        <h2 className="text-2xl font-extrabold">Flight + hotel in one search</h2>
        <p className="mt-2 text-brand-100">Glooconn shows flight + hotel packages for Prague within your budget. Change your home city on the next page. You book each part directly with our partners.</p>
        <Link href={search(LONDON_ROUTE)} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
