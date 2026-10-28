/**
 * Affiliate configuration (Milestone 19).
 *
 * Deliberately self-contained rather than folded into lib/config. Tagging is
 * off unless a marker is present, so a missing or malformed value degrades to
 * plain untagged links rather than a startup error. If affiliate links later
 * become load-bearing, move this into lib/config/load.ts so validate.ts can
 * surface problems at boot like the other settings.
 */

import type { AffiliateConfig } from "@/lib/affiliate/types";

/**
 * Markers are short partner identifiers. Restricting the shape stops a
 * stray value (a quoted string, a pasted URL, a newline) from being spliced
 * into an outbound link.
 */
const MARKER_PATTERN = /^[A-Za-z0-9_.-]{1,64}$/;

function readEnv(name: string): string | null {
  const raw = process.env[name];
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Reads affiliate settings from the environment. Safe to call anywhere. */
export function loadAffiliateConfig(): AffiliateConfig {
  const raw = readEnv("AFFILIATE_TRAVELPAYOUTS_MARKER");
  const marker = raw !== null && MARKER_PATTERN.test(raw) ? raw : null;

  return {
    enabled: marker !== null,
    travelpayoutsMarker: marker,
  };
}

/** Config with every programme disabled — the default, and used by tests. */
export const DISABLED_AFFILIATE_CONFIG: AffiliateConfig = {
  enabled: false,
  travelpayoutsMarker: null,
};
