/**
 * Milestone 76 — eight more content-first city pages (New York, Mumbai, Bangkok, Sydney,
 * Doha, Toronto, Kuala Lumpur, Los Angeles). Same rules as data.ts.
 *
 * Facts were researched on 2026-11-20 (Kayak, The Points Guy, Secret Flying, Skyscanner,
 * Cleartrip, Qantas, Qatar-area and airport guides, KLIA/Porter/airline pages), and written in
 * our own words. Where sources disagree (for example the cheapest month to fly from Mumbai) we
 * say so instead of picking one. Re-check `checked` and the facts about once a year.
 */

import type { CityGuide } from "@/lib/cityGuides/data";

const CHECKED = "2026-11-20";

const BOOK_TOGETHER = {
  q: "Can I book a hotel together with my flight on Glooconn?",
  a: "Yes. Search your trip as a package and Glooconn combines flights and hotels within your budget. You book each part on the partner site.",
};

export const MORE_GUIDES: readonly CityGuide[] = [
  {
    slug: "new-york",
    cityCode: "NYC",
    title: "Cheap flights from New York: JFK, Newark or LaGuardia, and how to compare",
    description:
      "Flying out of New York? How JFK, Newark and LaGuardia differ, which one suits long-haul trips, and how to compare all three, plus a live price search.",
    intro: [
      "New York has three major airports, and the price and the schedule for the same trip can be different at each. Searching all of them together is the single easiest way to save time and money.",
    ],
    sections: [
      {
        heading: "JFK, Newark or LaGuardia",
        paragraphs: [
          "John F. Kennedy (JFK) in Queens is the main long-haul gateway and has the widest choice of international airlines. Newark Liberty (EWR) is across the river in New Jersey, is a major United Airlines hub, and also has many long-haul and transatlantic flights.",
          "LaGuardia (LGA) is the closest to Midtown, but a distance rule means it handles mostly short and medium flights. Most non-stop flights from LGA stay within about 1,500 miles, so for most intercontinental trips you will be choosing between JFK and Newark.",
        ],
      },
      {
        heading: "Getting to the airport",
        paragraphs: [
          "Newark has a rail link: the AirTrain connects to NJ Transit, which reaches New York Penn Station in roughly half an hour. JFK and LaGuardia are in Queens, so allow extra time for traffic or the subway and airport rail connections.",
          "Travel agency and airport guides disagree on which airport is the most convenient, because it depends on where you start. Count the journey from your door to the gate, not only the fare.",
        ],
      },
    ],
    tips: [
      "Search \"New York (any)\" so all three airports are compared in one list.",
      "Use JFK or Newark for most long-haul trips; LaGuardia suits shorter flights.",
      "Add the cost and time of getting to a New Jersey airport before choosing Newark.",
      "Allow extra time at all three: New York airports often rank poorly for on-time performance.",
      "Check your airline's terminal before you leave, because terminals differ by carrier.",
    ],
    destinations: ["LON", "PAR", "MIL", "ROM", "LIS", "DXB", "LAX", "YTO"],
    faq: [
      {
        q: "Which New York airport is best for international flights?",
        a: "JFK has the widest choice of international airlines, and Newark also has many long-haul and transatlantic flights. LaGuardia mostly serves shorter routes.",
      },
      {
        q: "Is Newark a New York airport?",
        a: "It is in New Jersey, across the Hudson River, but it serves the New York area and shows up when you search for flights from New York. A rail link connects it to Manhattan.",
      },
      {
        q: "Why can't I fly long-haul from LaGuardia?",
        a: "A perimeter rule generally limits non-stop flights from LaGuardia to about 1,500 miles, with a few exceptions, so long-haul flights use JFK or Newark.",
      },
      BOOK_TOGETHER,
    ],
    checked: CHECKED,
  },
  {
    slug: "mumbai",
    cityCode: "BOM",
    title: "Cheap flights from Mumbai: airport tips, when to book and how to compare",
    description:
      "Flying out of Mumbai? How far ahead to book, why sources disagree on the cheapest month, and how to compare fares, plus a live price search.",
    intro: [
      "Mumbai's main airport, Chhatrapati Shivaji Maharaj International (BOM), has flights to dozens of Indian cities and to hubs across the Gulf, Southeast Asia and Europe. Fares move a lot with the season and the booking date.",
    ],
    sections: [
      {
        heading: "The airport",
        paragraphs: [
          "BOM is the only airport serving Mumbai for commercial flights, with two passenger terminals. Check which terminal your airline uses before you leave.",
        ],
      },
      {
        heading: "When to book and when to fly",
        paragraphs: [
          "Booking advice differs by source. Skyscanner's data suggests booking about a month before departure for its cheapest fares from Mumbai. Cleartrip suggests 4 to 6 weeks ahead for domestic flights and 8 to 12 weeks for international ones. International and holiday trips usually need earlier booking.",
          "The cheapest month is also disputed. Skyscanner points to March, Cleartrip to September, and Ratepunk to June, which falls in the monsoon season. Treat these as hints, and let the price calendar for your own route decide.",
        ],
      },
    ],
    tips: [
      "Book domestic trips about 4 to 6 weeks ahead and international ones earlier.",
      "Compare a few departure dates; the same route can differ a lot.",
      "Check the monsoon months for lower fares, but allow for weather delays.",
      "Compare one-stop options through Gulf or Southeast Asian hubs with direct flights.",
      "Check the terminal and baggage rules for your airline before you go.",
    ],
    destinations: ["DEL", "DXB", "DOH", "SIN", "BKK", "KUL", "LON", "IST"],
    faq: [
      {
        q: "How far ahead should I book a flight from Mumbai?",
        a: "Sources differ: roughly 4 to 6 weeks for domestic flights and 8 to 12 weeks for international ones is a common range. Compare your own dates in the search.",
      },
      {
        q: "What is the cheapest month to fly from Mumbai?",
        a: "It depends on the source and the route: Skyscanner points to March, Cleartrip to September and Ratepunk to June. Check the price calendar for your route.",
      },
      {
        q: "Does Mumbai have more than one airport?",
        a: "Commercial flights use Chhatrapati Shivaji Maharaj International (BOM), which has two passenger terminals.",
      },
      BOOK_TOGETHER,
    ],
    checked: CHECKED,
  },
  {
    slug: "bangkok",
    cityCode: "BKK",
    title: "Cheap flights from Bangkok: Suvarnabhumi or Don Mueang, and budget airlines",
    description:
      "Flying out of Bangkok? Which airport your airline uses (BKK or DMK), why low-cost flights often leave from Don Mueang, and how to compare, plus a live search.",
    intro: [
      "Bangkok has two airports, and picking the wrong one for your flight is an easy mistake. They are far apart and serve different kinds of airlines.",
    ],
    sections: [
      {
        heading: "Suvarnabhumi (BKK) or Don Mueang (DMK)",
        paragraphs: [
          "Suvarnabhumi (BKK), in the east of the city, is the main international hub and handles most long-haul flights and full-service airlines. Don Mueang (DMK), in the north, is the older airport and is mostly used by low-cost airlines such as AirAsia and Nok Air.",
          "Check the airport on your ticket before you leave. The distance between the two is large enough that going to the wrong one can cost you the flight.",
        ],
      },
      {
        heading: "Connecting between the two",
        paragraphs: [
          "If you book separate tickets that arrive at one airport and depart from the other, you must transfer across Bangkok yourself. Leave a generous gap and consider whether the saving is worth the risk.",
        ],
      },
    ],
    tips: [
      "Check which airport your ticket uses: BKK and DMK are different places.",
      "Compare low-cost carriers from Don Mueang with full-service flights from Suvarnabhumi.",
      "Add baggage and meal costs when comparing budget fares.",
      "Avoid tight self-made connections between BKK and DMK.",
      "Check the visa and entry rules for your onward destination.",
    ],
    destinations: ["SIN", "KUL", "TYO", "DXB", "DEL", "BOM", "SYD", "LON"],
    faq: [
      {
        q: "Which airport should I use in Bangkok?",
        a: "Suvarnabhumi (BKK) for most long-haul and full-service flights, and Don Mueang (DMK) for many low-cost and short-haul flights. Use whichever your ticket says.",
      },
      {
        q: "Are flights from Don Mueang cheaper?",
        a: "Often, because low-cost airlines operate there, but baggage and extras can change the total. Compare the full price.",
      },
      {
        q: "Can I change airports on a connection?",
        a: "Only if you allow plenty of time. Booking separate tickets between BKK and DMK means you handle the transfer and the risk yourself.",
      },
      BOOK_TOGETHER,
    ],
    checked: CHECKED,
  },
  {
    slug: "sydney",
    cityCode: "SYD",
    title: "Cheap flights from Sydney: terminals, best time to fly and long-haul tips",
    description:
      "Flying out of Sydney? How the airport's terminals work, which months are cheaper or more expensive, and tips for long-haul trips, plus a live price search.",
    intro: [
      "Sydney Kingsford Smith (SYD) is Australia's main international gateway and sits about 10 km from the city. Most routes from Sydney are long, so fares and booking dates matter more than on short-haul trips.",
    ],
    sections: [
      {
        heading: "The airport and its terminals",
        paragraphs: [
          "Sydney has three terminals. T1 is the international terminal. T2 and T3 handle domestic flights. If you are connecting between a domestic and an international flight, allow time to move between them; a shuttle bus runs but only at set hours.",
        ],
      },
      {
        heading: "When flights cost more",
        paragraphs: [
          "Kayak's flight data for Sydney describes March as the low season and December as the high season, with the quiet months about 12 percent cheaper on average and the popular times about 32 percent more expensive. Southern-hemisphere school holidays and Christmas push fares up.",
        ],
      },
    ],
    tips: [
      "Avoid December and school-holiday weeks if your dates are flexible.",
      "Allow plenty of time when connecting between T1 and the domestic terminals.",
      "Compare one-stop options through Asian or Gulf hubs with direct flights.",
      "Check passport validity and any electronic travel authorisation for your destination.",
      "Book long-haul trips early for peak dates.",
    ],
    destinations: ["SIN", "TYO", "BKK", "KUL", "DXB", "DOH", "LAX", "LON"],
    faq: [
      {
        q: "Which terminal do international flights use in Sydney?",
        a: "International flights use T1. T2 and T3 are domestic terminals.",
      },
      {
        q: "When is it cheapest to fly from Sydney?",
        a: "Kayak's data lists March as the low season and December as the high season. Compare your own dates in the search.",
      },
      {
        q: "How early should I get to Sydney Airport?",
        a: "Many guides suggest at least three hours before an international flight. Check your airline's own advice.",
      },
      BOOK_TOGETHER,
    ],
    checked: CHECKED,
  },
  {
    slug: "doha",
    cityCode: "DOH",
    title: "Cheap flights from Doha: Hamad Airport, stopovers and Qatar Airways options",
    description:
      "Flying out of Doha? The one airport you need to know, how connections through Doha work, and how to compare fares, plus a live price search.",
    intro: [
      "Doha is a connecting hub as much as a destination: Hamad International Airport (DOH) is the home base of Qatar Airways and links many of the world's regions. That means many routes from Doha are one stop or direct on the same airline.",
    ],
    sections: [
      {
        heading: "One airport",
        paragraphs: [
          "Since the old Doha International Airport stopped scheduled flights, all scheduled commercial flights use Hamad International (DOH). There is no second airport to compare for this city.",
        ],
      },
      {
        heading: "Fares and timing",
        paragraphs: [
          "Qatar Airways runs seasonal promotions, including some for summer and some that include a stopover in Doha. Terms differ by country and fare, so read the conditions on the airline's own site before you rely on one.",
          "Because the airline network passes through Doha, you can often compare a direct flight with a one-stop flight on another carrier. Check current notices on your airline's website for any schedule changes before you travel.",
        ],
      },
    ],
    tips: [
      "Hamad (DOH) is the only airport to use for scheduled flights.",
      "Compare a direct flight with one-stop options on other airlines.",
      "Check the conditions on any airline promotion before you book.",
      "Look at your airline's website for current schedule notices before you travel.",
      "Check visa and transit rules for your passport.",
    ],
    destinations: ["LON", "IST", "DXB", "BOM", "DEL", "BKK", "CMB", "MLE"],
    faq: [
      {
        q: "Which airport do I use in Doha?",
        a: "Hamad International Airport (DOH). All scheduled commercial flights now operate from it.",
      },
      {
        q: "Are flights from Doha mostly on Qatar Airways?",
        a: "Qatar Airways is the largest carrier at DOH, and many other airlines also fly there. Compare several in the search.",
      },
      {
        q: "Can I add a stopover in Doha?",
        a: "Qatar Airways has offers that include a Doha stopover on some itineraries. Check the conditions for your route.",
      },
      BOOK_TOGETHER,
    ],
    checked: CHECKED,
  },
  {
    slug: "toronto",
    cityCode: "YTO",
    title: "Cheap flights from Toronto: Pearson, Billy Bishop and Hamilton compared",
    description:
      "Flying out of Toronto? How Pearson, Billy Bishop and Hamilton differ, when each makes sense, and how to compare fares, plus a live price search.",
    intro: [
      "Toronto has more than one airport option, and the closest is not always the cheapest or the most useful for your trip. Comparing them takes a minute and can change the plan.",
    ],
    sections: [
      {
        heading: "Pearson, Billy Bishop or Hamilton",
        paragraphs: [
          "Toronto Pearson (YYZ) in Mississauga is Canada's busiest airport and has most of the long-haul flights, with dozens of airlines. Billy Bishop (YTZ) is on the Toronto Islands, very close to downtown, and mostly serves flights within Canada and to a few US cities.",
          "Hamilton (YHM) is about 64 km from Toronto. It is smaller and is used by Porter for some routes. It may suit you if you live west of the city.",
        ],
      },
      {
        heading: "When the small airport helps",
        paragraphs: [
          "Some travellers report that they save time at Billy Bishop because it is small and close to the city, and a few say they have found cheaper Europe trips by connecting through another city. Prices for the same destination are often similar, so check, don't assume.",
        ],
      },
    ],
    tips: [
      "Use Pearson for most long-haul flights.",
      "Check Billy Bishop for short flights within Canada and to nearby US cities.",
      "Compare a connection from a smaller airport with a direct flight from Pearson.",
      "Add the cost and time of getting to the airport, not only the fare.",
      "Check passport and entry rules for your destination.",
    ],
    destinations: ["NYC", "LON", "PAR", "MIL", "LIS", "LAX", "DXB"],
    faq: [
      {
        q: "Which airport is best in Toronto?",
        a: "Pearson (YYZ) for most international flights. Billy Bishop (YTZ) is convenient for short regional flights, and Hamilton (YHM) can suit people west of the city.",
      },
      {
        q: "Is Billy Bishop cheaper than Pearson?",
        a: "Prices to the same destination are often similar. Some travellers find savings on connecting flights, so compare both.",
      },
      {
        q: "Where is Billy Bishop airport?",
        a: "On the Toronto Islands, close to downtown, with a short ferry or tunnel connection.",
      },
      BOOK_TOGETHER,
    ],
    checked: CHECKED,
  },
  {
    slug: "kuala-lumpur",
    cityCode: "KUL",
    title: "Cheap flights from Kuala Lumpur: KLIA or KLIA2 and AirAsia tips",
    description:
      "Flying out of Kuala Lumpur? How KLIA and KLIA2 differ, which airlines use each, and how to avoid the wrong terminal, plus a live price search.",
    intro: [
      "Kuala Lumpur's main airport (KUL) has two separate terminals that share one airport code. Going to the wrong one is a common mistake, and it can be expensive.",
    ],
    sections: [
      {
        heading: "KLIA or KLIA2",
        paragraphs: [
          "KLIA (Terminal 1) serves full-service airlines such as Malaysia Airlines, Singapore Airlines, Emirates and Qatar Airways. KLIA2 (Terminal 2) is built for low-cost carriers, including AirAsia, AirAsia X and Scoot.",
          "The airport is about 45 km south of the city centre. The two terminals are a couple of kilometres apart, so check your boarding pass before you set out.",
        ],
      },
      {
        heading: "If you end up at the wrong terminal",
        paragraphs: [
          "A free shuttle bus and the Aerotrain link the terminals, but you need extra time. If you connect between a low-cost and a full-service airline on separate tickets, leave a long gap.",
        ],
      },
    ],
    tips: [
      "Check the terminal on your ticket: AirAsia flies from KLIA2.",
      "Allow extra time to travel between KLIA and KLIA2 if needed.",
      "Add baggage and seat fees when comparing low-cost fares.",
      "Compare low-cost carriers with full-service ones on the same dates.",
      "Allow about 45 minutes to reach the airport from the city centre.",
    ],
    destinations: ["SIN", "BKK", "TYO", "SYD", "DEL", "BOM", "DXB", "CMB"],
    faq: [
      {
        q: "What is the difference between KLIA and KLIA2?",
        a: "Both are part of Kuala Lumpur's main airport (KUL). KLIA serves full-service airlines, and KLIA2 serves low-cost carriers such as AirAsia.",
      },
      {
        q: "How do I get between KLIA and KLIA2?",
        a: "A free shuttle bus and the Aerotrain link the terminals. Leave extra time.",
      },
      {
        q: "How far is the airport from the city?",
        a: "About 45 km south of central Kuala Lumpur, roughly a 45-minute trip.",
      },
      BOOK_TOGETHER,
    ],
    checked: CHECKED,
  },
  {
    slug: "los-angeles",
    cityCode: "LAX",
    title: "Cheap flights from Los Angeles: LAX, Burbank, Long Beach and more compared",
    description:
      "Flying out of Los Angeles? How LAX compares with Burbank, Long Beach, John Wayne and Ontario, and how far ahead to book international trips, plus a live search.",
    intro: [
      "Los Angeles has five commercial airports, and which one is best depends on where in the region you start. LAX is the biggest, but not always the easiest.",
    ],
    sections: [
      {
        heading: "LAX and the other four",
        paragraphs: [
          "LAX has the widest international network and most long-haul flights, including to Asia, Europe and Oceania. Hollywood Burbank (BUR) handles only domestic flights and has a rail link to downtown. Long Beach (LGB) is small and quiet, and Southwest and JetBlue use it. John Wayne (SNA) serves Orange County, and Ontario (ONT) is east of the city, useful for the Inland Empire.",
          "These are not interchangeable: a cheaper airport can cost you a long drive. Compare the whole journey from where you start.",
        ],
      },
      {
        heading: "International flights",
        paragraphs: [
          "For international trips from LAX, Secret Flying suggests booking about 3 to 6 months ahead. Comparing fares across all the LA-area airports, not only LAX, is also worth doing for domestic trips.",
        ],
      },
    ],
    tips: [
      "Search \"Los Angeles (any)\" to compare all the area's airports.",
      "Use LAX for most international flights.",
      "For domestic trips, check Burbank, Long Beach, John Wayne and Ontario.",
      "Count the drive to the airport in your total time.",
      "Book international flights about 3 to 6 months ahead for the best choice.",
    ],
    destinations: ["NYC", "TYO", "LON", "PAR", "SYD", "SIN", "BKK", "YTO"],
    faq: [
      {
        q: "Which Los Angeles airport should I use?",
        a: "LAX for most international flights. For domestic trips, Burbank, Long Beach, John Wayne or Ontario may be closer to where you start.",
      },
      {
        q: "Does Burbank have international flights?",
        a: "No. Hollywood Burbank handles only domestic flights.",
      },
      {
        q: "How far ahead should I book from Los Angeles?",
        a: "Secret Flying suggests 3 to 6 months ahead for international trips from LAX. Check your own dates in the search.",
      },
      BOOK_TOGETHER,
    ],
    checked: CHECKED,
  },
];
