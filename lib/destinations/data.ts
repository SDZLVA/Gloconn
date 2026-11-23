/**
 * Milestone 75 — "Hot destinations": the cards on the home page and the /destinations/{slug}
 * pages. There is no live trend feed, so "hot" means "in season now": each destination lists
 * the months when it is at its best, and the home page shows the ones in season this month first.
 *
 * Season facts researched on 2026-11-20 (travel-board and tourism-guide pages for each city),
 * written in our own words. Where sources differ by a few weeks we say "roughly".
 * Re-check `checked` and the facts about once a year.
 */

import type { Destination, RegionId } from "@/lib/destinations/types";
import { AFRICA } from "@/lib/destinations/regions/africa";
import { ANTARCTICA } from "@/lib/destinations/regions/antarctica";
import { ASIA_NEW } from "@/lib/destinations/regions/asia";
import { EUROPE_NEW } from "@/lib/destinations/regions/europe";
import { NORTH_AMERICA } from "@/lib/destinations/regions/northAmerica";
import { OCEANIA } from "@/lib/destinations/regions/oceania";
import { SOUTH_AMERICA } from "@/lib/destinations/regions/southAmerica";

export type { Attraction, Destination, RegionId } from "@/lib/destinations/types";

const CHECKED = "2026-11-20";

