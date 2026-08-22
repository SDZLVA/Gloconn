/**
 * Safe Google Maps URL construction for hotel coordinates.
 *
 * Sprint 17.2 — only builds HTTPS URLs from validated numeric coordinates.
 * Never accepts arbitrary provider/user href strings.
 */

const GOOGLE_MAPS_ORIGIN = "https://www.google.com";

/**
 * Returns true when a URL is a safe external HTTPS link we may open in a new tab.
 */
export function isSafeExternalHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return false;
    }
    // Reject credentials / unexpected schemes already filtered by protocol check.
    if (parsed.username || parsed.password) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * True when both coordinates are finite WGS84 values in range.
 */
export function hasValidHotelCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): boolean {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return false;
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return false;
  }
  return true;
}

/**
 * Builds a Google Maps search URL from coordinates only.
 * Returns null when coordinates are missing/invalid or the URL fails safety checks.
 */
export function buildGoogleMapsUrl(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): string | null {
  if (!hasValidHotelCoordinates(latitude, longitude)) {
    return null;
  }

  // Encode components explicitly — never interpolate untrusted strings.
  const query = `${latitude},${longitude}`;
  const url = `${GOOGLE_MAPS_ORIGIN}/maps?q=${encodeURIComponent(query)}`;

  if (!isSafeExternalHttpsUrl(url)) {
    return null;
  }

  // Defence in depth: only allow our constructed Google Maps host.
  try {
    const parsed = new URL(url);
    if (parsed.origin !== GOOGLE_MAPS_ORIGIN) {
      return null;
    }
    if (!parsed.pathname.startsWith("/maps")) {
      return null;
    }
  } catch {
    return null;
  }

  return url;
}
