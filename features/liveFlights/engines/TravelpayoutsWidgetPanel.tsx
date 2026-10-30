"use client";

import { useEffect, useRef, useState } from "react";
import {
  FRAME_HEIGHT_MESSAGE,
  widgetFrameSrc,
} from "@/features/liveFlights/engines/travelpayoutsWidgetSearch";
import {
  applyFilters,
  findControls,
  hideOwnFilters,
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
    let bridged = false;

    const tick = () => {
      let doc: Document | null = null;
      try {
        doc = frameRef.current?.contentDocument ?? null;
      } catch {
        doc = null;
      }
      const controls = doc ? findControls(doc) : null;
      if (!controls) {
        if (bridged) {
          bridged = false;
          onFacetsRef.current?.({ airlines: [], bridged: false });
        }
        return;
      }

      hideOwnFilters(controls);
      const airlines = readWidgetAirlines(controls);
      const airlinesKey = airlines.join("|");
      if (!bridged || airlinesKey !== reportedAirlines) {
        bridged = true;
        reportedAirlines = airlinesKey;
        onFacetsRef.current?.({ airlines, bridged: true });
      }

      // Re-apply when the filters change or the widget re-rendered its controls.
      const key = JSON.stringify(filtersRef.current);
      if (key !== appliedKey || anchor !== controls.layovers[0]) {
        appliedKey = key;
        anchor = controls.layovers[0] ?? null;
        applyFilters(controls, filtersRef.current);
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
      loading="lazy"
      className="w-full rounded-2xl border border-slate-200 bg-white"
      // While the widget's pop-up is open the frame is one screen tall, so
      // the pop-up (pinned to the frame's top) is fully visible.
      style={{ height: modalOpen ? "100dvh" : contentHeight }}
    />
  );
}
