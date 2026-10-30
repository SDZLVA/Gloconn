/**
 * Pure mapping from Glooconn's sidebar to the Travelpayouts widget's filter
 * controls (Milestone 24). Tested; the DOM work is in the bridge.
 */

/** Widget layover options checked for a max-stops setting. [] = any. */
export function widgetStopsToCheck(maxStops: number | null, available: readonly number[]): number[] {
  if (maxStops === null) return [];
  const wanted = available.filter((stops) => stops <= maxStops);
  // Every option ticked means the same as none: show all.
  return wanted.length === available.length ? [] : wanted;
}

/** "Air France€ ‪150‬" → "Air France" (labels carry a price and bidi marks). */
export function widgetAirlineName(label: string): string {
  return label
    .replace(/[‎‏‪-‮⁦-⁩]/g, "")
    .split("€")[0]
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Whether a widget airline matches one of the sidebar's airline names. */
export function airlineSelected(widgetName: string, selected: readonly string[]): boolean {
  const key = normalize(widgetName);
  return key.length > 0 && selected.some((name) => normalize(name) === key);
}
