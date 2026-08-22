/**
 * Server-side validation of outbound hotel URLs (Sprint 17.3).
 *
 * Never trust arbitrary provider hrefs. Only HTTPS, allowlisted hosts/paths,
 * no credentials, no javascript/data/http.
 */

import { isSafeExternalHttpsUrl } from "@/lib/hotels/googleMapsUrl";

const GOOGLE_MAPS_HOSTS = new Set([
  "www.google.com",
  "google.com",
  "maps.google.com",
]);

/** Hosts we never expose as user-facing outbound links. */
const BLOCKED_HOSTS = new Set([
  "serpapi.com",
  "www.serpapi.com",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
]);

const MAX_URL_LENGTH = 2048;

function normalizeHost(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, "");
}

function parseHttpsUrl(raw: string): URL | null {
  const trimmed = raw?.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) {
    return null;
  }
  if (!isSafeExternalHttpsUrl(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") {
      return null;
    }
    if (parsed.username || parsed.password) {
      return null;
    }
    const host = normalizeHost(parsed.hostname);
    if (!host || BLOCKED_HOSTS.has(host)) {
      return null;
    }
    // Reject bare IPs for hotel websites / offers (open-redirect style abuse).
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[")) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Validates a Google Maps / directions URL from the provider.
 * Allows google.com / maps.google.com maps paths only.
 */
export function validateGoogleMapsDirectionsUrl(
  raw: string | null | undefined,
): string | null {
  const parsed = parseHttpsUrl(raw ?? "");
  if (!parsed) {
    return null;
  }

  const host = normalizeHost(parsed.hostname);
  if (!GOOGLE_MAPS_HOSTS.has(host)) {
    return null;
  }

  const path = parsed.pathname.toLowerCase();
  // Provider directions often look like /maps?... or /maps/dir/...
  if (!(path === "/maps" || path.startsWith("/maps/"))) {
    return null;
  }

  return parsed.toString();
}

/**
 * True when the URL is a Google Hotels click / travel clk wrapper (offer deep-link).
 */
export function isGoogleTravelClickUrl(parsed: URL): boolean {
  const host = normalizeHost(parsed.hostname);
  if (!GOOGLE_MAPS_HOSTS.has(host) && host !== "www.googleadservices.com") {
    return false;
  }
  const path = parsed.pathname.toLowerCase();
  return (
    path === "/aclk" ||
    path.startsWith("/aclk") ||
    path === "/travel/clk" ||
    path.startsWith("/travel/clk") ||
    path === "/url" ||
    path.startsWith("/url")
  );
}

/**
 * Validates a hotel website URL (official property site).
 * Any HTTPS host except blocked / Google click wrappers / SerpAPI.
 */
export function validateHotelWebsiteUrl(
  raw: string | null | undefined,
): string | null {
  const parsed = parseHttpsUrl(raw ?? "");
  if (!parsed) {
    return null;
  }

  if (isGoogleTravelClickUrl(parsed)) {
    return null;
  }

  const host = normalizeHost(parsed.hostname);
  if (GOOGLE_MAPS_HOSTS.has(host) && parsed.pathname.toLowerCase().startsWith("/maps")) {
    // Maps links belong in mapsUrl, not website.
    return null;
  }

  return parsed.toString();
}

/**
 * Validates a partner / OTA offer URL.
 * Currently allowlisted to Google click wrappers only (safe meta redirects).
 * Direct OTA deep-links without allowlisting are rejected.
 */
export function validateHotelOfferUrl(
  raw: string | null | undefined,
): string | null {
  const parsed = parseHttpsUrl(raw ?? "");
  if (!parsed) {
    return null;
  }

  if (!isGoogleTravelClickUrl(parsed)) {
    return null;
  }

  return parsed.toString();
}

/** Reject helper for tests — returns false for unsafe schemes/hosts. */
export function isRejectedExternalUrl(raw: string): boolean {
  const trimmed = raw.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("http:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return true;
  }
  return (
    validateHotelWebsiteUrl(raw) === null &&
    validateGoogleMapsDirectionsUrl(raw) === null &&
    validateHotelOfferUrl(raw) === null
  );
}
