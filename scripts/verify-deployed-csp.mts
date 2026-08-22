import { writeFileSync } from "node:fs";

const url = process.argv[2];
if (!url) {
  console.error("Usage: npx tsx scripts/verify-deployed-csp.mts <url>");
  process.exit(1);
}

async function once() {
  const r = await fetch(url, {
    headers: {
      Accept: "text/html",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    redirect: "follow",
  });
  const html = await r.text();
  const csp = r.headers.get("content-security-policy") ?? "";
  const cspNonce = /'nonce-([^']+)'/.exec(csp)?.[1] ?? null;
  const scriptTags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const scripts = scriptTags.map((m, i) => {
    const attrs = m[1] ?? "";
    const body = (m[2] ?? "").replace(/\s+/g, " ").slice(0, 80);
    const src = /\bsrc=["']([^"']+)["']/i.exec(attrs)?.[1] ?? null;
    const nonce = /\bnonce=["']([^"']+)["']/i.exec(attrs)?.[1] ?? null;
    return {
      i,
      src,
      inline: !src,
      noncePresent: Boolean(nonce),
      matches: Boolean(nonce && cspNonce && nonce === cspNonce),
      body,
    };
  });
  return {
    finalUrl: r.url,
    status: r.status,
    headers: {
      csp,
      cacheControl: r.headers.get("cache-control"),
      age: r.headers.get("age"),
      xVercelCache: r.headers.get("x-vercel-cache"),
      etag: r.headers.get("etag"),
      xMatchedPath: r.headers.get("x-matched-path"),
    },
    cspNoncePresent: Boolean(cspNonce),
    scriptCount: scripts.length,
    withNonce: scripts.filter((s) => s.noncePresent).length,
    withoutNonce: scripts.filter((s) => !s.noncePresent).length,
    allMatch:
      scripts.length > 0 && scripts.every((s) => s.noncePresent && s.matches),
    scriptSrcUnsafeInline: /script-src[^;]*unsafe-inline/.test(csp),
    scriptSrcStrictDynamic: /strict-dynamic/.test(csp),
    scripts,
  };
}

const a = await once();
await new Promise((r) => setTimeout(r, 600));
const b = await once();

const out = {
  url,
  a: {
    ...a,
    scripts: a.scripts,
  },
  comparison: {
    cspNonceChanged:
      a.headers.csp !== b.headers.csp,
    etagSame: a.headers.etag === b.headers.etag,
    htmlScriptsSame:
      JSON.stringify(a.scripts.map((s) => [s.src, s.noncePresent])) ===
      JSON.stringify(b.scripts.map((s) => [s.src, s.noncePresent])),
    aCache: a.headers.xVercelCache,
    bCache: b.headers.xVercelCache,
    aAllMatch: a.allMatch,
    bAllMatch: b.allMatch,
    // If CSP rotates, each response's scripts must still match THAT response's CSP
    pairedCorrectly: a.allMatch && b.allMatch,
  },
};

writeFileSync("scripts/_verify_out.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify({
  finalUrl: a.finalUrl,
  status: a.status,
  allMatch: a.allMatch,
  withNonce: a.withNonce,
  withoutNonce: a.withoutNonce,
  scriptCount: a.scriptCount,
  scriptSrcUnsafeInline: a.scriptSrcUnsafeInline,
  scriptSrcStrictDynamic: a.scriptSrcStrictDynamic,
  cache: a.headers.xVercelCache,
  age: a.headers.age,
  etag: a.headers.etag,
  comparison: out.comparison,
  firstScripts: a.scripts.slice(0, 4),
  inline: a.scripts.filter((s) => s.inline),
}, null, 2));
