import { writeFileSync } from "node:fs";

const url = process.argv[2] ?? "https://gloconn.vercel.app/";

async function capture(label: string) {
  const r = await fetch(url, {
    headers: {
      Accept: "text/html",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  const html = await r.text();
  const headers: Record<string, string | null> = {};
  for (const k of [
    "content-security-policy",
    "cache-control",
    "age",
    "x-vercel-cache",
    "x-vercel-id",
    "etag",
    "x-matched-path",
    "vary",
    "x-frame-options",
    "x-content-type-options",
  ]) {
    headers[k] = r.headers.get(k);
  }
  const csp = headers["content-security-policy"] ?? "";
  const cspNonce = /'nonce-([^']+)'/.exec(csp)?.[1] ?? null;
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(
    (m, i) => {
      const attrs = m[1] ?? "";
      const body = (m[2] ?? "").replace(/\s+/g, " ").slice(0, 100);
      const src = /\bsrc=["']([^"']+)["']/i.exec(attrs)?.[1] ?? null;
      const nonce = /\bnonce=["']([^"']+)["']/i.exec(attrs)?.[1] ?? null;
      let type = "other";
      if (src?.includes("/_next/")) type = "Next.js framework";
      else if (!src && (body.includes("__next_f") || body.includes("$RC") || body.includes("$RB")))
        type = "Next.js inline bootstrap/Flight";
      else if (!src) type = "inline other";
      else if (/vercel|va\.vercel|vitals/i.test(src)) type = "Vercel platform";
      else type = "external";
      return {
        i,
        type,
        src,
        inline: !src,
        noncePresent: Boolean(nonce),
        matchesCsp: nonce && cspNonce ? nonce === cspNonce : null,
        body,
      };
    },
  );
  return {
    label,
    status: r.status,
    headers,
    cspNoncePresent: Boolean(cspNonce),
    scriptCount: scripts.length,
    withNonce: scripts.filter((s) => s.noncePresent).length,
    withoutNonce: scripts.filter((s) => !s.noncePresent).length,
    scripts,
    htmlHasVercelAnalytics:
      /vercel-analytics|va\.vercel-scripts|_vercel\/insights|speed-insights/i.test(html),
    htmlHasToolbar: /vercel-live|vercel-toolbar/i.test(html),
    buildChunkSample: scripts.find((s) => s.src)?.src ?? null,
  };
}

const a = await capture("A");
await new Promise((r) => setTimeout(r, 800));
const b = await capture("B");

const out = {
  url,
  a,
  b,
  cspNonceChangedBetweenRequests:
    (a.headers["content-security-policy"] ?? "") !==
    (b.headers["content-security-policy"] ?? ""),
  etagSame: a.headers.etag === b.headers.etag,
  htmlScriptsIdentical:
    JSON.stringify(a.scripts.map((s) => s.src)) ===
    JSON.stringify(b.scripts.map((s) => s.src)),
};
writeFileSync("scripts/_cap_deep.json", JSON.stringify(out, null, 2));
console.log(
  JSON.stringify(
    {
      url,
      cspNonceChangedBetweenRequests: out.cspNonceChangedBetweenRequests,
      etagSame: out.etagSame,
      cacheA: a.headers["x-vercel-cache"],
      cacheB: b.headers["x-vercel-cache"],
      ageA: a.headers.age,
      ageB: b.headers.age,
      scriptsWithoutNonceA: a.withoutNonce,
      scriptsWithNonceA: a.withNonce,
      firstScript: a.scripts[0],
      inlineScripts: a.scripts.filter((s) => s.inline),
      vercelInjection: {
        analyticsInHtml: a.htmlHasVercelAnalytics,
        toolbarInHtml: a.htmlHasToolbar,
      },
      cspA: a.headers["content-security-policy"],
      cspB: a.headers["content-security-policy"] === b.headers["content-security-policy"]
        ? "(same as A)"
        : b.headers["content-security-policy"],
    },
    null,
    2,
  ),
);
