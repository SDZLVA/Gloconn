/**
 * Drives the Travelpayouts widget's own filter controls from Glooconn's
 * sidebar (Milestone 24). Runs in the results page; the widget's frame is
 * Glooconn's own page (same origin), so its DOM is reachable.
 *
 * Selectors were read from the live widget on 2026-10-30. They are not a
 * public API: if Travelpayouts changes them, `findControls` returns null,
 * the bridge does nothing, and the widget's own filters stay visible — the
 * traveller can still filter, just in the widget.
 */

import {
  airlineSelected,
  widgetAirlineName,
  widgetStopsToCheck,
} from "@/features/liveFlights/engines/travelpayoutsFilterMap";
import type { LiveFlightsFilters } from "@/features/liveFlights/types";

type Root = Document | ShadowRoot;

/** The document plus every (nested) shadow root the widget renders into. */
function allRoots(doc: Document): Root[] {
  const roots: Root[] = [doc];
  const visit = (root: Root) => {
    for (const element of root.querySelectorAll("*")) {
      if (element.shadowRoot) {
        roots.push(element.shadowRoot);
        visit(element.shadowRoot);
      }
    }
  };
  visit(doc);
  return roots;
}

function queryAll<T extends Element>(roots: Root[], selector: string): T[] {
  return roots.flatMap((root) => [...root.querySelectorAll<T>(selector)]);
}

export type WidgetControls = {
  roots: Root[];
  layovers: HTMLInputElement[];
  baggage: HTMLButtonElement | null;
  airlinesHeader: HTMLButtonElement | null;
};

/** Finds the widget's filter controls, or null when they are not there (yet). */
export function findControls(doc: Document): WidgetControls | null {
  const roots = allRoots(doc);
  const layovers = queryAll<HTMLInputElement>(
    roots,
    '[class*="Layovers-module__body"] input[type="checkbox"]',
  );
  if (layovers.length === 0) return null;
  const baggage = queryAll<HTMLButtonElement>(roots, '[data-testid="baggage-included-filter"]')[0] ?? null;
  const airlinesHeader =
    queryAll<HTMLButtonElement>(roots, 'button[class*="Expandable-module__header"]').find((button) =>
      /airlines/i.test(button.textContent ?? ""),
    ) ?? null;
  return { roots, layovers, baggage, airlinesHeader };
}

function airlineInputs(controls: WidgetControls): { name: string; input: HTMLInputElement }[] {
  const section = controls.airlinesHeader?.parentElement;
  if (!section) return [];
  if (!section.querySelector('input[type="checkbox"][value]')) {
    controls.airlinesHeader?.click(); // renders the options (inside the hidden panel)
  }
  return [...section.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
    .filter((input) => /^[A-Z0-9]{2}$/.test(input.value)) // airlines, not alliances
    .map((input) => ({ name: widgetAirlineName(input.closest("label")?.textContent ?? ""), input }))
    .filter((item) => item.name.length > 0);
}

/** Airline names the live results contain. */
export function readWidgetAirlines(controls: WidgetControls): string[] {
  return airlineInputs(controls).map((item) => item.name);
}

function setChecked(input: HTMLInputElement, checked: boolean): void {
  if (input.checked !== checked) {
    (input.closest("label") ?? input).click();
  }
}

/** Applies Glooconn's filters to the widget. Clicks only what differs. */
export function applyFilters(controls: WidgetControls, filters: LiveFlightsFilters): void {
  const available = controls.layovers.map((input) => Number(input.value)).filter(Number.isFinite);
  const stops = new Set(widgetStopsToCheck(filters.maxStops, available));
  for (const input of controls.layovers) setChecked(input, stops.has(Number(input.value)));

  if (controls.baggage) {
    const active = controls.baggage.className.includes("valueChanged");
    if (active !== filters.baggageIncluded) controls.baggage.click();
  }

  if (controls.airlinesHeader) {
    for (const { name, input } of airlineInputs(controls)) {
      setChecked(input, filters.airlines.length > 0 && airlineSelected(name, filters.airlines));
    }
  }
}

/**
 * Milestone 25: whether the widget is still collecting prices, and hide its
 * large progress block (Glooconn shows a slim line instead).
 */
export function takeOverProgress(controls: WidgetControls): boolean {
  const bars = queryAll<HTMLElement>(controls.roots, '[class*="SearchProgressbar-module__searchProgressbar"]');
  for (const bar of bars) {
    if (bar.style.display !== "none") bar.style.display = "none";
  }
  return bars.length > 0;
}

/**
 * Hides the widget's own filter bar and panel — Glooconn's sidebar is the
 * filter now. Re-applied on every tick because the widget may re-render.
 */
export function hideOwnFilters(controls: WidgetControls): void {
  for (const element of queryAll<HTMLElement>(
    controls.roots,
    '[class*="FlightFiltersMobileMenu-module__root"], [class*="FlightFilters-module__root"]',
  )) {
    if (element.style.display !== "none") element.style.display = "none";
  }
}
