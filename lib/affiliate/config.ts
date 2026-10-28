/**
 * Affiliate configuration (Milestone 19).
 *
 * The marker is read from NEXT_PUBLIC_TRAVELPAYOUTS_MARKER because outbound
 * links are built in client components (SearchResultsPage is "use client").
 * That is safe: a Travelpayouts marker is public by design and appears in
 * every outbound link anyway. It MUST be read with a literal
 * `process.env.NEXT_PUBLIC_…` expression — Next.js only inlines literal
 * references into the browser bundle, so a dynamic `process.env[name]`
 * lookup would silently read undefined in the browser. After changing it in
 * Vercel, redeploy without build cache: NEXT_PUBLIC_ values are baked in at
 * build time.
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

function clean(raw: string | undefined): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Reads affiliate settings. Safe on the server and in the browser. */
export function loadAffiliateConfig(): AffiliateConfig {
  // Literal access on purpose — see the file header.
  const raw = clean(process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER);
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
