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
  findSliderFraction,
  parseWidgetPrice,
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
export function takeOverProgress(target: WidgetControls | Document): boolean {
  const roots = "roots" in target ? target.roots : allRoots(target);
  const bars = queryAll<HTMLElement>(roots, '[class*="SearchProgressbar-module__searchProgressbar"]');
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
    '[class*="FlightFiltersMobileMenu-module__root"], [class*="FlightFilters-module__root"], [class*="TicketsWidget-module__filtersMobileMenu"]',
  )) {
    // Milestone 27: "important" — the widget's own CSS sets display with
    // !important, which beat a plain inline display:none.
    if (element.style.getPropertyPriority("display") !== "important") {
      element.style.setProperty("display", "none", "important");
    }
  }
}

/**
 * Milestone 28: sets the widget's own Price filter ("To € …") so it shows
 * only fares within Glooconn's max price / budget. The widget has a
 * pointer-driven slider (no input), so this drags it with synthetic
 * pointer events and reads the label it shows back. Only the filter's
 * own label is read, never the results.
 *
 * The filter panel is hidden by Glooconn; it is kept laid out off screen
 * (fixed, invisible, inert) so the slider has a size to drag along.
 * Returns false when the price filter is not there (yet) — try again later.
 */
export async function applyMaxPrice(
  controls: WidgetControls,
  maxPrice: number | null,
): Promise<boolean> {
  const header = queryAll<HTMLButtonElement>(controls.roots, 'button[class*="Expandable-module__header"]').find(
    (button) => (button.textContent ?? "").trim().toLowerCase() === "price",
  );
  if (!header) return false;

  const container = header.closest<HTMLElement>('[class*="FlightFilters-module__filerContainer"]');
  const content = header.closest<HTMLElement>('[class*="FlightFiltersContent-module__root"]');
  if (container) {
    const offscreen: Record<string, string> = {
      display: "block",
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: "360px",
      visibility: "hidden",
      "pointer-events": "none",
    };
    for (const [property, value] of Object.entries(offscreen)) {
      if (container.style.getPropertyValue(property) !== value) {
        container.style.setProperty(property, value, "important");
      }
    }
  }
  if (content && content.style.getPropertyValue("display") !== "block") {
    content.style.setProperty("display", "block", "important");
  }

  const body = header.parentElement?.querySelector<HTMLElement>('[class*="PriceFilter-module__body"]') ?? null;
  if (!body) {
    header.click(); // renders the price filter
    return false;
  }
  const control = body.querySelector<HTMLElement>('[class*="RangeInput-module__control"]');
  const line = body.querySelector<HTMLElement>('[class*="RangeInput-module__line"]');
  const info = body.querySelector<HTMLElement>('[class*="PriceFilter-module__info"]');
  if (!control || !line || !info) return false;
  const lineBox = line.getBoundingClientRect();
  if (lineBox.width <= 0) return false;

  const view = control.ownerDocument.defaultView;
  if (!view) return false;
  const start = control.getBoundingClientRect();
  const y = start.top + start.height / 2;
  const fire = (type: string, x: number, buttons: number) => {
    const init = { clientX: x, clientY: y, bubbles: true, composed: true, button: 0, buttons };
    const pointer = new view.PointerEvent(type, { ...init, pointerId: 1, isPrimary: true, pointerType: "mouse" });
    const mouse = new view.MouseEvent(type.replace("pointer", "mouse"), init);
    const targets: EventTarget[] = type === "pointerdown" ? [control] : [control, control.ownerDocument, view];
    for (const target of targets) {
      target.dispatchEvent(pointer);
      target.dispatchEvent(mouse);
    }
  };
  const xAt = (fraction: number) => lineBox.left + lineBox.width * fraction;
  const settle = () => new Promise((resolve) => view.setTimeout(resolve, 40));

  const noLimit = maxPrice === null || maxPrice <= 0;
  if (noLimit && control.style.left === "100%") return true; // already "any price"

  fire("pointerdown", start.left + start.width / 2, 1);
  let target = 1;
  if (!noLimit) {
    target = await findSliderFraction(maxPrice ?? 0, async (fraction) => {
      fire("pointermove", xAt(fraction), 1);
      await settle();
      // Re-query: the widget may re-render the label.
      return parseWidgetPrice(body.querySelector('[class*="PriceFilter-module__info"]')?.textContent);
    });
  }
  fire("pointermove", xAt(target), 1);
  fire("pointerup", xAt(target), 0);
  return true;
}
