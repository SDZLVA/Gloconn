/**
 * Outbound affiliate tagging (Milestone 19).
 *
 * Rules this module exists to enforce:
 *  1. Only HTTPS URLs are ever tagged.
 *  2. Only hosts we have an explicit, documented rule for are tagged.
 *     An unknown partner is sent the traveller's original link untouched.
 *  3. Tagging never rewrites the path, the host, or any existing query
 *     parameter. It adds one parameter and nothing else.
 *  4. Nothing about the traveller is ever added to the URL — no search
 *     terms, no dates, no identifiers. Only the partner marker.
 *  5. A URL that already carries the marker parameter is left alone, so a
 *     partner's own deep-link is never double-tagged.
 *
 * Any failure returns the input URL unchanged. A broken affiliate setup
 * must never stop a traveller reaching the booking page.
 */

import type {
  AffiliateConfig,
  AffiliateProgram,
  TagResult,
} from "@/lib/affiliate/types";

/** How one partner host is tagged. */
export type PartnerRule = {
  /** Which programme pays for this host. */
  program: AffiliateProgram;
  /** Query parameter carrying the marker, exactly as the partner documents it. */
  param: string;
};

/**
 * Host → tagging rule.
 *
 * INTENTIONALLY EMPTY. Each entry must come from the partner's own
 * documentation once the Travelpayouts account is approved — guessing a
 * parameter name produces links that look tagged, pay nothing, and are
 * almost impossible to notice. Until an entry exists, every link is sent
 * untagged, which is the correct and honest default.
 *
 * Expected shape once filled, for example:
 *   "www.example-partner.com": { program: "travelpayouts", param: "marker" }
 */
export const PARTNER_RULES: Readonly<Record<string, PartnerRule>> = {};

const MAX_URL_LENGTH = 2048;

function normalizeHost(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, "");
}

function markerFor(
  program: AffiliateProgram,
  config: AffiliateConfig,
): string | null {
  switch (program) {
    case "travelpayouts":
      return config.travelpayoutsMarker;
    default:
      return null;
  }
}

/**
 * Adds the partner marker to an outbound URL when, and only when, there is a
 * documented rule for its host and a marker configured for that programme.
 *
 * @param rawUrl - An already-validated HTTPS URL (see lib/hotels/safeExternalUrls).
 * @param config - Affiliate settings; pass DISABLED_AFFILIATE_CONFIG to opt out.
 * @param rules  - Host rules. Injectable so tests cover tagging without
 *                 depending on which partners happen to be live.
 */
export function tagOutboundUrl(
  rawUrl: string,
  config: AffiliateConfig,
  rules: Readonly<Record<string, PartnerRule>> = PARTNER_RULES,
): TagResult {
  const input = typeof rawUrl === "string" ? rawUrl.trim() : "";

  if (!input || input.length > MAX_URL_LENGTH) {
    return { url: rawUrl, tagged: false, reason: "invalid_url" };
  }

  if (!config.enabled) {
    return { url: input, tagged: false, reason: "disabled" };
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { url: input, tagged: false, reason: "invalid_url" };
  }

  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    return { url: input, tagged: false, reason: "invalid_url" };
  }

  const rule = rules[normalizeHost(parsed.hostname)];
  if (!rule) {
    return { url: input, tagged: false, reason: "unsupported_host" };
  }

  const marker = markerFor(rule.program, config);
  if (marker === null) {
    return { url: input, tagged: false, reason: "disabled" };
  }

  if (parsed.searchParams.has(rule.param)) {
    return { url: input, tagged: false, reason: "already_tagged" };
  }

  parsed.searchParams.set(rule.param, marker);

  const tagged = parsed.toString();
  if (tagged.length > MAX_URL_LENGTH) {
    return { url: input, tagged: false, reason: "invalid_url" };
  }

  return { url: tagged, tagged: true };
}
