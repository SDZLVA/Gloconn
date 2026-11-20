/**
 * Milestone 74 — content-first city pages (/flights-from/{slug}) for cities where the
 * free Travelpayouts price cache has little data (Dubai, Singapore, Delhi). They carry
 * advice that holds without live prices: airports and terminals, when fares rise and
 * fall, how far ahead to book, and a prefilled search.
 *
 * Facts were researched on 2026-11-20 (airport operators' pages, Expedia/Skyscanner
 * statements reported by Khaleej Times and Gulf News, MoneySmart, Going, Pointhacks).
 * Written in our own words. Where sources disagree we say so instead of picking one.
 * Re-check `checked` and the facts about once a year (terminals and airlines move).
 */

import type { CityCode } from "@/lib/routes/catalog";
import type { FaqItem } from "@/lib/seo/jsonld";

export type GuideSection = { heading: string; paragraphs: string[] };

export type CityGuide = {
  slug: string;
  cityCode: CityCode;
  title: string;
  description: string;
  intro: string[];
  sections: GuideSection[];
  /** Quick checklist shown as a list. */
  tips: string[];
  /** Destinations to link to (live-price searches; a route page too when it has prices). */
  destinations: CityCode[];
  faq: FaqItem[];
  /** YYYY-MM-DD — when the facts were last checked. */
  checked: string;
};

