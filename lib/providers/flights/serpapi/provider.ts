/**
 * SerpAPI flight search adapter (development / testing — ADR-036).
 *
 * Composes query builder → HTTP client → mapper.
 * Sprint 11.2: full date-time mapping, currency fallbacks, round-trip
 * return-leg fetch via `departure_token` (isolated to this package).
 * Milestone 18: scout mode does 1 outbound + 1 return lookup for honest RT totals.
 */

import { createProviderError } from "@/lib/api/errors";
import { getAppConfig } from "@/lib/config";
import type { SerpApiConfig } from "@/lib/config/types";
import type {
  FlightSearchOptions,
  FlightsProvider,
} from "@/lib/providers/core/types";
import { searchGoogleFlights } from "@/lib/providers/flights/serpapi/client";
import {
  buildSerpApiReturnSearchParams,
  buildSerpApiSearchParams,
} from "@/lib/providers/flights/serpapi/googleFlights";
import {
  collectSerpApiOptions,
  mapSerpApiFlightsResponse,
  mapSerpApiRoundTripPairToFlight,
} from "@/lib/providers/flights/serpapi/mappers";
import { resolveFlightCurrency } from "@/lib/providers/flights/serpapi/mappingHelpers";
import type {
  SerpApiGoogleFlightsResponse,
} from "@/lib/providers/flights/serpapi/types";
import type { Flight } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

/**
 * Cap outbound offers that trigger a return-leg HTTP call (full search).
 *
 * Sprint 18.8: raised back to 3. The outbound option's `price` is NOT the
 * round-trip total — that only arrives after a `departure_token` return
 * lookup. Offers beyond this cap are dropped (not shown with a partial price).
 *
 * Approximate SerpAPI cost (Google Flights + hotels):
 * - Round-trip search ≈ 5 calls (1 outbound + up to 3 return + 1 hotel)
 * - Explore ±2 ≈ 12 calls (4 pairs × (1 outbound + 1 return + 1 hotel))
 * - Explore ±3 ≈ 18 calls (6 pairs × 3)
 *
 * Scout mode uses a separate cap of 1 return lookup (see search()).
 */
export const MAX_ROUND_TRIP_RETURN_LOOKUPS = 3;

/** Scout round-trip: one outbound + one return lookup for an honest chip total. */
export const SCOUT_ROUND_TRIP_RETURN_LOOKUPS = 1;

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

  async search(
    request: SearchRequest,
    options: FlightSearchOptions = {},
  ): Promise<Flight[]> {
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

    // One-way: single outbound HTTP call — no departure_token lookups.
    if (request.tripType !== "round-trip") {
      return this.mapResponse(raw, {
        destinationId,
        requestCurrency: requestCurrency(request),
      });
    }

    // Round-trip: only publish offers with a real return-leg total.
    // Scout = 1 return lookup; full search = up to MAX_ROUND_TRIP_RETURN_LOOKUPS.
    const maxLookups =
      options.scout === true
        ? SCOUT_ROUND_TRIP_RETURN_LOOKUPS
        : MAX_ROUND_TRIP_RETURN_LOOKUPS;

    return this.searchRoundTrip(
      request,
      raw,
      destinationId,
      config,
      maxLookups,
    );
  }

  /**
   * Round-trip: fetch return options for a limited set of outbound tokens,
   * then map outbound×return packages.
   *
   * Honesty (Sprint 18.8): the outbound `price` is not a round-trip total.
   * - Offers beyond `maxLookups` are dropped (not shown understated).
   * - When a return lookup is attempted but fails / returns no options, that
   *   outbound is dropped too — we have no clean way to show a partial price
   *   as a full-trip total without misleading the user.
   */
  private async searchRoundTrip(
    request: SearchRequest,
    outboundRaw: SerpApiGoogleFlightsResponse,
    destinationId: string,
    config: SerpApiConfig,
    maxLookups: number,
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
      (option) =>
        typeof option.departure_token === "string" &&
        option.departure_token.trim(),
    );

    if (withTokens.length === 0) {
      // No tokens → cannot obtain honest RT totals; do not invent understated prices.
      return [];
    }

    const lookupTargets = withTokens.slice(0, maxLookups);
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
        // Lookup attempted but failed — drop rather than show outbound-only price.
        continue;
      }

      const returnOptions = collectSerpApiOptions(result.returnRaw).slice(
        0,
        MAX_RETURNS_PER_OUTBOUND,
      );

      if (returnOptions.length === 0) {
        // Successful HTTP but no return legs — still no honest RT total.
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

    // Outbounds beyond the lookup cap are intentionally omitted (no partial prices).
    return packages;
  }
}

export const serpApiFlightsProvider = new SerpApiFlightsProvider();
