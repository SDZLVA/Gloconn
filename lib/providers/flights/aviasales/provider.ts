/**
 * Aviasales flights adapter via Travelpayouts (Milestone 19).
 *
 * Free with the Glooconn Travelpayouts account (600 requests/minute), so
 * unlike SerpAPI it can serve the public site. Composes params → client →
 * mappers.
 *
 * PRICE MEANING — verified 2026-10-29. The documentation describes `price`
 * only as "price of the ticket". On the milestone-19-aviasales preview,
 * MXP→CDG 12–15 Nov 2026 returned easyJet €117 and Air France €160;
 * aviasales.com for the same trip ("MXP ⇄ CDG, 1 pax, economy") showed
 * $105 (≈€97) and $184 (≈€170). So `price` is the ROUND-TRIP TOTAL FOR ONE
 * PASSENGER, matching the card's "Round-trip · per person" label — a
 * one-way price would be roughly half. The same comparison showed cached
 * prices drifting 10–20% from live ones, hence `priceIsRecent` and the
 * "may have changed" copy on cards.
 *
 * DATA COVERAGE — exact dates months ahead often have no cached prices
 * (MXP→CDG 2–6 Mar 2027 returned 0 tickets; 12–15 Nov 2026 returned 9),
 * because the cache only holds what other travellers searched recently.
 *
 * No results is a loud error, never a silent empty list: the 19.0 bug was
 * an empty flights list that the page showed as "no flights exist".
 */

import { createProviderError } from "@/lib/api/errors";
import { NO_RECENT_PRICES_REASON } from "@/lib/api/searchMappers";
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
export const AVIASALES_RESULT_LIMIT = 100;
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
  // Whole-city codes first (MIL, PAR): budget airlines use secondary airports.
  const origin = (request.originCityIata ?? request.originIata)?.trim().toUpperCase() ?? "";
  const destination =
    (request.destinationCityIata ?? request.destinationIata)?.trim().toUpperCase() ?? "";
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
      passengers: {
        adults: request.travelers?.adults ?? 1,
        children: request.travelers?.children ?? 0,
        infants: request.travelers?.infants ?? 0,
      },
    });

    if (flights.length === 0) {
      throw createProviderError("No recent flight prices were found for this route and dates.", {
        cause: { reason: NO_RECENT_PRICES_REASON },
      });
    }

    return flights;
  }
}

export const aviasalesFlightsProvider = new AviasalesFlightsProvider();
