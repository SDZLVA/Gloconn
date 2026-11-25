import Link from "next/link";
import { PHOTOS, Photo } from "@/components/blog/Photo";
import { weekendIn } from "@/lib/blog/dates";
import { buildBookingSearchUrl } from "@/lib/hotels/bookingSearchUrl";
import { ROUTE_CITIES, routeSearchUrl, type FlightRoute, type RouteCity } from "@/lib/routes/catalog";

/**
 * Blog post (2026-11-24): Dubai Shopping Festival 2026-27 (32nd edition). Facts checked 2026-11-24:
 * - Dates 4 Dec 2026 – 17 Jan 2027 (45 days): Gulf News, tbreak (WAM / Emirates247 headlines agree).
 * - Opening weekend: Rashid Al Majed 4 Dec, Steve Aoki 5 Dec, both Coca-Cola Arena; free candlelight concert at
 *   Hatta Wadi Hub 2 Dec (Gulf News). JBR–Bluewaters light show 19:30–22:30, drone shows reported by tbreak.
 * - History: launched 1996 on the initiative of Sheikh Mohammed bin Rashid; first raffles 121 Lexus cars + 43 kg gold;
 *   Global Village grew out of the 1997 Creekside exhibition (The National 2022, Wikipedia).
 * - Origins: 2025 Dubai airport city pairs London 3.9M, Riyadh 3.0M, Mumbai 2.4M, Jeddah 2.4M, New Delhi 2.2M;
 *   Western Europe the biggest visitor region, 4.10M (21%) (The National 2026-02-11; Dubai Media Office 2026-02-09).
 * - Food: chefdenise.com (2024) and Lonely Planet (2019).
 * NOT written (no official source found): ticket prices, opening hours, sale-season dates, weather, visa rules.
 */

const DUBAI: RouteCity = ROUTE_CITIES.DXB;
const route = (from: FlightRoute["from"]): FlightRoute => ({ slug: `${from.slug}-to-dubai`, from, to: DUBAI });
const LONDON_ROUTE = route(ROUTE_CITIES.LON);
const MUMBAI_ROUTE = route(ROUTE_CITIES.BOM);
const DELHI_ROUTE = route(ROUTE_CITIES.DEL);
const PARIS_ROUTE = route(ROUTE_CITIES.PAR);

const FACTS = [
  { label: "32nd edition", value: "4 Dec – 17 Jan" },
  { label: "Length", value: "45 days" },
  { label: "Opening gigs", value: "4–5 Dec, Coca-Cola Arena" },
  { label: "Light show", value: "JBR – Bluewaters, evenings" },
  { label: "Started", value: "1996" },
  { label: "Big city pair", value: "London – Dubai, 3.9M pax in 2025" },
];

const EVENT = [
  "The Dubai Shopping Festival (DSF) is Dubai's big winter event: shopping deals, concerts, light and drone shows and family fun across the city.",
  "It started in 1996, an idea of Sheikh Mohammed bin Rashid, to put Dubai on the tourist map. The first edition gave away 121 Lexus cars and 43 kg of gold in raffles.",
  "This 32nd edition runs 4 December 2026 – 17 January 2027, about 45 days, so it covers Christmas and New Year.",
  "Opening weekend: Rashid Al Majed on 4 Dec and DJ Steve Aoki on 5 Dec, both at Coca-Cola Arena (Gulf News, tbreak). A free candlelight concert is planned at Hatta Wadi Hub on 2 Dec.",
  "A laser and light show runs on the water between The Beach JBR and Bluewaters Island, 19:30–22:30. tbreak reports nightly shows from 5 Dec, with two drone shows.",
  "The full programme, prizes and ticket details were still to be announced in mid-November. Check the official DSF pages before you book events.",
];

