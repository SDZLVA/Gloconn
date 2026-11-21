import Link from "next/link";
import { PHOTOS, Photo } from "@/components/blog/Photo";
import { weekendIn } from "@/lib/blog/dates";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { buildOmioResultsLink } from "@/lib/affiliate/omio";
import { ROUTE_CITIES, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";

/**
 * Blog post (buffer, written 2026-11-21): Tromsø polar night 2026. Facts checked 2026-11-21 against Visit Tromsø (visittromso.no), Visit Norway, Lonely Planet, Life in Norway and Hurtigruten.
 * No prices are written in the text: every price comes from the live search the buttons open.
 */

const TROMSO = { code: "TOS", name: "Tromsø", country: "Norway", slug: "tromso" } as const;
const OSLO = { code: "OSL", name: "Oslo", country: "Norway", slug: "oslo" } as const;
const route = (from: FlightRoute["from"], to: FlightRoute["to"] = TROMSO): FlightRoute => ({ slug: `${from.slug}-to-${to.slug}`, from, to });
const LONDON_ROUTE = route(ROUTE_CITIES.LON);
const OSLO_ROUTE = route(OSLO);
const PARIS_ROUTE = route(ROUTE_CITIES.PAR);
const AMSTERDAM_ROUTE = route(ROUTE_CITIES.AMS);

const FACTS = [
  { label: "Polar night", value: "About 27 Nov – 15 Jan" },
  { label: "Aurora tours", value: "Sep to early April" },
  { label: "Average winter temp", value: "Around −4 °C" },
  { label: "Where", value: "Under the aurora oval" },
  { label: "Nickname", value: "Paris of the North" },
  { label: "Winter events", value: "Film festival, Northern Lights Festival" },
];

const EVENT = [
  "The polar night (mørketid) lasts about 27 November to 15 January, per Visit Tromsø. The sun stays below the horizon and you get only a few hours of twilight each day. The exact date the sun returns depends on where you stand and on the mountains around you.",
  "Visit Norway says Tromsø lies directly beneath the aurora oval. Organised northern lights tours usually run from September to early April, per Visit Tromsø.",
  "Sightings depend on aurora activity, cloud cover and local weather, so nothing is guaranteed. Plan more than one evening in case the sky is cloudy.",
  "Winter events include the Tromsø International Film Festival, the Polar Night Half Marathon, the Northern Lights Festival and Sámi Week (Visit Tromsø).",
];

const SPECIAL = [
  { icon: "🌌", title: "Under the aurora oval", text: "Visit Norway calls Tromsø one of the world's best places to see the northern lights. Guided tours go in search of clear skies." },
  { icon: "🦌", title: "Reindeer and Sámi food", text: "Reindeer sledding is a winter-only activity (Visit Norway). Traditional Sámi food is based on fish, game, reindeer, berries and herbs." },
  { icon: "🦀", title: "King crab", text: "The city's Culinary History Walk (Visit Tromsø) tastes king crab, reindeer and cod-roe caviar at three venues." },
  { icon: "⛪", title: "The Arctic Cathedral", text: "A triangular church finished in 1965, officially Tromsdalen Church. It hosts a New Year's Eve concert every year (Visit Norway)." },
  { icon: "🐋", title: "Winter-only adventures", text: "Whale watching, skiing, and dog and reindeer sledding are on offer in winter, says Visit Norway." },
  { icon: "🍺", title: "Pubs with a view of the past", text: "Lonely Planet suggests the Fjellheisen cable car for views, then a warm-up at Ølhallen, a pub with 50 taps." },
];

const PLACES = [
  { name: "Northern lights tour", line1: "September to early April", line2: "Evening departures", note: "A guide with a driver finds the clearest sky on the night. Try to book on your first evening, so you can go again if it is cloudy." },
  { name: "Reindeer and Sámi camp", line1: "About 30 min north of the city", line2: "Tromsø Arctic Reindeer", note: "Feed the reindeer and hear about Sámi life. Some evening tours also give a chance to see the aurora." },
  { name: "Arctic Cathedral", line1: "Tromsdalen, across the bridge", line2: "Opening times change from day to day", note: "Check hours on the day. It is easy to see from all over the city." },
  { name: "Fjellheisen cable car", line1: "Views over the city and fjord", line2: "Ride up, then warm up in town", note: "Lonely Planet's pick for views. Wrap up warm: it can be much colder on top." },
];

const STAY = [
  "The city centre is on a small island. The Arctic Cathedral is across the bridge, in Tromsdalen.",
  "Staying central means you can walk to restaurants, pubs and the harbour between tours.",
  "Northern lights season is busy, so book a room with free cancellation.",
];

const GOOD_TO_KNOW = [
  { icon: "❄️", title: "Dress for the cold", text: "The average winter temperature in Tromsø is around −4 °C (Visit Tromsø), and it can be much colder inland on a tour." },
  { icon: "🌗", title: "Twilight, not full dark", text: "During the polar night you still get a few hours of twilight around midday. Plan outdoor sights for then." },
  { icon: "🚗", title: "Driving is hard in winter", text: "Visit Norway warns about icy roads, snow, darkness and poor visibility. A guided tour avoids the driving." },
  { icon: "📅", title: "Season is long", text: "Tours run from September to early April, so you do not have to come in the darkest weeks." },
];

const TRAINS: { city: string; time?: string }[] = [];

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

export function TromsoPolarNight2026({ today }: { today: string }) {
  // First Friday–Sunday weekend from tomorrow, before the pre-Christmas rush.
  const weekend = weekendIn("2026-12", today) ?? weekendIn("2026-11", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} ${weekend.departureDate.slice(5, 7) === "12" ? "December" : "November"}` : null;

  const search = (r: FlightRoute, mode?: "flights" | "hotels") => (dates ? (mode ? routeSearchUrl(r, dates, mode) : routeSearchUrl(r, dates)) : `/?mode=${mode ?? "packages"}`);
  const trainFrom = (city: string) => (dates ? buildOmioResultsLink({ from: city, to: "Tromsø", ...dates, travelMode: "TRAIN" }) : null);
  const packagesUrl = search(LONDON_ROUTE);
  const hotelsUrl = search(LONDON_ROUTE, "hotels");
  const flightCards = [
    { title: "From London", r: LONDON_ROUTE, note: "Compare flights from London to Tromsø." },
    { title: "From Oslo", r: OSLO_ROUTE, note: "Compare flights from Oslo to Tromsø." },
    { title: "From Paris", r: PARIS_ROUTE, note: "Compare flights from Paris to Tromsø." },
    { title: "From Amsterdam", r: AMSTERDAM_ROUTE, note: "Compare flights from Amsterdam to Tromsø." },
  ];
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Tromsø, Norway", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">{"From about 27 November the sun stays below the horizon in Tromsø, and it does not come back until about 15 January. That is the polar night: a few hours of blue twilight, then a dark sky made for the northern lights. Tromsø sits directly under the aurora oval, so it is one of the best places on Earth to see them. Here are the facts, with live flight and hotel prices."}</p>

      <section aria-label="Quick facts">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FACTS.map((f) => (
            <li key={f.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{f.label}</p>
              <p className="mt-1 font-extrabold text-slate-900">{f.value}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">{"Dates and temperatures from Visit Tromsø (visittromso.no) and Visit Norway. The northern lights can never be guaranteed: they depend on aurora activity and cloud cover."}</p>
      </section>

      <section id="about-the-event" aria-labelledby="about-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.tromsoCity} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">About the polar night</p>
          <h2 id="about-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Tromsø in the dark season
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
          What to do in Tromsø in winter
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
            <p className="mt-1 text-sm text-slate-700"></p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TRAINS.map((t) => {
                const url = trainFrom(t.city);
                return url ? (
                  <ButtonLink key={t.city} href={url} external>
                    {t.city} → Tromsø{t.time ? `, ${t.time}` : ""}
                  </ButtonLink>
                ) : null;
              })}
            </div>
          </div>
        )}
      </section>

      <section id="where-to-stay" aria-labelledby="stay-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.tromsoTown} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Where to stay</p>
          <h2 id="stay-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Stay in the city centre
          </h2>
          <Bullets items={STAY} />
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href={hotelsUrl} primary>
              Compare Tromsø hotels
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
        <p className="mt-2 text-brand-100">{"Glooconn shows flight + hotel packages for Tromsø within your budget. Change your home city on the next page. You book each part directly with our partners."}</p>
        <Link href={packagesUrl} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
