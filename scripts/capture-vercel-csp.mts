/**
 * Capture Vercel document CSP vs script inventory (no secret printing beyond nonce comparison).
 * Usage: npx tsx scripts/capture-vercel-csp.mts <url>
 */

const url = process.argv[2];
if (!url) {
  console.error("Usage: npx tsx scripts/capture-vercel-csp.mts <url>");
  process.exit(1);
}

function redactCsp(csp: string): string {
  // Keep structure; shorten nonce for report safety if desired — CTO asked for exact CSP.
  // They said DO NOT print secret values — nonce is not a secret but we'll include full CSP as required.
  return csp;
}

function classifyScript(tag: string, src: string | null, inlineBody: string): string {
  const lower = (src ?? "").toLowerCase();
  const body = inlineBody.slice(0, 200);
  if (src) {
    if (lower.includes("/_next/static/") || lower.includes("/_next/")) return "Next.js framework script";
    if (lower.includes("vercel") || lower.includes("va.vercel") || lower.includes("vitals"))
      return "Vercel/platform script";
    if (lower.includes("analytics") || lower.includes("gtag") || lower.includes("googletagmanager"))
      return "analytics";
    return "external/third-party script";
  }
  // inline
  if (body.includes("self.__next_f") || body.includes("$RC") || body.includes("nonce"))
    return "Next.js inline bootstrap / Flight";
  if (body.includes("__NEXT_DATA__")) return "Next.js __NEXT_DATA__";
  if (body.includes("vercel") || body.includes("_vercel")) return "Vercel injected inline";
  if (body.trim().length === 0) return "empty inline script";
  return "inline other";
}

const res = await fetch(url, {
  headers: {
    Accept: "text/html",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
  redirect: "follow",
});

const html = await res.text();
const headers: Record<string, string> = {};
res.headers.forEach((v, k) => {
  headers[k.toLowerCase()] = v;
});

const csp = headers["content-security-policy"] ?? "";
const cspNonce = /'nonce-([^']+)'/.exec(csp)?.[1] ?? null;

const scriptTagRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const scripts: Array<{
  index: number;
  src: string | null;
  nonce: string | null;
  inline: boolean;
  type: string;
  noncePresent: boolean;
  nonceMatchesCsp: boolean | null;
  bodyPreview: string;
}> = [];

let m: RegExpExecArray | null;
let i = 0;
while ((m = scriptTagRe.exec(html)) !== null) {
  const attrs = m[1] ?? "";
  const body = m[2] ?? "";
  const srcMatch = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(attrs);
  const nonceMatch = /\bnonce\s*=\s*["']([^"']+)["']/i.exec(attrs);
  // Also handle nonce without quotes rare
  const src = srcMatch?.[1] ?? null;
  const nonce = nonceMatch?.[1] ?? null;
  const inline = !src;
  const type = classifyScript(attrs, src, body);
  scripts.push({
    index: i++,
    src,
    nonce,
    inline,
    type,
    noncePresent: Boolean(nonce),
    nonceMatchesCsp: nonce && cspNonce ? nonce === cspNonce : nonce ? false : null,
    bodyPreview: inline ? body.replace(/\s+/g, " ").slice(0, 120) : "",
  });
}

// Scripts with only opening tag (modulepreload etc.) — also catch self-closing unlikely
const openOnly = [...html.matchAll(/<script\b([^>]*?)(?:\/>|>)/gi)].length;

const interestingHeaders = {
  "content-security-policy": csp ? redactCsp(csp) : null,
  "cache-control": headers["cache-control"] ?? null,
  age: headers["age"] ?? null,
  "x-vercel-cache": headers["x-vercel-cache"] ?? null,
  "x-vercel-id": headers["x-vercel-id"] ?? null,
  etag: headers["etag"] ?? null,
  "x-matched-path": headers["x-matched-path"] ?? null,
  "x-nextjs-cache": headers["x-nextjs-cache"] ?? null,
  vary: headers["vary"] ?? null,
  "x-frame-options": headers["x-frame-options"] ?? null,
  "x-content-type-options": headers["x-content-type-options"] ?? null,
  "content-type": headers["content-type"] ?? null,
};

const uniqueScriptNonces = [...new Set(scripts.map((s) => s.nonce).filter(Boolean))];
const scriptsWithoutNonce = scripts.filter((s) => !s.noncePresent);
const mismatched = scripts.filter((s) => s.noncePresent && s.nonceMatchesCsp === false);

console.log(
  JSON.stringify(
    {
      finalUrl: res.url,
      status: res.status,
      cspNoncePresent: Boolean(cspNonce),
      // full CSP as required by CTO report section 1
      cspHeader: csp || null,
      cspNonceLength: cspNonce?.length ?? 0,
      uniqueScriptNonceCount: uniqueScriptNonces.length,
      allScriptsMatchCsp:
        scripts.length > 0 &&
        scripts.every((s) => s.noncePresent && s.nonceMatchesCsp === true),
      scriptCount: scripts.length,
      scriptsWithoutNonceCount: scriptsWithoutNonce.length,
      mismatchedCount: mismatched.length,
      firstMismatch: mismatched[0] ?? scriptsWithoutNonce[0] ?? null,
      headers: interestingHeaders,
      scripts: scripts.map((s) => ({
        index: s.index,
        type: s.type,
        inline: s.inline,
        src: s.src,
        noncePresent: s.noncePresent,
        nonceMatchesCsp: s.nonceMatchesCsp,
        // compare equality only — do not dump full nonce unless needed
        nonceEqualsCspHeader: s.nonce && cspNonce ? s.nonce === cspNonce : false,
        bodyPreview: s.bodyPreview,
      })),
    },
    null,
    2,
  ),
);

// Second fetch — cache / nonce reuse check
const res2 = await fetch(url, {
  headers: { Accept: "text/html", "Cache-Control": "no-cache" },
  redirect: "follow",
});
const html2 = await res2.text();
const csp2 = res2.headers.get("content-security-policy") ?? "";
const nonce2 = /'nonce-([^']+)'/.exec(csp2)?.[1] ?? null;
const scriptNonce2 = [...html2.matchAll(/\snonce=["']([^"']+)["']/gi)].map((x) => x[1]);
const unique2 = [...new Set(scriptNonce2)];

console.log(
  JSON.stringify(
    {
      secondFetch: {
        cspNonceDifferent: Boolean(cspNonce && nonce2 && cspNonce !== nonce2),
        xVercelCache: res2.headers.get("x-vercel-cache"),
        cacheControl: res2.headers.get("cache-control"),
        age: res2.headers.get("age"),
        scriptNoncesMatchOwnCsp:
          unique2.length === 1 && unique2[0] === nonce2,
        htmlIdentical: html === html2,
      },
    },
    null,
    2,
  ),
);
