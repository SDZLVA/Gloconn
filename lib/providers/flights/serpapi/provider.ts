/**
 * SerpAPI flight search adapter (development / testing — ADR-036).
 *
 * Composes query builder → HTTP client → mapper.
 * Sprint 11.2: full date-time mapping, currency fallbacks, round-trip
 * return-leg fetch via `departure_token` (isolated to this package).
 */

import { createProviderError } from "@/lib/api/errors";
import { getAppConfig } from "@/lib/config";
import type { SerpApiConfig } from "@/lib/config/types";
import type { FlightsProvider } from "@/lib/providers/core/types";
import { searchGoogleFlights } from "@/lib/providers/flights/serpapi/client";
import {
  buildSerpApiReturnSearchParams,
  buildSerpApiSearchParams,
} from "@/lib/providers/flights/serpapi/googleFlights";
import {
  collectSerpApiOptions,
  mapSerpApiFlightsResponse,
  mapSerpApiOptionToFlight,
  mapSerpApiRoundTripPairToFlight,
} from "@/lib/providers/flights/serpapi/mappers";
import { resolveFlightCurrency } from "@/lib/providers/flights/serpapi/mappingHelpers";
import type {
  SerpApiGoogleFlightsResponse,
} from "@/lib/providers/flights/serpapi/types";
import type { Flight } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

/**
 * Cap outbound offers that trigger a return-leg HTTP call.
 * Protects SerpAPI quota while still covering best + some other options.
 */
export const MAX_ROUND_TRIP_RETURN_LOOKUPS = 5;

/**
 * Cap return options mapped per outbound token.
 */
export const MAX_RETURNS_PER_OUTBOUND = 3;

/** Injectable collaborators for unit tests — production uses real modules. */
export type SerpApiFlightsProviderDeps = {
  buildParams?: typeof buildSerpApiSearchParams;
  buildReturnParams?: typeof buildSerpApiReturnSearchParams;
  /** Named searchHttp so it does not collide with FlightsProvider.search. */
  searchHttp?: typeof searchGoogleFlights;
  mapResponse?: typeof mapSerpApiFlightsResponse;
  getSerpApiConfig?: () => SerpApiConfig;
};

function defaultGetSerpApiConfig(): SerpApiConfig {
  return getAppConfig().serpapi;
}

function requestCurrency(request: SearchRequest): string | undefined {
  return request.budget?.currency;
}

export class SerpApiFlightsProvider implements FlightsProvider {
  readonly name = "serpapi";

  private readonly buildParams: typeof buildSerpApiSearchParams;
  private readonly buildReturnParams: typeof buildSerpApiReturnSearchParams;
  private readonly searchHttp: typeof searchGoogleFlights;
  private readonly mapResponse: typeof mapSerpApiFlightsResponse;
  private readonly getSerpApiConfig: () => SerpApiConfig;

  constructor(deps: SerpApiFlightsProviderDeps = {}) {
    this.buildParams = deps.buildParams ?? buildSerpApiSearchParams;
    this.buildReturnParams =
      deps.buildReturnParams ?? buildSerpApiReturnSearchParams;
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

    if (request.tripType !== "round-trip") {
      return this.mapResponse(raw, {
        destinationId,
        requestCurrency: requestCurrency(request),
      });
    }

    return this.searchRoundTrip(request, raw, destinationId, config);
  }

  /**
   * Round-trip: fetch return options for a limited set of outbound tokens,
   * then map outbound×return packages. Falls back to outbound-only mapping
   * when tokens are missing or a return request fails.
   */
  private async searchRoundTrip(
    request: SearchRequest,
    outboundRaw: SerpApiGoogleFlightsResponse,
    destinationId: string,
    config: SerpApiConfig,
  ): Promise<Flight[]> {
    const outboundOptions = collectSerpApiOptions(outboundRaw);
    if (outboundOptions.length === 0) {
      return [];
    }

    const currencyResult = resolveFlightCurrency({
      responseCurrency: outboundRaw.search_parameters?.currency,
      requestCurrency: requestCurrency(request),
    });
    if (!currencyResult.ok) {
      const received = currencyResult.received?.trim() || "(missing)";
      throw createProviderError(
        `Flight offer currency "${received}" is not supported by Glooconn.`,
        { cause: { currency: currencyResult.received } },
      );
    }

    const withTokens = outboundOptions.filter(
      (option) => typeof option.departure_token === "string" && option.departure_token.trim(),
    );

    if (withTokens.length === 0) {
      return this.mapResponse(outboundRaw, {
        destinationId,
        requestCurrency: requestCurrency(request),
      });
    }

    const lookupTargets = withTokens.slice(0, MAX_ROUND_TRIP_RETURN_LOOKUPS);
    const packages: Flight[] = [];

    const returnResults = await Promise.all(
      lookupTargets.map(async (outbound) => {
        const token = outbound.departure_token!.trim();
        try {
          const returnParams = this.buildReturnParams(token, config);
          const returnRaw = await this.searchHttp(returnParams, config);
          return { outbound, returnRaw, ok: true as const };
        } catch {
          return { outbound, returnRaw: null, ok: false as const };
        }
      }),
    );

    for (const result of returnResults) {
      if (!result.ok || !result.returnRaw) {
        const fallback = mapSerpApiOptionToFlight(result.outbound, {
          destinationId,
          currency: currencyResult.currency,
        });
        if (fallback) {
          packages.push(fallback);
        }
        continue;
      }

      const returnOptions = collectSerpApiOptions(result.returnRaw).slice(
        0,
        MAX_RETURNS_PER_OUTBOUND,
      );

      if (returnOptions.length === 0) {
        const fallback = mapSerpApiOptionToFlight(result.outbound, {
          destinationId,
          currency: currencyResult.currency,
        });
        if (fallback) {
          packages.push(fallback);
        }
        continue;
      }

      for (const returnOption of returnOptions) {
        const flight = mapSerpApiRoundTripPairToFlight(
          result.outbound,
          returnOption,
          {
            destinationId,
            currency: currencyResult.currency,
          },
        );
        if (flight) {
          packages.push(flight);
        }
      }
    }

    // Outbounds beyond the lookup cap: map outbound-only so results stay complete.
    const lookedUp = new Set(lookupTargets);
    for (const outbound of outboundOptions) {
      if (lookedUp.has(outbound)) {
        continue;
      }
      const flight = mapSerpApiOptionToFlight(outbound, {
        destinationId,
        currency: currencyResult.currency,
      });
      if (flight) {
        packages.push(flight);
      }
    }

    return packages;
  }
}

export const serpApiFlightsProvider = new SerpApiFlightsProvider();
