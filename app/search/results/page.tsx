import { SearchResultsPage } from "@/components/results/SearchResultsPage";
import { parseSearchParams } from "@/lib/search/params";

type SearchResultsRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Search results route — reads query params and renders mock results. */
export default async function SearchResultsRoute({
  searchParams,
}: SearchResultsRouteProps) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      urlParams.set(key, value);
    } else if (Array.isArray(value)) {
      urlParams.set(key, value[0] ?? "");
    }
  }

  const search = parseSearchParams(urlParams);

  return <SearchResultsPage search={search} />;
}
