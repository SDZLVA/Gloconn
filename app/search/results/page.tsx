import { LiveFlightsResultsPage } from "@/components/live/LiveFlightsResultsPage";
import { LiveHotelsResultsPage } from "@/components/live/LiveHotelsResultsPage";
import { SearchResultsPage } from "@/components/results/SearchResultsPage";
import { getDestinationProvider } from "@/lib/providers/core/registry";
import { modeFromProductTypes } from "@/lib/search/modes";
import { parseSearchParamsToForm } from "@/lib/search/params";
import { parseSearchRequestFromParams } from "@/lib/search/request";
import { enrichSearchRequestWithAirports } from "@/lib/services/iataResolution";
import type { SearchRequest } from "@/types/models/search-request";

/**
 * Milestone 52: results pages are one per search (endless URL variants), so
 * they stay out of Google's index — Search Console flagged them as duplicates.
 */
export const metadata = { title: "Search results", robots: { index: false, follow: true } };

type SearchResultsRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toUrlSearchParams(
  params: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      urlParams.set(key, value);
    } else if (Array.isArray(value)) {
      urlParams.set(key, value[0] ?? "");
    }
  }

  return urlParams;
}

/**
 * Search results route — reads query params into SearchRequest and renders results.
 *
 * Milestone 28: the home tabs pick the page.
 * - Flights (productTypes=flights): live prices only; Glooconn's flight API is not called.
 * - Hotels (productTypes=hotels): live hotels page; sample hotel data is not used.
 * - Packages (default): the existing Glooconn results (flights + hotels + packages).
 */
export default async function SearchResultsRoute({
  searchParams,
}: SearchResultsRouteProps) {
  const urlParams = toUrlSearchParams(await searchParams);
  const search = parseSearchRequestFromParams(urlParams);
  const mode = modeFromProductTypes(search.productTypes);

  if (mode === "flights") {
    const { request } = await enrichSearchRequestWithAirports(
      { ...search, origin: search.origin ?? "", destination: search.destination ?? "" } as SearchRequest,
      getDestinationProvider(),
    );
    const stops = urlParams.get("stops");
    return (
      <LiveFlightsResultsPage
        search={search}
        initialForm={parseSearchParamsToForm(urlParams)}
        // Milestone 34: a picked airport ("airport-LHR") searches that airport; a city searches all its airports.
        originCode={(search.originId?.startsWith("airport-") ? request.originIata : request.originCityIata ?? request.originIata) ?? null}
        destinationCode={(search.destinationId?.startsWith("airport-") ? request.destinationIata : request.destinationCityIata ?? request.destinationIata) ?? null}
        initialMaxStops={stops !== null && /^[0-2]$/.test(stops) ? Number(stops) : null}
      />
    );
  }

  if (mode === "hotels") {
    return <LiveHotelsResultsPage search={search} initialForm={parseSearchParamsToForm(urlParams)} />;
  }

  return <SearchResultsPage search={search} />;
}
