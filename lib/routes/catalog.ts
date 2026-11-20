/**
 * Milestone 62 — popular flight routes with their own page (/flights/{slug}),
 * so search engines can find Glooconn ("cheap flights Milan to Colombo").
 * Codes are metro/city IATA codes, the same ones the search uses ("city-MIL").
 * To add a route: add the city (if new) and a [from, to] pair below.
 */

export type RouteCity = { code: string; name: string; country: string; slug: string };

export const ROUTE_CITIES = {
  MIL: { code: "MIL", name: "Milan", country: "Italy", slug: "milan" },
  ROM: { code: "ROM", name: "Rome", country: "Italy", slug: "rome" },
  LON: { code: "LON", name: "London", country: "United Kingdom", slug: "london" },
  PAR: { code: "PAR", name: "Paris", country: "France", slug: "paris" },
  BCN: { code: "BCN", name: "Barcelona", country: "Spain", slug: "barcelona" },
  MAD: { code: "MAD", name: "Madrid", country: "Spain", slug: "madrid" },
  LIS: { code: "LIS", name: "Lisbon", country: "Portugal", slug: "lisbon" },
  AMS: { code: "AMS", name: "Amsterdam", country: "Netherlands", slug: "amsterdam" },
  ATH: { code: "ATH", name: "Athens", country: "Greece", slug: "athens" },
  // Milestone 63: winter city breaks from Milan (blog).
  BUD: { code: "BUD", name: "Budapest", country: "Hungary", slug: "budapest" },
  KRK: { code: "KRK", name: "Kraków", country: "Poland", slug: "krakow" },
  PRG: { code: "PRG", name: "Prague", country: "Czech Republic", slug: "prague" },
  VIE: { code: "VIE", name: "Vienna", country: "Austria", slug: "vienna" },
  OPO: { code: "OPO", name: "Porto", country: "Portugal", slug: "porto" },
  VLC: { code: "VLC", name: "Valencia", country: "Spain", slug: "valencia" },
  SVQ: { code: "SVQ", name: "Seville", country: "Spain", slug: "seville" },
  IST: { code: "IST", name: "Istanbul", country: "Turkey", slug: "istanbul" },
  DXB: { code: "DXB", name: "Dubai", country: "United Arab Emirates", slug: "dubai" },
  CMB: { code: "CMB", name: "Colombo", country: "Sri Lanka", slug: "colombo" },
  MLE: { code: "MLE", name: "Malé", country: "Maldives", slug: "male" },
  BKK: { code: "BKK", name: "Bangkok", country: "Thailand", slug: "bangkok" },
  TYO: { code: "TYO", name: "Tokyo", country: "Japan", slug: "tokyo" },
  NYC: { code: "NYC", name: "New York", country: "United States", slug: "new-york" },
  // Milestone 73: global origins and destinations (the site is worldwide, not only Europe).
  SIN: { code: "SIN", name: "Singapore", country: "Singapore", slug: "singapore" },
  DEL: { code: "DEL", name: "Delhi", country: "India", slug: "delhi" },
  BOM: { code: "BOM", name: "Mumbai", country: "India", slug: "mumbai" },
  DOH: { code: "DOH", name: "Doha", country: "Qatar", slug: "doha" },
  KUL: { code: "KUL", name: "Kuala Lumpur", country: "Malaysia", slug: "kuala-lumpur" },
  SYD: { code: "SYD", name: "Sydney", country: "Australia", slug: "sydney" },
  LAX: { code: "LAX", name: "Los Angeles", country: "United States", slug: "los-angeles" },
  YTO: { code: "YTO", name: "Toronto", country: "Canada", slug: "toronto" },
} as const satisfies Record<string, RouteCity>;

export type CityCode = keyof typeof ROUTE_CITIES;