const EXISTING: readonly Destination[] = [
  {
    slug: "dubai",
    region: "asia",
    rank: 3,
    added: "2026-11-20",
    cityCode: "DXB",
    name: "Dubai",
    country: "United Arab Emirates",
    photo: "dubai",
    tagline: "Sun, skyscrapers and souks from November to March",
    bestMonths: [11, 12, 1, 2, 3],
    title: "Dubai travel guide: what to see, when to go, flights and hotels",
    description: "Plan a trip to Dubai: top attractions, the best months to visit, and a live search for flights and hotels. Written for travellers from anywhere in the world.",
    intro: [
      "Dubai is a city of record-breaking towers, long beaches, desert edges and old trading districts, all within one metro area. It works for a short stopover and for a week-long holiday.",
      "The main decision is timing. The mild months are also the busiest, so book flights and hotels early for them.",
    ],
    attractions: [
      { name: "Burj Khalifa and Dubai Mall", text: "The Burj Khalifa is the world's tallest building. Next to it, Dubai Mall has the fountain show in the evening and plenty of indoor space for hot afternoons." },
      { name: "Old Dubai and the Creek", text: "Walk the Al Fahidi area, cross the Creek on a small abra boat and browse the gold and spice souks for a very different side of the city." },
      { name: "Desert safari", text: "Half-day trips take you out of the city for dune driving and a camp dinner. Pick a reputable operator and check what is included." },
      { name: "Palm Jumeirah and the beaches", text: "Public beaches line the coast, and the Palm has hotels, restaurants and sea views. Beach time is most comfortable in the cooler months." },
      { name: "Museum of the Future", text: "A striking building with exhibitions on technology and the future. Tickets are usually timed, so book ahead in busy weeks." },
    ],
    bestTime: [
      "Most guides put the best weather between roughly November and March, with some extending it into April. Days are warm rather than extreme, so walking, beaches and the desert are all comfortable.",
      "Early November and late March are often cheaper edges of that season, while December and school-holiday weeks are the busiest and most expensive. Summer is low season: hotels drop their prices, but the heat is intense and most activities move indoors.",
    ],
    tips: [
      "Compare flights for a few dates; the same trip can cost less a week earlier or later.",
      "In winter, book hotels well ahead for the Christmas and New Year weeks.",
      "In summer, plan outdoor things for early morning or evening.",
      "Check visa rules for your passport before you book.",
    ],
    faq: [
      { q: "When is the best time to visit Dubai?", a: "Roughly November to March, when the weather is warm but not extreme. Early November and late March are often cheaper than December." },
      { q: "Is Dubai cheaper in summer?", a: "Hotel prices usually drop in summer, which is low season, but the heat is intense. Many visitors only go if they plan mostly indoor activities." },
      { q: "How many days do I need in Dubai?", a: "Three to four days cover the main sights. Add days if you want beach time or a desert trip." },
    ],
    checked: CHECKED,
  },
  {
    slug: "bangkok",
    region: "asia",
    rank: 1,
    added: "2026-11-20",
    cityCode: "BKK",
    name: "Bangkok",
    country: "Thailand",
    photo: "bangkok",
    tagline: "Temples, street food and river life, cool and dry now",
    bestMonths: [11, 12, 1, 2],
    title: "Bangkok travel guide: what to see, when to go, flights and hotels",
    description: "Plan a trip to Bangkok: temples, markets, street food, the best months to visit, and a live search for flights and hotels from anywhere in the world.",
    intro: [
      "Bangkok mixes gilded temples, river boats, big markets and some of the best street food in Asia. It is also a major air hub, so many routes to the rest of Southeast Asia start here.",
    ],
    attractions: [
      { name: "Grand Palace and Wat Phra Kaew", text: "The royal complex is the most visited sight in the city. Dress rules apply (covered shoulders and knees), and it is best early in the day." },
      { name: "Wat Pho", text: "Home of the long reclining Buddha, close to the Grand Palace, so the two fit in one morning." },
      { name: "Wat Arun", text: "The riverside temple with its tall spire looks best from across the Chao Phraya at sunset." },
      { name: "Chatuchak Weekend Market", text: "A huge market with thousands of stalls, open at weekends. Go early and bring water." },
      { name: "Yaowarat (Chinatown) street food", text: "The evening food streets are a good place to try many small dishes. Go hungry and choose busy stalls." },
      { name: "Chao Phraya river boats", text: "Public river boats are a cheap way to move between sights and avoid traffic." },
    ],
    bestTime: [
      "The cool, dry season runs roughly November to February, with the most comfortable weather and the highest prices. March to May is hot, and the rainy season is roughly June to October, with showers that are often short but heavy.",
      "If you want lower prices and can handle heat or rain, the shoulder and rainy months can be good value.",
    ],
    tips: [
      "Carry a light layer: malls, trains and buses are strongly air-conditioned.",
      "Use river boats and the BTS/MRT trains to avoid traffic.",
      "Book hotels early for December and January.",
      "Check entry rules for your passport before you book.",
    ],
    faq: [
      { q: "When is the best time to visit Bangkok?", a: "Roughly November to February is the cool and dry season, with the best weather. It is also the most expensive time." },
      { q: "Is the rainy season a bad time to go?", a: "Not necessarily. Rain is often in short bursts and prices are lower, but streets can flood and it is humid." },
      { q: "How many days do I need in Bangkok?", a: "Three days cover the main temples, markets and food. Many people add Bangkok to a longer Thailand trip." },
    ],
    checked: CHECKED,
  },
  {
    slug: "maldives",
    region: "asia",
    rank: 4,
    added: "2026-11-20",
    cityCode: "MLE",
    name: "Maldives",
    country: "Maldives",
    photo: "maldives",
    tagline: "Dry season starts: lagoons, reefs and overwater villas",
    bestMonths: [11, 12, 1, 2, 3, 4],
    title: "Maldives travel guide: islands, when to go, flights and hotels",
    description: "Plan a trip to the Maldives: island types, snorkelling, the best months to visit, and a live search for flights and hotels to Malé from anywhere.",
    intro: [
      "The Maldives is a chain of coral atolls in the Indian Ocean. Most visitors fly into Malé (MLE), then continue to a resort island by speedboat, seaplane or a short domestic flight.",
      "Transfers are part of the cost, so compare the whole price of flight, hotel and transfer, not only the room.",
    ],
    attractions: [
      { name: "House reefs and snorkelling", text: "Many islands have a reef right off the beach, so you can snorkel without a boat trip. Ask the resort about the reef before you book." },
      { name: "Resort islands", text: "One resort per island is the classic Maldives stay, with overwater villas, a private beach and all meals on site." },
      { name: "Local islands and guesthouses", text: "A cheaper way to visit: small guesthouses on islands where people live, with beach and excursions. Rules on dress and alcohol are stricter than on resort islands." },
      { name: "Diving and marine life", text: "Dive and snorkel trips run to channels and reefs. The best spots depend on the atoll and the season, so check with the operator." },
      { name: "Malé", text: "The capital is small and busy, with a fish market and old mosque. Most visitors only pass through, but it can fill a few hours between transfers." },
    ],
    bestTime: [
      "The dry season runs roughly December to April, with the sunniest, calmest weather. November is often the start of the high season, and Christmas and New Year weeks are the busiest.",
      "The wetter months are roughly May to October. Prices are lower, often lowest around April to August, and you can still get sunny days.",
    ],
    tips: [
      "Add transfer costs (boat or seaplane) to your budget before comparing.",
      "Check the resort's flight-time limits: seaplanes usually fly only in daylight.",
      "Book Christmas and New Year far ahead.",
      "Guesthouses on local islands are a cheaper way to see the Maldives.",
    ],
    faq: [
      { q: "When is the best time to visit the Maldives?", a: "Roughly December to April is the dry season, with the best weather and the highest prices." },
      { q: "Is the Maldives cheaper in the wet season?", a: "Usually yes. Prices are often lowest around April to August, but showers are more likely." },
      { q: "Which airport do I fly to?", a: "Velana International Airport in Malé (MLE). From there you take a boat, seaplane or domestic flight to your island." },
    ],
    checked: CHECKED,
  },
  {
    slug: "tokyo",
    region: "asia",
    rank: 2,
    added: "2026-11-20",
    cityCode: "TYO",
    name: "Tokyo",
    country: "Japan",
    photo: "tokyo",
    tagline: "Autumn leaves peak in late November and early December",
    bestMonths: [3, 4, 10, 11, 12],
    title: "Tokyo travel guide: what to see, when to go, flights and hotels",
    description: "Plan a trip to Tokyo: shrines, markets, neighbourhoods, the best months to visit and a live search for flights and hotels from anywhere in the world.",
    intro: [
      "Tokyo is a huge city made of many smaller neighbourhoods, from quiet shrines to neon crossings. Trains are fast and easy to use, so you can see a lot even in a short stay.",
    ],
    attractions: [
      { name: "Senso-ji, Asakusa", text: "Tokyo's oldest temple, with a market street leading up to it. Come early or late to avoid the crowds." },
      { name: "Shibuya Crossing", text: "The famous scramble crossing. Watch from a nearby building and then walk through it." },
      { name: "Meiji Shrine", text: "A calm forested shrine next to Harajuku, good for a slow start to the day." },
      { name: "Shinjuku Gyoen", text: "A large garden that is especially popular for autumn colours and spring blossom." },
      { name: "Tsukiji Outer Market", text: "Food stalls and small restaurants for breakfast and snacks." },
      { name: "Day trips", text: "Kamakura and Nikko are both popular day trips from Tokyo by train." },
    ],
    bestTime: [
      "Spring (March to May, with cherry blossom around late March and early April) and autumn (October to November) are the most popular seasons. Autumn leaves in Tokyo usually peak from around late November into early December, depending on the garden and the year.",
      "Summer is hot and humid, and winter is cold but often dry and clear, with lower prices outside the New Year week.",
    ],
    tips: [
      "Get a rechargeable transit card for trains and buses.",
      "Book hotels early for cherry blossom and autumn leaves.",
      "Carry some cash: small shops and restaurants may not take cards.",
      "Check entry rules for your passport before you book.",
    ],
    faq: [
      { q: "When is the best time to visit Tokyo?", a: "Spring (cherry blossom) and autumn (colours, peaking around late November to early December) are the favourites." },
      { q: "How many days do I need in Tokyo?", a: "Four to five days cover the main areas. Add days for day trips." },
      { q: "Is Tokyo expensive?", a: "Flights are usually the biggest cost. Once there, food and transport can be good value, while hotels in peak seasons cost more." },
    ],
    checked: CHECKED,
  },
  {
    slug: "lisbon",
    region: "europe",
    rank: 6,
    added: "2026-11-20",
    cityCode: "LIS",
    name: "Lisbon",
    country: "Portugal",
    photo: "lisbonTram",
    tagline: "Hills, trams and river views, mild all year",
    bestMonths: [3, 4, 5, 9, 10],
    title: "Lisbon travel guide: what to see, when to go, flights and hotels",
    description: "Plan a trip to Lisbon: trams, castles, custard tarts, the best months to visit and a live search for flights and hotels from anywhere in the world.",
    intro: [
      "Lisbon is a hilly, walkable capital on the Tagus river, known for yellow trams, tiled facades and a relaxed food scene. It is one of the more affordable western European capitals.",
    ],
    attractions: [
      { name: "Belém Tower and Jerónimos Monastery", text: "Two of the best-known monuments, side by side on the river. Go in the morning." },
      { name: "Tram 28 and Alfama", text: "The old tram climbs through Alfama's narrow streets. It is crowded, so many people walk the area instead." },
      { name: "São Jorge Castle", text: "A hilltop castle with wide views over the city and the river." },
      { name: "Pastéis de nata", text: "Try the custard tarts at the bakery in Belém or at any neighbourhood café." },
      { name: "LX Factory", text: "A former factory area turned into shops, cafés and bookshops." },
      { name: "Sintra day trip", text: "Palaces and gardens in the hills about 30 km away, reachable by train." },
    ],
    bestTime: [
      "Spring (March to May) and early autumn (September and October) are the most comfortable times, with mild weather and fewer crowds than midsummer.",
      "Winter is mild but rainy, and it is one of the cheapest periods for flights and hotels, roughly December to March. Summer is hot and busy.",
    ],
    tips: [
      "Wear comfortable shoes: the streets are steep and cobbled.",
      "Use the metro and trams, and watch for pickpockets on busy lines.",
      "Book Sintra palace tickets ahead in busy months.",
      "Compare flights from several airports if you live far from a hub.",
    ],
    faq: [
      { q: "When is the best time to visit Lisbon?", a: "Spring (March to May) and early autumn (September and October) have mild weather and fewer crowds." },
      { q: "Is Lisbon cheap in winter?", a: "Often yes. Roughly December to March is lower season for flights and hotels, though it can rain." },
      { q: "How many days do I need in Lisbon?", a: "Three days for the city, and one more for Sintra." },
    ],
    checked: CHECKED,
  },
  {
    slug: "new-york",
    region: "north-america",
    rank: 1,
    added: "2026-11-20",
    cityCode: "NYC",
    name: "New York",
    country: "United States",
    photo: "newYork",
    tagline: "Holiday lights and markets from late November",
    bestMonths: [5, 6, 9, 10, 11, 12],
    title: "New York travel guide: what to see, when to go, flights and hotels",
    description: "Plan a trip to New York City: landmarks, museums, the best months to visit and a live search for flights and hotels from anywhere in the world.",
    intro: [
      "New York is five boroughs of landmarks, museums, food and neighbourhoods. You can see the headline sights in a few days, but the city rewards a longer stay.",
    ],
    attractions: [
      { name: "Central Park", text: "A huge park in the middle of Manhattan, good for walking, boating and people-watching in any season." },
      { name: "Statue of Liberty and Ellis Island", text: "Ferries leave from Battery Park and Liberty State Park. Book tickets ahead in busy periods." },
      { name: "Brooklyn Bridge", text: "Walk across at sunrise or in the evening for skyline views." },
      { name: "The Met and other museums", text: "The Metropolitan Museum of Art is huge, so pick a few sections rather than trying to see everything." },
      { name: "The High Line", text: "An elevated park built on an old rail line on Manhattan's west side." },
      { name: "Times Square", text: "Busy and bright. Most people want to see it once, ideally in the evening." },
    ],
    bestTime: [
      "Late November and December bring holiday lights, markets and windows, but they are also the busiest and most expensive weeks. Spring and autumn (around May and October) are mild and good for walking.",
      "January to early March is usually the cheapest period, but it is cold.",
    ],
    tips: [
      "Book hotels early for December; prices climb quickly.",
      "Use the subway rather than taxis for most trips.",
      "Pre-book popular attractions in peak weeks.",
      "Check entry rules and any travel authorisation for your passport.",
    ],
    faq: [
      { q: "When is the best time to visit New York?", a: "May and October are mild and good for walking. Late November and December have holiday lights, with higher prices." },
      { q: "When is New York cheapest?", a: "January to early March is usually the lowest-priced period, though it is cold." },
      { q: "How many days do I need in New York?", a: "Four to five days cover the main sights. A week lets you explore neighbourhoods." },
    ],
    checked: CHECKED,
  },
  {
    slug: "istanbul",
    region: "europe",
    rank: 5,
    added: "2026-11-20",
    cityCode: "IST",
    name: "Istanbul",
    country: "Türkiye",
    photo: "istanbul",
    tagline: "Mosques, bazaars and the Bosphorus on two continents",
    bestMonths: [4, 5, 9, 10, 11],
    title: "Istanbul travel guide: what to see, when to go, flights and hotels",
    description: "Plan a trip to Istanbul: Hagia Sophia, bazaars, Bosphorus cruises, the best months to visit and a live search for flights and hotels from anywhere.",
    intro: [
      "Istanbul spans Europe and Asia across the Bosphorus. Its old city is full of Byzantine and Ottoman monuments, and it is also a very large modern city with a strong food scene.",
      "It is a big airline hub, so flights are often easy to find from many countries.",
    ],
    attractions: [
      { name: "Hagia Sophia and the Blue Mosque", text: "Two landmarks of the old city, a few minutes apart. Check opening hours and dress rules before you go." },
      { name: "Topkapı Palace", text: "The former Ottoman palace has courtyards, the Harem and views over the water. Allow half a day." },
      { name: "Grand Bazaar", text: "A covered market with thousands of shops. Bargaining is normal." },
      { name: "Bosphorus ferry", text: "Public ferries and tourist cruises show both shores and are a relaxed way to see the city." },
      { name: "Süleymaniye Mosque", text: "A large mosque on a hill with views over the Golden Horn, usually quieter than the headline mosques." },
    ],
    bestTime: [
      "Spring (April and May) and autumn (September and October) are generally the most pleasant, with mild weather. Summer is hot and crowded, and winter is cool and damp but quieter.",
    ],
    tips: [
      "Dress modestly for mosques and carry a scarf if needed.",
      "Use trams and ferries for the old city and the Bosphorus.",
      "Be careful with taxis and agree on the fare or use the meter.",
      "Check entry rules for your passport before you book.",
    ],
    faq: [
      { q: "When is the best time to visit Istanbul?", a: "April and May, and September and October, have the most pleasant weather." },
      { q: "How many days do I need in Istanbul?", a: "Three to four days for the old city, the bazaars and a Bosphorus trip." },
      { q: "Which airport do I fly to?", a: "Istanbul has two main airports, IST on the European side and SAW on the Asian side. Compare both when searching." },
    ],
    checked: CHECKED,
  },
  {
    slug: "athens",
    region: "europe",
    rank: 7,
    added: "2026-11-20",
    cityCode: "ATH",
    name: "Athens",
    country: "Greece",
    photo: "athens",
    tagline: "Ancient ruins and cheap off-season weekends",
    bestMonths: [4, 5, 6, 9, 10],
    title: "Athens travel guide: what to see, when to go, flights and hotels",
    description: "Plan a trip to Athens: the Acropolis, old neighbourhoods, the best months to visit and a live search for flights and hotels from anywhere in the world.",
    intro: [
      "Athens packs ancient sites, lively neighbourhoods and good food into a compact centre. It is also the gateway to the Greek islands.",
    ],
    attractions: [
      { name: "Acropolis and the Parthenon", text: "The main sight. Go early in the day, especially in summer, and wear shoes with good grip on the polished stone." },
      { name: "Acropolis Museum", text: "A modern museum below the hill with finds from the site." },
      { name: "Plaka and Anafiotika", text: "The old streets under the Acropolis, with small shops and cafés." },
      { name: "Ancient Agora", text: "The old marketplace, with the well-preserved temple of Hephaestus." },
      { name: "Lycabettus Hill", text: "A good sunset viewpoint over the city, reachable on foot or by funicular." },
      { name: "Cape Sounion", text: "A day trip to a clifftop temple of Poseidon, best around sunset." },
    ],
    bestTime: [
      "Spring (April to June) and early autumn (September and October) have the best mix of weather and crowds. Summer is very hot and busy.",
      "November to March is the cheapest period for flights and hotels, with cooler weather and some rain.",
    ],
    tips: [
      "Visit ancient sites early to avoid the heat and the crowds.",
      "Book Acropolis tickets online in busy months.",
      "Use the metro from the airport to the centre.",
      "Consider adding an island by ferry or a short flight.",
    ],
    faq: [
      { q: "When is the best time to visit Athens?", a: "April to June and September to October have pleasant weather and manageable crowds." },
      { q: "When is Athens cheapest?", a: "Roughly November to March, though it is cooler and can rain." },
      { q: "How many days do I need in Athens?", a: "Two to three days for the city, more if you add an island." },
    ],
    checked: CHECKED,
  },
];

