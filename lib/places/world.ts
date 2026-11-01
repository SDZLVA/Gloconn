import "server-only";

/**
 * Milestone 34 — every city with an airport, and every airport, worldwide,
 * for the search boxes. Source: Travelpayouts' free public data files
 * (no token): api.travelpayouts.com/data/en/{cities,airports,countries}.json.
 * Loaded on the server, kept in memory for a day.
 */

import type { Destination } from "@/types/models/destination";

export type WorldPlaceKind = "city" | "airport";

export type WorldPlace = {
  /** "city-PAR" or "airport-CDG" — used as destinationId / originId. */
  id: string;
  kind: WorldPlaceKind;
  /** City name, or airport name for airports. */
  name: string;
  cityName: string;
  country: string;
  countryCode: string;
  iata: string;
  cityIata: string;
  latitude: number | null;
  longitude: number | null;
  /** What the search box shows, e.g. "Paris, France" / "Charles de Gaulle Airport (CDG), France". */
  label: string;
  /** Bigger = more important (number of airports, international airport). */
  weight: number;
  key: string;
};

type RawCity = { code?: string; name?: string | null; country_code?: string; coordinates?: { lat?: number; lon?: number }; has_flightable_airport?: boolean; name_translations?: { en?: string } };
type RawAirport = { code?: string; name?: string | null; city_code?: string; country_code?: string; coordinates?: { lat?: number; lon?: number }; iata_type?: string; flightable?: boolean; name_translations?: { en?: string } };
type RawCountry = { code?: string; name?: string | null; name_translations?: { en?: string } };

const BASE = "https://api.travelpayouts.com/data/en";
const DAY = 24 * 60 * 60_000;

