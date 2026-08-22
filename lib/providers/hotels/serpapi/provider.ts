/**
 * SerpAPI hotel search adapter (Sprint 12.2 — live; Sprint 12.4 hardened).
 *
 * Composes query builder → HTTP client → mapper.
 * Maps Google Hotels results to the shared Glooconn Hotel model.
 */

import { createProviderError } from "@/lib/api/errors";
import { getAppConfig } from "@/lib/config";
import type { SerpApiConfig } from "@/lib/config/types";
import type { HotelsProvider } from "@/lib/providers/core/types";
import { searchGoogleHotels } from "@/lib/providers/hotels/serpapi/client";
import { mapSerpApiHotelsResponse } from "@/lib/providers/hotels/serpapi/mapper";
import { buildSerpApiHotelsSearchParams } from "@/lib/providers/hotels/serpapi/query";
import type { SerpApiGoogleHotelsResponse } from "@/lib/providers/hotels/serpapi/types";
import type { Hotel } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

/** Injectable collaborators for unit tests — production uses real modules. */
export type SerpApiHotelsProviderDeps = {
  buildParams?: typeof buildSerpApiHotelsSearchParams;
  /** Named searchHttp so it does not collide with HotelsProvider.search. */
  searchHttp?: typeof searchGoogleHotels;
  mapResponse?: typeof mapSerpApiHotelsResponse;
  getSerpApiConfig?: () => SerpApiConfig;
};

function defaultGetSerpApiConfig(): SerpApiConfig {
  return getAppConfig().serpapi;
}

function requestCurrency(request: SearchRequest): string | undefined {
  return request.budget?.currency;
}

export class SerpApiHotelsProvider implements HotelsProvider {
  readonly name = "serpapi";

  private readonly buildParams: typeof buildSerpApiHotelsSearchParams;
  private readonly searchHttp: typeof searchGoogleHotels;
  private readonly mapResponse: typeof mapSerpApiHotelsResponse;
  private readonly getSerpApiConfig: () => SerpApiConfig;

  constructor(deps: SerpApiHotelsProviderDeps = {}) {
    this.buildParams = deps.buildParams ?? buildSerpApiHotelsSearchParams;
    this.searchHttp = deps.searchHttp ?? searchGoogleHotels;
    this.mapResponse = deps.mapResponse ?? mapSerpApiHotelsResponse;
    this.getSerpApiConfig = deps.getSerpApiConfig ?? defaultGetSerpApiConfig;
  }

  async search(request: SearchRequest): Promise<Hotel[]> {
    const destinationId = request.destinationId?.trim();
    if (!destinationId) {
      throw createProviderError(
        "Hotel search requires a resolved destinationId before mapping SerpAPI offers.",
      );
    }

    const checkInDate = request.departureDate?.trim();
    const checkOutDate = request.returnDate?.trim();
    if (!checkInDate || !checkOutDate) {
      throw createProviderError(
        "Hotel search requires check-in (departureDate) and check-out (returnDate). One-way trips without returnDate are not supported for live hotel search.",
      );
    }

    const config = this.getSerpApiConfig();
    const params = this.buildParams(request);
    const raw: SerpApiGoogleHotelsResponse = await this.searchHttp(
      params,
      config,
    );

    return this.mapResponse(raw, {
      destinationId,
      requestCurrency: requestCurrency(request),
      locationFallback: request.destination?.trim() || destinationId,
      checkInDate,
      checkOutDate,
      adults: request.travelers?.adults,
    });
  }
}

export const serpApiHotelsProvider = new SerpApiHotelsProvider();
