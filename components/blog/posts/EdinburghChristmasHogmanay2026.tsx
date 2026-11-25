import Link from "next/link";
import { PHOTOS, Photo } from "@/components/blog/Photo";
import { weekendIn } from "@/lib/blog/dates";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { buildOmioResultsLink } from "@/lib/affiliate/omio";
import { ROUTE_CITIES, routeSearchUrl, type FlightRoute, type RouteCity } from "@/lib/routes/catalog";

/**
 * Blog post (2026-11-22): Edinburgh's Christmas + Hogmanay 2026. Facts checked 2026-11-22:
 * - Christmas run 14 Nov 2026 – 3 Jan 2027, East Princes Street Gardens market (about 70 stalls, free entry),
 *   Big Wheel 46 m, Star Flyer 80 m, funfair in West Princes Street Gardens (edinburgh.org, The List).
 * - Hogmanay 29 Dec 2026 – 1 Jan 2027: Torchlight Procession 29 Dec, Night Afore 30 Dec, Street Party 31 Dec,
 *   free 1 Jan programme; festival dates back to 1993 (edinburgh.org, edinburghfestivalcity.com).
 * - Hogmanay customs: edinburghfestivalcity.com, edinburgh.org blog, history.co.uk. Food: Lonely Planet, Marriott Traveler.
 * - Airport tram 30 min to the centre (edinburghairport.com); London–Edinburgh fastest 4 h 5 min (Trainline).
 * - Booking advice: VisitScotland says Hogmanay and some markets can sell out.
 * Opening hours and ticket prices are NOT written: no official page gave them. No prices in the text.
 */

const EDINBURGH: RouteCity = { code: "EDI", name: "Edinburgh", country: "United Kingdom", slug: "edinburgh" };
const route = (from: FlightRoute["from"]): FlightRoute => ({ slug: `${from.slug}-to-edinburgh`, from, to: EDINBURGH });
const LONDON_ROUTE = route(ROUTE_CITIES.LON);
const PARIS_ROUTE = route(ROUTE_CITIES.PAR);
const AMSTERDAM_ROUTE = route(ROUTE_CITIES.AMS);
const NEWYORK_ROUTE = route(ROUTE_CITIES.NYC);

const FACTS = [
  { label: "Christmas runs", value: "14 Nov – 3 Jan" },
  { label: "Hogmanay", value: "29 Dec – 1 Jan" },
  { label: "Street Party", value: "31 Dec, Princes St" },
  { label: "Market", value: "~70 stalls, free entry" },
  { label: "Big Wheel", value: "46 m tall" },
  { label: "Star Flyer", value: "80 m tall" },
];

const EVENT = [
  "Edinburgh's Christmas runs from 14 November 2026 to 3 January 2027, in and around Princes Street Gardens and on George Street.",
  "East Princes Street Gardens has the market (about 70 stalls, free to enter), the LNER Big Wheel and the Around The World Star Flyer swing ride.",
  "West Princes Street Gardens has the family funfair and Santa's Stories. Ross Bandstand hosts free concerts.",
  "New this year, per The List: a festive hub at Bristo Square, a Viking-themed Polar Ice Bar, and three cabaret shows including La Clique (from 20 Nov) and Stamptown (3–19 Dec).",
  "Then Hogmanay (Scottish New Year): 29 Dec Torchlight Procession from the Meadows, 30 Dec Night Afore concert, 31 Dec Street Party with about 45,000 people, 1 Jan free culture trail and Family Ceilidh.",
  "The official site says the Hogmanay festival dates back to 1993. Fire is the old theme: a flame to chase away bad spirits and welcome the new year.",
];

const SPECIAL = [
  { title: "Haggis, neeps and tatties", text: "Haggis is minced sheep offal with oatmeal and onion. It is served with mashed turnip (neeps) and potato (tatties). It is the national dish." },
  { title: "Scotch whisky", text: "Made from malted barley and aged at least three years in oak casks. It is also a classic first-footing gift." },
  { title: "Shortbread and black bun", text: "Shortbread and black bun (fruit cake in pastry) are the traditional New Year gifts so a house never goes hungry." },
  { title: "Cranachan and Cullen skink", text: "Cranachan is cream, whisky, toasted oats and berries. Cullen skink is a smoked haddock and potato soup." },
  { title: "First-footing and Auld Lang Syne", text: "The first person through your door after midnight brings luck, with coal, shortbread or whisky. At midnight everyone links arms and sings Burns's Auld Lang Syne." },
  { title: "Loony Dook", text: "A New Year's Day dip in the icy Firth of Forth, often in fancy dress, to raise money for charity. Check the organiser for this year's details." },
];

