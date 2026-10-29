"use client";

import { useEffect, useRef, useState } from "react";
import {
  FRAME_HEIGHT_MESSAGE,
  widgetFrameSrc,
} from "@/features/liveFlights/engines/travelpayoutsWidgetSearch";
import type { LiveFlightsSearch } from "@/features/liveFlights/types";

const INITIAL_HEIGHT = 560;

/**
 * Travelpayouts White Label widget in an iframe (Milestone 23).
 * The frame is Glooconn's own page (/live-flights/frame), so the widget
 * works for our domain; being framed keeps its CSS reset and its URL
 * rewriting away from the results page. The frame reports its height.
 */
export function TravelpayoutsWidgetPanel({ search }: { search: LiveFlightsSearch }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(INITIAL_HEIGHT);
  const src = widgetFrameSrc(search);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as { type?: unknown; height?: unknown };
      if (data?.type === FRAME_HEIGHT_MESSAGE && typeof data.height === "number" && data.height > 0) {
        setHeight(Math.min(Math.max(data.height, 200), 20_000));
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
      style={{ height }}
    />
  );
}
