import { SearchResultsPage } from "@/components/results/SearchResultsPage";
import { parseSearchRequestFromParams } from "@/lib/search/request";

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

/** Search results route — reads query params into SearchRequest and renders results. */
export default async function SearchResultsRoute({
  searchParams,
}: SearchResultsRouteProps) {
  const params = await searchParams;
  const search = parseSearchRequestFromParams(toUrlSearchParams(params));

  return <SearchResultsPage search={search} />;
}
