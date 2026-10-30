/**
 * Glooconn look for the Travelpayouts widget's results (Milestone 26).
 *
 * Shehan, 2026-10-30: separate, clean cards with clearly visible buttons in
 * Glooconn's theme. This only restyles the widget's own elements inside
 * Glooconn's frame page — it does not read or re-render its data
 * (Travelpayouts forbids collecting data from search results).
 *
 * Selectors are the widget's CSS-module class prefixes (read 2026-10-30).
 * If they change, the widget simply falls back to its own look.
 *
 * Layout: flights on the left, a separate price column (price, baggage,
 * full-width button) on the right; stacked on phones.
 */

// Glooconn tokens (app/globals.css): brand-700 #1d4ed8, brand-800 #1e40af,
// slate-50 #f8fafc, slate-200 #e2e8f0, slate-300 #cbd5e1, slate-900 #0f172a.
export const WIDGET_SKIN_CSS = `
[class*="DirectFlights-module__root"]{display:none!important}
[class*="FlightCard-module__card___"]{display:grid!important;grid-template-columns:minmax(0,1fr) 232px!important;grid-template-rows:auto!important;gap:0!important;background:#fff!important;border:1px solid #e2e8f0!important;border-radius:16px!important;box-shadow:0 1px 2px rgba(15,23,42,.05)!important;margin:22px 0 0!important;position:relative!important;overflow:visible!important;transition:box-shadow .15s ease,border-color .15s ease}
[class*="FlightCard-module__card___"]:hover{border-color:#bfdbfe!important;box-shadow:0 10px 28px rgba(15,23,42,.08)!important}
[class*="FlightCard-module__cardRight___"]{grid-column:1!important;grid-row:1!important;margin:0!important;padding:22px 24px!important;min-width:0}
[class*="FlightCard-module__cardLeft___"]{grid-column:2!important;grid-row:1!important;margin:0!important;display:flex!important;flex-direction:column!important;justify-content:center!important;gap:12px!important;padding:22px 20px!important;border-left:1px dashed #cbd5e1!important;background:#f8fafc!important;border-radius:0 16px 16px 0!important}
[class*="FlightCard-module__cardLeftPrice___"]{font-size:30px!important;line-height:1.1!important;font-weight:800!important;color:#0f172a!important;text-align:left!important;margin:0!important}
[class*="FlightCard-module__cardLeftBaggage___"]{margin:0!important;background:#fff!important;border-radius:12px!important}
[class*="FlightCard-module__cardLeftButton___"]{width:100%!important;min-height:48px!important;margin:0!important;border-radius:12px!important;background:#1d4ed8!important;color:#fff!important;font-weight:700!important;font-size:16px!important;box-shadow:0 1px 2px rgba(29,78,216,.25)!important}
[class*="FlightCard-module__cardLeftButton___"]:hover{background:#1e40af!important}
[class*="FlightCard-module__cardLeftButton___"]:focus-visible{outline:2px solid #1d4ed8!important;outline-offset:2px!important}
[class*="FlightCard-module__cardBadges___"]{position:absolute!important;top:-11px!important;left:20px!important;z-index:2!important;margin:0!important;display:flex!important;gap:6px!important}
[class*="FlightCard-module__cardBadges___"] > *{border-radius:999px!important;padding:2px 10px!important;font-size:12px!important;font-weight:700!important;letter-spacing:.01em}
@media (max-width:640px){
 [class*="FlightCard-module__card___"]{grid-template-columns:minmax(0,1fr)!important}
 [class*="FlightCard-module__cardRight___"]{padding:20px 16px 12px!important}
 [class*="FlightCard-module__cardLeft___"]{grid-column:1!important;grid-row:2!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;border-left:0!important;border-top:1px dashed #cbd5e1!important;border-radius:0 0 16px 16px!important;padding:16px!important}
 [class*="FlightCard-module__cardLeftPrice___"]{font-size:26px!important;flex:1 1 auto}
 [class*="FlightCard-module__cardLeftButton___"]{flex:1 1 100%}
}`;