/** Every destination page. To add one: put it in its region file under lib/destinations/regions/. */
export const DESTINATIONS: readonly Destination[] = [
  ...EXISTING,
  ...ASIA_NEW,
  ...EUROPE_NEW,
  ...NORTH_AMERICA,
  ...SOUTH_AMERICA,
  ...AFRICA,
  ...OCEANIA,
  ...ANTARCTICA,
];

export function findDestination(slug: string): Destination | null {
  return DESTINATIONS.find((d) => d.slug === slug) ?? null;
}

/**
 * The destination page for a flight-search city, if there is one. Antarctic pages use Ushuaia as
 * a gateway, so they never count as "the page for Ushuaia".
 */
export function destinationForCity(code: string): Destination | null {
  return DESTINATIONS.find((d) => d.cityCode === code && !d.gatewayNote) ?? null;
}

/** Destinations of one region, best-ranked first. */
export function destinationsInRegion(region: RegionId): Destination[] {
  return DESTINATIONS.filter((d) => d.region === region).sort((a, b) => a.rank - b.rank);
}

/** The 5 best-ranked per region are the "Top 5"; the rest are shown as "More in <region>". */
export const TOP_PER_REGION = 5;

/**
 * The destinations to show on the home page for a given month (1–12): those at their best
 * that month first, in list order, then the rest. Always returns `count` of them.
 */
export function hotDestinations(month: number, count = 4): Destination[] {
  const inSeason = DESTINATIONS.filter((d) => d.bestMonths.includes(month));
  const rest = DESTINATIONS.filter((d) => !d.bestMonths.includes(month));
  return [...inSeason, ...rest].slice(0, count);
}
