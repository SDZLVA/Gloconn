import Link from "next/link";
import { PHOTOS, Photo } from "@/components/blog/Photo";
import { weekendIn } from "@/lib/blog/dates";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { buildOmioResultsLink } from "@/lib/affiliate/omio";
import { ROUTE_CITIES, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";

/**
 * Blog post (written 2026-11-26): Brussels Winter Wonders 2026/27. Facts checked 2026-11-26 against the City of Brussels (brussels.be),
 * the organiser's site (winterwonders.be / plaisirsdhiver.be), visit.brussels, STIB-MIVB, Brussels Airport, Eurostar and Seat61.
 * Parking prices come from a secondary source and are labelled indicative. No fares are written in the text: prices come from the live search the buttons open.
 */

const BRUSSELS = { code: "BRU", name: "Brussels", country: "Belgium", slug: "brussels" } as const;
const route = (from: FlightRoute["from"], to: FlightRoute["to"] = BRUSSELS): FlightRoute => ({ slug: `${from.slug}-to-${to.slug}`, from, to });
const LONDON_ROUTE = route(ROUTE_CITIES.LON);
const NEWYORK_ROUTE = route(ROUTE_CITIES.NYC);
const ISTANBUL_ROUTE = route(ROUTE_CITIES.IST);

const FACTS = [
  { label: "Dates", value: "27 Nov 2026 – 3 Jan 2027" },
  { label: "Opening day", value: "Fri 27 Nov, from 12:00" },
  { label: "Daily hours", value: "12:00 – 22:00" },
  { label: "Closes at 18:00", value: "24 Dec, 31 Dec, 3 Jan" },
  { label: "Entry", value: "Free" },
  { label: "Where", value: "Grand-Place and 8 more squares" },
];

const EVENT = [
  "Winter Wonders (French: Plaisirs d'Hiver, Dutch: Winterpret) runs from 27 November 2026 to 3 January 2027. It is organised by the City of Brussels, and 2026 is its 25th edition.",
  "It is a trail of chalets, rides and light shows across the city centre: Grand-Place, the Fish Market (Marché aux Poissons), Place De Brouckère, Mont des Arts, Place de la Bourse, Place Sainte-Catherine, the Black Tower, Place de la Monnaie and Place Poelaert.",
  "Opening day is Friday 27 November. The market opens at 12:00, and the official opening show and tree lighting are on the Grand-Place at 18:00.",
  "The sound and light show \"Birth\" is projected on the City Hall tower. It lasts three minutes and repeats every 20 minutes from 18:00 to 22:00, from 27 November to 2 January. There is no show on 24 and 31 December.",
  "Walking around the market and watching the show is free. Some attractions, such as the View Tower at City Hall, need a booking.",
];

const NEW_2026 = [
  { icon: "🎂", title: "25th birthday", text: "A birthday edition, with a cake by pastry chef Stephan Goldrajch on show at the Fish Market." },
  { icon: "🏔️", title: "Basque and Béarn guests", text: "The guests of honour are the Basque Country and Béarn (Pyrénées-Atlantiques), with a village on Place de la Bourse." },
  { icon: "🎠", title: "New baroque carousel", text: "A chain carousel with 20 bauble-shaped seats on Place de la Monnaie, plus Santa's Reindeer Carousel." },
  { icon: "🎻", title: "Classissimo Sessions", text: "Classical concerts of about two hours at City Hall, listed for 19 to 23 December." },
  { icon: "🏛️", title: "View Tower at City Hall", text: "A viewpoint open from 15:00 to 21:00, Thursday to Saturday from 3 to 19 December and daily from 21 December to 2 January, except 24 and 31 December. Booking needed." },
  { icon: "📸", title: "Winter Memories", text: "A photo exhibition of 24 panels on Place Royale, from 27 November to 3 January." },
];

const SPECIAL = [
  { icon: "🍷", title: "Mulled wine and hot chocolate", text: "Warm drinks are served from the chalets all over the squares. Tourism and travel media also list Belgian beer and jenever, a juniper spirit." },
  { icon: "🧇", title: "Belgian waffles", text: "Waffles are on sale in the chalets and in the shops of the centre. Try one hot, with sugar or toppings." },
  { icon: "🍟", title: "Frites", text: "Belgian chips with sauce are a standard snack, found in the market and in snack shops around the centre." },
  { icon: "🍫", title: "Chocolate and pralines", text: "The shops around the Grand-Place sell Belgian chocolate. Travel media also mention chocolate makers at the market." },
  { icon: "🧀", title: "Hearty winter dishes", text: "Cheese dishes such as tartiflette are on offer in the chalets, for example at Place Sainte-Catherine and the Fish Market." },
  { icon: "🌶️", title: "Basque and Béarn village", text: "On Place de la Bourse you can taste and buy products from the guest region this year." },
];

const PLACES = [
  { name: "Grand-Place", line1: "The tree and the light show", line2: "Free to watch", note: "Come at 18:00 for the first show of the evening, or after 21:00 when it is quieter." },
  { name: "Fish Market (Marché aux Poissons)", line1: "Food chalets and the big wheel", line2: "Lotto Big Wheel", note: "The biggest cluster of chalets, a short walk from Place Sainte-Catherine." },
  { name: "Place De Brouckère", line1: "Skating and curling", line2: "Ice rink and curling are listed on the official trail", note: "Check the official map for the exact rink hours and prices before you go." },
  { name: "Mont des Arts", line1: "A viewpoint village", line2: "Gardens above the city", note: "Pretty at sunset, and a calmer stop between the busy squares." },
];

const STAY = [
  "Stay inside the Pentagon, the ring road around the old centre: you can walk to the Grand-Place and avoid car and parking problems.",
  "Hotels around Brussels-Central or Brussels-Midi stations are a good second choice, with fast trains and metro into the centre.",
  "Advent weekends and opening weekend are busy, so book a room with free cancellation.",
];

const GOOD_TO_KNOW = [
  { icon: "🧥", title: "Dress warm", text: "The trail is outdoors from 12:00 to 22:00. Wear layers and shoes that can handle wet cobbles." },
  { icon: "♻️", title: "Reusable cups", text: "The market uses reusable cups and compostable tableware, so expect a deposit on your mug." },
  { icon: "🔦", title: "Plan around the show", text: "The light show is every 20 minutes from 18:00, so you can see it on the way between squares." },
  { icon: "🌟", title: "Opening day is crowded", text: "The Grand-Place is full around the 18:00 opening show on 27 November. Come on a weekday for more space." },
];

const TRAINS: { city: string; time: string; note: string }[] = [
  { city: "London", time: "about 2 h", note: "Eurostar, direct to Brussels-Midi. Eurostar says 1 h 53 for its fastest trains." },
  { city: "Paris", time: "from about 1 h 22", note: "Eurostar (formerly Thalys), direct to Brussels-Midi." },
  { city: "Amsterdam", time: "from about 1 h 52", note: "Eurostar and EuroCity Direct, direct to Brussels-Midi." },
  { city: "Cologne", time: "about 1 h 50", note: "ICE trains from Germany, with a stop at Brussels-Midi." },
];

const TRANSPORT = [
  { icon: "✈️", title: "From Brussels Airport (Zaventem)", text: "Direct trains run to Brussels-Central about six times an hour, in around 18 minutes (Brussels Airport). The airport supplement is €6.90 and is often already inside the train ticket price. There is no metro at the airport." },
  { icon: "🚆", title: "From Brussels-Midi (Eurostar and ICE)", text: "Eurostar and ICE trains stop at Brussels-Midi, not at Brussels-Central (Seat61). From Midi, take a local train one stop to Brussels-Central, or the metro or tram into the centre. Check your route in the STIB planner." },
  { icon: "🚇", title: "Metro, tram and bus stops near the trail", text: "The organisers list stops at Gare Centrale, Bourse, De Brouckère and Sainte-Catherine. Brussels-Central station is a short walk from the Grand-Place." },
  { icon: "🚕", title: "Taxi or ride-hail", text: "The Grand-Place zone is pedestrian. Taxis may only enter where marked, and drop-off inside the zone is limited to 4:00 to 11:00. Ask to be dropped at the edge and walk the last minutes." },
  { icon: "🚗", title: "By car", text: "The Grand-Place is part of the pedestrian zone: there is no parking, and cars need a permit that is only given for absolute necessity. The whole Brussels region is also a Low Emission Zone for cars, vans, buses and coaches, with foreign plates included. Foreign-registered vehicles must register for free before entering or within five days after, and an unregistered vehicle can be fined. Check your car on lez.brussels before you drive." },
  { icon: "🅿️", title: "Where to park", text: "The organisers point to Interparking car parks about 10 minutes on foot. A secondary source lists the Grand-Place garage (open 24/7), the Ecuyer garage (height limit 1.90 m) and Albertine garage. Street parking is a red zone with a two-hour limit. Park and ride lots at the edge of the city are the cheaper choice." },
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

function CardGrid({ items }: { items: { icon: string; title: string; text: string }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((t) => (
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
  );
}

export function BrusselsWinterWonders2026({ today }: { today: string }) {
  // First Friday–Sunday weekend from tomorrow, inside the market dates and before the pre-Christmas rush.
  const weekend = weekendIn("2026-12", today) ?? weekendIn("2026-11", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} ${weekend.departureDate.slice(5, 7) === "12" ? "December" : "November"}` : null;

  const search = (r: FlightRoute, mode?: "flights" | "hotels") => (dates ? (mode ? routeSearchUrl(r, dates, mode) : routeSearchUrl(r, dates)) : `/?mode=${mode ?? "packages"}`);
  const trainFrom = (city: string) => (dates ? buildOmioResultsLink({ from: city, to: "Brussels", ...dates, travelMode: "TRAIN" }) : null);
  const packagesUrl = search(LONDON_ROUTE);
  const hotelsUrl = search(LONDON_ROUTE, "hotels");
  const flightCards = [
    { title: "From New York", r: NEWYORK_ROUTE, note: "Compare flights from New York to Brussels." },
    { title: "From Istanbul", r: ISTANBUL_ROUTE, note: "Compare flights from Istanbul to Brussels." },
  ];
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Brussels, Belgium", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">{"Brussels Winter Wonders opens on Friday 27 November, for its 25th edition. Chalets, a big wheel, carousels and a light show on the City Hall tower fill the centre until 3 January, and walking the trail is free. Here are the dates, what to try, and exactly how to reach the Grand-Place by train, metro, taxi or car."}</p>

      <section aria-label="Quick facts">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FACTS.map((f) => (
            <li key={f.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{f.label}</p>
              <p className="mt-1 font-extrabold text-slate-900">{f.value}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">{"Dates and hours from the City of Brussels and the organisers (winterwonders.be). The number of chalets is given as more than 200 by the city and 257 by the organisers."}</p>
      </section>

      <section id="about-the-event" aria-labelledby="about-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.brusselsTownHall} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">About the event</p>
          <h2 id="about-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            A winter trail through the heart of Brussels
          </h2>
          <Bullets items={EVENT} />
        </div>
      </section>

      <section id="new-in-2026" aria-labelledby="new-title" className="scroll-mt-24 space-y-4">
        <h2 id="new-title" className="text-2xl font-extrabold text-slate-900">
          Why it is hot now: what is new in 2026
        </h2>
        <CardGrid items={NEW_2026} />
      </section>

      <section id="special" aria-labelledby="special-title" className="scroll-mt-24 space-y-4">
        <h2 id="special-title" className="text-2xl font-extrabold text-slate-900">
          What makes it special
        </h2>
        <CardGrid items={SPECIAL} />
        <p className="text-xs text-slate-500">{"The official pages do not list individual dishes. The food and drink above comes from tourism and travel media, and the stalls change each year."}</p>
      </section>

      <section aria-labelledby="places-title" className="space-y-4">
        <h2 id="places-title" className="text-2xl font-extrabold text-slate-900">
          Where to go first
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">🚆 By train, the easy way</p>
          <p className="mt-1 text-sm text-slate-700">Brussels-Midi is the hub for international trains. Compare train and bus tickets for the weekend of your trip.</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {TRAINS.map((t) => (
              <li key={t.city}>
                <span className="font-bold text-slate-900">{t.city}, {t.time}.</span> {t.note}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {TRAINS.map((t) => {
              const url = trainFrom(t.city);
              return url ? (
                <ButtonLink key={t.city} href={url} external>
                  {t.city} → Brussels
                </ButtonLink>
              ) : null;
            })}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
        <p className="text-xs text-slate-500">{"We picked these starting cities from the main rail and air links, not from 2026 visitor data, which we could not find."}</p>
      </section>

      <section id="getting-around" aria-labelledby="around-title" className="scroll-mt-24 space-y-4">
        <h2 id="around-title" className="text-2xl font-extrabold text-slate-900">
          Getting around in Brussels: how to reach the Grand-Place
        </h2>
        <p className="text-sm text-slate-600">{"The Grand-Place is in a pedestrian zone, so the last part is always on foot. Here is how to get close from the airport and the stations, and what to know if you drive. Prices are indicative, so check them on the day."}</p>
        <CardGrid items={TRANSPORT} />
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Easiest way</p>
          <p className="mt-1 text-sm text-slate-800">{"Easiest overall: arrive by train, then use the metro or walk from Brussels-Central. Leave the car at home or at a park and ride lot, because the centre is pedestrian and the whole region is a Low Emission Zone."}</p>
          <p className="mt-3 text-xs text-slate-500">{"Indicative costs: a STIB single journey paid by contactless card is from about €2.40, with free changes within 60 minutes and a daily cap of €8.50 (STIB-MIVB). The airport train supplement is €6.90. A secondary source lists garage parking near the Grand-Place from about €4 per hour or €30 per day. Prices change, so check the operator."}</p>
        </div>
      </section>

      <section id="where-to-stay" aria-labelledby="stay-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.brusselsGrandPlace} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Where to stay</p>
          <h2 id="stay-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Stay in the centre, near the trail
          </h2>
          <Bullets items={STAY} />
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href={hotelsUrl} primary>
              Compare Brussels hotels
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
        <CardGrid items={GOOD_TO_KNOW} />
      </section>

      <section className="rounded-3xl bg-brand-900 p-6 text-white sm:p-8">
        <h2 className="text-2xl font-extrabold">Flight + hotel in one search</h2>
        <p className="mt-2 text-brand-100">{"Glooconn shows flight + hotel packages for Brussels within your budget. Change your home city on the next page. You book each part directly with our partners."}</p>
        <Link href={packagesUrl} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
