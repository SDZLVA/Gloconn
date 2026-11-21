import Link from "next/link";
import { PHOTOS, Photo } from "@/components/blog/Photo";
import { weekendIn } from "@/lib/blog/dates";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { buildOmioResultsLink } from "@/lib/affiliate/omio";
import { ROUTE_CITIES, routeSearchUrl, type FlightRoute } from "@/lib/routes/catalog";

/**
 * Blog post (buffer, written 2026-11-21): Tenerife in winter 2026. Facts checked 2026-11-21 against easyJet Holidays, lastminute.com, TUI, Great British Chefs, Barceló, Inside the Travel Lab and Holiday-Weather.
 * No prices are written in the text: every price comes from the live search the buttons open.
 */

const TENERIFE = { code: "TFS", name: "Tenerife", country: "Spain", slug: "tenerife" } as const;
const FRANKFURT = { code: "FRA", name: "Frankfurt", country: "Germany", slug: "frankfurt" } as const;
const DUBLIN = { code: "DUB", name: "Dublin", country: "Ireland", slug: "dublin" } as const;
const route = (from: FlightRoute["from"], to: FlightRoute["to"] = TENERIFE): FlightRoute => ({ slug: `${from.slug}-to-${to.slug}`, from, to });
const LONDON_ROUTE = route(ROUTE_CITIES.LON);
const AMSTERDAM_ROUTE = route(ROUTE_CITIES.AMS);
const FRANKFURT_ROUTE = route(FRANKFURT);
const DUBLIN_ROUTE = route(DUBLIN);

const FACTS = [
  { label: "December daytime", value: "About 21–22 °C" },
  { label: "December nights", value: "About 16 °C" },
  { label: "Sea in December", value: "About 20–21 °C" },
  { label: "January daytime", value: "About 18–20 °C" },
  { label: "Sun in December", value: "About 6 h a day" },
  { label: "Nickname", value: "Island of eternal spring" },
];

const EVENT = [
  "easyJet Holidays calls Tenerife the 'Island of Eternal Spring'. Even in December it offers mild temperatures and a break from the European winter.",
  "Typical December: highs of about 21–22 °C and lows of about 16 °C (lastminute.com and Greta's Travels). January is a little cooler, with highs of about 18–20 °C.",
  "Winter is also the wetter season: Holiday-Weather says rain is expected from November to March in the Canary Islands. Most months still have only a few rainy days.",
  "In January the Fiestas de San Sebastián are held in Adeje (easyJet Holidays), with traditional music and dancing.",
];

const SPECIAL = [
  { icon: "🥔", title: "Papas arrugadas with mojo", text: "Small potatoes boiled in very salty water until the skin wrinkles, served with red (picón) or green (verde) mojo sauce. Barceló calls them the binding ingredient of Canarian food." },
  { icon: "🌾", title: "Gofio", text: "Toasted grain flour that dates back to the Guanches, the islands' early people (Palladium). Used in soups, desserts and as a side." },
  { icon: "🐟", title: "Cherne (wreckfish)", text: "A classic fish on Canarian menus, often with papas arrugadas, gofio and mojo (Great British Chefs)." },
  { icon: "☕", title: "Barraquito", text: "The local layered coffee, often enjoyed after a meal (DoYouSpain, Bahia Principe)." },
  { icon: "🍯", title: "Ron miel", text: "Honey rum, a typical Tenerife drink (Bahia Principe)." },
  { icon: "🌋", title: "Hiking in winter", text: "easyJet Holidays points to Mount Teide National Park and the Anaga Rural Park as winter hiking highlights." },
];

const PLACES = [
  { name: "Teide National Park", line1: "Hiking and volcano scenery", line2: "Cooler up high", note: "Pack a layer: the mountains are cooler than the beaches." },
  { name: "Anaga Rural Park", line1: "North-east coast", line2: "Green, mountainous coast", note: "Mountains that drop to the Atlantic. easyJet Holidays lists it as a winter hiking highlight." },
  { name: "Los Gigantes", line1: "Cliffs and marina", line2: "West coast", note: "Cliffs above the sea, with a marina below (see the photo further down)." },
  { name: "La Orotava", line1: "Old town in the north", line2: "Gofio mill nearby", note: "Inside the Travel Lab suggests nibbling gofio at the Molino de Gofio La Maquina." },
];

