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
  IST: { code: "IST", name: "Istanbul", country: "Turkey", slug: "istanbul" },
  DXB: { code: "DXB", name: "Dubai", country: "United Arab Emirates", slug: "dubai" },
  CMB: { code: "CMB", name: "Colombo", country: "Sri Lanka", slug: "colombo" },
  MLE: { code: "MLE", name: "Malé", country: "Maldives", slug: "male" },
  BKK: { code: "BKK", name: "Bangkok", country: "Thailand", slug: "bangkok" },
  TYO: { code: "TYO", name: "Tokyo", country: "Japan", slug: "tokyo" },
  NYC: { code: "NYC", name: "New York", country: "United States", slug: "new-york" },
} as const satisfies Record<string, RouteCity>;

type CityCode = keyof typeof ROUTE_CITIES;

const PAIRS: [CityCode, CityCode][] = [
  // From Milan
  ["MIL", "CMB"], ["MIL", "LON"], ["MIL", "PAR"], ["MIL", "BCN"], ["MIL", "AMS"], ["MIL", "MAD"], ["MIL", "LIS"],
  ["MIL", "ATH"], ["MIL", "IST"], ["MIL", "DXB"], ["MIL", "BKK"], ["MIL", "MLE"], ["MIL", "NYC"], ["MIL", "TYO"],
  // From Rome
  ["ROM", "CMB"], ["ROM", "LON"], ["ROM", "PAR"], ["ROM", "BCN"], ["ROM", "AMS"], ["ROM", "MAD"], ["ROM", "LIS"],
  ["ROM", "ATH"], ["ROM", "IST"], ["ROM", "DXB"], ["ROM", "BKK"], ["ROM", "NYC"],
  // From London
  ["LON", "CMB"], ["LON", "MIL"], ["LON", "ROM"], ["LON", "PAR"], ["LON", "BCN"], ["LON", "AMS"], ["LON", "LIS"],
  ["LON", "DXB"], ["LON", "BKK"], ["LON", "NYC"],
  // From Colombo
  ["CMB", "MIL"], ["CMB", "ROM"], ["CMB", "LON"], ["CMB", "DXB"], ["CMB", "BKK"], ["CMB", "MLE"],
];

export type FlightRoute = { slug: string; from: RouteCity; to: RouteCity };

export const FLIGHT_ROUTES: readonly FlightRoute[] = PAIRS.map(([a, b]) => ({
  slug: `${ROUTE_CITIES[a].slug}-to-${ROUTE_CITIES[b].slug}`,
  from: ROUTE_CITIES[a],
  to: ROUTE_CITIES[b],
}));

export function findRoute(slug: string): FlightRoute | null {
  return FLIGHT_ROUTES.find((r) => r.slug === slug) ?? null;
}

/** Other routes from the same city, and the way back if we have it. */
export function relatedRoutes(route: FlightRoute, max = 8): FlightRoute[] {
  const back = FLIGHT_ROUTES.find((r) => r.from.code === route.to.code && r.to.code === route.from.code);
  const same = FLIGHT_ROUTES.filter((r) => r.from.code === route.from.code && r.slug !== route.slug);
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
