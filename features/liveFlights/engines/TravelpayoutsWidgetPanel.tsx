"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_TPWL_ID,
  urlWithWidgetSearch,
  widgetScriptUrl,
} from "@/features/liveFlights/engines/travelpayoutsWidgetSearch";
import type { LiveFlightsSearch } from "@/features/liveFlights/types";

declare global {
  interface Window {
    TPWL_CONFIGURATION?: Record<string, unknown>;
    __glooconnTpwlLoaded?: boolean;
  }
}

// Literal reference so Next.js inlines it at build time.
const WHITE_LABEL_ID = process.env.NEXT_PUBLIC_TPWL_ID || DEFAULT_TPWL_ID;

type Status = "loading" | "ready" | "unavailable";

/**
 * Travelpayouts White Label widget, results only (Milestone 23).
 *
 * The widget reads `flightSearch` from the page URL and searches by itself,
 * so the panel puts the traveller's search into the URL (replaceState, no
 * reload) and then loads the script once. Its own search form is not shown:
 * submitting it would navigate away from Glooconn's results.
 */
export function TravelpayoutsWidgetPanel({ search }: { search: LiveFlightsSearch }) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const scriptUrl = widgetScriptUrl(WHITE_LABEL_ID);
    const next = urlWithWidgetSearch(window.location.href, search);
    if (!scriptUrl || !next) {
      setStatus("unavailable");
      return;
    }

    // The widget reads the URL when it starts. A later change of dates
    // (date strip) would need a fresh start — reload the page then.
    const searchChanged = window.location.href !== next;
    window.history.replaceState(window.history.state, "", next);
    if (window.__glooconnTpwlLoaded) {
      if (searchChanged) window.location.reload();
      return;
    }

    window.__glooconnTpwlLoaded = true;
    window.TPWL_CONFIGURATION = { ...window.TPWL_CONFIGURATION };
    const script = document.createElement("script");
    script.type = "module";
    script.async = true;
    script.src = scriptUrl;
    script.onload = () => setStatus("ready");
    script.onerror = () => setStatus("unavailable");
    document.head.appendChild(script);
  }, [search]);

  if (status === "unavailable") {
    return (
      <p className="text-sm text-slate-600" role="status">
        Live flights could not be loaded right now.
      </p>
    );
  }

  return (
    <div aria-busy={status === "loading"}>
      {/* Required by the widget; kept off screen so only results show. */}
      <div id="tpwl-search" className="sr-only" aria-hidden="true" />
      <div id="tpwl-tickets" className="min-h-24" />
    </div>
  );
}
