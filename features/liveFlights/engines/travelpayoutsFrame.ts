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
import { WIDGET_SKIN_CSS } from "@/features/liveFlights/engines/travelpayoutsSkin";

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
<link rel="preconnect" href="https://tpwgts.com">
<link rel="preconnect" href="https://api.apistp.com" crossorigin>
<link rel="preconnect" href="https://tickets-api.apistp.com" crossorigin>
<style>
  html, body { margin: 0; background: transparent; }
  /* Milestone 27: the parent sizes the frame to its content, so the frame
     itself never scrolls (no second scrollbar inside the results page). */
  html { overflow: hidden; scrollbar-width: none; }
  html::-webkit-scrollbar { display: none; }
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

    // The widget locks body scrolling while its flight-details pop-up is
    // open; the parent then shrinks the frame to the screen so the pop-up
    // (pinned to the frame's top) is visible.
    var last = "";
    function report() {
      if (window.parent === window) return;
      // Milestone 27: measure the results themselves. documentElement's
      // scrollHeight can stay at an old, larger value, and lags behind
      // results that keep streaming in.
      var tickets = document.getElementById("tpwl-tickets");
      var h = tickets
        ? Math.ceil(tickets.getBoundingClientRect().bottom + window.scrollY) + 8
        : Math.ceil(document.documentElement.scrollHeight);
      var modal = !!document.body && getComputedStyle(document.body).overflow === "hidden";
      var key = h + ":" + modal;
      if (key !== last) {
        last = key;
        window.parent.postMessage(
          { type: ${JSON.stringify(FRAME_HEIGHT_MESSAGE)}, height: h, modal: modal },
          window.location.origin
        );
      }
    }
    document.addEventListener("DOMContentLoaded", function () {
      new MutationObserver(report).observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
      report();
    });
    // Milestone 26: Glooconn look. The widget renders into shadow roots and
    // keeps re-rendering, so the style is (re)added to every root on a timer.
    var SKIN = ${JSON.stringify(WIDGET_SKIN_CSS)};
    function skin() {
      var roots = [document];
      (function walk(root) {
        var all = root.querySelectorAll("*");
        for (var i = 0; i < all.length; i++) {
          if (all[i].shadowRoot) { roots.push(all[i].shadowRoot); walk(all[i].shadowRoot); }
        }
      })(document);
      for (var j = 0; j < roots.length; j++) {
        var host = roots[j] === document ? document.head : roots[j];
        if (!host.querySelector("style[data-glooconn-skin]")) {
          var style = document.createElement("style");
          style.setAttribute("data-glooconn-skin", "");
          style.textContent = SKIN;
          host.appendChild(style);
        }
      }
    }
    setInterval(skin, 400);

    window.addEventListener("load", report);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(report);
      ro.observe(document.documentElement);
      document.addEventListener("DOMContentLoaded", function () {
        var t = document.getElementById("tpwl-tickets");
        if (t) ro.observe(t);
      });
    }
    setInterval(report, 500);
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