const SPECIAL = [
  { title: "Machboos", text: "Spiced rice with chicken or lamb, flavoured with saffron, cardamom and cinnamon. Try it in Al Fahidi (Old Dubai), for example at Arabian Tea House or the Sheikh Mohammed Centre for Cultural Understanding." },
  { title: "Luqaimat", text: "Small fried dough balls soaked in date syrup, a classic Emirati sweet. Found at Al Fanar and at the Sheikh Mohammed Centre in Al Fahidi." },
  { title: "Karak chai and Arabic coffee", text: "Karak is strong, sweet spiced milk tea. Qahwa is cardamom coffee served in small cups with dates. Both are easy to find at Old Dubai cafés." },
  { title: "Gold, malls and souks", text: "Gold retailers have taken part in the festival since the start. Dubai Mall is a main DSF venue, and Old Dubai's Creek area has the historic feel." },
  { title: "Global Village roots", text: "Global Village began as a 1997 Creekside shopping exhibition with international pavilions, a DSF idea. It has since moved to its own site." },
];

const GOOD_TO_KNOW = [
  { icon: "🎟️", title: "Tickets", text: "Some concerts and activities sell their own tickets. Prices were not confirmed when we checked." },
  { icon: "🕑", title: "Hours", text: "We found no official opening hours for the festival events. Check the DSF pages and each venue." },
  { icon: "🏷️", title: "Deals", text: "Prizes are offered at taking-part malls. No 2026 discount figures were confirmed, so compare prices yourself." },
  { icon: "📅", title: "Plan for peak days", text: "Christmas and New Year are in the festival window. Book flights and beds early." },
  { icon: "🛂", title: "Entry rules", text: "Visa rules depend on your passport. Check the official UAE government site before you book." },
  { icon: "🌤️", title: "Weather", text: "We did not verify the forecast, so check it close to your dates." },
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
  { icon: "✈️", title: "From Dubai airport (DXB)", text: "The Red Line metro serves Terminals 1 and 3. Ride to Burj Khalifa/Dubai Mall station, which takes about 25 minutes. A taxi takes about 12 minutes." },
  { icon: "🚆", title: "By metro and tram", text: "Burj Khalifa/Dubai Mall is on the Red Line. A covered, air-conditioned walkway (the Metro Link Bridge) leads from the station to the mall, and the walk takes about 10 to 15 minutes." },
  { icon: "🚌", title: "By bus and coach", text: "Bus 27 also serves Dubai Mall. For long-distance or intercity coaches, check the RTA website for the stop, then change to the metro." },
  { icon: "🚗", title: "By car", text: "Dubai Mall has more than 13,000 parking spaces. Roads in Dubai use Salik tolls, so a hire car may carry small toll charges." },
  { icon: "🅿️", title: "Where to park", text: "Zabeel and Fountain Views car parks are free. Fashion and Cinema car parks are paid under the Salik system, with 4 hours free from Monday to Thursday and 6 hours free from Friday to Sunday." },
  { icon: "⚠️", title: "Limits for private vehicles", text: "Paid car parks at the mall use Salik, so you may need to register or pay online if you have no account. Streets near Downtown are very busy on festival evenings." },
];

