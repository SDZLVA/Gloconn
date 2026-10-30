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

/**
 * Milestone 28: reads the amount from the widget's price-filter label
 * ("Total To € 5,461" → 5461). Null when it shows no number.
 */
export function parseWidgetPrice(text: string | null | undefined): number | null {
  const digits = (text ?? "").replace(/[^\d]/g, "");
  if (!digits) return null;
  const value = Number(digits);
  return Number.isFinite(value) ? value : null;
}

/**
 * Milestone 28: where to put the widget's price slider so its upper limit
 * is the highest value that is still within `maxPrice`. `probe(f)` moves
 * the slider to fraction f (0 = left, 1 = right) and returns the price the
 * widget then shows. The slider only grows to the right, so a binary
 * search is enough. Returns 1 when the whole range is within budget.
 */
export async function findSliderFraction(
  maxPrice: number,
  probe: (fraction: number) => Promise<number | null>,
  steps = 12,
): Promise<number> {
  const top = await probe(1);
  if (top === null || top <= maxPrice) return 1;
  let low = 0;
  let high = 1;
  for (let i = 0; i < steps; i += 1) {
    const mid = (low + high) / 2;
    const value = await probe(mid);
    if (value !== null && value <= maxPrice) low = mid;
    else high = mid;
  }
  return low;
}
