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
const ROUTE: FlightRoute = { slug: "milan-to-strasbourg", from: ROUTE_CITIES.MIL, to: STRASBOURG };

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

export function StrasbourgChristmasMarket2026({ today }: { today: string }) {
  // First Friday–Sunday weekend from tomorrow, before the pre-Christmas rush.
  const weekend = weekendIn("2026-12", today) ?? weekendIn("2026-11", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} ${weekend.departureDate.slice(5, 7) === "12" ? "December" : "November"}` : null;

  const packagesUrl = dates ? routeSearchUrl(ROUTE, dates) : "/?mode=packages";
  const flightsUrl = dates ? routeSearchUrl(ROUTE, dates, "flights") : "/?mode=flights";
  const hotelsUrl = dates ? routeSearchUrl(ROUTE, dates, "hotels") : "/?mode=hotels";
  const trainUrl = dates ? buildOmioResultsLink({ from: "Milan", to: "Strasbourg", ...dates, travelMode: "TRAIN" }) : null;
  const busUrl = dates ? buildOmioResultsLink({ from: "Milan", to: "Strasbourg", ...dates, travelMode: "BUS" }) : null;
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Strasbourg, France", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">
        France&apos;s oldest Christmas market opens on <strong>Friday 27 November</strong>. From Milan there is no direct train — but there is a direct
        flight and an easy train change in Basel. Here is everything you need, with live prices.
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
          Getting there from Milan
        </h2>
        {when && <p className="text-sm text-slate-500">Buttons below are set for the weekend of {when} — change the dates on the next page.</p>}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">✈ Flight</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">About 1 h 10 min</p>
            <ul className="mt-2 flex-1 space-y-1 text-sm text-slate-700">
              <li>• easyJet flies Malpensa → Strasbourg direct.</li>
              <li>• Only a few flights a week — check the days first.</li>
            </ul>
            <div className="mt-4">
              <ButtonLink href={flightsUrl} primary>
                Compare flights
              </ButtonLink>
            </div>
          </div>
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">🚆 Train</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">About 7 h, 1 change</p>
            <ul className="mt-2 flex-1 space-y-1 text-sm text-slate-700">
              <li>• No direct train. Milan → Basel SBB takes about 4 h 10 min – 4 h 30 min.</li>
              <li>• Then Basel → Strasbourg, around 1 h 20 min.</li>
            </ul>
            <div className="mt-4">
              {trainUrl ? (
                <ButtonLink href={trainUrl} external primary>
                  Train tickets on Omio
                </ButtonLink>
              ) : (
                <ButtonLink href="/?mode=transport" primary>
                  Mixed transport
                </ButtonLink>
              )}
            </div>
          </div>
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">🚌 Bus</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">Slowest, often cheapest</p>
            <ul className="mt-2 flex-1 space-y-1 text-sm text-slate-700">
              <li>• Omio lists bus options between Milan and Strasbourg.</li>
              <li>• Compare the total time before you choose.</li>
            </ul>
            <div className="mt-4">
              {busUrl ? (
                <ButtonLink href={busUrl} external>
                  Bus tickets on Omio
                </ButtonLink>
              ) : (
                <ButtonLink href="/?mode=transport">Mixed transport</ButtonLink>
              )}
            </div>
          </div>
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
          Glooconn shows packages for Milan → Strasbourg within your budget. You book each part directly with our partners.
        </p>
        <Link href={packagesUrl} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
