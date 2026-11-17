import Link from "next/link";
import { RouteDeal } from "@/components/blog/RouteDeal";
import { winterMonths } from "@/lib/blog/dates";

/**
 * Milestone 63 — blog post: 5 cheap weekend trips from Milan this winter.
 * Prices come from RouteDeal (live, refreshed every 12 h); the text avoids
 * facts that go out of date (exact prices, opening dates).
 */

const H2 = "mt-10 text-2xl font-bold text-slate-900";
const P = "mt-3 leading-relaxed text-slate-700";
const UL = "mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-slate-700";

export function CheapWeekendTripsFromMilanWinter({ today }: { today: string }) {
  const months = winterMonths(today);
  return (
    <>
      <p className={P}>
        Winter is one of the best times for a short break from Milan. Flights are often cheaper than in spring and summer, cities are
        quieter, and many of the best things to do — thermal baths, Christmas markets, long lunches in the sun — are at their best in the
        cold months. Here are five easy weekend trips, each a short flight from Milan, with the cheapest recent fares for this winter.
      </p>
      <p className={P}>
        <strong>How we picked them:</strong> each city is about 1.5 to 3 hours from Milan, has frequent low-cost flights, and is affordable
        once you land. The price boxes update automatically from recent fares, so they show this winter&apos;s prices, not last year&apos;s.
      </p>

      <h2 className={H2}>1. Budapest, Hungary — thermal baths in the snow</h2>
      <p className={P}>
        About an hour and a half from Milan, Budapest is a classic winter weekend. Sitting in a steaming outdoor thermal pool while it is
        freezing around you is something you remember.
      </p>
      <ul className={UL}>
        <li>Spend a morning at the Széchenyi or Gellért baths — go early to avoid the crowds.</li>
        <li>The Christmas market in Vörösmarty Square usually runs from late November until the turn of the year.</li>
        <li>Walk up to Buda Castle and Fisherman&apos;s Bastion for the view over the Danube and Parliament.</li>
        <li>Eat well for little: goulash, lángos and chimney cake. Hungary uses the forint, and food is cheaper than in Milan.</li>
      </ul>
      <RouteDeal route="milan-to-budapest" months={months} today={today} />

      <h2 className={H2}>2. Kraków, Poland — the budget champion</h2>
      <p className={P}>
        Kraków is often the cheapest city break on this list once you land. The medieval old town is compact, so a weekend is enough to see
        the highlights without rushing.
      </p>
      <ul className={UL}>
        <li>The Main Market Square is one of the largest medieval squares in Europe, and hosts a Christmas market in December.</li>
        <li>Visit Wawel Castle and the cathedral, then walk through Kazimierz, the old Jewish quarter, now full of cafés.</li>
        <li>The Wieliczka Salt Mine, a short trip from the city, is underground, so the cold outside doesn&apos;t matter.</li>
        <li>Try pierogi and a warm drink in a milk bar (bar mleczny) — Poland uses the złoty, and prices are low.</li>
      </ul>
      <RouteDeal route="milan-to-krakow" months={months} today={today} />

      <h2 className={H2}>3. Lisbon, Portugal — sunshine and mild weather</h2>
      <p className={P}>
        If you want to escape the grey Milan winter, Lisbon is often mild and sunny, with daytime temperatures that can feel like spring.
      </p>
      <ul className={UL}>
        <li>Ride the old yellow trams through Alfama and stop at the viewpoints (miradouros) over the river.</li>
        <li>Go to Belém for the monastery, the tower and the famous custard tarts (pastéis de nata).</li>
        <li>With an extra half day, take the train to Sintra and its colourful palaces.</li>
        <li>Lisbon is hilly: bring comfortable shoes and use the trams and metro to save your legs.</li>
      </ul>
      <RouteDeal route="milan-to-lisbon" months={months} today={today} />

      <h2 className={H2}>4. Seville, Spain — orange trees in January</h2>
      <p className={P}>
        Seville is one of the warmest cities in Europe in winter. Walking past orange trees and eating tapas outside in January is hard to
        beat.
      </p>
      <ul className={UL}>
        <li>Book a time slot for the Real Alcázar, the royal palace and gardens — tickets can sell out.</li>
        <li>Climb the Giralda tower next to the cathedral, then walk to the Plaza de España.</li>
        <li>Do a tapas crawl in Triana or the Santa Cruz quarter: small plates keep dinner cheap.</li>
        <li>The city centre is flat and walkable, so you rarely need taxis.</li>
      </ul>
      <RouteDeal route="milan-to-seville" months={months} today={today} />

      <h2 className={H2}>5. Athens, Greece — the Acropolis without the summer crowds</h2>
      <p className={P}>
        In summer the Acropolis is hot and packed. In winter the days are often mild and bright, the queues are shorter, and the city feels
        more local.
      </p>
      <ul className={UL}>
        <li>Visit the Acropolis early in the morning, then the Acropolis Museum next to it.</li>
        <li>Wander through Plaka and Monastiraki, and watch the sunset from Lycabettus Hill or Filopappou Hill.</li>
        <li>Street food is cheap and excellent: souvlaki, gyros and spanakopita.</li>
        <li>The metro runs from the airport straight to the centre.</li>
      </ul>
      <RouteDeal route="milan-to-athens" months={months} today={today} />

      <h2 className={H2}>Tips to keep a weekend from Milan cheap</h2>
      <ul className={UL}>
        <li>
          <strong>Check all three airports.</strong> Milan has Malpensa, Linate and Bergamo (Orio al Serio). Many low-cost flights leave
          from Bergamo and Malpensa — Glooconn searches all of them when you choose &ldquo;Milan&rdquo;.
        </li>
        <li>
          <strong>Travel with hand luggage only.</strong> Checked bags can cost as much as the flight on low-cost airlines.
        </li>
        <li>
          <strong>Be flexible by a day.</strong> Leaving on Thursday or coming back on Monday is sometimes much cheaper — try the next
          dates on the route pages.
        </li>
        <li>
          <strong>Look at the whole trip, not only the flight.</strong> A cheap flight with an expensive hotel is not a cheap weekend.
          Glooconn&apos;s packages show the flight and the hotel together, within the budget you set.
        </li>
      </ul>

      <h2 className={H2}>Plan your weekend</h2>
      <p className={P}>
        Pick a city, open its price box above, and choose &ldquo;Plan a weekend&rdquo; to see flight + hotel packages for a Friday to Sunday
        trip. You book each part directly with our partner sites. Looking further afield? See all our{" "}
        <Link href="/flights" className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-900">
          popular flight routes
        </Link>
        .
      </p>
    </>
  );
}
