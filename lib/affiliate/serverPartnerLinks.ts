/**
 * Partner links that need a secret, prepared on the server (Milestone 19).
 *
 * The Aviasales link goes through the Travelpayouts link API, which needs
 * TRAVELPAYOUTS_API_TOKEN — so it cannot be built in the browser like the
 * Kiwi link. Never throws: a failure means a plain, untagged Aviasales
 * search link, and no link at all when the route itself is unusable.
 */

import "server-only";

import { loadAffiliateConfig } from "@/lib/affiliate/config";
import { buildAviasalesSearchUrl } from "@/lib/affiliate/aviasalesLink";
import { createPartnerLink } from "@/lib/affiliate/partnerLinksApi";
import { getAppConfig } from "@/lib/config";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResponsePartnerLink } from "@/types/models/search-response";

/** Placement label reported to Travelpayouts. Never traveller data. */
export const AVIASALES_SEARCH_SUB_ID = "aviasales_search";

export async function prepareAviasalesPartnerLink(
  request: SearchRequest,
  convert: typeof createPartnerLink = createPartnerLink,
): Promise<SearchResponsePartnerLink | undefined> {
  try {
    if (request.productTypes && !request.productTypes.includes("flights")) {
      return undefined;
    }

    const brandUrl = buildAviasalesSearchUrl({
      origin: request.originCityIata ?? request.originIata ?? "",
      destination: request.destinationCityIata ?? request.destinationIata ?? "",
      departureDate: request.departureDate,
      returnDate: request.tripType === "round-trip" ? request.returnDate : null,
      adults: request.travelers?.adults ?? 1,
      children: request.travelers?.children ?? 0,
      infants: request.travelers?.infants ?? 0,
    });
    if (!brandUrl) {
      return undefined;
    }

    const { aviasales } = getAppConfig();
    const marker = loadAffiliateConfig().travelpayoutsMarker ?? "";
    const partnerUrl = await convert(
      brandUrl,
      { apiToken: aviasales.apiToken, projectId: aviasales.projectId, marker },
      AVIASALES_SEARCH_SUB_ID,
    );

    return partnerUrl
      ? { href: partnerUrl, tagged: true }
      : { href: brandUrl, tagged: false };
  } catch {
    return undefined;
  }
}