const PAIRS: [CityCode, CityCode][] = [
  // From Milan
  ["MIL", "CMB"], ["MIL", "LON"], ["MIL", "PAR"], ["MIL", "BCN"], ["MIL", "AMS"], ["MIL", "MAD"], ["MIL", "LIS"],
  ["MIL", "ATH"], ["MIL", "IST"], ["MIL", "DXB"], ["MIL", "BKK"], ["MIL", "MLE"], ["MIL", "NYC"], ["MIL", "TYO"],
  ["MIL", "BUD"], ["MIL", "KRK"], ["MIL", "PRG"], ["MIL", "VIE"], ["MIL", "OPO"], ["MIL", "VLC"], ["MIL", "SVQ"],
  // From Rome
  ["ROM", "CMB"], ["ROM", "LON"], ["ROM", "PAR"], ["ROM", "BCN"], ["ROM", "AMS"], ["ROM", "MAD"], ["ROM", "LIS"],
  ["ROM", "ATH"], ["ROM", "IST"], ["ROM", "DXB"], ["ROM", "BKK"], ["ROM", "NYC"],
  // From London
  ["LON", "CMB"], ["LON", "MIL"], ["LON", "ROM"], ["LON", "PAR"], ["LON", "BCN"], ["LON", "AMS"], ["LON", "LIS"],
  ["LON", "DXB"], ["LON", "BKK"], ["LON", "NYC"],
  // From Colombo
  ["CMB", "MIL"], ["CMB", "ROM"], ["CMB", "LON"], ["CMB", "DXB"], ["CMB", "BKK"], ["CMB", "MLE"],
  // Milestone 73 — worldwide. Routes with no recent prices are marked noindex by the page itself.
  // From New York
  ["NYC", "LON"], ["NYC", "PAR"], ["NYC", "ROM"], ["NYC", "MIL"], ["NYC", "MAD"], ["NYC", "LAX"], ["NYC", "DXB"], ["NYC", "DEL"],
  // From Dubai
  ["DXB", "LON"], ["DXB", "DEL"], ["DXB", "BOM"], ["DXB", "BKK"], ["DXB", "CMB"], ["DXB", "MLE"], ["DXB", "IST"], ["DXB", "PAR"],
  // From Singapore
  ["SIN", "BKK"], ["SIN", "TYO"], ["SIN", "SYD"], ["SIN", "LON"], ["SIN", "KUL"], ["SIN", "DEL"],
  // From Delhi and Mumbai
  ["DEL", "LON"], ["DEL", "DXB"], ["DEL", "BKK"], ["DEL", "SIN"], ["DEL", "NYC"],
  ["BOM", "DXB"], ["BOM", "LON"], ["BOM", "SIN"], ["BOM", "BKK"],
  // From Bangkok, Kuala Lumpur, Doha
  ["BKK", "TYO"], ["BKK", "SIN"], ["BKK", "LON"], ["BKK", "DXB"],
  ["KUL", "SIN"], ["KUL", "BKK"], ["KUL", "TYO"],
  ["DOH", "LON"], ["DOH", "CMB"], ["DOH", "BKK"],
  // From Sydney, Los Angeles, Toronto
  ["SYD", "SIN"], ["SYD", "LON"], ["SYD", "TYO"], ["SYD", "LAX"],
  ["LAX", "NYC"], ["LAX", "LON"], ["LAX", "TYO"],
  ["YTO", "LON"], ["YTO", "NYC"], ["YTO", "PAR"],
  // More Europe
  ["PAR", "LON"], ["PAR", "NYC"], ["PAR", "BCN"], ["PAR", "ROM"], ["LON", "MAD"], ["LON", "IST"], ["LON", "ATH"], ["AMS", "LON"], ["AMS", "BCN"],
];

export type FlightRoute = { slug: string; from: RouteCity; to: RouteCity };

export const FLIGHT_ROUTES: readonly FlightRoute[] = PAIRS.map(([a, b]) => ({
  slug: `${ROUTE_CITIES[a].slug}-to-${ROUTE_CITIES[b].slug}`,
  from: ROUTE_CITIES[a],
  to: ROUTE_CITIES[b],
}));

