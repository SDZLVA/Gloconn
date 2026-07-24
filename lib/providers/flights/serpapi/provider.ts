/**
 * SerpAPI flight search adapter (development / testing — ADR-036).
 *
 * Composes query builder → HTTP client → mapper.
 * Factory selection is intentionally deferred to a later sprint.
 */

import { createProviderError } from "@/lib/api/errors";
import { getAppConfig } from "@/lib/config";
import type { SerpApiConfig } from "@/lib/config/types";
import type { FlightsProvider } from "@/lib/providers/core/types";
import { searchGoogleFlights } from "@/lib/providers/flights/serpapi/client";
import { buildSerpApiSearchParams } from "@/lib/providers/flights/serpapi/googleFlights";
import { mapSerpApiFlightsResponse } from "@/lib/providers/flights/serpapi/mappers";
import type { SerpApiGoogleFlightsResponse } from "@/lib/providers/flights/serpapi/types";
import type { Flight } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

/** Injectable collaborators for unit tests — production uses real modules. */
export type SerpApiFlightsProviderDeps = {
  buildParams?: typeof buildSerpApiSearchParams;
  /** Named searchHttp so it does not collide with FlightsProvider.search. */
  searchHttp?: typeof searchGoogleFlights;
  mapResponse?: typeof mapSerpApiFlightsResponse;
  getSerpApiConfig?: () => SerpApiConfig;
};

function defaultGetSerpApiConfig(): SerpApiConfig {
  return getAppConfig().serpapi;
}

export class SerpApiFlightsProvider implements FlightsProvider {
  readonly name = "serpapi";

  private readonly buildParams: typeof buildSerpApiSearchParams;
  private readonly searchHttp: typeof searchGoogleFlights;
  private readonly mapResponse: typeof mapSerpApiFlightsResponse;
  private readonly getSerpApiConfig: () => SerpApiConfig;

  constructor(deps: SerpApiFlightsProviderDeps = {}) {
    this.buildParams = deps.buildParams ?? buildSerpApiSearchParams;
    this.searchHttp = deps.searchHttp ?? searchGoogleFlights;
    this.mapResponse = deps.mapResponse ?? mapSerpApiFlightsResponse;
    this.getSerpApiConfig = deps.getSerpApiConfig ?? defaultGetSerpApiConfig;
  }

  async search(request: SearchRequest): Promise<Flight[]> {
    const destinationId = request.destinationId?.trim();
    if (!destinationId) {
      throw createProviderError(
        "Flight search requires a resolved destinationId before mapping SerpAPI offers.",
      );
    }

    const config = this.getSerpApiConfig();
    const params = this.buildParams(request, config);
    const raw: SerpApiGoogleFlightsResponse = await this.searchHttp(
      params,
      config,
    );
    return this.mapResponse(raw, { destinationId });
  }
}

export const serpApiFlightsProvider = new SerpApiFlightsProvider();