const GOOD_TO_KNOW = [
  { icon: "🎟️", title: "Book ahead", text: "Market entry is free. Rides and some shows need tickets, and VisitScotland warns that Hogmanay and some Christmas events can sell out." },
  { icon: "🕑", title: "Check hours", text: "We found no official opening hours. Check the official event pages (edinburgh.org) before you go." },
  { icon: "🎆", title: "Hogmanay is ticketed", text: "The Street Party and concerts need tickets. Sign up on the official page to hear first about sales." },
  { icon: "🧥", title: "Dress for wind", text: "Scottish December is cold and wet. Waterproof layers beat umbrellas on Princes Street." },
  { icon: "🏁", title: "2 January is a holiday", text: "Per the official Edinburgh blog it is a national holiday in Scotland. Check opening times for 1–2 January." },
  { icon: "🚋", title: "Use the tram", text: "The airport tram stops at Haymarket, West End Princes Street and St Andrew Square." },
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
  { icon: "✈️", title: "From Edinburgh airport", text: "The tram takes about 30 to 35 minutes to St Andrew Square, from about £7.90 single. The Airlink 100 bus runs 24 hours to Waverley Bridge in about 30 minutes, from about £6.00. A city-zone ticket of about £2.40 does not cover the airport." },
  { icon: "🚆", title: "From the train station", text: "Waverley station is in the middle of the city, next to Princes Street Gardens, and the market area is a short walk. Haymarket is at the west end of Princes Street, and the tram stops there too." },
  { icon: "🚌", title: "From the long-distance bus station", text: "Edinburgh Bus Station is a short walk from the St Andrew Square tram stop. From there Princes Street is a few minutes away on foot." },
  { icon: "🚗", title: "By car", text: "The airport has car hire, and the city centre is hard to park in during events. Edinburgh has a Low Emission Zone in the centre, so check that your car meets the rules." },
  { icon: "🅿️", title: "Where to park", text: "Use a park-and-ride at the edge of the city, such as Ingliston, which is on the tram line, then ride in. Central car parks fill quickly in December." },
  { icon: "⚠️", title: "Limits for private vehicles", text: "Some central streets are closed or restricted for events, and the Low Emission Zone can bring a fine for older vehicles." },
];