export function DubaiShoppingFestival2026({ today }: { today: string }) {
  // First Friday–Sunday weekend of December (4–6 Dec is the opening weekend); stays inside the festival.
  const weekend = weekendIn("2026-12", today);
  const dates = weekend ? { departureDate: weekend.departureDate, returnDate: weekend.returnDate } : null;
  const when = weekend ? `${Number(weekend.departureDate.slice(8))}–${Number(weekend.returnDate.slice(8))} December` : null;

  const search = (r: FlightRoute, mode?: "flights" | "hotels") => (dates ? (mode ? routeSearchUrl(r, dates, mode) : routeSearchUrl(r, dates)) : `/?mode=${mode ?? "packages"}`);
  const bookingUrl = dates
    ? buildBookingSearchUrl({ destination: "Dubai, United Arab Emirates", ...dates, travelers: { adults: 2, children: 0, infants: 0, rooms: 1 } })
    : null;

  const flightCards = [
    { city: "London", r: LONDON_ROUTE, note: "London – Dubai was the busiest city pair at Dubai airport in 2025 (3.9M passengers)." },
    { city: "Mumbai", r: MUMBAI_ROUTE, note: "Mumbai was the third-busiest city pair at Dubai airport in 2025 (2.4M passengers)." },
    { city: "Delhi", r: DELHI_ROUTE, note: "New Delhi was fifth-busiest at Dubai airport in 2025 (2.2M passengers)." },
    { city: "Paris", r: PARIS_ROUTE, note: "Western Europe was Dubai's biggest visitor region in 2025 (4.1M, 21%). Compare Paris flights." },
  ];

  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">
        Dubai&apos;s <strong>32nd Shopping Festival</strong> starts 4 December and runs to 17 January 2027. Short facts, then live prices.
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
          Dates and concerts from{" "}
          <a href="https://gulfnews.com/uae/dubai/dubai-shopping-festival-to-launch-32nd-edition-on-december-4-1.500742735" target="_blank" rel="noopener noreferrer" className="underline">
            Gulf News
          </a>{" "}
          and{" "}
          <a href="https://tbreak.com/dubai-shopping-festival-2026-concerts-drone-shows/" target="_blank" rel="noopener noreferrer" className="underline">
            tbreak
          </a>
          . Flight data: The National (Dubai airport 2025).
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
        <p className="text-sm text-slate-500">
          These origins come from 2025 Dubai airport and visitor data. Riyadh and Jeddah are also top routes, but we do not list them yet.
          {when ? ` Buttons are set for ${when}. Change the dates on the next page: the festival runs to 17 Jan.` : ""}
        </p>
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
      </section>

      <section id="getting-around" aria-labelledby="around-title" className="scroll-mt-24 space-y-4">
        <h2 id="around-title" className="text-2xl font-extrabold text-slate-900">
          {"Getting around in Dubai: how to reach Dubai Mall and Downtown"}
        </h2>
        <p className="text-sm text-slate-600">{"Dubai Mall and the Burj Khalifa are in Downtown Dubai, and the metro is the cheapest and most reliable way to get there. Prices are indicative, so check them on the day."}</p>
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
          <p className="mt-1 text-sm text-slate-800">{"Easiest overall: the Red Line metro to Burj Khalifa/Dubai Mall and the covered bridge to the mall. By car, use a free car park such as Zabeel or Fountain Views, which is also easy."}</p>
          <p className="mt-3 text-xs text-slate-500">{"Indicative costs: a metro journey from the airport to Dubai Mall is about AED 5 to 8 with a Nol card. A Nol Silver card costs AED 25, including AED 19 of credit. A taxi from the airport is about AED 35 to 45. Parking is free for the first 4 to 6 hours in the paid zones. Prices change, so check the RTA site."}</p>
        </div>
      </section>

      <section id="where-to-stay" aria-labelledby="stay-title" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <Photo photo={PHOTOS.dubaiLights} />
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Where to stay</p>
          <h2 id="stay-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Pick the area that matches your plan
          </h2>
          <Bullets
            items={[
              "Downtown Dubai: next to Dubai Mall and the Burj Khalifa, best for shopping.",
              "JBR and Dubai Marina: beach, and the waterfront where the light show runs (JBR – Bluewaters).",
              "Old Dubai (Al Fahidi, Deira, the Creek): historic streets, souks and traditional food.",
            ]}
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href={search(LONDON_ROUTE, "hotels")} primary>
              Compare Dubai hotels
            </ButtonLink>
            {bookingUrl && (
              <ButtonLink href={bookingUrl} external>
                Booking.com ({when})
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
        <Photo photo={PHOTOS.dubaiCreek} />
      </section>

      <section className="rounded-3xl bg-brand-900 p-6 text-white sm:p-8">
        <h2 className="text-2xl font-extrabold">Flight + hotel in one search</h2>
        <p className="mt-2 text-brand-100">Glooconn shows flight + hotel packages for Dubai within your budget. Change your home city on the next page. You book each part directly with our partners.</p>
        <Link href={search(LONDON_ROUTE)} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          {when ? `Plan ${when}` : "Plan your trip"}
        </Link>
      </section>
    </div>
  );
}
