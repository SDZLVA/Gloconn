"use client";

import { useEffect, useRef, useState } from "react";
import {
  FRAME_HEIGHT_MESSAGE,
  widgetFrameSrc,
} from "@/features/liveFlights/engines/travelpayoutsWidgetSearch";
import {
  applyFilters,
  applyMaxPrice,
  findControls,
  hideOwnFilters,
  takeOverProgress,
  readWidgetAirlines,
} from "@/features/liveFlights/engines/travelpayoutsFilterBridge";
import type { LiveFlightsPanelProps } from "@/features/liveFlights/types";

const INITIAL_HEIGHT = 560;

/**
 * Travelpayouts White Label widget in an iframe (Milestone 23).
 * The frame is Glooconn's own page (/live-flights/frame), so the widget
 * works for our domain; being framed keeps its CSS reset and its URL
 * rewriting away from the results page. The frame reports its height.
 */
export function TravelpayoutsWidgetPanel({ search, filters, onFacets }: LiveFlightsPanelProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  // Latest values for the polling loop below (it must not restart on each change).
  const filtersRef = useRef(filters);
  const onFacetsRef = useRef(onFacets);
  useEffect(() => {
    filtersRef.current = filters;
    onFacetsRef.current = onFacets;
  });

  // Milestone 24: Glooconn's sidebar drives the widget's own filters.
  useEffect(() => {
    let appliedKey = "";
    let anchor: HTMLInputElement | null = null;
    let reportedAirlines = "";
    let reportedSearching = true;
    let bridged = false;
    // Milestone 28: the price slider is dragged asynchronously.
    let priceApplied: string | null = null;
    let priceAnchor: HTMLInputElement | null = null;
    let priceBusy = false;

    const tick = () => {
      let doc: Document | null = null;
      try {
        doc = frameRef.current?.contentDocument ?? null;
      } catch {
        doc = null;
      }
      const controls = doc ? findControls(doc) : null;
      // Before the first results the controls don't exist yet; hide the
      // widget's large progress block from the start anyway.
      if (doc && !controls) takeOverProgress(doc);
      if (!controls) {
        if (bridged) {
          bridged = false;
          onFacetsRef.current?.({ airlines: [], bridged: false, searching: false });
        }
        return;
      }

      hideOwnFilters(controls);
      const searching = takeOverProgress(controls);
      const airlines = readWidgetAirlines(controls);
      const airlinesKey = airlines.join("|");
      if (!bridged || airlinesKey !== reportedAirlines || searching !== reportedSearching) {
        bridged = true;
        reportedAirlines = airlinesKey;
        reportedSearching = searching;
        onFacetsRef.current?.({ airlines, bridged: true, searching });
      }

      // Re-apply when the filters change or the widget re-rendered its controls.
      const key = JSON.stringify(filtersRef.current);
      if (key !== appliedKey || anchor !== controls.layovers[0]) {
        appliedKey = key;
        anchor = controls.layovers[0] ?? null;
        applyFilters(controls, filtersRef.current);
      }

      const maxPrice = filtersRef.current.maxPrice ?? null;
      // While prices are still arriving the range grows; re-check every 5 s.
      const priceKey = `${maxPrice}:${searching ? Math.floor(Date.now() / 5000) : "done"}`;
      if (!priceBusy && (priceKey !== priceApplied || priceAnchor !== controls.layovers[0])) {
        priceBusy = true;
        const anchorNow = controls.layovers[0] ?? null;
        void applyMaxPrice(controls, maxPrice)
          .then((done) => {
            if (done) {
              priceApplied = priceKey;
              priceAnchor = anchorNow;
            }
          })
          .catch(() => {
            /* the widget changed; the next tick retries */
          })
          .finally(() => {
            priceBusy = false;
          });
      }
    };

    const timer = window.setInterval(tick, 700);
    return () => window.clearInterval(timer);
  }, []);

  const [contentHeight, setContentHeight] = useState(INITIAL_HEIGHT);
  const [modalOpen, setModalOpen] = useState(false);
  const src = widgetFrameSrc(search);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as { type?: unknown; height?: unknown; modal?: unknown };
      if (data?.type !== FRAME_HEIGHT_MESSAGE) return;
      const modal = data.modal === true;
      setModalOpen((wasOpen) => {
        // Bring the flight-details pop-up into view when it opens.
        if (modal && !wasOpen) {
          requestAnimationFrame(() => frameRef.current?.scrollIntoView({ block: "start" }));
        }
        return modal;
      });
      if (!modal && typeof data.height === "number" && data.height > 0) {
        setContentHeight(Math.min(Math.max(data.height, 200), 20_000));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!src) {
    return (
      <p className="text-sm text-slate-600" role="status">
        Live flights are not available for this search.
      </p>
    );
  }

  return (
    <iframe
      ref={frameRef}
      key={src}
      src={src}
      title="Live flights search results"
      // Eager, not lazy: the live search starts as soon as the results page
      // opens, so it has usually finished by the time it is scrolled to.
      // Milestone 26: no frame border; the results are separate Glooconn-style cards.
      // Milestone 27: the frame is always as tall as its content; it never scrolls.
      scrolling="no"
      className="block w-full overflow-hidden bg-transparent"
      // While the widget's pop-up is open the frame is one screen tall, so
      // the pop-up (pinned to the frame's top) is fully visible.
      style={{ height: modalOpen ? "100dvh" : contentHeight }}
    />
  );
}