export function EdinburghChristmasHogmanay2026({ today }: { today: string }) {
  // First Friday–Sunday weekend of December: inside the Christmas run, before the pre-Christmas rush.
  const weekend = weekendIn("2026-12", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} December` : null;
  // Hogmanay stay: 29 Dec – 2 Jan, only while still in the future.
  const hog = today < "2026-12-29" ? { departureDate: "2026-12-29", returnDate: "2027-01-02" } : null;

  const search = (r: FlightRoute, mode?: "flights" | "hotels") => (dates ? (mode ? routeSearchUrl(r, dates, mode) : routeSearchUrl(r, dates)) : `/?mode=${mode ?? "packages"}`);
  const trainUrl = dates ? buildOmioResultsLink({ from: "London", to: "Edinburgh", ...dates, travelMode: "TRAIN" }) : null;
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Edinburgh, United Kingdom", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;
  const hogBookingUrl = hog
    ? buildBookingSearchUrl({ destination: "Edinburgh, United Kingdom", ...hog, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  const flightCards = [
    { city: "London", r: LONDON_ROUTE, note: "Compare flights from London to Edinburgh." },
    { city: "Paris", r: PARIS_ROUTE, note: "Compare flights from Paris to Edinburgh." },
    { city: "Amsterdam", r: AMSTERDAM_ROUTE, note: "Compare flights from Amsterdam to Edinburgh." },
    { city: "New York", r: NEWYORK_ROUTE, note: "Compare flights from New York to Edinburgh." },
  ];

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">
        Edinburgh&apos;s Christmas is already on (14 Nov – 3 Jan), and <strong>Hogmanay</strong>, Scotland&apos;s big New Year party, runs 29 Dec – 1 Jan. Short facts, then live
        prices.
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
          <a href="https://edinburgh.org/festivals/edinburghs-christmas-hogmanay" target="_blank" rel="noopener noreferrer" className="underline">
            edinburgh.org
          </a>{" "}
          and{" "}
          <a href="https://edinburgh.org/festivals/edinburghs-hogmanay" target="_blank" rel="noopener noreferrer" className="underline">
            the Hogmanay page
          </a>
          . Check the official pages for tickets and the full programme.
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
        {when && <p className="text-sm text-slate-500">Buttons are set for the weekend of {when}. Change the dates on the next page (try 29 Dec – 2 Jan for Hogmanay).</p>}
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
        {trainUrl && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">🚆 London → Edinburgh by train</p>
            <p className="mt-1 text-sm text-slate-700">The fastest train takes about 4 hours 5 minutes (Trainline). Trains arrive at Edinburgh Waverley.</p>
            <div className="mt-3">
              <ButtonLink href={trainUrl} external>
                London → Edinburgh
              </ButtonLink>
            </div>
          </div>
        )}
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="font-bold text-slate-900">From Edinburgh Airport to the centre</p>
          <Bullets
            items={[
              "The tram stop is outside the main terminal. The ride to the city centre takes about 30 minutes, per the airport.",
              "Trams run every 7 minutes in the day. First tram from the airport 06:30, last 22:52.",
              "Get off at West End – Princes Street or St Andrew Square for the markets.",
            ]}
          />
        </div>
      </section>

      <section id="getting-around" aria-labelledby="around-title" className="scroll-mt-24 space-y-4">
        <h2 id="around-title" className="text-2xl font-extrabold text-slate-900">
          {"Getting around in Edinburgh: how to reach the markets and Princes Street"}
        </h2>
        <p className="text-sm text-slate-600">{"The Christmas market and Hogmanay events are in the city centre around Princes Street Gardens and the Old Town, which is easy to reach on public transport. Prices are indicative, so check them on the day."}</p>
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
          <p className="mt-1 text-sm text-slate-800">{"Easiest overall: the Airlink 100 or the tram from the airport, then walk. By train, Waverley puts you next to the gardens. By car, use a park-and-ride and take the tram in."}</p>
          <p className="mt-3 text-xs text-slate-500">{"Indicative costs: airport bus about £6.00 single, airport tram about £7.90 single and a city-zone single about £2.40. Tap-on tap-off fares are capped daily. Parking prices change by car park, so check the sign or the operator site."}</p>
        </div>
      </section>

      <section id="where-to-stay" aria-labelledby="stay-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.edinburghNight} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Where to stay</p>
          <h2 id="stay-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Old Town and New Town for walking distance
          </h2>
          <Bullets
            items={[
              "New Town (around Princes Street and George Street) puts the markets, Big Wheel and Hogmanay Street Party on your doorstep.",
              "Old Town is the atmospheric choice. The Torchlight Procession passes through it.",
              "Hogmanay beds go early. Book with free cancellation.",
            ]}
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href={search(LONDON_ROUTE, "hotels")} primary>
              Compare Edinburgh hotels
            </ButtonLink>
            {bookingUrl && (
              <ButtonLink href={bookingUrl} external>
                Booking.com ({when})
              </ButtonLink>
            )}
            {hogBookingUrl && (
              <ButtonLink href={hogBookingUrl} external>
                Booking.com Hogmanay
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

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <Photo photo={PHOTOS.edinburghBalmoral} />
      </section>

      <section className="rounded-3xl bg-brand-900 p-6 text-white sm:p-8">
        <h2 className="text-2xl font-extrabold">Flight + hotel in one search</h2>
        <p className="mt-2 text-brand-100">Glooconn shows flight + hotel packages for Edinburgh within your budget. Change your home city on the next page. You book each part directly with our partners.</p>
        <Link href={search(LONDON_ROUTE)} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
