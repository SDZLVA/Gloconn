/**
 * Production CSP/nonce verification (local). Does not print secrets beyond nonce values.
 */

const res = await fetch("http://localhost:3000/", {
  headers: { Accept: "text/html" },
});
const html = await res.text();
const csp = res.headers.get("content-security-policy") ?? "";
const xFrame = res.headers.get("x-frame-options");
const xcto = res.headers.get("x-content-type-options");

const cspNonceMatch = /'nonce-([^']+)'/.exec(csp);
const cspNonce = cspNonceMatch?.[1] ?? null;

const scriptNonces = [
  ...html.matchAll(/<script[^>]*\snonce=["']([^"']+)["'][^>]*>/gi),
].map((m) => m[1]);

const uniqueScriptNonces = [...new Set(scriptNonces)];
const scriptsWithoutNonce = (
  html.match(/<script\b[^>]*>/gi) ?? []
).filter((tag) => !/\snonce=/i.test(tag));

const scriptSrc = csp
  .split(";")
  .map((p) => p.trim())
  .find((p) => p.startsWith("script-src"));

console.log(
  JSON.stringify(
    {
      status: res.status,
      cspPresent: Boolean(csp),
      cspNonce,
      scriptNonceCount: scriptNonces.length,
      uniqueScriptNonces,
      allScriptsMatchCspNonce:
        uniqueScriptNonces.length === 1 && uniqueScriptNonces[0] === cspNonce,
      scriptsWithoutNonceCount: scriptsWithoutNonce.length,
      scriptsWithoutNonceSample: scriptsWithoutNonce.slice(0, 3),
      scriptSrcHasUnsafeInline: /unsafe-inline/.test(scriptSrc ?? ""),
      scriptSrcHasStrictDynamic: /strict-dynamic/.test(scriptSrc ?? ""),
      scriptSrcHasUnsafeEval: /unsafe-eval/.test(scriptSrc ?? ""),
      xFrameOptions: xFrame,
      xContentTypeOptions: xcto,
    },
    null,
    2,
  ),
);

// Second request — nonce must differ
const res2 = await fetch("http://localhost:3000/", {
  headers: { Accept: "text/html" },
});
const csp2 = res2.headers.get("content-security-policy") ?? "";
const nonce2 = /'nonce-([^']+)'/.exec(csp2)?.[1] ?? null;
console.log(
  JSON.stringify(
    {
      secondRequestDifferentNonce: Boolean(cspNonce && nonce2 && cspNonce !== nonce2),
    },
    null,
    2,
  ),
);
