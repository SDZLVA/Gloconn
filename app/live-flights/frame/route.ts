/**
 * GET /live-flights/frame?flightSearch=MIL2311PAR28111&currency=EUR
 *
 * Milestone 23, part of the removable live-flights engine
 * (features/liveFlights). Only Glooconn itself may frame this page
 * (proxy.ts: frame-ancestors 'self' for this path).
 */

import { renderWidgetFrame } from "@/features/liveFlights/engines/travelpayoutsFrame";

export function GET(request: Request) {
  const { status, html } = renderWidgetFrame(
    new URL(request.url).searchParams,
    request.headers.get("x-nonce"),
  );
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
