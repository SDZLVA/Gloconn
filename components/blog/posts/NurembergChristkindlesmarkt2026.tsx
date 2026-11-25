import Link from "next/link";
import { PHOTOS, Photo } from "@/components/blog/Photo";
import { weekendIn } from "@/lib/blog/dates";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { buildOmioResultsLink } from "@/lib/affiliate/omio";
import { ROUTE_CITIES, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";

/**
 * Blog post (written 2026-11-25): Nuremberg Christkindlesmarkt 2026. Facts checked 2026-11-25 against the City of Nuremberg (nuernberg.de), Nuremberg Tourism (tourismus.nuernberg.de), the city's 2026 press information, Radical Storage, European Traveler and Festivals in Deutschland.
 * No prices are written in the text: every price comes from the live search the buttons open.
 */

const NUREMBERG = { code: "NUE", name: "Nuremberg", country: "Germany", slug: "nuremberg" } as const;
const route = (from: FlightRoute["from"], to: FlightRoute["to"] = NUREMBERG): FlightRoute => ({ slug: `${from.slug}-to-${to.slug}`, from, to });
const LONDON_ROUTE = route(ROUTE_CITIES.LON);
const PARIS_ROUTE = route(ROUTE_CITIES.PAR);
const AMSTERDAM_ROUTE = route(ROUTE_CITIES.AMS);
const ISTANBUL_ROUTE = route(ROUTE_CITIES.IST);

const FACTS = [
  { label: "Dates", value: "27 Nov – 24 Dec 2026" },
  { label: "Opening", value: "Fri 27 Nov, 17:30" },
  { label: "Daily hours", value: "10:00 – 21:00" },
  { label: "24 December", value: "10:00 – 14:00" },
  { label: "Entry", value: "Free" },
  { label: "Where", value: "Hauptmarkt, old town" },
];

const EVENT = [
  "The market runs 27 November to 24 December 2026 on the Hauptmarkt in the old town. Entry is free (Nuremberg Tourism).",
  "The official opening is on Friday 27 November at 17:30. The Nuremberg Christkind, a young woman chosen for two years, speaks a prologue from the Frauenkirche balcony (City of Nuremberg).",
  "Daily hours are 10:00 to 21:00. On 24 December the market closes at 14:00, and the Sister Cities Market on the Rathausplatz closes a day earlier, on 23 December.",
  "The market was first mentioned in writing in 1678, according to the city.",
];

const SPECIAL = [
  { icon: "👼", title: "The Christkind", text: "A real person, elected for two years, opens the market and visits the stalls during the season." },
  { icon: "🍞", title: "Nuremberg gingerbread", text: "Lebkuchen is the local speciality, sold in many stalls around the Hauptmarkt." },
  { icon: "🌭", title: "Rostbratwurst", text: "Small grilled sausages, usually served in threes or sixes in a bun. The city lists them with the market's main treats." },
  { icon: "🧸", title: "Prune men", text: "Zwetschgenmännle are small figures made of dried plums and figs. They are the market's classic souvenir." },
  { icon: "🌍", title: "Sister Cities Market", text: "On the Rathausplatz, partner cities of Nuremberg sell food and crafts from around the world." },
  { icon: "🎠", title: "Children's Christmas", text: "The Kinderweihnacht on the Hans-Sachs-Platz has a children's programme for families." },
];

const PLACES = [
  { name: "Hauptmarkt and Frauenkirche", line1: "The heart of the market", line2: "Free to walk through", note: "The church balcony is where the Christkind opens the market. Come on a weekday morning for fewer crowds." },
  { name: "Sister Cities Market", line1: "Rathausplatz, next to the main market", line2: "Open to 23 December", note: "A quick walk from the Hauptmarkt, with food and crafts from partner cities." },
  { name: "Kinderweihnacht", line1: "Hans-Sachs-Platz", line2: "For families", note: "A children's programme, a short walk from the main square." },
  { name: "Original Regional", line1: "In front of the Sebalduskirche", line2: "Local products", note: "A few stalls with food and gifts from Franconia." },
];

const STAY = [
  "Staying inside the old town means you can walk to the Hauptmarkt and avoid driving and parking.",
  "Hotels near the main station are a good second choice: the market is about 15 minutes on foot.",
  "Advent weekends are busy, so book a room with free cancellation.",
];

const GOOD_TO_KNOW = [
  { icon: "🧥", title: "Dress warm", text: "The market is outdoors and often around 4 °C in the daytime in December." },
  { icon: "💶", title: "Bring a bit of cash", text: "Many stalls take cards, but some small stands may prefer cash." },
  { icon: "🍷", title: "Mulled wine mugs", text: "Glühwein is served in a mug with a deposit, which you get back when you return it." },
  { icon: "🕔", title: "Opening night is busy", text: "On 27 November the market pauses around the 17:30 ceremony, and the square fills up. Come on another day for a calmer visit." },
];
const TRANSPORT = [
  { icon: "✈️", title: "From Nuremberg Airport", text: "The U2 underground runs from the airport to the main station (Hauptbahnhof) in about 12 to 13 minutes. A single ticket is a short-zone fare of roughly €3 to €3.50 (VAG). From the station, walk about 15 minutes or take the U1 to the old town." },
  { icon: "🚆", title: "From the main station (Hbf)", text: "The old town starts just across the road. Walk about 15 minutes along the Königstraße to the Hauptmarkt, or ride the U1 to Lorenzkirche or Weißer Turm and walk about 5 minutes. Both are inside the same city fare zone." },
  { icon: "🚌", title: "From the long-distance bus station (ZOB)", text: "The bus station is on Willy-Brandt-Platz, opposite the main station. Walk about 15 to 20 minutes to the market, or go through the station and take the U1. Coaches carrying tour groups use separate drop-off points near the old town, so ask your operator." },
  { icon: "🚗", title: "By car", text: "The A3, A6, A9 and A73 motorways all reach Nuremberg. The old town is mostly closed to traffic, and the city has a low-emission zone that needs a green sticker. Park in a garage at the edge of the centre and walk." },
  { icon: "🅿️", title: "Where to park", text: "Parkhaus Hauptmarkt (Augustinerstraße 4) is about 3 minutes' walk from the market, with a maximum height of 2.10 m. Other garages near the Findelgasse and the main station are also close. Park and Ride at the edge of the city is the cheapest option." },
  { icon: "⚠️", title: "Limits for private vehicles", text: "Tall vans and campers over about 2.10 m do not fit the closest garage. Coaches are not allowed into the pedestrian old town. Without a green sticker you risk a fine in the low-emission zone. Cars are not allowed on the market streets themselves." },
];

const TRAINS: { city: string; time?: string }[] = [
  { city: "Munich", time: "about 1 h" },
  { city: "Frankfurt", time: "about 2 h" },
  { city: "Vienna", time: "about 4 h" },
  { city: "Prague" },
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

export function NurembergChristkindlesmarkt2026({ today }: { today: string }) {
  // First Friday–Sunday weekend from tomorrow, before the pre-Christmas rush.
  const weekend = weekendIn("2026-12", today) ?? weekendIn("2026-11", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} ${weekend.departureDate.slice(5, 7) === "12" ? "December" : "November"}` : null;

  const search = (r: FlightRoute, mode?: "flights" | "hotels") => (dates ? (mode ? routeSearchUrl(r, dates, mode) : routeSearchUrl(r, dates)) : `/?mode=${mode ?? "packages"}`);
  const trainFrom = (city: string) => (dates ? buildOmioResultsLink({ from: city, to: "Nuremberg", ...dates, travelMode: "TRAIN" }) : null);
  const packagesUrl = search(LONDON_ROUTE);
  const hotelsUrl = search(LONDON_ROUTE, "hotels");
  const flightCards = [
    { title: "From London", r: LONDON_ROUTE, note: "Compare flights from London to Nuremberg." },
    { title: "From Paris", r: PARIS_ROUTE, note: "Compare flights from Paris to Nuremberg." },
    { title: "From Amsterdam", r: AMSTERDAM_ROUTE, note: "Compare flights from Amsterdam to Nuremberg." },
    { title: "From Istanbul", r: ISTANBUL_ROUTE, note: "Compare flights from Istanbul to Nuremberg." },
  ];
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Nuremberg, Germany", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">{"The Nuremberg Christkindlesmarkt opens this Friday, 27 November, and it is one of the best-known Christmas markets in Germany. The Christkind opens it from the balcony of the Frauenkirche, then about 160 red-and-white stalls fill the Hauptmarkt until Christmas Eve. Here are the dates, what to try, and exactly how to reach the market from the airport, the station or by car, with parking."}</p>

      <section aria-label="Quick facts">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FACTS.map((f) => (
            <li key={f.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{f.label}</p>
              <p className="mt-1 font-extrabold text-slate-900">{f.value}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">{"Dates and hours from the City of Nuremberg and Nuremberg Tourism. Some pages list 22:00 on opening night, so check the official Christkindlesmarkt site before a late visit."}</p>
      </section>

      <section id="about-the-event" aria-labelledby="about-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.nurembergTower} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">About the market</p>
          <h2 id="about-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Germany&apos;s famous town of wood and cloth
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
          What to see around the market
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
            <p className="mt-1 text-sm text-slate-700">Nuremberg is on the main German rail network. Compare train and bus tickets for the weekend of your trip.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TRAINS.map((t) => {
                const url = trainFrom(t.city);
                return url ? (
                  <ButtonLink key={t.city} href={url} external>
                    {t.city} → Nuremberg{t.time ? `, ${t.time}` : ""}
                  </ButtonLink>
                ) : null;
              })}
            </div>
          </div>
        )}
      </section>


      <section id="getting-around" aria-labelledby="around-title" className="scroll-mt-24 space-y-4">
        <h2 id="around-title" className="text-2xl font-extrabold text-slate-900">
          Getting around in Nuremberg: how to reach the market
        </h2>
        <p className="text-sm text-slate-600">{"The Hauptmarkt is in the pedestrian old town, so the last part is always on foot. Here is how to get close from the airport, the main station, the long-distance bus station and by car. Prices are indicative, so check them on the day."}</p>
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
          <p className="mt-1 text-sm text-slate-800">{"Easiest overall: arrive by train or the airport's U2, get off at the main station, then walk or ride the U1 to Lorenzkirche. By car, the easiest is a Park and Ride at the city edge, then public transport in. It avoids the old town's limited parking and traffic."}</p>
          <p className="mt-3 text-xs text-slate-500">{"Indicative costs: a single public-transport ticket from the airport to the centre is from about €3.30. City-run parking in the old town is from about €2.50 per hour, and from about €2 per hour outside the centre. Private garages such as Parkhaus Hauptmarkt are from about €1.80 per hour. Prices change, so check the sign or the operator's site."}</p>
        </div>
      </section>

      <section id="where-to-stay" aria-labelledby="stay-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.nurembergStreet} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Where to stay</p>
          <h2 id="stay-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Stay in or near the old town
          </h2>
          <Bullets items={STAY} />
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href={hotelsUrl} primary>
              Compare Nuremberg hotels
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
        <p className="mt-2 text-brand-100">{"Glooconn shows flight + hotel packages for Nuremberg within your budget. Change your home city on the next page. You book each part directly with our partners."}</p>
        <Link href={packagesUrl} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