export function normalizePlaceText(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

type Index = { places: WorldPlace[]; byId: Map<string, WorldPlace> };
let index: { at: number; value: Index } | null = null;
let loading: Promise<Index> | null = null;

async function getJson<T>(name: string): Promise<T[]> {
  const response = await fetch(`${BASE}/${name}.json`, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`${name}.json ${response.status}`);
  const data = (await response.json()) as unknown;
  return Array.isArray(data) ? (data as T[]) : [];
}

export function buildWorldIndex(cities: RawCity[], airports: RawAirport[], countries: RawCountry[]): Index {
  const countryName = new Map<string, string>();
  for (const c of countries) if (c.code) countryName.set(c.code, c.name_translations?.en || c.name || c.code);

  const flightable = airports.filter((a) => a.code && (a.iata_type ?? "airport") === "airport" && a.flightable !== false);
  const airportsPerCity = new Map<string, RawAirport[]>();
  for (const a of flightable) {
    const list = airportsPerCity.get(a.city_code ?? "") ?? [];
    list.push(a);
    airportsPerCity.set(a.city_code ?? "", list);
  }

  const places: WorldPlace[] = [];
  const cityNames = new Map<string, string>();
  for (const c of cities) {
    const name = (c.name_translations?.en || c.name || "").trim();
    if (!c.code || !name) continue;
    cityNames.set(c.code, name);
    const own = airportsPerCity.get(c.code) ?? [];
    if (own.length === 0 && c.has_flightable_airport !== true) continue;
    const country = countryName.get(c.country_code ?? "") ?? c.country_code ?? "";
    const international = own.some((a) => /international/i.test(a.name ?? ""));
    places.push({
      id: `city-${c.code}`,
      kind: "city",
      name,
      cityName: name,
      country,
      countryCode: c.country_code ?? "",
      iata: c.code,
      cityIata: c.code,
      latitude: c.coordinates?.lat ?? null,
      longitude: c.coordinates?.lon ?? null,
      label: country ? `${name}, ${country}` : name,
      weight: own.length + (international ? 3 : 0),
      key: normalizePlaceText(`${name} ${c.code}`),
    });
  }
  for (const a of flightable) {
    const name = (a.name_translations?.en || a.name || "").trim();
    if (!a.code || !name) continue;
    const cityName = cityNames.get(a.city_code ?? "") ?? name;
    const country = countryName.get(a.country_code ?? "") ?? a.country_code ?? "";
    places.push({
      id: `airport-${a.code}`,
      kind: "airport",
      name,
      cityName,
      country,
      countryCode: a.country_code ?? "",
      iata: a.code,
      cityIata: a.city_code ?? a.code,
      latitude: a.coordinates?.lat ?? null,
      longitude: a.coordinates?.lon ?? null,
      label: `${name} (${a.code}), ${country || cityName}`,
      weight: /international/i.test(name) ? 2 : 1,
      key: normalizePlaceText(`${name} ${cityName} ${a.code}`),
    });
  }
  return { places, byId: new Map(places.map((p) => [p.id, p])) };
}

export async function getWorldIndex(): Promise<Index> {
  if (process.env.GLOOCONN_WORLD_PLACES === "off") return { places: [], byId: new Map() };
  if (index && Date.now() - index.at < DAY) return index.value;
  if (!loading) {
    loading = Promise.all([getJson<RawCity>("cities"), getJson<RawAirport>("airports"), getJson<RawCountry>("countries")])
      .then(([cities, airports, countries]) => {
        const value = buildWorldIndex(cities, airports, countries);
        index = { at: Date.now(), value };
        return value;
      })
      .finally(() => {
        loading = null;
      });
  }
  return loading;
}

/** Best matches for what the traveller typed. */
export function searchWorld(idx: Index, query: string, kinds: WorldPlaceKind[], limit = 8): WorldPlace[] {
  const q = normalizePlaceText(query);
  if (q.length < 2) return [];
  const scored: { place: WorldPlace; score: number }[] = [];
  for (const place of idx.places) {
    if (!kinds.includes(place.kind)) continue;
    let score = 0;
    if (q.length === 3 && place.iata.toLowerCase() === q) score = 100;
    else if (normalizePlaceText(place.name) === q) score = 80;
    else if (place.key.startsWith(q)) score = 60;
    else if (place.key.includes(` ${q}`)) score = 40;
    else if (q.length >= 4 && place.key.includes(q)) score = 20;
    if (score === 0) continue;
    // Cities first among equals; then the bigger hubs.
    scored.push({ place, score: score + Math.min(place.weight, 10) + (place.kind === "city" ? 5 : 0) });
  }
  scored.sort((a, b) => b.score - a.score || a.place.name.length - b.place.name.length);
  return scored.slice(0, limit).map((s) => s.place);
}

export function isWorldPlaceId(id: string | undefined | null): boolean {
  return Boolean(id && /^(city|airport)-[A-Z0-9]{3}$/.test(id));
}

/** A world place in the shape the rest of Glooconn uses. */
export function worldPlaceToDestination(place: WorldPlace): Destination {
  return {
    id: place.id,
    name: place.kind === "city" ? place.cityName : place.name,
    country: place.country,
    region: place.kind === "city" ? "City" : "Airport",
    iataCode: place.iata,
    cityIataCode: place.cityIata,
  };
}

export async function getWorldDestination(id: string): Promise<Destination | null> {
  if (!isWorldPlaceId(id)) return null;
  try {
    const place = (await getWorldIndex()).byId.get(id);
    return place ? worldPlaceToDestination(place) : null;
  } catch {
    return null;
  }
}

/** "Colombo, Sri Lanka" → the matching city (used when no id was picked). */
export async function findWorldDestinationByLabel(label: string): Promise<Destination | null> {
  const [first, ...rest] = label.split(",").map((s) => s.trim());
  if (!first) return null;
  try {
    const idx = await getWorldIndex();
    const country = normalizePlaceText(rest.join(" "));
    const match = searchWorld(idx, first, ["city"], 10).find(
      (p) => normalizePlaceText(p.cityName) === normalizePlaceText(first) && (!country || normalizePlaceText(p.country) === country),
    );
    return match ? worldPlaceToDestination(match) : null;
  } catch {
    return null;
  }
}
