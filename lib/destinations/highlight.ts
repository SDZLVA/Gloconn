/**
 * Highlight matching substrings in autocomplete labels.
 * Pure — no DOM; returns React-friendly segment lists.
 */

import { normalizeDestinationQuery } from "@/lib/destinations/normalize";

export type HighlightSegment = {
  text: string;
  /** True when this segment matches the query. */
  match: boolean;
};

/**
 * Splits `text` into segments for rendering highlighted matches.
 * Matching is case- and accent-insensitive against `query`.
 * When there is no match, returns a single non-match segment.
 */
export function highlightMatchSegments(
  text: string,
  query: string,
): HighlightSegment[] {
  const normalizedQuery = normalizeDestinationQuery(query);
  if (!normalizedQuery || !text) {
    return [{ text, match: false }];
  }

  const normalizedText = normalizeDestinationQuery(text);
  const matchIndex = normalizedText.indexOf(normalizedQuery);
  if (matchIndex < 0) {
    return [{ text, match: false }];
  }

  // Map normalized index back onto the original string by walking both.
  let originalStart = 0;
  let normalizedPos = 0;
  while (normalizedPos < matchIndex && originalStart < text.length) {
    const ch = text[originalStart] ?? "";
    const normalizedCh = normalizeDestinationQuery(ch);
    originalStart += 1;
    normalizedPos += normalizedCh.length;
  }

  let originalEnd = originalStart;
  let matchedNorm = 0;
  while (matchedNorm < normalizedQuery.length && originalEnd < text.length) {
    const ch = text[originalEnd] ?? "";
    const normalizedCh = normalizeDestinationQuery(ch);
    originalEnd += 1;
    matchedNorm += normalizedCh.length;
  }

  const before = text.slice(0, originalStart);
  const matched = text.slice(originalStart, originalEnd);
  const after = text.slice(originalEnd);

  const segments: HighlightSegment[] = [];
  if (before) {
    segments.push({ text: before, match: false });
  }
  if (matched) {
    segments.push({ text: matched, match: true });
  }
  if (after) {
    segments.push({ text: after, match: false });
  }
  return segments.length > 0 ? segments : [{ text, match: false }];
}