/**
 * Routes where Travelpayouts' free price cache had nothing on 2026-11-20 (checked on the M73
 * preview). The page still exists and turns indexable by itself once prices appear, but
 * it is kept out of the sitemap, the /flights index and "related" links so search engines
 * are not shown empty pages. Re-check now and then and remove slugs that gained data.
 */
export const UNPRICED_ROUTE_SLUGS: ReadonlySet<string> = new Set([
  "colombo-to-rome", "singapore-to-london", "dubai-to-delhi", "dubai-to-istanbul", "singapore-to-sydney", "dubai-to-paris",
  "dubai-to-colombo", "dubai-to-london", "dubai-to-bangkok", "dubai-to-mumbai", "singapore-to-bangkok", "singapore-to-tokyo",
  "dubai-to-male", "mumbai-to-dubai", "delhi-to-dubai", "mumbai-to-singapore", "mumbai-to-london", "singapore-to-delhi",
  "delhi-to-new-york", "mumbai-to-bangkok", "bangkok-to-tokyo", "delhi-to-bangkok", "delhi-to-london", "delhi-to-singapore",
  "singapore-to-kuala-lumpur", "bangkok-to-singapore", "bangkok-to-dubai", "kuala-lumpur-to-bangkok", "kuala-lumpur-to-tokyo",
  "doha-to-london", "sydney-to-tokyo", "sydney-to-singapore", "kuala-lumpur-to-singapore", "doha-to-colombo", "bangkok-to-london",
  "sydney-to-london", "doha-to-bangkok", "amsterdam-to-london", "paris-to-rome", "toronto-to-london", "los-angeles-to-london",
  "paris-to-barcelona", "sydney-to-los-angeles", "toronto-to-paris", "paris-to-new-york", "paris-to-london", "los-angeles-to-tokyo",
  "toronto-to-new-york", "los-angeles-to-new-york", "amsterdam-to-barcelona",
]);

/** Routes that are listed publicly (sitemap, index, related links). */
export const LISTED_ROUTES: readonly FlightRoute[] = FLIGHT_ROUTES.filter((r) => !UNPRICED_ROUTE_SLUGS.has(r.slug));

export function findRoute(slug: string): FlightRoute | null {
  return FLIGHT_ROUTES.find((r) => r.slug === slug) ?? null;
}

/** Other routes from the same city, and the way back if we have it. */
export function relatedRoutes(route: FlightRoute, max = 8): FlightRoute[] {
  const back = LISTED_ROUTES.find((r) => r.from.code === route.to.code && r.to.code === route.from.code);
  const same = LISTED_ROUTES.filter((r) => r.from.code === route.from.code && r.slug !== route.slug);
  return [...(back ? [back] : []), ...same].slice(0, max);
}

/** "Milan, Italy" — the label the search bar and results page use. */
export const cityLabel = (city: RouteCity) => `${city.name}, ${city.country}`;

/**
 * Results page link for this route (packages unless a tab is given), in the
 * same format the search bar builds.
 */
export function routeSearchUrl(
  route: FlightRoute,
  dates: { departureDate: string; returnDate: string | null },
  productTypes?: "flights" | "hotels",
): string {
  const params = new URLSearchParams({
    ...(productTypes !== "hotels" ? { origin: cityLabel(route.from), originId: `city-${route.from.code}` } : {}),
    destination: cityLabel(route.to),
    destinationId: `city-${route.to.code}`,
    tripType: dates.returnDate ? "round-trip" : "one-way",
    departureDate: dates.departureDate,
    ...(dates.returnDate ? { returnDate: dates.returnDate } : {}),
    adults: "1",
    children: "0",
    infants: "0",
    rooms: "1",
    travelStyle: "standard",
  });
  if (productTypes) params.set("productTypes", productTypes);
  return `/search/results?${params.toString()}`;
}
