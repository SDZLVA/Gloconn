/**
 * Pure destination text normalization for matching.
 * Accent-insensitive — "Cancún" and "cancun" share the same key.
 */

/** Trim, lowercase, and strip diacritics for stable comparisons. */
export function normalizeDestinationQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Split a normalized string into word tokens (spaces / hyphens). */
export function tokenizeDestinationText(normalized: string): string[] {
  return normalized.split(/[\s-]+/).filter(Boolean);
}

/** True when `query` matches a whole word in `haystack` (both normalized). */
export function hasWholeWordMatch(haystack: string, query: string): boolean {
  if (!query) {
    return false;
  }
  return tokenizeDestinationText(haystack).some(
    (token) => token === query || token.startsWith(query),
  );
}
