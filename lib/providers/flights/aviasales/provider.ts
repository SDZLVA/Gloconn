/**
 * Aviasales flights adapter via Travelpayouts (Milestone 19).
 *
 * Free with the Glooconn Travelpayouts account (600 requests/minute), so
 * unlike SerpAPI it can serve the public site. Composes params → client →
 * mappers.
 *
 * OPEN QUESTION — verify before production. The documentation describes
 * `price` only as "price of the ticket": it does not say whether a
 * round-trip result's price covers both legs, nor whether it is per
 * passenger. The evidence points to "round-trip total for one adult" (each
 * result carries return date, return stops and return duration, and its
 * link encodes both dates and one passenger), but that must be confirmed by
 * comparing live results with the same fare on aviasales.com before this
 * provider is enabled in production. See the 18.8 lesson in docs/TODO.md.
 *
 * No results is a loud error, never a silent empty list: the 19.0 bug was
 * an empty flights list that the page showed as "no flights exist".
 */

import { createProviderError } from "@/lib/api/errors";
import { getAppConfig } from "@/lib/config";
import type { AviasalesConfig } from "@/lib/config/types";
import type { FlightSearchOptions, FlightsProvider } from "@/lib/providers/core/types";
import { fetchAviasalesPricesForDates } from "@/lib/providers/flights/aviasales/client";
import { mapAviasalesResponse } from "@/lib/providers/flights/aviasales/mappers";
import type { CurrencyCode } from "@/types/models/currency";
import type { Flight } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

const SUPPORTED_CURRENCIES: readonly CurrencyCode[] = ["EUR", "USD", "GBP", "CHF", "JPY", "AUD", "CAD"];

/** Tickets requested per search; scout mode (price hints) needs fewer. */
export const AVIASALES_RESULT_LIMIT = 10;
export const AVIASALES_SCOUT_LIMIT = 3;

const IATA = /^[A-Z]{3}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function resolveAviasalesCurrency(request: SearchRequest): CurrencyCode {
  const requested = request.budget?.currency;
  return requested && SUPPORTED_CURRENCIES.includes(requested) ? requested : "EUR";
}

/** Builds prices_for_dates query params. Throws when the route is unusable. */
export function buildAviasalesParams(
  request: SearchRequest,
  config: Pick<AviasalesConfig, "market">,
  options: FlightSearchOptions = {},
): URLSearchParams {
  const origin = request.originIata?.trim().toUpperCase() ?? "";
  const destination = request.destinationIata?.trim().toUpperCase() ?? "";
  if (!IATA.test(origin) || !IATA.test(destination)) {
    throw createProviderError("Flight search requires origin and destination airport codes.");
  }
  if (!ISO_DATE.test(request.departureDate ?? "")) {
    throw createProviderError("Flight search requires a departure date.");
  }

  const roundTrip = request.tripType === "round-trip" && ISO_DATE.test(request.returnDate ?? "");

  const params = new URLSearchParams({
    origin,
    destination,
    departure_at: request.departureDate,
    one_way: roundTrip ? "false" : "true",
    currency: resolveAviasalesCurrency(request).toLowerCase(),
    sorting: "price",
    direct: "false",
    unique: "false",
    limit: String(options.scout ? AVIASALES_SCOUT_LIMIT : AVIASALES_RESULT_LIMIT),
    page: "1",
  });
  if (roundTrip) {
    params.set("return_at", request.returnDate as string);
  }
  if (config.market) {
    params.set("market", config.market);
  }
  return params;
}

export type AviasalesFlightsProviderDeps = {
  fetchPrices?: typeof fetchAviasalesPricesForDates;
  getConfig?: () => AviasalesConfig;
};

export class AviasalesFlightsProvider implements FlightsProvider {
  readonly name = "aviasales";

  private readonly fetchPrices: typeof fetchAviasalesPricesForDates;
  private readonly getConfig: () => AviasalesConfig;

  constructor(deps: AviasalesFlightsProviderDeps = {}) {
    this.fetchPrices = deps.fetchPrices ?? fetchAviasalesPricesForDates;
    this.getConfig = deps.getConfig ?? (() => getAppConfig().aviasales);
  }

  async search(request: SearchRequest, options: FlightSearchOptions = {}): Promise<Flight[]> {
    const destinationId = request.destinationId?.trim();
    if (!destinationId) {
      throw createProviderError(
        "Flight search requires a resolved destinationId before mapping Aviasales tickets.",
      );
    }

    const config = this.getConfig();
    const params = buildAviasalesParams(request, config, options);
    const response = await this.fetchPrices(params, config.apiToken);

    const flights = mapAviasalesResponse(response, {
      destinationId,
      currency: resolveAviasalesCurrency(request),
      tripType: request.tripType === "round-trip" && request.returnDate ? "round-trip" : "one-way",
    });

    if (flights.length === 0) {
      throw createProviderError("No recent flight prices were found for this route and dates.", {
        cause: { reason: "no_recent_prices" },
      });
    }

    return flights;
  }
}

export const aviasalesFlightsProvider = new AviasalesFlightsProvider();
