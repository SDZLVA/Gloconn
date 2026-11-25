import Link from "next/link";
import { PHOTOS, Photo } from "@/components/blog/Photo";
import { weekendIn } from "@/lib/blog/dates";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { buildOmioResultsLink } from "@/lib/affiliate/omio";
import { ROUTE_CITIES, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";

/**
 * Blog post (buffer, written 2026-11-21): Dolomites ski season 2026/27. Facts checked 2026-11-21 against dolomiti.it (Dolomiti Superski season dates), valgardena.it, altabadia.org, Südtirol/suedtirol.info, Powderhounds and Sky Sport (FIS calendar).
 * No prices are written in the text: every price comes from the live search the buttons open.
 */

const VENICE = { code: "VCE", name: "Venice", country: "Italy", slug: "venice" } as const;
const INNSBRUCK = { code: "INN", name: "Innsbruck", country: "Austria", slug: "innsbruck" } as const;
const route = (from: FlightRoute["from"], to: FlightRoute["to"] = VENICE): FlightRoute => ({ slug: `${from.slug}-to-${to.slug}`, from, to });
const LONDON_ROUTE = route(ROUTE_CITIES.LON);
const AMSTERDAM_ROUTE = route(ROUTE_CITIES.AMS);
const PARIS_ROUTE = route(ROUTE_CITIES.PAR);
const LONDON_INNSBRUCK_ROUTE = route(ROUTE_CITIES.LON, INNSBRUCK);

const FACTS = [
  { label: "Season opens", value: "28 Nov, Plan de Corones" },
  { label: "Val Gardena / Alta Badia", value: "Open 4 Dec" },
  { label: "Val Gardena World Cup", value: "18–19 Dec" },
  { label: "Alta Badia World Cup", value: "20–21 Dec" },
  { label: "Season ends", value: "4 Apr 2027 (most areas)" },
  { label: "Gateway airports", value: "Venice, Innsbruck, Verona, Munich" },
];

const EVENT = [
  "Dolomiti Superski opens the season on 28 November 2026 at Plan de Corones (to 11 April 2027). Alta Badia, Val Gardena / Alpe di Siusi and Val di Fassa / Carezza open on 4 December (to 4 April 2027). Arabba / Marmolada opens on 4 December and runs to 18 April (dolomiti.it).",
  "World Cup, Val Gardena: the Saslong Classic is on 18 and 19 December, with a super-G and a downhill (dolomiti.it, valgardena.it).",
  "World Cup, Alta Badia: giant slalom and slalom on 20 and 21 December, at La Villa (altabadia.org, FIS calendar).",
  "The Saslong is famous for its 'camel humps' and speeds of up to 100 km/h, says the Val Gardena tourist office. World Cup racing there goes back to the 1970s.",
  "Race dates come from the provisional FIS calendar. Check the organisers before you book.",
];

const SPECIAL = [
  { icon: "🥟", title: "Canederli", text: "Bread dumplings, often with speck and served in broth or with salad. The suedtirol.info site calls them the taste of the region." },
  { icon: "🥓", title: "Speck and Schüttelbrot", text: "South Tyrolean smoked ham with crisp rye flatbread, a snack for centuries (Val Gardena tourist office)." },
  { icon: "🍎", title: "Apple strudel", text: "Layered pastry with cooked apples, raisins and cinnamon, usually with vanilla sauce (Val Gardena)." },
  { icon: "🥞", title: "Kaiserschmarrn", text: "Shredded sweet pancake, a hut classic with strudel (Val Gardena)." },
  { icon: "🍝", title: "Schlutzkrapfen", text: "Filled pasta pockets, listed with speck and strudel as a South Tyrol speciality (suedtirol.com)." },
  { icon: "🏠", title: "Mountain huts (rifugi)", text: "Italysegreta calls the high-alpine huts the best places to try Dolomitic cooking." },
];

const PLACES = [
  { name: "Val Gardena / Alpe di Siusi", line1: "Opens 4 Dec", line2: "Home of the Saslong", note: "Part of the Dolomiti Superski area. The World Cup downhill and super-G are held here on 18–19 Dec." },
  { name: "Alta Badia", line1: "Opens 4 Dec", line2: "Gran Risa slope, La Villa", note: "Lift- and piste-linked with Val Gardena, Val di Fassa and Arabba (Powderhounds). World Cup giant slalom and slalom on 20–21 Dec." },
  { name: "Plan de Corones (Kronplatz)", line1: "Opens 28 Nov", line2: "To 11 April 2027", note: "The first Dolomiti Superski area to open, per dolomiti.it." },
  { name: "Arabba / Marmolada", line1: "Opens 4 Dec", line2: "To 18 April 2027", note: "The longest season of the big areas, per dolomiti.it. Sources disagree on the opening day, so check closer to the date." },
];

const STAY = [
  "Val Gardena (Selva, Santa Cristina, Ortisei) and Alta Badia (Corvara, La Villa) are linked by lifts, so you can ski between them.",
  "Race days are busy: the Val Gardena tourist office offers a World Cup package with a room, race entry and a Dolomiti Superski pass at a reduced price.",
  "Book early for 18–21 December and choose free cancellation.",
];

const GOOD_TO_KNOW = [
  { icon: "🚌", title: "Airport shuttles", text: "Dolomiti Superski lists shuttle buses between Venice and Treviso airports and Cortina and Alta Badia." },
  { icon: "🛞", title: "Winter tyres", text: "Powderhounds says most rental cars from Italy do not come fully winterised, while those from Innsbruck or Munich do." },
  { icon: "🎟️", title: "Ski pass", text: "Dolomiti Superski's 2026/27 adult day pass in high season is €89, per its press release." },
  { icon: "🌨️", title: "Check conditions", text: "Lift openings are subject to change. Dolomiti Superski publishes a daily bulletin of open lifts and slopes." },
];

const TRAINS: { city: string; time?: string }[] = [
  { city: "Verona" },
  { city: "Innsbruck" },
  { city: "Munich" },
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
  { icon: "✈️", title: "From the airports", text: "Bolzano is about 30 km away but has limited flights. Innsbruck is about 130 km, Treviso about 170 km, Venice about 180 km, Verona about 230 km and Munich about 330 km. Shuttle buses run from several airports to the valleys." },
  { icon: "🚆", title: "From the train station", text: "Take a train to Bolzano or to Chiusa (Klausen) or Bressanone, then a bus. For Val Gardena, bus 350 runs from Bolzano in about an hour. Brunico is about 30 km from Alta Badia." },
  { icon: "🚌", title: "By long-distance bus", text: "FlixBus and Alto Adige Bus link Innsbruck, Munich and Bolzano with the valleys. The valleys also have Südtirol Transfer shuttles and taxis for the last part." },
  { icon: "🚗", title: "By car", text: "Val Gardena is one of the easier Dolomites resorts to reach by car, and the Chiusa/Val Gardena exit is the usual way. From Innsbruck it is about 2 hours in winter. From Venice it can take around 3 hours on mountain roads." },
  { icon: "🅿️", title: "Where to park", text: "Many hotels have their own car park, and several lift stations have car parks too, so ask your hotel before you arrive. Many guests leave the car for the week and use the ski buses and the lifts." },
  { icon: "⚠️", title: "Limits for private vehicles", text: "From 15 November to 15 April, cars in the Dolomites need winter tyres or snow chains on board. Police checks are common, and a hire car should come with them. Four-wheel drive helps on the mountain roads." },
];

export function DolomitesSkiSeason2026({ today }: { today: string }) {
  // First Friday–Sunday weekend from tomorrow, before the pre-Christmas rush.
  const weekend = weekendIn("2026-12", today) ?? weekendIn("2026-11", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} ${weekend.departureDate.slice(5, 7) === "12" ? "December" : "November"}` : null;

  const search = (r: FlightRoute, mode?: "flights" | "hotels") => (dates ? (mode ? routeSearchUrl(r, dates, mode) : routeSearchUrl(r, dates)) : `/?mode=${mode ?? "packages"}`);
  const trainFrom = (city: string) => (dates ? buildOmioResultsLink({ from: city, to: "Bolzano", ...dates, travelMode: "TRAIN" }) : null);
  const packagesUrl = search(LONDON_ROUTE);
  const hotelsUrl = "/?mode=hotels";
  const flightCards = [
    { title: "London → Venice", r: LONDON_ROUTE, note: "Venice is a common gateway for Cortina and Alta Badia (Powderhounds, Dolomiti Superski). Compare flights from London to Venice." },
    { title: "Amsterdam → Venice", r: AMSTERDAM_ROUTE, note: "Compare flights from Amsterdam to Venice." },
    { title: "Paris → Venice", r: PARIS_ROUTE, note: "Compare flights from Paris to Venice." },
    { title: "London → Innsbruck", r: LONDON_INNSBRUCK_ROUTE, note: "Innsbruck is about 130 km north of the main resorts (Powderhounds). Compare flights from London to Innsbruck." },
  ];
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Val Gardena, Italy", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">{"The Dolomites open for skiing on 28 November, and the big valleys, Val Gardena and Alta Badia, follow on 4 December. Two weeks later the men's World Cup arrives, with races in both valleys from 18 to 21 December. Here are the dates, what to eat in the mountain huts and how to get there from London, Amsterdam and Paris, with live prices."}</p>

      <section aria-label="Quick facts">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FACTS.map((f) => (
            <li key={f.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{f.label}</p>
              <p className="mt-1 font-extrabold text-slate-900">{f.value}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">{"Season dates from Dolomiti Superski via dolomiti.it (6 Oct 2026); lift openings depend on snow. Race dates from dolomiti.it, altabadia.org and the provisional FIS 2026/27 calendar: check the organisers before you book."}</p>
      </section>

      <section id="about-the-event" aria-labelledby="about-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.dolomitesVillnoess} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">About the season</p>
          <h2 id="about-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Dolomiti Superski 2026/27
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
          Ski areas to know
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
            <p className="mt-1 text-sm text-slate-700">Trains run to Bolzano. From Bolzano or Chiusa a public bus, a Südtirol Transfer or a taxi reaches Val Gardena (valgardena.it).</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TRAINS.map((t) => {
                const url = trainFrom(t.city);
                return url ? (
                  <ButtonLink key={t.city} href={url} external>
                    {t.city} → Bolzano{t.time ? `, ${t.time}` : ""}
                  </ButtonLink>
                ) : null;
              })}
            </div>
          </div>
        )}
      </section>

      <section id="getting-around" aria-labelledby="around-title" className="scroll-mt-24 space-y-4">
        <h2 id="around-title" className="text-2xl font-extrabold text-slate-900">
          {"Getting around in the Dolomites: how to reach the ski areas"}
        </h2>
        <p className="text-sm text-slate-600">{"The main ski areas, like Val Gardena and Alta Badia, are in the mountains, so you usually fly, then take a bus, train or car. Prices are indicative, so check them on the day."}</p>
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
          <p className="mt-1 text-sm text-slate-800">{"Easiest overall: fly to Innsbruck or Bolzano and take a shuttle or bus to your valley, then use the ski bus. By car, make sure you have winter tyres or chains, and park once."}</p>
          <p className="mt-3 text-xs text-slate-500">{"Indicative costs: local bus tickets are low, but fares and shuttle prices vary by operator and season. No fixed price is shown here, so check Südtirol Mobil and the shuttle company before you travel."}</p>
        </div>
      </section>

      <section id="where-to-stay" aria-labelledby="stay-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.dolomitesSanMartino} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Where to stay</p>
          <h2 id="stay-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Stay in the valley you ski
          </h2>
          <Bullets items={STAY} />
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href={hotelsUrl} primary>
              Compare hotels
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
        <p className="mt-2 text-brand-100">{"Glooconn shows flight + hotel packages within your budget. Change your home city and destination on the next page. You book each part directly with our partners."}</p>
        <Link href={packagesUrl} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
