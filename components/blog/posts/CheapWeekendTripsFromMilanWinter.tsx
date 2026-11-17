import Link from "next/link";
import { AthensArt, BudapestArt, KrakowArt, LisbonArt, SevilleArt } from "@/components/blog/art/CityArt";
import { RouteDeal } from "@/components/blog/RouteDeal";
import { winterMonths } from "@/lib/blog/dates";

/**
 * Milestone 63 — blog post: 5 cheap weekend trips from Milan this winter.
 * 63b: simpler, cleaner layout — one card per city with an illustration.
 * Prices come from RouteDeal (live, refreshed every 12 h); the text avoids
 * facts that go out of date (exact prices, opening dates).
 */

type City = {
  id: string;
  route: string;
  name: string;
  tagline: string;
  flight: string;
  Art: (p: { className?: string }) => React.ReactNode;
  intro: string;
  points: string[];
};

const CITIES: City[] = [
  {
    id: "budapest",
    route: "milan-to-budapest",
    name: "Budapest",
    tagline: "Thermal baths in the snow",
    flight: "about 1 h 30 min",
    Art: BudapestArt,
    intro: "Sitting in a steaming outdoor thermal pool while it's freezing around you is a weekend you remember.",
    points: [
      "Széchenyi or Gellért baths — go early, before the crowds.",
      "Christmas market in Vörösmarty Square, usually late November to the new year.",
      "Goulash, lángos and chimney cake cost far less than a meal in Milan.",
    ],
  },
  {
    id: "krakow",
    route: "milan-to-krakow",
    name: "Kraków",
    tagline: "The budget champion",
    flight: "about 1 h 45 min",
    Art: KrakowArt,
    intro: "Often the cheapest city break once you land, with a compact old town you can see in a weekend.",
    points: [
      "The Main Market Square and its Christmas market in December.",
      "Wawel Castle, then cafés in Kazimierz, the old Jewish quarter.",
      "The Wieliczka Salt Mine is underground — the cold doesn't matter.",
    ],
  },
  {
    id: "lisbon",
    route: "milan-to-lisbon",
    name: "Lisbon",
    tagline: "Winter sunshine",
    flight: "about 2 h 45 min",
    Art: LisbonArt,
    intro: "Swap Milan's grey winter for mild, often sunny days that can feel like spring.",
    points: [
      "Ride the yellow tram 28 through Alfama and stop at the viewpoints.",
      "Custard tarts (pastéis de nata) and the monastery in Belém.",
      "With half a day more, take the train to Sintra's palaces.",
    ],
  },
  {
    id: "seville",
    route: "milan-to-seville",
    name: "Seville",
    tagline: "Orange trees in January",
    flight: "about 2 h 30 min",
    Art: SevilleArt,
    intro: "One of the warmest cities in Europe in winter — tapas outside in January is hard to beat.",
    points: [
      "Book a time slot for the Real Alcázar palace and gardens.",
      "Climb the Giralda tower, then walk to the Plaza de España.",
      "Tapas in Triana or Santa Cruz keep dinner cheap.",
    ],
  },
  {
    id: "athens",
    route: "milan-to-athens",
    name: "Athens",
    tagline: "The Acropolis without the crowds",
    flight: "about 2 h 15 min",
    Art: AthensArt,
    intro: "Mild, bright days, shorter queues and a city that feels more local than in summer.",
    points: [
      "The Acropolis early in the morning, then the Acropolis Museum.",
      "Plaka and Monastiraki, and sunset from Lycabettus Hill.",
      "Souvlaki, gyros and spanakopita — cheap and excellent.",
    ],
  },
];

const TIPS = [
  { icon: "✈", title: "Check all three airports", text: "Malpensa, Linate and Bergamo — choose “Milan” and Glooconn searches them all." },
  { icon: "🎒", title: "Hand luggage only", text: "On low-cost airlines a checked bag can cost as much as the flight." },
  { icon: "📅", title: "Move by one day", text: "Thursday–Sunday or Friday–Monday is sometimes much cheaper." },
  { icon: "🏨", title: "Price the whole trip", text: "A cheap flight with an expensive hotel isn't a cheap weekend — packages show both." },
];

export function CheapWeekendTripsFromMilanWinter({ today }: { today: string }) {
  const months = winterMonths(today);
  return (
    <div className="space-y-10">
      <p className="text-lg leading-relaxed text-slate-700">
        Winter is a great time for a short break from Milan: flights are often cheaper, cities are quieter, and thermal baths, Christmas
        markets and long sunny lunches are at their best. Here are five easy weekends — each a short flight away, with live prices.
      </p>

      <nav aria-label="The five cities" className="flex flex-wrap gap-2">
        {CITIES.map((c, i) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 hover:border-brand-700 hover:text-brand-700"
          >
            {i + 1}. {c.name}
          </a>
        ))}
      </nav>

      {CITIES.map((c, i) => (
        <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`} className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <c.Art />
          <div className="p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">
              {i + 1} · {c.tagline}
            </p>
            <h2 id={`${c.id}-title`} className="mt-1 text-2xl font-extrabold text-slate-900">
              {c.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Flight from Milan: {c.flight}</p>
            <p className="mt-3 leading-relaxed text-slate-700">{c.intro}</p>
            <ul className="mt-3 space-y-2">
              {c.points.map((p) => (
                <li key={p} className="flex gap-2 text-slate-700">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <RouteDeal route={c.route} months={months} today={today} />
          </div>
        </section>
      ))}

      <section aria-labelledby="tips" className="space-y-4">
        <h2 id="tips" className="text-2xl font-extrabold text-slate-900">
          Keep the weekend cheap
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {TIPS.map((t) => (
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
        <h2 className="text-2xl font-extrabold">Pick a city, we&apos;ll build the weekend</h2>
        <p className="mt-2 text-brand-100">
          &ldquo;Plan a weekend&rdquo; shows flight + hotel packages for a Friday to Sunday trip, within your budget. You book each part
          directly with our partners.
        </p>
        <Link href="/flights" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-brand-900 hover:bg-brand-50">
          See all flight routes
        </Link>
      </section>
    </div>
  );
}