const STAY = [
  "Holiday-Weather's December averages show the south a little warmer than the north (about 20 °C against 19 °C). Los Cristianos, Playa de las Américas and Costa Adeje are on the south coast.",
  "The north is greener and cooler, good for hiking and old towns like La Orotava.",
  "Winter is a busy season, so book early and choose free cancellation.",
];

const GOOD_TO_KNOW = [
  { icon: "🧥", title: "Bring a light layer", text: "Evenings cool down to about 13 °C in January (easyJet Holidays), so pack a light jacket." },
  { icon: "☔", title: "Winter is the wetter season", text: "Rain is expected between November and March. The north gets more cloud than the south." },
  { icon: "🌊", title: "The sea is cool", text: "Around 20–21 °C in December. Some people find it cool to swim (Travelscoop)." },
  { icon: "🕑", title: "Shorter days", text: "About 6 hours of sun a day in December (Rove). Plan beach time for midday." },
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

export function TenerifeWinterSun2026({ today }: { today: string }) {
  // First Friday–Sunday weekend from tomorrow, before the pre-Christmas rush.
  const weekend = weekendIn("2026-12", today) ?? weekendIn("2026-11", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} ${weekend.departureDate.slice(5, 7) === "12" ? "December" : "November"}` : null;

  const search = (r: FlightRoute, mode?: "flights" | "hotels") => (dates ? (mode ? routeSearchUrl(r, dates, mode) : routeSearchUrl(r, dates)) : `/?mode=${mode ?? "packages"}`);
  const trainFrom = (city: string) => (dates ? buildOmioResultsLink({ from: city, to: "Tenerife", ...dates, travelMode: "TRAIN" }) : null);
  const packagesUrl = search(LONDON_ROUTE);
  const hotelsUrl = search(LONDON_ROUTE, "hotels");
  const flightCards = [
    { title: "From London", r: LONDON_ROUTE, note: "Compare flights from London to Tenerife." },
    { title: "From Amsterdam", r: AMSTERDAM_ROUTE, note: "Compare flights from Amsterdam to Tenerife." },
    { title: "From Frankfurt", r: FRANKFURT_ROUTE, note: "Compare flights from Frankfurt to Tenerife." },
    { title: "From Dublin", r: DUBLIN_ROUTE, note: "Compare flights from Dublin to Tenerife." },
  ];
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Tenerife, Spain", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">{"While much of Europe is cold and grey, Tenerife stays mild. Daytime highs in December are about 21–22 °C, the sea is around 20–21 °C and there is hiking, a dramatic coast and the famous Canarian wrinkled potatoes. Here is what winter is really like, what to eat, and how to fly there from London, Amsterdam, Frankfurt and Dublin, with live prices."}</p>

      <section aria-label="Quick facts">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FACTS.map((f) => (
            <li key={f.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{f.label}</p>
              <p className="mt-1 font-extrabold text-slate-900">{f.value}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">{"Averages from easyJet Holidays, lastminute.com, TUI and travel-weather sites. Figures differ a little by source and by coast, so treat them as a guide."}</p>
      </section>

      <section id="about-the-event" aria-labelledby="about-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.tenerifeGigantes} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">About Tenerife in winter</p>
          <h2 id="about-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Why people go in winter
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
          Where to go
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
                    {t.city} → Tenerife{t.time ? `, ${t.time}` : ""}
                  </ButtonLink>
                ) : null;
              })}
            </div>
          </div>
        )}
      </section>

      <section id="where-to-stay" aria-labelledby="stay-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.tenerifeBenijo} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Where to stay</p>
          <h2 id="stay-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Pick your coast
          </h2>
          <Bullets items={STAY} />
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href={hotelsUrl} primary>
              Compare Tenerife hotels
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
        <p className="mt-2 text-brand-100">{"Glooconn shows flight + hotel packages for Tenerife within your budget. Change your home city on the next page. You book each part directly with our partners."}</p>
        <Link href={packagesUrl} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
