/**
 * Exact-ticket Aviasales redirect (Milestone 20) — server only.
 *
 * Flight cards link to /api/out/aviasales?u=<aviasales ticket URL>. The
 * partner link is made here, at click time, rather than for every result
 * during the search: a search shows up to 100 tickets, the Travelpayouts
 * link API allows 100 requests a minute, and most tickets are never
 * clicked. Conversions are cached (partnerLinksApi.ts), so a second click
 * on the same ticket costs nothing.
 *
 * Only exact aviasales.com ticket URLs are accepted, so the route cannot
 * be used to send people to any other site (no open redirect).
 */

import "server-only";

import { loadAffiliateConfig } from "@/lib/affiliate/config";
import { isAviasalesTicketUrl } from "@/lib/affiliate/aviasalesLink";
import { createPartnerLink } from "@/lib/affiliate/partnerLinksApi";
import { getAppConfig } from "@/lib/config";

/** Placement label reported to Travelpayouts. Never traveller data. */
export const AVIASALES_TICKET_SUB_ID = "flight_exact";

export type AviasalesRedirect =
  | { ok: true; location: string; tagged: boolean }
  | { ok: false };

export async function resolveAviasalesRedirect(
  target: string | null,
  convert: typeof createPartnerLink = createPartnerLink,
): Promise<AviasalesRedirect> {
  if (!target || target.length > 2_000 || !isAviasalesTicketUrl(target)) {
    return { ok: false };
  }
  try {
    const { aviasales } = getAppConfig();
    const marker = loadAffiliateConfig().travelpayoutsMarker ?? "";
    const partnerUrl = await convert(
      target,
      { apiToken: aviasales.apiToken, projectId: aviasales.projectId, marker },
      AVIASALES_TICKET_SUB_ID,
    );
    return partnerUrl
      ? { ok: true, location: partnerUrl, tagged: true }
      : { ok: true, location: target, tagged: false };
  } catch {
    // Attribution failed; the traveller still gets the exact ticket.
    return { ok: true, location: target, tagged: false };
  }
}
