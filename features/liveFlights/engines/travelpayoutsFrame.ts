/**
 * The page inside the live-flights iframe (Milestone 23). Served by
 * app/live-flights/frame/route.ts. Contains only the Travelpayouts widget.
 */

import {
  DEFAULT_TPWL_ID,
  FRAME_HEIGHT_MESSAGE,
  isValidFlightSearch,
  widgetScriptUrl,
} from "@/features/liveFlights/engines/travelpayoutsWidgetSearch";

function escapeAttr(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export type FrameResult = { status: number; html: string };

export function renderWidgetFrame(
  query: URLSearchParams,
  nonce: string | null,
  whiteLabelId: string = process.env.NEXT_PUBLIC_TPWL_ID || DEFAULT_TPWL_ID,
): FrameResult {
  const scriptUrl = widgetScriptUrl(whiteLabelId);
  if (!isValidFlightSearch(query.get("flightSearch")) || !scriptUrl || !nonce) {
    return { status: 400, html: "<!doctype html><title>Live flights</title><p>Invalid search.</p>" };
  }

  const nonceAttr = escapeAttr(nonce);
  // The widget reads flightSearch/currency from THIS page's URL by itself.
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Live flights</title>
<base target="_blank">
<style>
  html, body { margin: 0; background: transparent; }
  body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  #tpwl-search { display: none; }
</style>
<script nonce="${nonceAttr}">
  (function () {
    window.TPWL_CONFIGURATION = Object.assign({}, window.TPWL_CONFIGURATION);
    var s = document.createElement("script");
    s.type = "module";
    s.async = true;
    s.src = ${JSON.stringify(scriptUrl)};
    document.head.appendChild(s);

    var last = 0;
    function report() {
      var h = Math.ceil(document.documentElement.scrollHeight);
      if (h !== last && window.parent !== window) {
        last = h;
        window.parent.postMessage({ type: ${JSON.stringify(FRAME_HEIGHT_MESSAGE)}, height: h }, window.location.origin);
      }
    }
    window.addEventListener("load", report);
    if (window.ResizeObserver) new ResizeObserver(report).observe(document.documentElement);
    setInterval(report, 1000);
  })();
</script>
</head>
<body>
<div id="tpwl-search"></div>
<div id="tpwl-tickets"></div>
</body>
</html>`;
  return { status: 200, html };
}