export const CITY_GUIDES: readonly CityGuide[] = [
  {
    slug: "dubai",
    cityCode: "DXB",
    title: "Cheap flights from Dubai: airports, best time to fly and booking tips",
    description:
      "Flying out of Dubai? Which airport to use, when fares rise (summer, school holidays) and fall, and how to find cheaper flights, plus a live price search.",
    intro: [
      "Dubai is one of the busiest long-haul hubs in the world, so there are plenty of flights out of it, but prices swing a lot with the season. Departing from the UAE follows a different calendar than flying in as a visitor: the months that are cheapest for tourists coming to Dubai are not the cheapest for people leaving it.",
    ],
    sections: [
      {
        heading: "Which airport to fly from",
        paragraphs: [
          "Dubai International (DXB) is the airport almost everyone uses. It is about 11 km from the city and is where Emirates and most major international airlines fly. Al Maktoum International (DWC), in Dubai South, is around 37 km out and today handles far fewer passenger flights, though Dubai has announced plans to move passenger traffic there in the long run.",
          "Sharjah (SHJ, about 28 km) and Abu Dhabi (AUH, about 105 km) are also within reach. They can be cheaper for a given route, so it is worth running one search for each before you book, as long as the extra transfer time and cost do not eat the saving.",
        ],
      },
      {
        heading: "When flights from Dubai cost more",
        paragraphs: [
          "Summer is the quiet season for visitors coming into Dubai, but it is the busy season for people leaving it. Expedia's 2025 report on UAE travel named June the most expensive month to fly out of the UAE, which likely reflects residents travelling for the school holidays. The late-summer rush before schools reopen also pushes fares up.",
          "Dates still matter within the summer. Skyscanner's analysis for summer 2026 found the week starting 31 August to be the cheapest overall for UAE travellers, and that many people wrongly assume July is cheapest. Winter (November to April) is Dubai's busy tourist season, so flights on popular routes can also fill earlier then.",
        ],
      },
      {
        heading: "Direct or one stop",
        paragraphs: [
          "Non-stop flights from Dubai to Europe and North America carry the biggest premium in peak weeks. Gulf News has reported that one-stop itineraries through regional hubs can bring long-haul fares down noticeably. If your dates are fixed, compare both on the same search before choosing.",
        ],
      },
    ],
    tips: [
      "Compare DXB with Sharjah and Abu Dhabi for the same dates.",
      "Avoid June and the days just before schools reopen if you can move your trip.",
      "Search a one-stop option next to the direct flight on long-haul routes.",
      "Midweek departures are often a little cheaper, but sources disagree on the best day, so let the price comparison decide.",
      "For November to April trips, book early and check the price again after a few days.",
    ],
    destinations: ["LON", "PAR", "IST", "DEL", "BOM", "BKK", "CMB", "MLE"],
    faq: [
      {
        q: "Which airport should I fly from in Dubai?",
        a: "Most travellers use Dubai International (DXB), about 11 km from the city, where Emirates and most international airlines operate. Al Maktoum (DWC) is farther out and has far fewer passenger flights. Sharjah and Abu Dhabi are worth comparing for price.",
      },
      {
        q: "Is it cheaper to fly out of Dubai in summer?",
        a: "Not necessarily. Summer is the low season for tourists arriving in Dubai, but it is a busy time for people leaving the UAE. Expedia's 2025 report named June the most expensive month to fly from the UAE. Late August and early September were cheaper in Skyscanner's 2026 analysis.",
      },
      {
        q: "Are direct flights from Dubai more expensive?",
        a: "On long routes to Europe and the US, often yes, especially in peak weeks. One-stop options via regional hubs can be cheaper but take longer. Compare both for your dates.",
      },
      {
        q: "Can I book a hotel together with my flight on Glooconn?",
        a: "Yes. Search your trip as a package and Glooconn combines flights and hotels within your budget. You book each part on the partner site.",
      },
    ],
    checked: "2026-11-20",
  },
  {
    slug: "singapore",
    cityCode: "SIN",
    title: "Cheap flights from Singapore: Changi terminals, budget airlines and when to book",
    description:
      "Flying out of Singapore? Which Changi terminal your airline uses, budget airlines to compare, how far ahead to book and when fares spike, plus a live search.",
    intro: [
      "Singapore Changi is one of the most connected airports in Asia. It has flights on over 100 airlines, a strong low-cost scene, and a short hop to many neighbouring countries, so the same trip can cost very different amounts depending on the airline and the date.",
    ],
    sections: [
      {
        heading: "Changi's four terminals",
        paragraphs: [
          "Changi has four terminals. Terminals 1, 2 and 3 are linked by the Skytrain, and Jewel, the shopping and garden complex, connects directly to Terminal 1. Terminal 4 is separate and reached by a shuttle bus from the other terminals.",
          "As a rough guide, Singapore Airlines uses Terminal 2 for many regional routes and Terminal 3 for longer ones, while Scoot, Emirates, British Airways and Qantas are at Terminal 1. Terminal 4 hosts Jetstar Asia, AirAsia and Cathay Pacific. Airlines do move terminals now and then, so always check the terminal printed on your booking before you leave.",
        ],
      },
      {
        heading: "Budget airlines out of Singapore",
        paragraphs: [
          "Scoot (Singapore Airlines' low-cost arm), Jetstar Asia and AirAsia all fly from Changi to dozens of cities across Asia. Cheaper base fares usually come with extra charges for bags, seats and meals, so compare the final price with those added, not the first figure you see.",
        ],
      },
      {
        heading: "How far ahead to book",
        paragraphs: [
          "A Singapore money site that looked at booking data suggests booking short regional trips roughly 8 to 15 days ahead, and long-haul flights 3 to 6 months ahead. Treat these as guides rather than rules: a long weekend to Bangkok in a busy week can sell out earlier.",
          "Fares jump around Chinese New Year, the school holidays and the National Day long weekend. Published guides disagree on which month is the cheapest overall, so the best move is to compare the dates you can actually do rather than trust one month.",
        ],
      },
    ],
    tips: [
      "Check the terminal on your booking. Terminal 4 is a separate building.",
      "Add bags and seats to low-cost fares before comparing prices.",
      "Book regional trips a week or two ahead, but start looking for long-haul 3 to 6 months out.",
      "Expect higher prices around Chinese New Year, school holidays and National Day.",
    ],
    destinations: ["BKK", "KUL", "TYO", "SYD", "LON", "DEL", "DXB"],
    faq: [
      {
        q: "Which terminal do I fly from at Singapore Changi?",
        a: "It depends on the airline. Singapore Airlines uses Terminals 2 and 3, Scoot, Emirates, British Airways and Qantas are at Terminal 1, and Jetstar Asia, AirAsia and Cathay Pacific are at Terminal 4. Airlines occasionally move, so confirm the terminal on your booking.",
      },
      {
        q: "When should I book flights from Singapore?",
        a: "One guide suggests 8 to 15 days ahead for short regional trips and 3 to 6 months ahead for long-haul. Fares rise around Chinese New Year, school holidays and National Day.",
      },
      {
        q: "Which budget airlines fly from Singapore?",
        a: "Scoot, Jetstar Asia and AirAsia are the main low-cost options. Always compare the final price including bags and seats.",
      },
      {
        q: "Can I search flights and hotels together?",
        a: "Yes. Use the package search to see flights and hotels combined within your budget, then book each part on the partner site.",
      },
    ],
    checked: "2026-11-20",
  },
  {
    slug: "delhi",
    cityCode: "DEL",
    title: "Cheap flights from Delhi: Terminal 3, best time to book and festival fares",
    description:
      "Flying out of Delhi? Which terminal international flights use, when fares rise (Diwali, holidays), how far ahead to book, and tips for cheaper flights.",
    intro: [
      "Delhi's Indira Gandhi International Airport (DEL) is India's busiest airport, and the choice of airline, stopover and date can change what you pay by a large margin. Festival weeks and school holidays push fares up fast, so planning a few weeks ahead usually pays off.",
    ],
    sections: [
      {
        heading: "Terminals at Delhi airport",
        paragraphs: [
          "Delhi airport has three terminals, about 16 km from central Delhi. Every international flight, on every airline, uses Terminal 3. Terminal 1 mainly serves domestic low-cost airlines such as IndiGo and SpiceJet, and Terminal 2 handles part of the domestic traffic.",
          "If you connect from a domestic flight to an international one, you may need to change terminals. The terminals are not within walking distance, but free shuttle buses link them around the clock, so leave a generous gap between flights. A new airport at Noida, about 63 km from Delhi airport, is under construction.",
        ],
      },
      {
        heading: "When fares from Delhi go up and down",
        paragraphs: [
          "Diwali, which falls in October or November depending on the year, is one of the busiest travel periods in India, and fares around it can rise quickly. Summer, with its heat and monsoon rain, is the quieter season for much of the country, which tends to mean cheaper flights.",
          "One Indian fare guide recommends booking international flights roughly 8 to 12 weeks ahead, and Southeast Asia routes 3 to 5 months ahead. Another guide notes that the cheapest month depends on which Indian city you fly from, so do not assume a pattern from another city applies to Delhi.",
        ],
      },
      {
        heading: "Direct or with a stop",
        paragraphs: [
          "Direct flights are the simplest, but one-stop itineraries are often cheaper on long routes. Compare both, and check that the layover is long enough to change terminals or clear immigration if you need to.",
        ],
      },
    ],
    tips: [
      "International flights leave from Terminal 3. Plan extra time if you arrive on a domestic flight.",
      "Book Diwali-season trips early, or move your dates away from the festival week.",
      "For Southeast Asia, start searching 3 to 5 months ahead.",
      "Compare direct flights with one-stop options for the same dates.",
      "Prices differ by departure city in India, so compare other Indian cities too if you can reach them.",
    ],
    destinations: ["DXB", "LON", "BKK", "SIN", "NYC", "KUL", "YTO"],
    faq: [
      {
        q: "Which terminal do international flights use at Delhi airport?",
        a: "All international flights use Terminal 3. Terminal 1 is mainly for domestic low-cost airlines and Terminal 2 handles part of the domestic traffic. Free shuttle buses link the terminals.",
      },
      {
        q: "When is the cheapest time to fly from Delhi?",
        a: "It depends on the route and the destination. Festival periods such as Diwali are expensive, while the summer low season tends to be cheaper for much of India. Compare your own dates.",
      },
      {
        q: "How early should I book an international flight from Delhi?",
        a: "One Indian fare guide suggests roughly 8 to 12 weeks ahead for most international routes and 3 to 5 months for Southeast Asia. Book earlier for Diwali and school holidays.",
      },
      {
        q: "Can I plan a flight and hotel together?",
        a: "Yes. Use Glooconn's package search to see flights and hotels together, then book each on the partner site.",
      },
    ],
    checked: "2026-11-20",
  },
];

export function findGuide(slug: string): CityGuide | null {
  return CITY_GUIDES.find((g) => g.slug === slug) ?? null;
}
